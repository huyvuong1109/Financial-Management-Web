import api from './api';

// Lấy thông tin tài khoản
export const getAccountInfo = async () => {
  return api.get('/account');
};

// Cập nhật thông tin tài khoản
export const updateAccount = async (data) => {
  return api.put('/account', data);
};

// Đổi mật khẩu
export const changePassword = async (oldPassword, newPassword) => {
  return api.post('/account/change-password', {
    oldPassword,
    newPassword
  });
};

// Lấy danh sách thẻ
export const getCards = async () => {
  return api.get('/cards');
};

// Lấy thẻ theo ID
export const getCardById = async (id) => {
  return api.get(`/cards/${id}`);
};

// Tạo thẻ mới
export const createCard = async (data) => {
  return api.post('/cards', data);
};

// Cập nhật thẻ
export const updateCard = async (id, data) => {
  return api.put(`/cards/${id}`, data);
};

// Xóa/Khóa thẻ
export const deleteCard = async (id) => {
  return api.delete(`/cards/${id}`);
};

// Toggle trạng thái thẻ (lock/unlock)
export const toggleCardStatus = async (id) => {
  return api.post(`/cards/${id}/toggle-status`);
};
