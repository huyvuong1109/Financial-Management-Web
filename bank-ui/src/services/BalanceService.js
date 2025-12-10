import api from './api';

// Lấy thông tin số dư
export const getBalance = async () => {
  return api.get('/balance');
};

// Lấy tổng quan tài chính (balance, income, expense)
export const getFinancialOverview = async (startDate, endDate) => {
  return api.get('/balance/overview', {
    params: { startDate, endDate }
  });
};

// Lấy lịch sử số dư theo thời gian
export const getBalanceHistory = async (days = 30) => {
  return api.get('/balance/history', {
    params: { days }
  });
};
