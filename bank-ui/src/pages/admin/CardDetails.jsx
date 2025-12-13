import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import "./CardDetails.css";
import { BANK_SERVICE_API } from '../../config/api';

export default function CardDetails() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Lấy thông tin thẻ
  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const res = await axios.get(
          `${BANK_SERVICE_API}/api/cards/${cardId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCard(res.data);
      } catch (err) {
        console.error("Error fetching card details", err);
      }
    };
    fetchCardDetails();
  }, [cardId, token]);

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount)) {
      alert("Please enter a valid deposit amount");
      return;
    }
    try {
      await axios.post(
        `${BANK_SERVICE_API}/transactions/deposit/${card.accountId}`,
        {
          amount: parseFloat(depositAmount),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Deposit successful!");
      setDepositAmount("");
      window.location.reload(); // Load lại dữ liệu balance
    } catch (err) {
      console.error("Error depositing money", err);
      alert("Deposit failed!");
    }
  };
  
  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount)) {
      alert("Please enter a valid withdraw amount");
      return;
    }
    try {
      await axios.post(
        `${BANK_SERVICE_API}/transactions/withdraw/${card.accountId}`,
        {
          amount: parseFloat(withdrawAmount),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Withdraw successful!");
      setWithdrawAmount("");
      window.location.reload();
    } catch (err) {
      console.error("Error withdrawing money", err);
      alert("Withdraw failed!");
    }
  };
  
  if (!card) return <p>Loading...</p>;

  return (
    <div className="card-page">
      <AppBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <h2>Card Details</h2>
        <div className="card-details-container">
          {/* Card Information */}
          <div className="card-info-box">
            <h3>Card Information</h3>
            <p><strong>Card ID:</strong> {card.cardId}</p>
            <p><strong>Card Type:</strong> {card.cardType}</p>
            <p><strong>Expiry Date:</strong> {card.expiryDate}</p>
            <p><strong>Status:</strong> {card.status}</p>
            <p><strong>User Name:</strong> {card.customerName}</p>
            <p><strong>User Email:</strong> {card.email}</p>
            <button className="btn-back" onClick={() => navigate("/Card")}>
              Back to all card
            </button>
          </div>

          {/* Balance Information */}
          <div className="balance-info-box">
            <h3>Balance Information</h3>
            <p><strong>Balance ID:</strong> {card.balanceId}</p>
            <p><strong>Available Balance:</strong> {card.availableBalance}</p>
            <p><strong>Hold Balance:</strong> {card.holdBalance}</p>

            <div className="form-group">
              <input
                placeholder="Deposit Amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <button className="btn-deposit" onClick={handleDeposit}>
                Deposit
              </button>
            </div>
            <div className="form-group">
              <input
                placeholder="Withdraw Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button className="btn-withdraw" onClick={handleWithdraw}>
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
