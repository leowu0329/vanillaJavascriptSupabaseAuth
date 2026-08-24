/**
 * 建立具備切換顯示/隱藏功能的密碼輸入欄位 HTML
 * @param {Object} options 
 * @param {string} options.id - Input ID
 * @param {string} options.label - Label 名稱
 * @param {string} options.placeholder - 預設文字
 * @returns {string} HTML 樣板字串
 */
export function createPasswordInput({ id, label = '密碼', placeholder = '請輸入密碼' }) {
  return `
    <div class="mb-3">
      <label for="${id}" class="form-label">${label}</label>
      <div class="input-group">
        <input type="password" class="form-control" id="${id}" placeholder="${placeholder}" required>
        <button class="btn btn-outline-secondary toggle-password-btn" type="button" data-target="${id}">
          <i class="bi bi-eye-slash"></i>
        </button>
      </div>
    </div>
  `;
}

/**
 * 為密碼切換按鈕綁定事件 Listeners
 * @param {HTMLElement} container - 包含按鈕的容器
 */
export function attachPasswordToggle(container = document) {
  const buttons = container.querySelectorAll('.toggle-password-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      } else {
        input.type = 'password';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      }
    });
  });
}