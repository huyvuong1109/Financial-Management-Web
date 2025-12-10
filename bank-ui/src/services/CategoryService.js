import api from './api';

// Lấy tất cả categories của user
export const getCategories = async () => {
  return api.get('/categories');
};

// Lấy category theo ID
export const getCategoryById = async (id) => {
  return api.get(`/categories/${id}`);
};

// Lấy categories theo loại (INCOME/EXPENSE)
export const getCategoriesByType = async (type) => {
  return api.get(`/categories/type/${type}`);
};

// Tạo category mới
export const createCategory = async (data) => {
  return api.post('/categories', data);
};

// Cập nhật category
export const updateCategory = async (id, data) => {
  return api.put(`/categories/${id}`, data);
};

// Xóa category
export const deleteCategory = async (id) => {
  return api.delete(`/categories/${id}`);
};

// Lấy thống kê theo category
export const getCategoryStatistics = async (startDate, endDate) => {
  return api.get('/categories/statistics', {
    params: { startDate, endDate }
  });
};
