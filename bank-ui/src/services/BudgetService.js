import api from './api';

// Lấy tất cả budgets của user
export const getBudgets = async () => {
  return api.get('/budgets');
};

// Lấy budget theo ID
export const getBudgetById = async (id) => {
  return api.get(`/budgets/${id}`);
};

// Lấy budget theo tháng
export const getBudgetsByMonth = async (year, month) => {
  return api.get('/budgets/month', {
    params: { year, month }
  });
};

// Tạo budget mới
export const createBudget = async (data) => {
  return api.post('/budgets', data);
};

// Cập nhật budget
export const updateBudget = async (id, data) => {
  return api.put(`/budgets/${id}`, data);
};

// Xóa budget
export const deleteBudget = async (id) => {
  return api.delete(`/budgets/${id}`);
};

// Lấy tổng quan budget (spent vs limit)
export const getBudgetOverview = async (year, month) => {
  return api.get('/budgets/overview', {
    params: { year, month }
  });
};
