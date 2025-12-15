import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppBar from './AppBar';
import Sidebar from './Sidebar';
import axios from 'axios';
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
  Pagination,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Assessment as AssessmentIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { BANK_SERVICE_API } from '../../config/api';

const Transactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const accountIdFromUrl = searchParams.get('accountId');
  
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [transactionType, setTransactionType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');
  const [filteredAccountId, setFilteredAccountId] = useState(accountIdFromUrl || '');

  const token = localStorage.getItem("token");

  // Fetch accounts để map email với accountId
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(`${BANK_SERVICE_API}/api/accounts`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        setAccounts(response.data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, [token]);

  // Fetch tất cả transactions một lần khi component mount hoặc khi cần filter theo accountId
  useEffect(() => {
    fetchAllTransactions();
  }, [token]);

  // Filter transactions khi email hoặc accountId thay đổi
  useEffect(() => {
    if (emailFilter) {
      const account = accounts.find(acc => 
        acc.email?.toLowerCase().includes(emailFilter.toLowerCase())
      );
      if (account) {
        setFilteredAccountId(account.accountId);
      } else {
        setFilteredAccountId('');
        setTransactions([]);
      }
    } else if (accountIdFromUrl) {
      setFilteredAccountId(accountIdFromUrl);
    } else {
      setFilteredAccountId('');
    }
  }, [emailFilter, accounts, accountIdFromUrl]);

  // Filter transactions theo accountId và các filter khác
  useEffect(() => {
    let filtered = [...allTransactions];
    
    // Filter theo accountId
    if (filteredAccountId) {
      filtered = filtered.filter(t => 
        t.fromAccountId === filteredAccountId || t.toAccountId === filteredAccountId
      );
    }
    
    // Filter theo transactionType
    if (transactionType) {
      filtered = filtered.filter(t => t.transactionType === transactionType);
    }
    
    // Filter theo status
    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    
    // Pagination
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedTransactions = filtered.slice(startIndex, endIndex);
    
    setTransactions(paginatedTransactions);
    setTotalPages(Math.ceil(filtered.length / size));
  }, [filteredAccountId, allTransactions, size, page, transactionType, status]);

  const fetchAllTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch tất cả transactions (không filter ở backend)
      const url = `${BANK_SERVICE_API}/transactions/all?page=0&size=1000&transactionType=&status=`;
      
      const response = await axios.get(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      setAllTransactions(response.data.content);
    } catch (err) {
      setError("Không thể tải danh sách giao dịch. Vui lòng kiểm tra kết nối hoặc token.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setIsModalOpen(true);
  };
    
  const handleApprove = async () => {
    setIsUpdateLoading(true);
    setError(null);
    try {
      const url = `${BANK_SERVICE_API}/transactions/${selectedTransactionId}/approve`;
      await axios.post(url, {}, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setIsModalOpen(false);
      fetchAllTransactions(); 
    } catch (err) {
      setError("Không thể phê duyệt giao dịch.");
      console.error("Error approving transaction:", err);
    } finally {
      setIsUpdateLoading(false);
    }
  };
    
  const handleReject = async () => {
    setIsUpdateLoading(true);
    setError(null);
    try {
      const url = `${BANK_SERVICE_API}/transactions/${selectedTransactionId}/reject`;
      await axios.post(url, {}, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setIsModalOpen(false);
      fetchAllTransactions();
    } catch (err) {
      setError("Không thể từ chối giao dịch.");
      console.error("Error rejecting transaction:", err);
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
      case 'AWAITING_APPROVAL':
        return 'warning';
      case 'EXPIRED':
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon fontSize="small" />;
      case 'REJECTED':
        return <CancelIcon fontSize="small" />;
      case 'PENDING':
      case 'AWAITING_APPROVAL':
        return <PendingIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'success';
      case 'WITHDRAWAL':
        return 'error';
      case 'TRANSFER':
        return 'info';
      default:
        return 'default';
    }
  };

  const getAccountEmail = (accountId) => {
    const account = accounts.find(acc => acc.accountId === accountId);
    return account?.email || accountId;
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.accountId === accountId);
    return account?.customerName || accountId;
  };

  const clearFilters = () => {
    setEmailFilter('');
    setFilteredAccountId('');
    setTransactionType('');
    setStatus('');
    setSearchParams({});
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
              <AssessmentIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                Lịch sử giao dịch
              </Typography>
            </Box>
            {(filteredAccountId || emailFilter || transactionType || status) && (
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

          {/* Filter Cards */}
          <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 3 }}>
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
                    label="Lọc theo email"
                    placeholder="Nhập email người dùng..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {filteredAccountId && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Tìm thấy: {getAccountName(filteredAccountId)} ({getAccountEmail(filteredAccountId)})
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Loại giao dịch</InputLabel>
                    <Select
                      value={transactionType}
                      label="Loại giao dịch"
                      onChange={(e) => setTransactionType(e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="DEPOSIT">Nạp tiền</MenuItem>
                      <MenuItem value="WITHDRAWAL">Rút tiền</MenuItem>
                      <MenuItem value="TRANSFER">Chuyển tiền</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={status}
                      label="Trạng thái"
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="PENDING">Đang chờ</MenuItem>
                      <MenuItem value="APPROVED">Đã phê duyệt</MenuItem>
                      <MenuItem value="REJECTED">Đã từ chối</MenuItem>
                      <MenuItem value="EXPIRED">Hết hạn</MenuItem>
                      <MenuItem value="FAILED">Thất bại</MenuItem>
                      <MenuItem value="AWAITING_APPROVAL">Chờ phê duyệt</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  boxShadow: 4,
                }}
              >
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Tổng số giao dịch
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {transactions.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  color: "white",
                  boxShadow: 4,
                }}
              >
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Đã phê duyệt
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {transactions.filter(t => t.status === 'APPROVED').length}
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
                }}
              >
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Chờ phê duyệt
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {transactions.filter(t => t.status === 'AWAITING_APPROVAL').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Transactions Table */}
          <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
            <TableContainer>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : transactions.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    Không tìm thấy giao dịch nào
                  </Typography>
                </Box>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Từ tài khoản</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Đến tài khoản</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Số tiền</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Loại</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Trạng thái</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                          Hành động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow
                          key={t.id}
                          sx={{
                            "&:hover": { backgroundColor: "#f5f5f5" },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell>{t.id}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {getAccountName(t.fromAccountId)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getAccountEmail(t.fromAccountId)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {t.toAccountId ? (
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {getAccountName(t.toAccountId)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {getAccountEmail(t.toAccountId)}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                color: t.transactionType === 'DEPOSIT' ? "#2e7d32" : "#c62828",
                              }}
                            >
                              {t.amount?.toLocaleString('vi-VN')} VNĐ
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={t.transactionType}
                              color={getTypeColor(t.transactionType)}
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(t.status)}
                              label={t.status}
                              color={getStatusColor(t.status)}
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Cập nhật trạng thái">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleUpdateSuccess(t.id)}
                                disabled={t.status !== 'AWAITING_APPROVAL'}
                                sx={{
                                  background: t.status === 'AWAITING_APPROVAL' 
                                    ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                                    : undefined,
                                  "&:hover": {
                                    background: t.status === 'AWAITING_APPROVAL'
                                      ? "linear-gradient(135deg, #3d8bfe 0%, #00d9fe 100%)"
                                      : undefined,
                                  },
                                  "&:disabled": {
                                    background: "#e0e0e0",
                                  },
                                }}
                              >
                                Cập nhật
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={page + 1}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </Box>
                </>
              )}
            </TableContainer>
          </Card>

          {/* Update Status Modal */}
          <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Cập nhật trạng thái giao dịch
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography>
                Bạn có chắc chắn muốn thay đổi trạng thái của giao dịch này?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setIsModalOpen(false)} color="inherit">
                Hủy
              </Button>
              <Button
                onClick={handleReject}
                variant="contained"
                color="error"
                disabled={isUpdateLoading}
                sx={{ mr: 1 }}
              >
                {isUpdateLoading ? "Đang xử lý..." : "Từ chối"}
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                color="success"
                disabled={isUpdateLoading}
                sx={{
                  background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #38d973 0%, #2de9d7 100%)",
                  },
                }}
              >
                {isUpdateLoading ? "Đang xử lý..." : "Phê duyệt"}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </main>
    </div>
  );
};

export default Transactions;
