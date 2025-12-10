import api from './api';

// Lấy tất cả savings goals của user
export const getSavingsGoals = async () => {
  return api.get('/savings');
};

// Lấy savings goal theo ID
export const getSavingsGoalById = async (id) => {
  return api.get(`/savings/${id}`);
};

// Tạo savings goal mới
export const createSavingsGoal = async (data) => {
  return api.post('/savings', data);
};

// Cập nhật savings goal
export const updateSavingsGoal = async (id, data) => {
  return api.put(`/savings/${id}`, data);
};

// Xóa savings goal
export const deleteSavingsGoal = async (id) => {
  return api.delete(`/savings/${id}`);
};

// Nạp tiền vào savings goal
export const depositToSavingsGoal = async (id, amount) => {
  return api.post(`/savings/${id}/deposit`, { amount });
};

// Rút tiền từ savings goal
export const withdrawFromSavingsGoal = async (id, amount) => {
  return api.post(`/savings/${id}/withdraw`, { amount });
};

// Lấy tổng quan savings
export const getSavingsOverview = async () => {
  return api.get('/savings/overview');
};
