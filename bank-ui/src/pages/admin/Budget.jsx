import React, { useState, useEffect } from 'react';
import './Budget.css';
import * as BudgetService from '../../services/BudgetService';
import { BANK_SERVICE_API } from '../../config/api';

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [formData, setFormData] = useState({
    categoryId: '',
    budgetAmount: '',
    alertThreshold: 80,
    monthYear: new Date().toISOString().slice(0, 7),
  });

  const token = localStorage.getItem('token');
  const accountId = localStorage.getItem('accountId');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${BANK_SERVICE_API}/api/categories/account/${accountId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    if (accountId && token) {
      fetchCategories();
    }
  }, [accountId, token]);

  // Fetch budgets for current month
  useEffect(() => {
    fetchBudgets();
  }, [currentMonth]);

  const fetchBudgets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await BudgetService.getBudgetsByMonth(accountId, currentMonth);
      setBudgets(response.data);
    } catch (err) {
      setError('Failed to load budgets: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        ...formData,
        accountId,
        budgetAmount: parseFloat(formData.budgetAmount),
        alertThreshold: parseInt(formData.alertThreshold),
      };

      if (editingBudgetId) {
        // Update budget
        await BudgetService.updateBudget(editingBudgetId, {
          budgetAmount: data.budgetAmount,
          alertThreshold: data.alertThreshold,
        });
      } else {
        // Create new budget
        await BudgetService.createBudget(data);
      }

      setShowForm(false);
      setEditingBudgetId(null);
      setFormData({
        categoryId: '',
        budgetAmount: '',
        alertThreshold: 80,
        monthYear: currentMonth,
      });
      fetchBudgets();
    } catch (err) {
      setError('Error saving budget: ' + (err.response?.data?.message || err.message));
      console.error('Error saving budget:', err);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudgetId(budget.budgetId);
    setFormData({
      categoryId: budget.categoryId.toString(),
      budgetAmount: budget.budgetAmount.toString(),
      alertThreshold: budget.alertThreshold,
      monthYear: budget.monthYear,
    });
    setShowForm(true);
  };

  const handleDelete = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await BudgetService.deleteBudget(budgetId);
        fetchBudgets();
      } catch (err) {
        setError('Error deleting budget: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudgetId(null);
    setFormData({
      categoryId: '',
      budgetAmount: '',
      alertThreshold: 80,
      monthYear: currentMonth,
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category ? category.categoryName : 'Unknown';
  };

  return (
    <div className="budget-container">
      <div className="budget-header">
        <h2>Budget Management</h2>
        <button 
          className="btn-add-budget"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          + Add Budget
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Month Selector */}
      <div className="month-selector">
        <label>Select Month:</label>
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
        />
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className="budget-form">
          <h3>{editingBudgetId ? 'Edit Budget' : 'Create New Budget'}</h3>
          <form onSubmit={handleCreateOrUpdate}>
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                disabled={editingBudgetId}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Budget Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budgetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, budgetAmount: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Alert Threshold (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.alertThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, alertThreshold: e.target.value })
                }
              />
              <small>Alert will be sent when spending reaches this percentage</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                {editingBudgetId ? 'Update Budget' : 'Create Budget'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets List */}
      {loading ? (
        <p className="loading">Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <p className="no-data">No budgets for {currentMonth}</p>
      ) : (
        <div className="budgets-list">
          {budgets.map(budget => (
            <div key={budget.budgetId} className="budget-card">
              <div className="budget-info">
                <h4>{getCategoryName(budget.categoryId)}</h4>
                <p className="budget-month">{budget.monthYear}</p>
              </div>

              <div className="budget-details">
                <div className="budget-amount">
                  <span>Budget:</span>
                  <strong>${budget.budgetAmount.toFixed(2)}</strong>
                </div>
                <div className="budget-spent">
                  <span>Spent:</span>
                  <strong>${budget.spent.toFixed(2)}</strong>
                </div>
              </div>

              <div className="budget-progress">
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${
                      budget.exceeded ? 'exceeded' :
                      budget.spendingPercentage >= budget.alertThreshold ? 'warning' :
                      'normal'
                    }`}
                    style={{
                      width: `${Math.min(budget.spendingPercentage, 100)}%`
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {budget.spendingPercentage.toFixed(1)}%
                </span>
              </div>

              {budget.exceeded && (
                <div className="alert-badge exceeded-alert">
                  ⚠️ Over Budget
                </div>
              )}
              {!budget.exceeded && budget.spendingPercentage >= budget.alertThreshold && (
                <div className="alert-badge warning-alert">
                  ⚠️ Approaching Limit
                </div>
              )}

              <div className="budget-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(budget)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(budget.budgetId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
