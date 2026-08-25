import { supabase } from '../../config/supabaseClient.js';
import { showModal } from '../modal.js';
import { createPasswordInput, attachPasswordToggle } from '../../components/PasswordInput.js';
import { isValidEmail } from '../../utils/validators.js';

/** 1. 註冊頁面 */
export function renderRegister(container) {
  container.innerHTML = `
    <div class="centered-container">
      <div class="auth-card">
        <h3 class="text-center mb-4 font-bold">帳號註冊</h3>
        <form id="registerForm">
          <div class="mb-3">
            <label for="regAccount" class="form-label">帳號</label>
            <input type="text" class="form-control" id="regAccount" placeholder="請輸入帳號" required>
          </div>
          <div class="mb-3">
            <label for="regEmail" class="form-label">電子信箱</label>
            <input type="email" class="form-control" id="regEmail" placeholder="name@example.com" required>
          </div>
          ${createPasswordInput({ id: 'regPassword', label: '密碼', placeholder: '設定密碼' })}
          ${createPasswordInput({ id: 'regConfirmPassword', label: '再確認密碼', placeholder: '再次輸入密碼' })}
          <button type="submit" class="btn btn-primary w-100 mb-3">註冊</button>
          <div class="text-center">
            <a href="#login" class="text-decoration-none">已有帳號？前往登入</a>
          </div>
        </form>
      </div>
    </div>
  `;
  attachPasswordToggle(container);

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regAccount').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!isValidEmail(email)) {
      showModal('請輸入有效的電子信箱格式！');
      return;
    }
    if (password !== confirmPassword) {
      showModal('兩次輸入的密碼不一致！');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error) {
      showModal(`註冊失敗: ${error.message}`);
    } else {
      showModal('註冊成功！驗證郵件已發送，請至信箱點擊連結完成驗證後再行登入。', '註冊成功');
      window.location.hash = '#login';
    }
  });
}

/** 2. 登入頁面 */
export function renderLogin(container) {
  container.innerHTML = `
    <div class="centered-container">
      <div class="auth-card">
        <h3 class="text-center mb-4 font-bold">會員登入</h3>
        <form id="loginForm">
          <div class="mb-3">
            <label for="loginEmail" class="form-label">電子信箱</label>
            <input type="email" class="form-control" id="loginEmail" placeholder="name@example.com" required>
          </div>
          ${createPasswordInput({ id: 'loginPassword', label: '密碼', placeholder: '請輸入密碼' })}
          <div class="d-flex justify-content-between mb-3">
            <a href="#forgot-password" class="text-decoration-none small">忘記密碼？</a>
            <a href="#register" class="text-decoration-none small">尚未註冊？前往註冊</a>
          </div>
          <button type="submit" class="btn btn-primary w-100">登入</button>
        </form>
      </div>
    </div>
  `;
  attachPasswordToggle(container);

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!isValidEmail(email)) {
      showModal('請輸入正確的電子信箱格式！');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showModal(`登入失敗: ${error.message}`);
    } else {
      if (!data.user.email_confirmed_at) {
        showModal('您的帳號尚未完成信箱驗證，請先至信箱收取確認信。', '未驗證提醒');
        await supabase.auth.signOut();
        return;
      }
      showModal('登入成功！', '提示');
      window.location.hash = '#home';
    }
  });
}

/** 3. 忘記密碼申請頁面 */
export function renderForgotPassword(container) {
  container.innerHTML = `
    <div class="centered-container">
      <div class="auth-card">
        <h3 class="text-center mb-4">重設密碼</h3>
        <form id="forgotPasswordForm">
          <div class="mb-3">
            <label for="forgotEmail" class="form-label">電子信箱</label>
            <input type="email" class="form-control" id="forgotEmail" placeholder="name@example.com" required>
          </div>
          <button type="submit" class="btn btn-primary w-100 mb-3">發送重設密碼信件</button>
          <div class="text-center">
            <a href="#login" class="text-decoration-none">返回登入</a>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();

    if (!isValidEmail(email)) {
      showModal('請輸入格式正確的電子信箱！');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });

    if (error) {
      showModal(`請求失敗: ${error.message}`);
    } else {
      showModal('重設密碼連結已發送至您的信箱，請至信箱查收。');
      window.location.hash = '#login';
    }
  });
}

/** 4. 忘記密碼驗證後：設定新密碼畫面 */
export function renderResetPassword(container, onComplete) {
  container.innerHTML = `
    <div class="centered-container">
      <div class="auth-card">
        <h3 class="text-center mb-4">設定新密碼</h3>
        <form id="resetPasswordForm">
          ${createPasswordInput({ id: 'resetNewPassword', label: '輸入新密碼', placeholder: '請輸入新密碼' })}
          ${createPasswordInput({ id: 'resetConfirmPassword', label: '確認新密碼', placeholder: '再次輸入新密碼' })}
          <button type="submit" class="btn btn-primary w-100 mb-3">更新密碼</button>
        </form>
      </div>
    </div>
  `;
  attachPasswordToggle(container);

  document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('resetNewPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value;

    if (newPassword !== confirmPassword) {
      showModal('兩次輸入的新密碼不一致！');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      showModal(`密碼重設失敗: ${error.message}`);
    } else {
      await supabase.auth.signOut();
      localStorage.clear();
      showModal('密碼已成功更新！請使用新密碼重新登入。');
      if (onComplete) onComplete();
      window.location.hash = '#login';
    }
  });
}