import axios from 'axios';
import { BANK_SERVICE_API } from '../config/api';

const API_BASE = `${BANK_SERVICE_API}/api/budgets`;

/**
 * Create a new budget
 */
export const createBudget = async (budgetData) => {
  return axios.post(API_BASE, budgetData);
};

/**
 * Get budget by ID
 */
export const getBudgetById = async (budgetId) => {
  return axios.get(`${API_BASE}/${budgetId}`);
};

/**
 * Get all budgets for an account
 */
export const getBudgetsByAccountId = async (accountId) => {
  return axios.get(`${API_BASE}/account/${accountId}`);
};

/**
 * Get budgets for a specific month
 * monthYear format: YYYY-MM (e.g., "2024-12")
 */
export const getBudgetsByMonth = async (accountId, monthYear) => {
  return axios.get(`${API_BASE}/account/${accountId}/month`, {
    params: { monthYear }
  });
};

/**
 * Update budget
 */
export const updateBudget = async (budgetId, updateData) => {
  return axios.put(`${API_BASE}/${budgetId}`, updateData);
};

/**
 * Delete budget
 */
export const deleteBudget = async (budgetId) => {
  return axios.delete(`${API_BASE}/${budgetId}`);
};

/**
 * Get spending progress for a budget
 */
export const getBudgetProgress = async (budgetId) => {
  return axios.get(`${API_BASE}/${budgetId}/progress`);
};

/**
 * Get monthly spending progress for all budgets
 */
export const getMonthlyProgress = async (accountId, monthYear) => {
  return axios.get(`${API_BASE}/account/${accountId}/progress`, {
    params: { monthYear }
  });
};

/**
 * Get monthly summary statistics
 */
export const getMonthlySummary = async (accountId, monthYear) => {
  return axios.get(`${API_BASE}/account/${accountId}/summary`, {
    params: { monthYear }
  });
};
