let modalInstance = null;
let modalTimer = null;

/**
 * 顯示訊息 Modal 並在 5 秒後自動關閉
 * @param {string} message - 顯示內容
 * @param {string} title - 標題
 */
export function showModal(message, title = '系統提示') {
  const modalEl = document.getElementById('globalModal');
  document.getElementById('globalModalTitle').innerText = title;
  document.getElementById('globalModalBody').innerText = message;

  if (modalTimer) {
    clearTimeout(modalTimer);
  }

  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalEl);
  }

  modalInstance.show();

  modalTimer = setTimeout(() => {
    modalInstance.hide();
  }, 5000);
}

/**
 * 顯示確認對話框 Modal
 * @param {string} message - 訊息
 * @param {Function} onConfirm - 按下確定的回調函式
 */
export function showConfirmModal(message, onConfirm) {
  const confirmModalEl = document.getElementById('confirmModal');
  document.getElementById('confirmModalBody').innerText = message;
  
  const confirmBtn = document.getElementById('confirmModalActionBtn');
  const instance = new bootstrap.Modal(confirmModalEl);

  const handleConfirm = () => {
    onConfirm();
    instance.hide();
    confirmBtn.removeEventListener('click', handleConfirm);
  };

  confirmBtn.addEventListener('click', handleConfirm);
  instance.show();
}