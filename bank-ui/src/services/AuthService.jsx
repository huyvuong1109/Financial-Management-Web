import axios from 'axios';
import { BANK_SERVICE_API } from '../config/api';

const API_BASE = `${BANK_SERVICE_API}/api/auth`;

export const register = async (data) => {
  return axios.post(`${API_BASE}/register`, data);
};

export const login = async (data) => {
  return axios.post(`${API_BASE}/login`, data);
};
