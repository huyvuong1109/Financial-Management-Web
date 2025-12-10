import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  SwapHoriz as TransferIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const token = localStorage.getItem('token');

  // New transaction form
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const categories = {
    INCOME: ['Lương', 'Thưởng', 'Đầu tư', 'Kinh doanh', 'Khác'],
    EXPENSE: ['Ăn uống', 'Mua sắm', 'Di chuyển', 'Hóa đơn', 'Giải trí', 'Sức khỏe', 'Giáo dục', 'Khác'],
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage, filterType]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/bankservice/transactions/my-history?page=${page}&size=${rowsPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.content || []);
        setTotalElements(data.totalElements || 0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <IncomeIcon sx={{ color: 'success.main' }} />;
      case 'WITHDRAWAL':
        return <ExpenseIcon sx={{ color: 'error.main' }} />;
      case 'TRANSFER':
        return <TransferIcon sx={{ color: 'primary.main' }} />;
      default:
        return <ExpenseIcon sx={{ color: 'error.main' }} />;
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      APPROVED: { label: 'Thành công', color: 'success' },
      PENDING: { label: 'Đang xử lý', color: 'warning' },
      FAILED: { label: 'Thất bại', color: 'error' },
      AWAITING_APPROVAL: { label: 'Chờ duyệt', color: 'info' },
      REJECTED: { label: 'Từ chối', color: 'error' },
      EXPIRED: { label: 'Hết hạn', color: 'default' },
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTransaction({
      type: 'EXPENSE',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const types = ['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER'];
    setFilterType(types[newValue]);
  };

  // Calculate summary
  const totalIncome = transactions
    .filter((t) => t.transactionType === 'DEPOSIT')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.transactionType === 'WITHDRAWAL' || t.transactionType === 'TRANSFER')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Giao dịch
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và theo dõi các giao dịch của bạn
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ borderRadius: 2 }}
        >
          Thêm giao dịch
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <IncomeIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tổng thu nhập
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(totalIncome)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <ExpenseIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tổng chi tiêu
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(totalExpense)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TransferIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Chênh lệch
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(totalIncome - totalExpense)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction Table */}
      <Card>
        <CardContent>
          {/* Filters */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Tất cả" />
              <Tab label="Thu nhập" />
              <Tab label="Chi tiêu" />
              <Tab label="Chuyển khoản" />
            </Tabs>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />
              <Button startIcon={<DownloadIcon />} variant="outlined">
                Xuất
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>Loại</TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Người gửi</TableCell>
                  <TableCell>Người nhận</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.100' }}>
                            {getTransactionIcon(transaction.transactionType)}
                          </Avatar>
                          <Typography variant="body2">
                            {transaction.transactionType === 'DEPOSIT'
                              ? 'Thu nhập'
                              : transaction.transactionType === 'WITHDRAWAL'
                              ? 'Chi tiêu'
                              : 'Chuyển khoản'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.completedAt || transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {transaction.categoryId || 'Không có mô tả'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {transaction.fromAccountId || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {transaction.toAccountId || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            color:
                              transaction.transactionType === 'DEPOSIT'
                                ? 'success.main'
                                : 'error.main',
                          }}
                        >
                          {transaction.transactionType === 'DEPOSIT' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(transaction.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Chưa có giao dịch nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trong ${count !== -1 ? count : `hơn ${to}`}`
            }
          />
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm giao dịch mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại giao dịch</InputLabel>
                <Select
                  value={newTransaction.type}
                  label="Loại giao dịch"
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, type: e.target.value, category: '' })
                  }
                >
                  <MenuItem value="INCOME">Thu nhập</MenuItem>
                  <MenuItem value="EXPENSE">Chi tiêu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số tiền"
                type="number"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, amount: e.target.value })
                }
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={newTransaction.category}
                  label="Danh mục"
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, category: e.target.value })
                  }
                >
                  {categories[newTransaction.type]?.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={2}
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ngày"
                type="date"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Thêm giao dịch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
