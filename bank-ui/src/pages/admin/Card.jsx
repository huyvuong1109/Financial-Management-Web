import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Card as MuiCard,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  CreditCard as CreditCardIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import "./AdminHome.css";
import { BANK_SERVICE_API } from '../../config/api';

export default function CardManagement() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [cardTypeFilter, setCardTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const API_BASE = `${BANK_SERVICE_API}/api/cards`;
  const token = localStorage.getItem("token");

  const fetchCards = () => {
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      return;
    }

    setLoading(true);
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
      })
      .finally(() => {
        setLoading(false);
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

  // Filter cards
  const filteredCards = cards.filter((c) => {
    const matchesSearch = !search || 
      c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.cardId?.toString().includes(search);
    const matchesCardType = !cardTypeFilter || c.cardType === cardTypeFilter;
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesCardType && matchesStatus;
  });

  // Get unique card types
  const cardTypes = [...new Set(cards.map(c => c.cardType).filter(Boolean))];

  // Stats
  const stats = {
    total: cards.length,
    active: cards.filter(c => c.status === 'active').length,
    inactive: cards.filter(c => c.status === 'inactive').length,
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />;
  };

  const getCardTypeColor = (cardType) => {
    switch (cardType?.toUpperCase()) {
      case 'DEBIT':
        return 'primary';
      case 'CREDIT':
        return 'secondary';
      case 'PREPAID':
        return 'warning';
      default:
        return 'default';
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCardTypeFilter("");
    setStatusFilter("");
  };

  return (
    <div className="admin-home">
      <AppBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CreditCardIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                Quản lý thẻ
              </Typography>
            </Box>
            {(search || cardTypeFilter || statusFilter) && (
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ textTransform: "none" }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <MuiCard
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  boxShadow: 4,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CreditCardIcon sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng số thẻ
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.total}
                  </Typography>
                </CardContent>
              </MuiCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <MuiCard
                sx={{
                  background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  color: "white",
                  boxShadow: 4,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CheckCircleIcon sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Thẻ đang hoạt động
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.active}
                  </Typography>
                </CardContent>
              </MuiCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <MuiCard
                sx={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  boxShadow: 4,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CancelIcon sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Thẻ không hoạt động
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.inactive}
                  </Typography>
                </CardContent>
              </MuiCard>
            </Grid>
          </Grid>

          {/* Filter Card */}
          <MuiCard sx={{ mb: 3, boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <FilterListIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Bộ lọc
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Tìm theo username"
                    placeholder="Nhập tên người dùng..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Loại thẻ</InputLabel>
                    <Select
                      value={cardTypeFilter}
                      label="Loại thẻ"
                      onChange={(e) => setCardTypeFilter(e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {cardTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Trạng thái"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="active">Đang hoạt động</MenuItem>
                      <MenuItem value="inactive">Không hoạt động</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </MuiCard>

          {/* Cards Table */}
          <MuiCard sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
            <TableContainer>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredCards.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    {cards.length === 0
                      ? "Chưa có thẻ nào"
                      : "Không tìm thấy thẻ phù hợp"}
                  </Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Username</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Loại thẻ</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ngày hết hạn</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Trạng thái</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCards.map((card) => (
                      <TableRow
                        key={card.cardId}
                        sx={{
                          "&:hover": { backgroundColor: "#f5f5f5" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>{card.cardId}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{card.customerName}</TableCell>
                        <TableCell>
                          <Chip
                            label={card.cardType}
                            color={getCardTypeColor(card.cardType)}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>
                          {card.expiryDate
                            ? new Date(card.expiryDate).toLocaleDateString("vi-VN")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(card.status)}
                            label={card.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                            color={getStatusColor(card.status)}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            <Tooltip title="Xóa">
                              <IconButton
                                color="error"
                                onClick={() => deleteCard(card.cardId)}
                                sx={{
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                  },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={card.status}
                                onChange={(e) => updateStatus(card.cardId, e.target.value)}
                                sx={{
                                  height: 36,
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: card.status === 'active' ? '#4caf50' : '#f44336',
                                  },
                                }}
                              >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </MuiCard>
        </Container>
      </main>
    </div>
  );
}
