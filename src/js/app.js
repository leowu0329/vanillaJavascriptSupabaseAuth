import { supabase } from '../config/supabaseClient.js';
import { showModal, showConfirmModal } from './modal.js';
import { renderSideBar, attachSideBarEvents } from '../components/SideBar.js';

// 引用業務視圖模組
import { 
  renderRegister, 
  renderLogin, 
  renderForgotPassword, 
  renderResetPassword 
} from './views/auth.js';
import { renderHome } from './views/home.js';
import { renderChangePassword, renderProfile } from './views/user.js';

const app = document.getElementById('app');
let isRecoveryMode = false;

// 1. 監聽 Auth 狀態 (捕捉重設密碼事件)
supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    isRecoveryMode = true;
    renderResetPassword(app, () => { isRecoveryMode = false; });
  }
});

// 2. 路由監聽
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// 包裹受保護頁面的整體版面 (含 SideBar)
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

// 登出處理
function handleLogout() {
  showConfirmModal('確定要登出系統嗎？', async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    showModal('您已成功登出。');
    window.location.hash = '#login';
  });
}

// 主路由分發器
async function router() {
  const rawHash = window.location.hash;

  if (rawHash.includes('access_token') || rawHash.includes('type=recovery') || isRecoveryMode) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session || isRecoveryMode) {
      renderResetPassword(app, () => { isRecoveryMode = false; });
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

  // 路由權限守衛
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

  // 依路由分發至 View 模組
  switch (hash) {
    case 'register':
      renderRegister(app);
      break;
    case 'login':
      renderLogin(app);
      break;
    case 'forgot-password':
      renderForgotPassword(app);
      break;
    case 'home':
      renderHome(app, session, renderProtectedLayout);
      break;
    case 'profile':
      renderProfile(app, session, renderProtectedLayout);
      break;
    case 'change-password':
      renderChangePassword(app, session, renderProtectedLayout);
      break;
    default:
      window.location.hash = session ? '#home' : '#login';
      break;
  }
}