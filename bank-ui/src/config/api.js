// Cấu hình API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const NOTIFICATION_API_BASE_URL = import.meta.env.VITE_NOTIFICATION_API_BASE_URL || 'http://localhost:8082';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8082';

export const BANK_SERVICE_API = `${API_BASE_URL}/bankservice`;
export const NOTIFICATION_SERVICE_API = `${NOTIFICATION_API_BASE_URL}/api/notifications`;
export const WS_URL = `${WS_BASE_URL}/ws`;

export default {
  BANK_SERVICE_API,
  NOTIFICATION_SERVICE_API,
  WS_URL
};





