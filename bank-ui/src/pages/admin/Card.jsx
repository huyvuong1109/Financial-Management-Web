import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import "./Card.css";
import { BANK_SERVICE_API } from '../../config/api';

export default function Card() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const API_BASE = `${BANK_SERVICE_API}/api/cards`;
  const token = localStorage.getItem("token");

  const fetchCards = () => {
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      return;
    }

    fetch(`${API_BASE}/all`, {
      headers: {
        "Authorization": `Bearer ${token}`,
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
      .then((data) => {
        console.log("Dữ liệu API trả về:", data); 
        setCards(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Không thể tải danh sách thẻ. Hãy đăng nhập lại.");
      });
  };

  const deleteCard = (cardId) => {
    if (window.confirm("Bạn có chắc muốn xóa thẻ này?")) {
      fetch(`${API_BASE}/${cardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(() => fetchCards())
        .catch((err) => {
          console.error(err);
          alert("Không thể xóa thẻ.");
        });
    }
  };

  const updateStatus = (cardId, status) => {
    fetch(`${API_BASE}/${cardId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi cập nhật trạng thái");
        fetchCards();
      })
      .catch((err) => {
        console.error(err);
        alert("Không thể cập nhật trạng thái.");
      });
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const filteredCards = cards.filter((c) =>
    c.cardId?.toString().includes(search)
  );  

  return (
    <div className="card-page">
    {/* AppBar + Sidebar */}
    <AppBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    <Sidebar isOpen={sidebarOpen} />

    {/* Nội dung chính */}
    <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
      <h2>Manager Card</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Search by ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table border="1" cellPadding="8" className="card-table">
        <thead className="card-table-head">
          <tr>
            <th className="card-th-id">ID</th>
            <th className="card-th-name">User name</th>
            <th className="card-th-type">Card type</th>
            <th className="card-th-expiry">Expiry Date</th>
            <th className="card-th-status">Status</th>
            <th className="card-th-action">Action</th>
          </tr>
        </thead>
        <tbody className="card-table-body">
          {filteredCards && filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <tr key={card.cardId} className="card-row">
                <td className="card-id">{card.cardId}</td>
                <td className="card-name">{card.customerName}</td>
                <td className="card-type">{card.cardType}</td>
                <td className="card-expiry">{card.expiryDate}</td>
                <td className="card-status">{card.status}</td>
                <td className="card-actions">
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/Card/${card.cardId}`)}
                  >
                    View
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteCard(card.cardId)}
                  >
                    Delete
                  </button>
                  <select
                    className="select"
                    value={card.status}
                    onChange={(e) => updateStatus(card.cardId, e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-cards">
                No cards found
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </main>
  </div>

  );
}
