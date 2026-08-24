import './style.css'
import { supabase } from './config/supabaseClient.js'

let isSignUp = false

const authContainer = document.getElementById('auth-container')
const dashboard = document.getElementById('dashboard')
const authForm = document.getElementById('auth-form')
const formTitle = document.getElementById('form-title')
const submitBtn = document.getElementById('submit-btn')
const toggleBtn = document.getElementById('toggle-btn')
const logoutBtn = document.getElementById('logout-btn')
const userEmail = document.getElementById('user-email')
const message = document.getElementById('message')

// 切換登入 / 註冊 模式
toggleBtn.addEventListener('click', () => {
  isSignUp = !isSignUp
  formTitle.textContent = isSignUp ? '註冊帳號' : '會員登入'
  submitBtn.textContent = isSignUp ? '註冊' : '登入'
  toggleBtn.textContent = isSignUp ? '已有帳號？前往登入' : '沒有帳號？前往註冊'
  message.textContent = ''
})

// 表單提交處理
authForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  
  message.textContent = '處理中...'
  message.className = 'mt-4 text-center text-sm text-slate-500'

  if (isSignUp) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      showMessage(error.message, true)
    } else {
      showMessage('註冊成功！請檢查您的 Email 完成驗證。', false)
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      showMessage(error.message, true)
    } else {
      showMessage('登入成功！', false)
    }
  }
})

// 登出處理
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut()
})

// 顯示訊息輔助函式
function showMessage(msg, isError) {
  message.textContent = msg
  message.className = `mt-4 text-center text-sm ${isError ? 'text-red-500' : 'text-green-600'}`
}

// 監聽 Auth 狀態變化 (登入、登出時自動觸發)
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    authContainer.classList.add('hidden')
    dashboard.classList.remove('hidden')
    userEmail.textContent = session.user.email
  } else {
    authContainer.classList.remove('hidden')
    dashboard.classList.add('hidden')
    userEmail.textContent = ''
  }
})