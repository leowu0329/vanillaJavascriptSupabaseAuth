/**
 * 渲染系統首頁
 * @param {HTMLElement} container 
 * @param {Object} session 
 * @param {Function} renderProtectedLayout 
 */
export function renderHome(container, session, renderProtectedLayout) {
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