import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [year, setYear] = useState('2025');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  // Sample data
  const monthlyData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    income: [15000000, 18000000, 14000000, 20000000, 22000000, 19000000, 25000000, 23000000, 21000000, 24000000, 26000000, 28000000],
    expense: [12000000, 15000000, 13000000, 16000000, 18000000, 14000000, 20000000, 19000000, 17000000, 21000000, 22000000, 24000000],
  };

  const expenseByCategory = {
    labels: ['Ăn uống', 'Mua sắm', 'Di chuyển', 'Hóa đơn', 'Giải trí', 'Sức khỏe', 'Giáo dục', 'Khác'],
    data: [3500000, 2800000, 1500000, 2500000, 1200000, 800000, 1500000, 500000],
    colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#6b7280'],
  };

  const incomeByCategory = {
    labels: ['Lương', 'Thưởng', 'Đầu tư', 'Kinh doanh', 'Khác'],
    data: [15000000, 3000000, 2000000, 5000000, 1000000],
    colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  };

  // Chart configurations
  const incomeExpenseChartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Thu nhập',
        data: monthlyData.income.map(v => v / 1000000),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Chi tiêu',
        data: monthlyData.expense.map(v => v / 1000000),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const savingsChartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Tiết kiệm tích lũy',
        data: monthlyData.income.map((inc, i) => {
          const savings = monthlyData.income.slice(0, i + 1).reduce((a, b) => a + b, 0) -
                         monthlyData.expense.slice(0, i + 1).reduce((a, b) => a + b, 0);
          return savings / 1000000;
        }),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const expensePieData = {
    labels: expenseByCategory.labels,
    datasets: [
      {
        data: expenseByCategory.data,
        backgroundColor: expenseByCategory.colors,
        borderWidth: 0,
      },
    ],
  };

  const incomePieData = {
    labels: incomeByCategory.labels,
    datasets: [
      {
        data: incomeByCategory.data,
        backgroundColor: incomeByCategory.colors,
        borderWidth: 0,
      },
    ],
  };

  // Calculate totals
  const totalIncome = monthlyData.income.reduce((a, b) => a + b, 0);
  const totalExpense = monthlyData.expense.reduce((a, b) => a + b, 0);
  const totalSavings = totalIncome - totalExpense;
  const savingsRate = ((totalSavings / totalIncome) * 100).toFixed(1);
  const avgMonthlyIncome = totalIncome / 12;
  const avgMonthlyExpense = totalExpense / 12;

  // Top expenses
  const topExpenses = expenseByCategory.labels
    .map((label, i) => ({ label, value: expenseByCategory.data[i], color: expenseByCategory.colors[i] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Báo cáo & Thống kê
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Phân tích chi tiết tình hình tài chính của bạn
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Năm</InputLabel>
            <Select value={year} label="Năm" onChange={(e) => setYear(e.target.value)}>
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tổng thu nhập năm
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {formatCurrency(totalIncome)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                TB: {formatCurrency(avgMonthlyIncome)}/tháng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tổng chi tiêu năm
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {formatCurrency(totalExpense)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                TB: {formatCurrency(avgMonthlyExpense)}/tháng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tiết kiệm năm
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {formatCurrency(totalSavings)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {savingsRate}% thu nhập
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tỷ lệ chi/thu
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="secondary.main">
                {((totalExpense / totalIncome) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mục tiêu: &lt; 70%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Income vs Expense Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Thu nhập vs Chi tiêu theo tháng
              </Typography>
              <Box sx={{ height: 350 }}>
                <Bar
                  data={incomeExpenseChartData}
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

        {/* Top Expenses */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top chi tiêu
              </Typography>
              {topExpenses.map((expense, index) => (
                <Box
                  key={expense.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: index < topExpenses.length - 1 ? '1px solid' : 'none',
                    borderColor: 'grey.200',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: expense.color,
                      }}
                    />
                    <Typography variant="body2">{expense.label}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(expense.value)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {((expense.value / totalExpense) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Savings Trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Tiết kiệm tích lũy
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={savingsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
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
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Phân bổ chi tiêu
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut
                  data={expensePieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                    cutout: '60%',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Income Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Nguồn thu nhập
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut
                  data={incomePieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                    cutout: '60%',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                💡 Phân tích & Đề xuất
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Chi tiêu cao nhất
                    </Typography>
                    <Typography variant="body2">
                      Danh mục <strong>Ăn uống</strong> chiếm 25% tổng chi tiêu. 
                      Cân nhắc nấu ăn tại nhà để tiết kiệm.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tỷ lệ tiết kiệm
                    </Typography>
                    <Typography variant="body2">
                      Bạn đang tiết kiệm <strong>{savingsRate}%</strong> thu nhập. 
                      {parseFloat(savingsRate) >= 20 
                        ? ' Tuyệt vời! Hãy duy trì nhịp độ này.' 
                        : ' Cố gắng tăng lên 20% để đạt mục tiêu tài chính.'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Xu hướng chi tiêu
                    </Typography>
                    <Typography variant="body2">
                      Chi tiêu tháng này <strong>tăng 5%</strong> so với tháng trước. 
                      Kiểm tra các khoản mua sắm không cần thiết.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
