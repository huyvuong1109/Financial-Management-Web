import api from './api';

// Lấy tất cả giao dịch của user
export const getTransactions = async (params = {}) => {
  return api.get('/transactions', { params });
};

// Lấy giao dịch theo ID
export const getTransactionById = async (id) => {
  return api.get(`/transactions/${id}`);
};

// Tạo giao dịch mới
export const createTransaction = async (data) => {
  return api.post('/transactions', data);
};

// Cập nhật giao dịch
export const updateTransaction = async (id, data) => {
  return api.put(`/transactions/${id}`, data);
};

// Xóa giao dịch
export const deleteTransaction = async (id) => {
  return api.delete(`/transactions/${id}`);
};

// Lấy giao dịch theo category
export const getTransactionsByCategory = async (categoryId) => {
  return api.get(`/transactions/category/${categoryId}`);
};

// Lấy tổng thu/chi theo khoảng thời gian
export const getTransactionSummary = async (startDate, endDate) => {
  return api.get('/transactions/summary', {
    params: { startDate, endDate }
  });
};

// Lấy giao dịch theo ngày
export const getTransactionsByDateRange = async (startDate, endDate) => {
  return api.get('/transactions/date-range', {
    params: { startDate, endDate }
  });
};
