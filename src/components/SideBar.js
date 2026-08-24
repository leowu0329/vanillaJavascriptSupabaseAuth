/**
 * 渲染 SideBar 組件
 * @param {string} activeRoute - 當前頁面路由
 * @returns {string} HTML 樣板
 */
export function renderSideBar(activeRoute) {
  return `
    <div class="sidebar" id="appSidebar">
      <div class="p-3 d-flex align-items-center justify-content-between border-bottom border-secondary">
        <span class="fs-5 fw-bold link-text">控制面板</span>
        <button class="btn btn-sm btn-dark text-white" id="sidebarToggleBtn">
          <i class="bi bi-list fs-5"></i>
        </button>
      </div>
      <ul class="nav nav-pills flex-column mb-auto py-2">
        <li class="nav-item">
          <a href="#home" class="nav-link ${activeRoute === 'home' ? 'active' : ''}">
            <i class="bi bi-house-door"></i>
            <span class="link-text">首頁</span>
          </a>
        </li>
        <li>
          <a href="#profile" class="nav-link ${activeRoute === 'profile' ? 'active' : ''}">
            <i class="bi bi-person"></i>
            <span class="link-text">修改個人訊息</span>
          </a>
        </li>
        <li>
          <a href="#change-password" class="nav-link ${activeRoute === 'change-password' ? 'active' : ''}">
            <i class="bi bi-key"></i>
            <span class="link-text">更改密碼</span>
          </a>
        </li>
        <li>
          <a href="#" id="sidebarLogoutBtn" class="nav-link">
            <i class="bi bi-box-arrow-right"></i>
            <span class="link-text">登出</span>
          </a>
        </li>
      </ul>
    </div>
  `;
}

/**
 * 綁定 SideBar 縮放控制事件
 */
export function attachSideBarEvents(onLogoutClick) {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.getElementById('appSidebar');
  const logoutBtn = document.getElementById('sidebarLogoutBtn');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      onLogoutClick();
    });
  }
}