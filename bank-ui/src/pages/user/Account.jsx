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
  Fade,
  Grow,
} from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SendIcon from "@mui/icons-material/Send";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardIcon from "@mui/icons-material/CreditCard";
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

  // Component hiển thị card preview
  const CardPreview = ({ cardType, cardNumber, expiryDate }) => {
    const getCardGradient = (type) => {
      switch (type) {
        case "VISA":
          return "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)";
        case "DEBIT":
          return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
        case "CREDIT":
          return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
        default:
          return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      }
    };

    const getCardLogo = (type) => {
      switch (type) {
        case "VISA":
          return "VISA";
        case "DEBIT":
          return "DEBIT";
        case "CREDIT":
          return "CREDIT";
        default:
          return "CARD";
      }
    };

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          height: 240,
          borderRadius: 4,
          background: getCardGradient(cardType),
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          color: "white",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", zIndex: 1 }}>
          <CreditCardIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", letterSpacing: 2 }}>
            {getCardLogo(cardType)}
          </Typography>
        </Box>
        <Box sx={{ zIndex: 1 }}>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontSize: "0.85rem" }}>
            Số thẻ
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: "monospace", letterSpacing: 2, mb: 3 }}>
            {cardNumber || "**** **** **** ****"}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.75rem", mb: 0.5 }}>
                Hết hạn
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                {expiryDate || "MM/YY"}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.75rem", mb: 0.5 }}>
                Chủ thẻ
              </Typography>
              <Typography variant="body1" sx={{ textTransform: "uppercase", fontSize: "0.9rem" }}>
                {account?.customerName?.split(" ").map(n => n[0]).join("") || "USER"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

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
    fetch(`${BANK_SERVICE_API}/transactions/deposit/${accountId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: parseFloat(transaction.amount) }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Lỗi không xác định" }));
          throw new Error(errorData.message || "Không thể nạp tiền");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Deposit result:", data);
        // Đóng form nạp tiền
        setActiveDepositCard(null);
        setTransaction({ amount: "" });
        // Cập nhật số dư ngay lập tức
        fetchBalances();
        alert("Nạp tiền thành công!");
      })
      .catch((err) => {
        console.error("Error depositing:", err);
        alert(err.message || "Không thể nạp tiền. Vui lòng thử lại.");
      });
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
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Lỗi không xác định" }));
          throw new Error(errorData.message || "Không thể rút tiền");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Withdraw result:", data);
        // Đóng form rút tiền
        setActiveWithdrawCard(null);
        setTransaction({ amount: "" });
        // Cập nhật số dư ngay lập tức
        fetchBalances();
        alert("Rút tiền thành công!");
      })
      .catch((err) => {
        console.error("Error withdrawing:", err);
        alert(err.message || "Không thể rút tiền. Vui lòng thử lại.");
      });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(8px)",
          opacity: 0.3,
          zIndex: 0,
        },
      }}
    >
      <UserAppBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: "relative", zIndex: 1 }}>
        <Fade in={true} timeout={800}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: "bold",
              mb: 4,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
            }}
          >
            Quản lý Tài khoản
          </Typography>
        </Fade>

        {/* Thông tin tài khoản */}
        <Grow in={true} timeout={1000}>
          <Card
            sx={{
              mb: 4,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    mr: 2,
                  }}
                >
                  <AccountBalanceIcon sx={{ fontSize: 32, color: "white" }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2d3748" }}>
                  Thông tin Tài khoản
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Họ và tên
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "600", color: "#2d3748" }}>
                      {account.customerName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Email
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "600", color: "#2d3748" }}>
                      {account.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Số điện thoại
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "600", color: "#2d3748" }}>
                      {account.phoneNumber}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Vai trò
                    </Typography>
                    <Chip
                      label={account.role}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grow>

        {/* Danh sách thẻ */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Danh sách thẻ của bạn
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCardIcon />}
            onClick={() => setShowForm(!showForm)}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #653d8f 100%)",
              },
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            Tạo thẻ mới
          </Button>
        </Box>

        {/* Form tạo thẻ */}
        {showForm && (
          <Grow in={showForm} timeout={600}>
            <Card
              sx={{
                mb: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", mb: 3, color: "#2d3748" }}
                >
                  Thông tin thẻ mới
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <CardPreview
                        cardType={newCard.cardType || "VISA"}
                        expiryDate={newCard.expiryDate ? new Date(newCard.expiryDate).toLocaleDateString("en-GB", { month: "2-digit", year: "2-digit" }) : ""}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Loại thẻ"
                          select
                          value={newCard.cardType}
                          onChange={(e) => setNewCard({ ...newCard, cardType: e.target.value })}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        >
                          <MenuItem value="VISA">VISA</MenuItem>
                          <MenuItem value="DEBIT">DEBIT</MenuItem>
                          <MenuItem value="CREDIT">CREDIT</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Ngày hết hạn"
                          type="date"
                          value={newCard.expiryDate}
                          onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Trạng thái"
                          select
                          value={newCard.status}
                          onChange={(e) => setNewCard({ ...newCard, status: e.target.value })}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                          <Button
                            variant="contained"
                            onClick={createCard}
                            sx={{
                              flex: 1,
                              borderRadius: 2,
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #5568d3 0%, #653d8f 100%)",
                              },
                              py: 1.5,
                            }}
                          >
                            Xác nhận tạo thẻ
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => setShowForm(false)}
                            sx={{
                              flex: 1,
                              borderRadius: 2,
                              borderColor: "#cbd5e0",
                              color: "#4a5568",
                              "&:hover": {
                                borderColor: "#a0aec0",
                                background: "#f7fafc",
                              },
                              py: 1.5,
                            }}
                          >
                            Hủy
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grow>
        )}

        {/* Danh sách thẻ */}
        {cards.length > 0 ? (
          <Grid container spacing={3}>
            {cards.map((card, index) => (
              <Grid item xs={12} md={6} key={card.cardId}>
                <Grow in={true} timeout={600 + index * 100}>
                  <Card
                    sx={{
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                      borderRadius: 3,
                      height: "100%",
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Card Preview */}
                      <Box sx={{ mb: 3 }}>
                        <CardPreview
                          cardType={card.cardType}
                          cardNumber={
                            card.cardId
                              ? card.cardId
                                  .toString()
                                  .replace(/\s/g, "")
                                  .replace(/(.{4})/g, "$1 ")
                                  .trim()
                              : undefined
                          }
                          expiryDate={
                            card.expiryDate
                              ? new Date(card.expiryDate).toLocaleDateString("en-GB", {
                                  month: "2-digit",
                                  year: "2-digit",
                                })
                              : ""
                          }
                        />
                      </Box>

                      {/* Status Chip */}
                      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                        <Chip
                          label={card.status}
                          sx={{
                            background: card.status === "ACTIVE"
                              ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                              : "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                            color: "white",
                            fontWeight: "bold",
                            px: 2,
                          }}
                        />
                      </Box>

                      {/* Balance Info */}
                      <Box
                        sx={{
                          mb: 3,
                          p: 2.5,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Số dư khả dụng
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: "bold",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mb: 1,
                          }}
                        >
                          {(balances?.availableBalance ?? 0).toLocaleString()} VNĐ
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                          Đang chờ xử lý: {(balances?.holdBalance ?? 0).toLocaleString()} VNĐ
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
                        <Button
                          variant="contained"
                          size="medium"
                          startIcon={<AccountBalanceWalletIcon />}
                          onClick={() => setActiveDepositCard(activeDepositCard === card.cardId ? null : card.cardId)}
                          sx={{
                            flex: { xs: "1 1 100%", sm: "0 1 auto" },
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #38d973 0%, #2ee5c5 100%)",
                            },
                            boxShadow: "0 4px 15px rgba(67, 233, 123, 0.4)",
                            fontWeight: "600",
                          }}
                        >
                          Nạp tiền
                        </Button>
                        <Button
                          variant="contained"
                          size="medium"
                          startIcon={<AccountBalanceWalletIcon />}
                          onClick={() => setActiveWithdrawCard(activeWithdrawCard === card.cardId ? null : card.cardId)}
                          sx={{
                            flex: { xs: "1 1 100%", sm: "0 1 auto" },
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #e85d8a 0%, #f5d82e 100%)",
                            },
                            boxShadow: "0 4px 15px rgba(250, 112, 154, 0.4)",
                            fontWeight: "600",
                          }}
                        >
                          Rút tiền
                        </Button>
                        <Button
                          variant="contained"
                          size="medium"
                          startIcon={<SendIcon />}
                          onClick={() => handleTransfer(card.cardId)}
                          sx={{
                            flex: { xs: "1 1 100%", sm: "0 1 auto" },
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #e68900 0%, #d66b00 100%)",
                            },
                            boxShadow: "0 4px 15px rgba(255, 152, 0, 0.4)",
                            fontWeight: "600",
                          }}
                        >
                          Chuyển khoản
                        </Button>
                      </Box>

                      {/* Form Nạp tiền */}
                      {activeDepositCard === card.cardId && (
                        <Fade in={activeDepositCard === card.cardId}>
                          <Paper
                            sx={{
                              mt: 2,
                              p: 2.5,
                              borderRadius: 2,
                              background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                              border: "1px solid rgba(33, 150, 243, 0.2)",
                            }}
                          >
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
                              Nạp tiền vào tài khoản
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1.5, mt: 1.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                placeholder="Nhập số tiền"
                                value={transaction.amount}
                                onChange={(e) => setTransaction({ amount: e.target.value })}
                                sx={{
                                  flex: 1,
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor: "white",
                                  },
                                }}
                              />
                              <Button
                                variant="contained"
                                size="medium"
                                onClick={() => depositMoney(account.accountId)}
                                sx={{
                                  borderRadius: 2,
                                  background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                                  "&:hover": {
                                    background: "linear-gradient(135deg, #38d973 0%, #2ee5c5 100%)",
                                  },
                                  fontWeight: "600",
                                }}
                              >
                                Xác nhận
                              </Button>
                            </Box>
                          </Paper>
                        </Fade>
                      )}

                      {/* Form Rút tiền */}
                      {activeWithdrawCard === card.cardId && (
                        <Fade in={activeWithdrawCard === card.cardId}>
                          <Paper
                            sx={{
                              mt: 2,
                              p: 2.5,
                              borderRadius: 2,
                              background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                              border: "1px solid rgba(255, 152, 0, 0.2)",
                            }}
                          >
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold", color: "#f57c00" }}>
                              Rút tiền từ tài khoản
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1.5, mt: 1.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                placeholder="Nhập số tiền"
                                value={transaction.amount}
                                onChange={(e) => setTransaction({ amount: e.target.value })}
                                sx={{
                                  flex: 1,
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor: "white",
                                  },
                                }}
                              />
                              <Button
                                variant="contained"
                                size="medium"
                                onClick={() => withdrawMoney(account.accountId)}
                                sx={{
                                  borderRadius: 2,
                                  background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                                  "&:hover": {
                                    background: "linear-gradient(135deg, #e85d8a 0%, #f5d82e 100%)",
                                  },
                                  fontWeight: "600",
                                }}
                              >
                                Xác nhận
                              </Button>
                            </Box>
                          </Paper>
                        </Fade>
                      )}
                  </CardContent>
                </Card>
                    </Grow>
             </Grid>
            ))}
          </Grid>
          
        ) : (
          <Grow in={true} timeout={800}>
            <Card
              sx={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                textAlign: "center",
                py: 6,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <CardContent>
                <CreditCardIcon
                  sx={{
                    fontSize: 80,
                    color: "#cbd5e0",
                    mb: 2,
                    opacity: 0.5,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Chưa có thẻ nào
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Hãy tạo thẻ mới để bắt đầu sử dụng dịch vụ!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddCardIcon />}
                  onClick={() => setShowForm(true)}
                  sx={{
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #653d8f 100%)",
                    },
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Tạo thẻ mới ngay
                </Button>
              </CardContent>
            </Card>
          </Grow>
        )}
      </Container>
    </Box>
  );
}
