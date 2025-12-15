import React, { useState, useEffect } from "react";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import "./AdminHome.css";
import { BANK_SERVICE_API } from '../../config/api';

export default function AdminHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "USER"
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = `${BANK_SERVICE_API}/api/accounts`;
  const token = localStorage.getItem("token");

  const fetchAccounts = () => {
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      return;
    }

    fetch(API_BASE, {
      headers: {
        "Authorization": `Bearer ${token.trim()}`,
        "Content-Type": "application/json"
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Lỗi ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setAccounts(data);
        setError("");
      })
      .catch(err => {
        console.error(err);
        setError("Không thể tải danh sách tài khoản. Hãy đăng nhập lại.");
      });
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account.accountId);
      setFormData({
        customerName: account.customerName,
        email: account.email,
        phoneNumber: account.phoneNumber,
        password: "",
        role: account.role
      });
    } else {
      setEditingAccount(null);
      setFormData({
        customerName: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "USER"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const method = editingAccount ? "PUT" : "POST";
    const url = editingAccount ? `${API_BASE}/${editingAccount}` : API_BASE;

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Lỗi ${res.status}`);
        }
        return res.text();
      })
      .then(() => {
        fetchAccounts();
        setIsModalOpen(false);
      })
      .catch(err => {
        console.error(err);
        alert("Không thể lưu account. Vui lòng thử lại.");
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(async (res) => {
          if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || `Lỗi ${res.status}`);
          }
          return res.text();
        })
        .then(() => {
          fetchAccounts();
        })
        .catch(err => {
          console.error(err);
          alert(err.message); 
        });
    }
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-home">
      <AppBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <h2>Dashboard</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo Customer Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "10px", padding: "5px", width: "250px" }}
        />

        <button onClick={() => openModal()} style={{ marginLeft: "10px" }}>
          ➕ Thêm Account
        </button>

        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map(acc => (
              <tr key={acc.accountId}>
                <td>{acc.accountId}</td>
                <td>{acc.customerName}</td>
                <td>{acc.email}</td>
                <td>{acc.phoneNumber}</td>
                <td>{acc.role}</td>
                <td>
                  <button onClick={() => openModal(acc)}>✏ Sửa</button>
                  <button className="delete-btn" onClick={() => handleDelete(acc.accountId)}>🗑 Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>{editingAccount ? "Sửa Account" : "Thêm Account"}</h3>
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
              {!editingAccount && (
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              )}
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="modal-actions">
                <button onClick={handleSave}>💾 Lưu</button>
                <button onClick={() => setIsModalOpen(false)}>❌ Hủy</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
