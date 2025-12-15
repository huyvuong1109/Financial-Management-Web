import "./polyfill";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminHome from './pages/admin/AdminHome';
import User from './pages/admin/User';
import CardManagement from './pages/admin/Card';
import CardDetails from './pages/admin/CardDetails';
import UserHome from './pages/user/UserHome';
import Forbidden from './pages/Forbidden';
import ProtectedRoute from './components/ProtectedRoute';
import Account from './pages/user/Account';
import Transfer from './pages/user/Transfer';
import PublicRoute from './components/PublicRoute';
import Transactions from './pages/admin/Transactions';
import TransactionHistory from "./pages/user/TransactionHistory";
import FinancialReports from "./pages/user/FinancialReports";
import Budget from "./pages/user/Budget";
import AdminFinancialReports from './pages/admin/AdminFinancialReports';

ReactDOM.createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/DashBoard" element={<AdminHome />} />
        <Route path="/User" element={<User />} />
        <Route path="/Card" element={<CardManagement />} />
        <Route path="/Card/:cardId" element={<CardDetails />} />
        <Route path="Transactions" element={<Transactions />} />
        <Route path="/AdminFinancialReports" element={<AdminFinancialReports />} />
      </Route>

      {/* User routes */}
      <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
      <Route path="/user-home" element={<UserHome />} />
      <Route path="/account" element={<Account />} />
      <Route path="/transfer/:cardId" element={<Transfer />} />
      <Route path="/transaction-history" element={<TransactionHistory />} />
      <Route path="/financial-reports" element={<FinancialReports />} />
      <Route path="/budget" element={<Budget />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />
    </Routes>
  </BrowserRouter>
);
