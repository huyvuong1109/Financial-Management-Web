// src/pages/user/Account.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  CreditCard as CreditCardIcon,
  Add as AddIcon,
  AccountBalance as AccountBalanceIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Send as SendIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useSnackbar } from 'notistack';

export default function Account() {
  const [account, setAccount] = useState(null);
  const [cards, setCards] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  
  // Dialog states
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showBalanceMap, setShowBalanceMap] = useState({});
  
  const [newCard, setNewCard] = useState({
    cardType: "",
    expiryDate: "",
    status: "ACTIVE",
  });
  
  const [editProfile, setEditProfile] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
  });

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const getAccountIdFromToken = () => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.sub;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const accountId = getAccountIdFromToken();
    if (!accountId) return;

    try {
      // Fetch account info
      const accountRes = await fetch(`/bankservice/api/accounts/${accountId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const accountData = await accountRes.json();
      const { password, ...safeData } = accountData;
      setAccount(safeData);
      setEditProfile({
        customerName: safeData.customerName || "",
        email: safeData.email || "",
        phoneNumber: safeData.phoneNumber || "",
      });

      // Fetch cards
      const cardsRes = await fetch(`/bankservice/api/cards/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cardsData = await cardsRes.json();
      setCards(cardsData);

      // Fetch balances
      const balancesRes = await fetch("/bankservice/api/balances", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balancesData = await balancesRes.json();
      setBalances(balancesData);
    } catch (err) {
      console.error("Error fetching data:", err);
      enqueueSnackbar("Không thể tải dữ liệu", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const createCard = async () => {
    if (!newCard.cardType.trim()) {
      enqueueSnackbar("Vui lòng chọn loại thẻ!", { variant: "warning" });
      return;
    }

    try {
      const res = await fetch("/bankservice/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCard),
      });
      const data = await res.json();
      setCards((prev) => [...prev, data]);
      setShowCardDialog(false);
      setNewCard({ cardType: "", expiryDate: "", status: "ACTIVE" });
      enqueueSnackbar("Tạo thẻ thành công!", { variant: "success" });
    } catch (err) {
      console.error("Error creating card:", err);
      enqueueSnackbar("Không thể tạo thẻ", { variant: "error" });
    }
  };

  const toggleBalanceVisibility = (cardId) => {
    setShowBalanceMap((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const getCardBalance = (cardId) => {
    const balance = balances.find((b) => b.accountId === cardId);
    return balance?.availableBalance || 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return "•••• •••• •••• ••••";
    return cardNumber.replace(/(.{4})/g, "$1 ").trim();
  };

  const getCardGradient = (cardType) => {
    switch (cardType?.toUpperCase()) {
      case "VISA":
        return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      case "MASTERCARD":
        return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
      case "DEBIT":
        return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
      default:
        return "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)";
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Thẻ & Tài khoản
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thẻ ngân hàng và thông tin tài khoản của bạn
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Thông tin cá nhân
                </Typography>
                <IconButton size="small" onClick={() => setShowEditProfileDialog(true)}>
                  <EditIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    fontSize: "2rem",
                    mb: 2,
                  }}
                >
                  {account?.customerName?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {account?.customerName || "Người dùng"}
                </Typography>
                <Chip
                  label={account?.role || "USER"}
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tên tài khoản
                    </Typography>
                    <Typography variant="body2">
                      {account?.accountId || "N/A"}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2">
                      {account?.email || "Chưa cập nhật"}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PhoneIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Số điện thoại
                    </Typography>
                    <Typography variant="body2">
                      {account?.phoneNumber || "Chưa cập nhật"}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Cards Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Thẻ của tôi ({cards.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCardDialog(true)}
            >
              Thêm thẻ mới
            </Button>
          </Box>

          <Grid container spacing={2}>
            {cards.length === 0 ? (
              <Grid size={12}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    bgcolor: "background.default",
                  }}
                >
                  <CreditCardIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                  <Typography color="text.secondary">
                    Bạn chưa có thẻ nào. Hãy tạo thẻ mới!
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              cards.map((card) => (
                <Grid size={{ xs: 12, sm: 6 }} key={card.cardId}>
                  <Card
                    sx={{
                      background: getCardGradient(card.cardType),
                      color: "white",
                      borderRadius: 3,
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 200,
                    }}
                  >
                    <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                          {card.cardType || "CARD"}
                        </Typography>
                        <Chip
                          label={card.status}
                          size="small"
                          sx={{
                            bgcolor: card.status === "ACTIVE" ? "rgba(255,255,255,0.3)" : "rgba(255,0,0,0.3)",
                            color: "white",
                          }}
                          icon={card.status === "ACTIVE" ? <LockOpenIcon sx={{ color: "white !important" }} /> : <LockIcon sx={{ color: "white !important" }} />}
                        />
                      </Box>

                      <Box sx={{ my: 2 }}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Số dư
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h5" fontWeight="bold">
                            {showBalanceMap[card.cardId]
                              ? formatCurrency(getCardBalance(card.cardId))
                              : "••••••••"}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => toggleBalanceVisibility(card.cardId)}
                            sx={{ color: "white" }}
                          >
                            {showBalanceMap[card.cardId] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, letterSpacing: 2 }}>
                          {formatCardNumber(card.cardNumber)}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Hết hạn: {card.expiryDate || "N/A"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<SendIcon />}
                          onClick={() => navigate(`/transfer/${card.cardId}`)}
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                          }}
                        >
                          Chuyển tiền
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>

        {/* Total Balance */}
        <Grid size={12}>
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <AccountBalanceIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Tổng số dư tất cả thẻ
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {formatCurrency(
                          balances.reduce((sum, b) => sum + (b.availableBalance || 0), 0)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: "flex", gap: 2, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" fontWeight="bold">
                        {cards.length}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Số thẻ
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" fontWeight="bold">
                        {cards.filter((c) => c.status === "ACTIVE").length}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Đang hoạt động
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Card Dialog */}
      <Dialog open={showCardDialog} onClose={() => setShowCardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm thẻ mới</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Loại thẻ</InputLabel>
              <Select
                value={newCard.cardType}
                label="Loại thẻ"
                onChange={(e) => setNewCard({ ...newCard, cardType: e.target.value })}
              >
                <MenuItem value="VISA">Visa</MenuItem>
                <MenuItem value="MASTERCARD">Mastercard</MenuItem>
                <MenuItem value="DEBIT">Thẻ ghi nợ</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Ngày hết hạn"
              type="date"
              value={newCard.expiryDate}
              onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCardDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={createCard}>
            Tạo thẻ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfileDialog} onClose={() => setShowEditProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Họ và tên"
              value={editProfile.customerName}
              onChange={(e) => setEditProfile({ ...editProfile, customerName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editProfile.email}
              onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Số điện thoại"
              value={editProfile.phoneNumber}
              onChange={(e) => setEditProfile({ ...editProfile, phoneNumber: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditProfileDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => {
            // TODO: Implement update profile API
            enqueueSnackbar("Cập nhật thông tin thành công!", { variant: "success" });
            setShowEditProfileDialog(false);
          }}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
