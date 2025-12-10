import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  Savings as SavingsIcon,
  ArrowForward as ArrowForwardIcon,
  ShoppingCart as ShoppingIcon,
  Restaurant as FoodIcon,
  DirectionsCar as TransportIcon,
  Receipt as BillIcon,
  MoreHoriz as MoreIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

// Stat Card Component
const StatCard = ({ title, value, change, changeType, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {changeType === 'increase' ? (
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
              ) : (
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                sx={{ color: changeType === 'increase' ? 'success.main' : 'error.main' }}
              >
                {change} so với tháng trước
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.light`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Category Icon mapping
const getCategoryIcon = (category) => {
  const icons = {
    'Mua sắm': <ShoppingIcon />,
    'Ăn uống': <FoodIcon />,
    'Di chuyển': <TransportIcon />,
    'Hóa đơn': <BillIcon />,
  };
  return icons[category] || <MoreIcon />;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Fetch balance
        const balanceRes = await fetch('/bankservice/api/balances', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setBalance(balanceData);
        }

        // Fetch recent transactions
        const transRes = await fetch('/bankservice/transactions/my-history?page=0&size=5', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (transRes.ok) {
          const transData = await transRes.json();
          setTransactions(transData.content || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  // Chart data for expense breakdown
  const expenseChartData = {
    labels: ['Ăn uống', 'Mua sắm', 'Di chuyển', 'Hóa đơn', 'Giải trí', 'Khác'],
    datasets: [
      {
        data: [30, 25, 15, 15, 10, 5],
        backgroundColor: [
          '#ef4444',
          '#f97316',
          '#eab308',
          '#22c55e',
          '#3b82f6',
          '#8b5cf6',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Chart data for monthly trend
  const monthlyTrendData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Thu nhập',
        data: [15, 18, 14, 20, 22, 19, 25, 23, 21, 24, 26, 28],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Chi tiêu',
        data: [12, 15, 13, 16, 18, 14, 20, 19, 17, 21, 22, 24],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Sample budget data
  const budgets = [
    { category: 'Ăn uống', spent: 3500000, limit: 5000000, color: '#ef4444' },
    { category: 'Mua sắm', spent: 2800000, limit: 3000000, color: '#f97316' },
    { category: 'Di chuyển', spent: 1200000, limit: 2000000, color: '#eab308' },
    { category: 'Giải trí', spent: 800000, limit: 1500000, color: '#3b82f6' },
  ];

  // Sample savings goals
  const savingsGoals = [
    { name: 'Du lịch Đà Nẵng', current: 8000000, target: 15000000, icon: '✈️' },
    { name: 'Mua laptop mới', current: 12000000, target: 20000000, icon: '💻' },
    { name: 'Quỹ khẩn cấp', current: 25000000, target: 50000000, icon: '🏦' },
  ];

  const totalBalance = balance?.availableBalance || 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chào mừng trở lại! Đây là tổng quan tài chính của bạn.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Tổng số dư"
            value={formatCurrency(totalBalance)}
            change="+12.5%"
            changeType="increase"
            icon={<WalletIcon sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Thu nhập tháng này"
            value={formatCurrency(15000000)}
            change="+8.2%"
            changeType="increase"
            icon={<TrendingUpIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Chi tiêu tháng này"
            value={formatCurrency(8500000)}
            change="-5.1%"
            changeType="decrease"
            icon={<TrendingDownIcon sx={{ color: 'error.main' }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Tiết kiệm"
            value={formatCurrency(45000000)}
            change="+15.3%"
            changeType="increase"
            icon={<SavingsIcon sx={{ color: 'secondary.main' }} />}
            color="secondary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Monthly Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Xu hướng thu chi
                </Typography>
                <Chip label="12 tháng" size="small" />
              </Box>
              <Box sx={{ height: 300 }}>
                <Line
                  data={monthlyTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `${value}M`,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Phân bổ chi tiêu
              </Typography>
              <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut
                  data={expenseChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                    cutout: '60%',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Ngân sách tháng này
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/budget')}>
                  Xem tất cả
                </Button>
              </Box>
              {budgets.map((budget, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {budget.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((budget.spent / budget.limit) * 100, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: budget.spent > budget.limit ? '#ef4444' : budget.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Savings Goals */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Mục tiêu tiết kiệm
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/savings')}>
                  Xem tất cả
                </Button>
              </Box>
              {savingsGoals.map((goal, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" sx={{ mr: 1 }}>{goal.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {goal.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {Math.round((goal.current / goal.target) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(goal.current / goal.target) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'primary.main',
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Giao dịch gần đây
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/transactions')}>
                  Xem tất cả
                </Button>
              </Box>
              <List>
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <ListItem
                      key={transaction.id || index}
                      sx={{
                        px: 0,
                        borderBottom: index < transactions.length - 1 ? '1px solid' : 'none',
                        borderColor: 'grey.200',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: transaction.transactionType === 'DEPOSIT' ? 'success.light' : 'error.light' }}>
                          {transaction.transactionType === 'DEPOSIT' ? (
                            <TrendingUpIcon sx={{ color: 'success.main' }} />
                          ) : (
                            <TrendingDownIcon sx={{ color: 'error.main' }} />
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={transaction.transactionType === 'TRANSFER' ? 'Chuyển khoản' : transaction.transactionType}
                        secondary={new Date(transaction.completedAt || transaction.createdAt).toLocaleDateString('vi-VN')}
                      />
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ color: transaction.transactionType === 'DEPOSIT' ? 'success.main' : 'error.main' }}
                      >
                        {transaction.transactionType === 'DEPOSIT' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </ListItem>
                  ))
                ) : (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Chưa có giao dịch nào"
                      secondary="Bắt đầu theo dõi chi tiêu của bạn ngay hôm nay!"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
