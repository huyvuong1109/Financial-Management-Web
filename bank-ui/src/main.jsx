import "./polyfill";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import Forbidden from './pages/Forbidden';

// Layouts
import MainLayout from './layouts/MainLayout';

// User pages
import Dashboard from './pages/user/Dashboard';
import TransactionsPage from './pages/user/TransactionsPage';
import BudgetPage from './pages/user/BudgetPage';
import SavingsPage from './pages/user/SavingsPage';
import ReportsPage from './pages/user/ReportsPage';
import CategoriesPage from './pages/user/CategoriesPage';
import Account from './pages/user/Account';
import Transfer from './pages/user/Transfer';

// Admin pages
import AdminHome from './pages/admin/AdminHome';
import User from './pages/admin/User';
import Card from './pages/admin/Card';
import CardDetails from './pages/admin/CardDetails';
import Transactions from './pages/admin/Transactions';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider 
      maxSnack={3} 
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={3000}
    >
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/403" element={<Forbidden />} />

          {/* User Routes with Main Layout */}
          <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/accounts" element={<Account />} />
              <Route path="/transfer/:cardId" element={<Transfer />} />
              <Route path="/user-home" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin-home" element={<AdminHome />} />
            <Route path="/DashBoard" element={<AdminHome />} />
            <Route path="/User" element={<User />} />
            <Route path="/Card" element={<Card />} />
            <Route path="/Card/:cardId" element={<CardDetails />} />
            <Route path="/Transactions" element={<Transactions />} />
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  </ThemeProvider>
);
