import api from './api';

// Lấy tất cả thông báo của user
export const getNotifications = async () => {
  return api.get('/notifications');
};

// Lấy thông báo chưa đọc
export const getUnreadNotifications = async () => {
  return api.get('/notifications/unread');
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = async () => {
  return api.get('/notifications/unread/count');
};

// Đánh dấu thông báo đã đọc
export const markAsRead = async (id) => {
  return api.put(`/notifications/${id}/read`);
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllAsRead = async () => {
  return api.put('/notifications/read-all');
};

// Xóa thông báo
export const deleteNotification = async (id) => {
  return api.delete(`/notifications/${id}`);
};

// Xóa tất cả thông báo
export const clearAllNotifications = async () => {
  return api.delete('/notifications/clear-all');
};
