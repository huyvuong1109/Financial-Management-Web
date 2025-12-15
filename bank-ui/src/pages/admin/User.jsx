import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
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
  IconButton,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as ReportIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import "./AdminHome.css";
import { BANK_SERVICE_API } from '../../config/api';

export default function AdminHome() {
  const navigate = useNavigate();
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
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [selectedUserBalance, setSelectedUserBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const API_BASE = `${BANK_SERVICE_API}/api/accounts`;
  const token = localStorage.getItem("token");

  const fetchAccounts = () => {
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      return;
    }

    setLoading(true);
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
      })
      .finally(() => {
        setLoading(false);
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
        .then(() => fetchAccounts())
        .catch(err => {
          console.error(err);
          alert("Không thể xóa account.");
        });
    }
  };

  const handleViewReport = (accountId) => {
    navigate(`/Transactions?accountId=${accountId}`);
  };

  const handleViewFinancialReport = (accountId) => {
    navigate(`/AdminFinancialReports?accountId=${accountId}`);
  };

  const handleViewBalance = async (accountId, accountName, email) => {
    setBalanceModalOpen(true);
    setLoadingBalance(true);
    setSelectedUserBalance(null);
    
    try {
      // Fetch tất cả wallet balances và tìm theo accountId
      const response = await fetch(`${BANK_SERVICE_API}/api/reports/wallet-balances`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Không thể tải số dư");
      }
      
      const balances = await response.json();
      const userBalance = balances.find(b => b.accountId === accountId);
      
      if (userBalance) {
        setSelectedUserBalance({
          ...userBalance,
          customerName: accountName,
          email: email,
        });
      } else {
        // Nếu không tìm thấy, tạo object mặc định
        setSelectedUserBalance({
          accountId: accountId,
          customerName: accountName,
          email: email,
          availableBalance: 0,
          holdBalance: 0,
          totalBalance: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Không thể tải số dư. Vui lòng thử lại.");
      // Tạo object mặc định với thông tin user
      setSelectedUserBalance({
        accountId: accountId,
        customerName: accountName,
        email: email,
        availableBalance: 0,
        holdBalance: 0,
        totalBalance: 0,
      });
    } finally {
      setLoadingBalance(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         acc.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: accounts.length,
    admin: accounts.filter(acc => acc.role === "ADMIN").length,
    user: accounts.filter(acc => acc.role === "USER").length
  };

  return (
    <div className="admin-home">
      <AppBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              Quản lý người dùng
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openModal()}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a4190 100%)",
                },
                boxShadow: 3,
              }}
            >
              Thêm tài khoản
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  boxShadow: 4,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PeopleIcon sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng số tài khoản
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  boxShadow: 4,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AdminIcon sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Quản trị viên
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.admin}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  color: "white",
                  boxShadow: 4,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Người dùng
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.user}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filter */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
              }}
              sx={{ flexGrow: 1, minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={roleFilter}
                label="Vai trò"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="ALL">Tất cả vai trò</MenuItem>
                <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                <MenuItem value="USER">Người dùng</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Table */}
          <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
            <TableContainer>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredAccounts.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    {accounts.length === 0
                      ? "Chưa có tài khoản nào"
                      : "Không tìm thấy tài khoản phù hợp"}
                  </Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tên khách hàng</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Email</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Số điện thoại</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Vai trò</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAccounts.map((acc) => (
                      <TableRow
                        key={acc.accountId}
                        sx={{
                          "&:hover": { backgroundColor: "#f5f5f5" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>{acc.accountId}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{acc.customerName}</TableCell>
                        <TableCell>{acc.email}</TableCell>
                        <TableCell>{acc.phoneNumber}</TableCell>
                        <TableCell>
                          <Chip
                            label={acc.role}
                            color={acc.role === "ADMIN" ? "warning" : "primary"}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            <Tooltip title="Báo cáo giao dịch">
                              <IconButton
                                color="info"
                                onClick={() => handleViewReport(acc.accountId)}
                                sx={{
                                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                  color: "white",
                                  "&:hover": {
                                    background: "linear-gradient(135deg, #3d8bfe 0%, #00d9fe 100%)",
                                    transform: "translateY(-2px)",
                                  },
                                  boxShadow: 2,
                                }}
                              >
                                <ReportIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Báo cáo tài chính">
                              <IconButton
                                color="success"
                                onClick={() => handleViewFinancialReport(acc.accountId)}
                                sx={{
                                  background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                                  color: "white",
                                  "&:hover": {
                                    background: "linear-gradient(135deg, #38d973 0%, #2de9d7 100%)",
                                    transform: "translateY(-2px)",
                                  },
                                  boxShadow: 2,
                                }}
                              >
                                <BarChartIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Số dư">
                              <IconButton
                                color="warning"
                                onClick={() => handleViewBalance(acc.accountId, acc.customerName, acc.email)}
                                sx={{
                                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                  color: "white",
                                  "&:hover": {
                                    background: "linear-gradient(135deg, #e084f0 0%, #e54a5c 100%)",
                                    transform: "translateY(-2px)",
                                  },
                                  boxShadow: 2,
                                }}
                              >
                                <AccountBalanceIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                color="primary"
                                onClick={() => openModal(acc)}
                                sx={{
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                  },
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(acc.accountId)}
                                sx={{
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                  },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Card>

          {/* Modal */}
          <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {editingAccount ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
                <TextField
                  label="Tên khách hàng"
                  required
                  fullWidth
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
                <TextField
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <TextField
                  label="Số điện thoại"
                  required
                  fullWidth
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
                {!editingAccount && (
                  <TextField
                    label="Mật khẩu"
                    type="password"
                    required
                    fullWidth
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                )}
                <FormControl fullWidth>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    value={formData.role}
                    label="Vai trò"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <MenuItem value="USER">Người dùng</MenuItem>
                    <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setIsModalOpen(false)} color="inherit">
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a4190 100%)",
                  },
                }}
                startIcon={<AddIcon />}
              >
                Lưu
              </Button>
            </DialogActions>
          </Dialog>

          {/* Balance Modal */}
          <Dialog 
            open={balanceModalOpen} 
            onClose={() => setBalanceModalOpen(false)} 
            maxWidth="md" 
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AccountBalanceIcon sx={{ fontSize: 30, color: "#1976d2" }} />
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Số dư tài khoản
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {loadingBalance ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : selectedUserBalance ? (
                <Box sx={{ mt: 2 }}>
                  {/* User Info */}
                  <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Thông tin tài khoản
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                        {selectedUserBalance.customerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedUserBalance.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                        ID: {selectedUserBalance.accountId}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Balance Table */}
                  <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Loại số dư</TableCell>
                          <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                            Số tiền
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: "#1976d2",
                                }}
                              />
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Số dư khả dụng
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold", color: "#1976d2" }}
                            >
                              {parseFloat(selectedUserBalance.availableBalance || 0).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: "#f57c00",
                                }}
                              />
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Số dư đang giữ
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold", color: "#f57c00" }}
                            >
                              {parseFloat(selectedUserBalance.holdBalance || 0).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            backgroundColor: "#f5f5f5",
                            "& td": { borderTop: "2px solid #ddd", fontWeight: "bold" },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: "#2e7d32",
                                }}
                              />
                              <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                                Tổng số dư
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "bold", color: "#2e7d32" }}
                            >
                              {parseFloat(selectedUserBalance.totalBalance || 0).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <Typography color="text.secondary">
                    Không thể tải thông tin số dư
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setBalanceModalOpen(false)}
                variant="contained"
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a4190 100%)",
                  },
                }}
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </main>
    </div>
  );
}
