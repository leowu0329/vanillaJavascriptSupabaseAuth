import { supabase } from '../../config/supabaseClient.js';
import { showModal } from '../modal.js';
import { createPasswordInput, attachPasswordToggle } from '../../components/PasswordInput.js';

/** 更改密碼 */
export function renderChangePassword(container, session, renderProtectedLayout) {
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
  attachPasswordToggle(container);

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

/** 修改個人訊息 */
export async function renderProfile(container, session, renderProtectedLayout) {
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