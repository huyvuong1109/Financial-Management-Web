// src/components/User/Account.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SendIcon from "@mui/icons-material/Send";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import UserAppBar from "./UserAppBar";
import { useNavigate } from "react-router-dom";
import { BANK_SERVICE_API } from '../../config/api';

export default function Account() {
  const [account, setAccount] = useState(null);
  const [cards, setCards] = useState([]);
  const [balances, setBalances] = useState([]);
  const token = localStorage.getItem("token");
  const [newCard, setNewCard] = useState({
    cardType: "",
    expiryDate: "",
    status: "active",
  });
  const [showForm, setShowForm] = useState(false);
  const [transaction, setTransaction] = useState({ amount: "" });
  const [activeDepositCard, setActiveDepositCard] = useState(null);
  const [activeWithdrawCard, setActiveWithdrawCard] = useState(null);
  const navigate = useNavigate();


  const handleTransfer = (cardId) => {
    navigate(`/transfer/${cardId}`); // điều hướng đến trang chuyển khoản với cardId
  };

  // Hàm lấy accountId từ token
  const getAccountIdFromToken = () => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      console.log("Account ID:", decoded.sub);
      return decoded.sub;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  useEffect(() => {
    const accountId = getAccountIdFromToken();
    console.log("Token:", token);
    if (!accountId) return;
    console.log("Account ID from token:", accountId);

    // Lấy thông tin tài khoản
    fetch(`${BANK_SERVICE_API}/api/accounts/${accountId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        
        // eslint-disable-next-line no-unused-vars
        const { password, ...safeData } = data;
        console.log("Account data:", safeData);
        setAccount(safeData);
      })
      .catch((err) => console.error("Error fetching account:", err));

    // Lấy danh sách thẻ
    fetch(`${BANK_SERVICE_API}/api/cards/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch((err) => console.error("Error fetching cards:", err));
  }, []);
  const fetchBalances = () => {
    fetch(`${BANK_SERVICE_API}/api/balances`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setBalances(data))
      .catch((err) => console.error(err));
  };
  
  useEffect(() => {
    fetchBalances();
  }, [token]);
  

  if (!account) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }
  const createCard = () => {
    if (!newCard.cardType.trim()) {
      alert("Vui lòng chọn loại thẻ!");
      return;
    }
    fetch(`${BANK_SERVICE_API}/api/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newCard),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Card created:", data);
        setCards((prev) => [...prev, data]);
        setShowForm(false);
        setNewCard({ cardType: "", expiryDate: "", status: "ACTIVE" });
      })
      .catch((err) => console.error("Error creating card:", err));
  };


  const depositMoney = (accountId) => {
    if (!transaction.amount || isNaN(transaction.amount) || transaction.amount <= 0) {
      alert("Số tiền không hợp lệ!");
      return;
    }
    fetch(`/bankservice/api/balances/deposit/${accountId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: parseFloat(transaction.amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Deposit result:", data);
        setBalances(data);
        alert("Nạp tiền thành công!");
        setTransaction({ amount: "" });
        setShowDepositForm(false);
        fetchBalances();
      })
      .catch((err) => console.error("Error depositing:", err));
  };
  
  const withdrawMoney = (accountId) => {
    if (!transaction.amount || isNaN(transaction.amount) || transaction.amount <= 0) {
      alert("Số tiền không hợp lệ!");
      return;
    }
    fetch(`${BANK_SERVICE_API}/transactions/withdraw/${accountId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: parseFloat(transaction.amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Withdraw result:", data);
        setBalances(data);
        alert("Rút tiền thành công!");
        setTransaction({ amount: "" });
        // setShowWithdrawForm(false);
        fetchBalances();
      })
      .catch((err) => console.error("Error withdrawing:", err));
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <UserAppBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4, color: "#1976d2" }}>
          Quản lý Tài khoản
        </Typography>

        {/* Thông tin tài khoản */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <AccountBalanceIcon sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Thông tin Tài khoản
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Họ và tên</Typography>
                <Typography variant="h6">{account.customerName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="h6">{account.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="h6">{account.phoneNumber}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Vai trò</Typography>
                <Chip label={account.role} color="primary" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Danh sách thẻ */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Danh sách thẻ của bạn
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCardIcon />}
            onClick={() => setShowForm(!showForm)}
            sx={{ borderRadius: 2 }}
          >
            Tạo thẻ mới
          </Button>
        </Box>

        {/* Form tạo thẻ */}
        {showForm && (
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin thẻ mới
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Loại thẻ"
                    select
                    value={newCard.cardType}
                    onChange={(e) => setNewCard({ ...newCard, cardType: e.target.value })}
                  >
                    <MenuItem value="VISA">VISA</MenuItem>
                    <MenuItem value="DEBIT">DEBIT</MenuItem>
                    <MenuItem value="CREDIT">CREDIT</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Ngày hết hạn"
                    type="date"
                    value={newCard.expiryDate}
                    onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Trạng thái"
                    select
                    value={newCard.status}
                    onChange={(e) => setNewCard({ ...newCard, status: e.target.value })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={createCard} sx={{ mr: 2 }}>
                    Xác nhận tạo thẻ
                  </Button>
                  <Button variant="outlined" onClick={() => setShowForm(false)}>
                    Hủy
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Danh sách thẻ */}
        {cards.length > 0 ? (
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} md={6} key={card.cardId}>
                <Card sx={{ boxShadow: 3, height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          Thẻ {card.cardType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Số thẻ: {card.cardId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Hết hạn: {card.expiryDate}
                        </Typography>
                      </Box>
                      <Chip
                        label={card.status}
                        color={card.status === "ACTIVE" ? "success" : "default"}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Số dư khả dụng
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                        {(balances?.availableBalance ?? 0).toLocaleString()} VNĐ
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Đang chờ xử lý: {(balances?.holdBalance ?? 0).toLocaleString()} VNĐ
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={() => setActiveDepositCard(activeDepositCard === card.cardId ? null : card.cardId)}
                      >
                        Nạp tiền
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={() => setActiveWithdrawCard(activeWithdrawCard === card.cardId ? null : card.cardId)}
                      >
                        Rút tiền
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SendIcon />}
                        onClick={() => handleTransfer(card.cardId)}
                        sx={{ backgroundColor: "#ff9800", "&:hover": { backgroundColor: "#f57c00" } }}
                      >
                        Chuyển khoản
                      </Button>
                    </Box>

                    {/* Form Nạp tiền */}
                    {activeDepositCard === card.cardId && (
                      <Paper sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd" }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Nạp tiền vào tài khoản
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Nhập số tiền"
                            value={transaction.amount}
                            onChange={(e) => setTransaction({ amount: e.target.value })}
                            sx={{ flex: 1 }}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => depositMoney(account.accountId)}
                          >
                            Xác nhận
                          </Button>
                        </Box>
                      </Paper>
                    )}

                    {/* Form Rút tiền */}
                    {activeWithdrawCard === card.cardId && (
                      <Paper sx={{ mt: 2, p: 2, backgroundColor: "#fff3e0" }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Rút tiền từ tài khoản
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Nhập số tiền"
                            value={transaction.amount}
                            onChange={(e) => setTransaction({ amount: e.target.value })}
                            sx={{ flex: 1 }}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => withdrawMoney(account.accountId)}
                            sx={{ backgroundColor: "#f57c00" }}
                          >
                            Xác nhận
                          </Button>
                        </Box>
                      </Paper>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{ boxShadow: 3, textAlign: "center", py: 4 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Chưa có thẻ nào. Hãy tạo thẻ mới để bắt đầu!
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
