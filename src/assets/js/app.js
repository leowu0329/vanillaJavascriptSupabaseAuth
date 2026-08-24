import { supabase } from '../../config/supabaseClient.js';
import { showModal, showConfirmModal } from './modal.js';
import { createPasswordInput, attachPasswordToggle } from '../../components/PasswordInput.js';
import { renderSideBar, attachSideBarEvents } from '../../components/SideBar.js';

const app = document.getElementById('app');
let isRecoveryMode = false;

// 1. 監聽 Supabase Auth 事件，自動擷取信件中的 Recovery Token
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    isRecoveryMode = true;
    renderResetPassword();
  }
});

// 2. 路由監聽與初始化
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// 電子信箱格式驗證
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 主路由處理器
async function router() {
  const rawHash = window.location.hash;

  // 1. 若網址正帶有 Supabase 的 Token 或處於復原狀態，暫停路由跳轉，讓 SDK 存入 Session
  if (rawHash.includes('access_token') || rawHash.includes('type=recovery') || isRecoveryMode) {
    // 若 session 已建立且為復原流程，直接渲染重設密碼頁面
    const { data: { session } } = await supabase.auth.getSession();
    if (session || isRecoveryMode) {
      renderResetPassword();
      return;
    }
  }

  let session = null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    session = data.session;
  } catch (err) {
    console.warn('Session 讀取失敗:', err.message);
    await supabase.auth.signOut().catch(() => {});
    localStorage.clear();
    session = null;
  }

  const hash = rawHash.split('&')[0].replace('#', '') || 'login';

  // 權限控管
  if (session) {
    if (['login', 'register', 'forgot-password'].includes(hash)) {
      window.location.hash = '#home';
      return;
    }
  } else {
    if (['home', 'profile', 'change-password'].includes(hash)) {
      window.location.hash = '#login';
      return;
    }
  }

  switch (hash) {
    case 'register':
      renderRegister();
      break;
    case 'login':
      renderLogin();
      break;
    case 'forgot-password':
      renderForgotPassword();
      break;
    case 'home':
      renderHome(session);
      break;
    case 'profile':
      renderProfile(session);
      break;
    case 'change-password':
      renderChangePassword(session);
      break;
    default:
      window.location.hash = session ? '#home' : '#login';
      break;
  }
}

// 登出流程
function handleLogout() {
  showConfirmModal('確定要登出系統嗎？', async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    showModal('您已成功登出。');
    window.location.hash = '#login';
  });
}

// 包裹受保護頁面的整體版面 (包含 SideBar)
function renderProtectedLayout(activeRoute, contentHtml) {
  app.innerHTML = `
    <div class="sidebar-wrapper">
      ${renderSideBar(activeRoute)}
      <div class="main-content">
        <div class="w-100" style="max-width: 600px;">
          ${contentHtml}
        </div>
      </div>
    </div>
  `;
  attachSideBarEvents(handleLogout);
}

/* ================= 1. 註冊頁面 ================= */
function renderRegister() {
  app.innerHTML = `
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
  attachPasswordToggle(app);

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

/* ================= 2. 登入頁面 ================= */
function renderLogin() {
  app.innerHTML = `
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
  attachPasswordToggle(app);

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

/* ================= 3. 忘記密碼發送頁面 ================= */
function renderForgotPassword() {
  app.innerHTML = `
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

    const currentOrigin = window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${currentOrigin}/`,
    });

    if (error) {
      showModal(`請求失敗: ${error.message}`);
    } else {
      showModal('重設密碼連結已發送至您的信箱，請至信箱查收。');
      window.location.hash = '#login';
    }
  });
}

/* ================= 4. 忘記密碼驗證後：設定新密碼畫面 ================= */
function renderResetPassword() {
  app.innerHTML = `
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
  attachPasswordToggle(app);

  document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('resetNewPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value;

    if (newPassword !== confirmPassword) {
      showModal('兩次輸入的新密碼不一致！');
      return;
    }

    // 呼叫 Supabase 更新密碼
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      showModal(`密碼重設失敗: ${error.message}`);
    } else {
      isRecoveryMode = false;
      // 成功後登出復原 Session，並引導使用者回登入畫面
      await supabase.auth.signOut();
      localStorage.clear();
      showModal('密碼已成功更新！請使用新密碼重新登入。');
      window.location.hash = '#login';
    }
  });
}

/* ================= 5. 首頁 ================= */
function renderHome(session) {
  const content = `
    <div class="card shadow-sm">
      <div class="card-body text-center p-5">
        <i class="bi bi-house-check text-primary display-1"></i>
        <h2 class="mt-3">歡迎登入系統</h2>
        <p class="text-muted">目前的登入帳號：<strong>${session ? session.user.email : ''}</strong></p>
      </div>
    </div>
  `;
  renderProtectedLayout('home', content);
}

/* ================= 6. 會員中心：更改密碼 ================= */
function renderChangePassword(session) {
  const content = `
    <div class="card shadow-sm">
      <div class="card-body p-4">
        <h4 class="card-title mb-4 text-center">更改密碼</h4>
        <form id="changePasswordForm">
          ${createPasswordInput({ id: 'currentPassword', label: '目前密碼', placeholder: '請輸入舊密碼' })}
          ${createPasswordInput({ id: 'newPassword', label: '輸入新密碼', placeholder: '請輸入新密碼' })}
          ${createPasswordInput({ id: 'confirmNewPassword', label: '確認新密碼', placeholder: '再次輸入新密碼' })}
          <button type="submit" class="btn btn-primary w-100">更新密碼</button>
        </form>
      </div>
    </div>
  `;
  renderProtectedLayout('change-password', content);
  attachPasswordToggle(app);

  document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
      showModal('新密碼與確認密碼不一致！');
      return;
    }

    if (currentPassword === newPassword) {
      showModal('新密碼不能與目前密碼相同！');
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword
    });

    if (authError) {
      showModal('目前密碼輸入錯誤，請重新確認！');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      showModal(`密碼更新失敗: ${updateError.message}`);
    } else {
      showModal('密碼修改成功！即將為您跳轉至首頁。');
      window.location.hash = '#home';
    }
  });
}

/* ================= 7. 修改個人訊息 ================= */
async function renderProfile(session) {
  const user = session ? session.user : {};
  const meta = user.user_metadata || {};

  const content = `
    <div class="card shadow-sm my-3">
      <div class="card-body p-4">
        <h4 class="card-title mb-4 text-center">修改個人訊息</h4>
        <form id="profileForm">
          <div class="mb-3">
            <label class="form-label">電子信箱 (不可修改)</label>
            <input type="email" class="form-control" value="${user.email || ''}" disabled readonly>
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <label for="profAccount" class="form-label">帳號</label>
              <input type="text" class="form-control" id="profAccount" value="${meta.username || ''}">
            </div>
            <div class="col-md-6">
              <label for="profNickname" class="form-label">暱稱</label>
              <input type="text" class="form-control" id="profNickname" value="${meta.nickname || ''}">
            </div>
            <div class="col-md-6">
              <label for="profBirthday" class="form-label">生日</label>
              <input type="date" class="form-control" id="profBirthday" value="${meta.birthday || ''}">
            </div>
            <div class="col-md-6">
              <label for="profID" class="form-label">ID (身分證/員工編號)</label>
              <input type="text" class="form-control" id="profID" value="${meta.identity_id || ''}">
            </div>
            <div class="col-12">
              <label for="profAddress" class="form-label">地址</label>
              <input type="text" class="form-control" id="profAddress" value="${meta.address || ''}">
            </div>
            <div class="col-md-6">
              <label for="profPhone" class="form-label">手機</label>
              <input type="tel" class="form-control" id="profPhone" value="${meta.phone || ''}">
            </div>
            <div class="col-md-6">
              <label for="profFactory" class="form-label">廠別</label>
              <input type="text" class="form-control" id="profFactory" value="${meta.factory || ''}">
            </div>
            <div class="col-md-4">
              <label for="profDepartment" class="form-label">部門</label>
              <input type="text" class="form-control" id="profDepartment" value="${meta.department || ''}">
            </div>
            <div class="col-md-4">
              <label for="profTitle" class="form-label">職稱</label>
              <input type="text" class="form-control" id="profTitle" value="${meta.job_title || ''}">
            </div>
            <div class="col-md-4">
              <label for="profIdentity" class="form-label">身分別</label>
              <input type="text" class="form-control" id="profIdentity" value="${meta.identity_type || ''}">
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-100 mt-4">儲存修改</button>
        </form>
      </div>
    </div>
  `;
  renderProtectedLayout('profile', content);

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const updates = {
      username: document.getElementById('profAccount').value.trim(),
      nickname: document.getElementById('profNickname').value.trim(),
      birthday: document.getElementById('profBirthday').value,
      identity_id: document.getElementById('profID').value.trim(),
      address: document.getElementById('profAddress').value.trim(),
      phone: document.getElementById('profPhone').value.trim(),
      factory: document.getElementById('profFactory').value.trim(),
      department: document.getElementById('profDepartment').value.trim(),
      job_title: document.getElementById('profTitle').value.trim(),
      identity_type: document.getElementById('profIdentity').value.trim()
    };

    const { error } = await supabase.auth.updateUser({ data: updates });

    if (error) {
      showModal(`個人資訊更新失敗: ${error.message}`);
    } else {
      showModal('個人資訊更新成功！');
    }
  });
}