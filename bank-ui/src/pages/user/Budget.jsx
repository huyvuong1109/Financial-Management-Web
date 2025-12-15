import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Chip,
  Paper,
  Tooltip,
  Fade,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  Category as CategoryIcon,
  CalendarMonth as CalendarIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";
import UserAppBar from "./UserAppBar";
import { BANK_SERVICE_API } from "../../config/api";
import { jwtDecode } from "jwt-decode";

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe", "#43e97b", "#38f9d7"];

export default function Budget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [progress, setProgress] = useState(null);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Form state

  const [formData, setFormData] = useState({
    categoryId: "",
    budgetMonth: new Date().getMonth() + 1,
    budgetYear: new Date().getFullYear(),
    budgetAmount: "",
    alertThreshold: 80,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch budgets, progress, and categories in parallel
      const [budgetsRes, progressRes, categoriesRes] = await Promise.all([
        fetch(`${BANK_SERVICE_API}/api/budgets?month=${month}&year=${year}`, { headers }),
        fetch(`${BANK_SERVICE_API}/api/budgets/progress?month=${month}&year=${year}`, { headers }),
        fetch(`${BANK_SERVICE_API}/api/categories`, { headers }),
      ]);

      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json();
        setBudgets(budgetsData);
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu ngân sách");
    } finally {
      setLoading(false);
    }
  };

  const getAllowedMonths = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    return [
      { month: currentMonth, year: currentYear },
      { month: nextMonth, year: nextYear }
    ];
  };

  const handleOpenDialog = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        categoryId: budget.categoryId || "",
        budgetMonth: budget.budgetMonth,
        budgetYear: budget.budgetYear,
        budgetAmount: budget.budgetAmount,
        alertThreshold: budget.alertThreshold || 80,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        categoryId: "",
        budgetMonth: month,
        budgetYear: year,
        budgetAmount: "",
        alertThreshold: 80,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
  };

  const handleSubmit = async () => {
    if (!formData.budgetAmount || formData.budgetAmount <= 0) {
      setError("Vui lòng nhập số tiền ngân sách hợp lệ");
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const body = {
        categoryId: formData.categoryId || null,
        budgetMonth: formData.budgetMonth,
        budgetYear: formData.budgetYear,
        budgetAmount: parseFloat(formData.budgetAmount),
        alertThreshold: formData.alertThreshold,
      };

      let response;
      if (editingBudget) {
        response = await fetch(`${BANK_SERVICE_API}/api/budgets/${editingBudget.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
      } else {
        response = await fetch(`${BANK_SERVICE_API}/api/budgets`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
      }

      if (response.ok) {
        setSuccess(editingBudget ? "Cập nhật ngân sách thành công!" : "Tạo ngân sách thành công!");
        handleCloseDialog();
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("Error saving budget:", err);
      setError("Không thể lưu ngân sách");
    }
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ngân sách này?")) return;

    try {
      const response = await fetch(`${BANK_SERVICE_API}/api/budgets/${budgetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess("Xóa ngân sách thành công!");
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Không thể xóa ngân sách");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa");
    }
  };

  const handleCheckAlerts = async () => {
    try {
      const response = await fetch(
        `${BANK_SERVICE_API}/api/budgets/check-alerts?month=${month}&year=${year}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const alerts = await response.json();
        if (alerts.length > 0) {
          setSuccess(`Đã gửi ${alerts.length} cảnh báo!`);
        } else {
          setSuccess("Không có cảnh báo mới");
        }
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Có lỗi khi kiểm tra cảnh báo");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return "error";
    if (percent >= 80) return "warning";
    return "success";
  };

  const getProgressGradient = (percent) => {
    if (percent >= 100) return "linear-gradient(90deg, #f5576c 0%, #f093fb 100%)";
    if (percent >= 80) return "linear-gradient(90deg, #FFB74D 0%, #FF9800 100%)";
    return "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)";
  };

  // Prepare bar chart data - Mỗi ngân sách có 2 cột: Ngân sách và Đã chi
  const barData = budgets.map((b) => ({
    name: b.categoryName || "Tổng",
    "Ngân sách": b.budgetAmount || 0,
    "Đã chi": b.spentAmount || 0,
  }));

  const hasSpending = budgets.some(b => (b.spentAmount || 0) > 0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        pb: 4,
      }}
    >
      <UserAppBar />

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Header */}
        <Fade in={true} timeout={600}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                color: "white",
                fontWeight: "bold",
                mb: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              Quản lý Ngân sách
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Theo dõi chi tiêu và kiểm soát tài chính của bạn
            </Typography>
          </Box>
        </Fade>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Budget Alerts - Hiển thị tự động khi có cảnh báo */}
        {!loading && progress?.alerts?.length > 0 && (
          <Fade in={true} timeout={800}>
            <Paper
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                background: "linear-gradient(135deg, rgba(255,152,0,0.15) 0%, rgba(244,67,54,0.15) 100%)",
                border: "2px solid",
                borderColor: progress.alerts.some(a => a.alertType === "EXCEEDED") ? "#f44336" : "#ff9800",
                backdropFilter: "blur(10px)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                  ⚠️ Cảnh báo ngân sách tháng {month}/{year}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {progress.alerts.map((alert, index) => (
                  <Alert
                    key={index}
                    severity={alert.alertType === "EXCEEDED" ? "error" : "warning"}
                    variant="filled"
                    sx={{ 
                      borderRadius: 2,
                      "& .MuiAlert-message": { fontWeight: 500 }
                    }}
                  >
                    <strong>{alert.categoryName || "Tổng ngân sách"}</strong>: {" "}
                    {alert.alertType === "EXCEEDED" 
                      ? `Đã vượt ${(alert.progressPercent - 100).toFixed(1)}% ngân sách!`
                      : `Đã sử dụng ${alert.progressPercent.toFixed(1)}% ngân sách`
                    }
                    {" "}({formatCurrency(alert.spentAmount)} / {formatCurrency(alert.budgetAmount)})
                  </Alert>
                ))}
              </Box>
            </Paper>
          </Fade>
        )}

        {/* Month/Year Selector & Actions */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>

              <FormControl fullWidth size="small">
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={month}
                  label="Tháng"
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {[...Array(12)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Năm</InputLabel>
                <Select
                  value={year}
                  label="Năm"
                  onChange={(e) => setYear(e.target.value)}
                >
                  {[2024, 2025, 2026].map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>

              {/* <Button
                variant="outlined"
                startIcon={<NotificationsIcon />}
                onClick={handleCheckAlerts}
                sx={{ borderRadius: 2 }}
              >
                Kiểm tra cảnh báo
              </Button> */}
              
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2,
                  "&:hover": {
                    background: "linear-gradient(90deg, #5a6fd6 0%, #6a4190 100%)",
                  },
                }}
              >
                Tạo ngân sách
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "white" }} size={60} />
          </Box>
        ) : (
          <>
            {/* Summary Cards */}
            {progress && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <WalletIcon sx={{ fontSize: 40, mr: 2 }} />
                        <Typography variant="h6">Tổng ngân sách</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {formatCurrency(progress.totalBudget)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      color: "white",
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                        <Typography variant="h6">Đã chi tiêu</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {formatCurrency(progress.totalSpent)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      background:
                        progress.overallProgress >= 100
                          ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)"
                          : "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      color: "white",
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        {progress.overallProgress >= 100 ? (
                          <WarningIcon sx={{ fontSize: 40, mr: 2 }} />
                        ) : (
                          <CheckCircleIcon sx={{ fontSize: 40, mr: 2 }} />
                        )}
                        <Typography variant="h6">Còn lại</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {formatCurrency(progress.totalRemaining)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Budget List & Chart */}
            <Grid container spacing={3}>
              {/* Budget Cards */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ color: "white", mb: 2, fontWeight: "bold" }}>
                  Chi tiết ngân sách
                </Typography>
                {budgets.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <Typography variant="h6" color="textSecondary">
                      Chưa có ngân sách nào cho tháng {month}/{year}
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    {budgets.map((budget, index) => (
                      <Grid item xs={12} key={budget.id}>
                        <Fade in={true} timeout={300 + index * 100}>
                          <Card
                            sx={{
                              borderRadius: 3,
                              overflow: "hidden",
                              transition: "transform 0.2s, box-shadow 0.2s",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                height: 6,
                                background: getProgressGradient(budget.progressPercent),
                              }}
                            />
                            <CardContent>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    <CategoryIcon sx={{ mr: 1, color: COLORS[index % COLORS.length] }} />
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                      {budget.categoryName || `Tổng ngân sách tháng ${budget.budgetMonth}/${budget.budgetYear}`}
                                    </Typography>
                                    {budget.isExceeded && (
                                      <Chip
                                        label="Vượt ngân sách!"
                                        color="error"
                                        size="small"
                                        icon={<WarningIcon />}
                                        sx={{ ml: 2 }}
                                      />
                                    )}
                                    {budget.isNearLimit && !budget.isExceeded && (
                                      <Chip
                                        label="Sắp đạt giới hạn"
                                        color="warning"
                                        size="small"
                                        sx={{ ml: 2 }}
                                      />
                                    )}
                                  </Box>

                                  <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={4}>
                                      <Typography variant="body2" color="textSecondary">
                                        Ngân sách
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#667eea" }}>
                                        {formatCurrency(budget.budgetAmount)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                      <Typography variant="body2" color="textSecondary">
                                        Đã chi
                                      </Typography>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          fontWeight: "bold",
                                          color: budget.isExceeded ? "#f5576c" : "#f093fb",
                                        }}
                                      >
                                        {formatCurrency(budget.spentAmount)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                      <Typography variant="body2" color="textSecondary">
                                        Còn lại
                                      </Typography>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          fontWeight: "bold",
                                          color: budget.remainingAmount >= 0 ? "#43e97b" : "#f5576c",
                                        }}
                                      >
                                        {formatCurrency(budget.remainingAmount)}
                                      </Typography>
                                    </Grid>
                                  </Grid>

                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Box sx={{ flex: 1, mr: 2 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={Math.min(budget.progressPercent || 0, 100)}
                                        color={getProgressColor(budget.progressPercent)}
                                        sx={{
                                          height: 10,
                                          borderRadius: 5,
                                          backgroundColor: "rgba(0,0,0,0.1)",
                                        }}
                                      />
                                    </Box>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: "bold",
                                        minWidth: 60,
                                        color:
                                          budget.progressPercent >= 100
                                            ? "#f5576c"
                                            : budget.progressPercent >= 80
                                            ? "#FF9800"
                                            : "#43e97b",
                                      }}
                                    >
                                      {budget.progressPercent?.toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                                  <Tooltip title="Chỉnh sửa">
                                    <IconButton
                                      onClick={() => handleOpenDialog(budget)}
                                      sx={{ color: "#667eea" }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa">
                                    <IconButton
                                      onClick={() => handleDelete(budget.id)}
                                      sx={{ color: "#f5576c" }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Bar Chart */}
              {/* <Grid item xs={12}>
                <Typography variant="h5" sx={{ color: "white", mb: 2, fontWeight: "bold" }}>
                  Biểu đồ chi tiêu
                </Typography>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={Math.max(250, barData.length * 120)}>
                      <BarChart 
                        data={barData} 
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                        barCategoryGap="20%"
                      >
                        <defs>
                          <linearGradient id="budgetGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="100%" stopColor="#38f9d7" />
                          </linearGradient>
                          <linearGradient id="spentGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#43e97b" />
                            <stop offset="100%" stopColor="#38f9d7" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                        <XAxis 
                          type="number"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => 
                            value >= 1000000 
                              ? `${(value / 1000000).toFixed(1)}M` 
                              : value >= 1000 
                                ? `${(value / 1000).toFixed(0)}K` 
                                : value
                          }
                          domain={[0, (dataMax) => Math.ceil(dataMax * 1.1)]}
                        />
                        <YAxis 
                          type="category"
                          dataKey="name" 
                          tick={{ fontSize: 14, fontWeight: 500 }}
                          tickLine={false}
                          axisLine={false}
                          width={45}
                        />
                        <RechartsTooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ borderRadius: 8 }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: 10 }}
                          verticalAlign="bottom"
                        />
                        <Bar 
                          dataKey="Ngân sách" 
                          fill="url(#budgetGradient)" 
                          radius={[0, 10, 10, 0]}
                          name="Ngân sách"
                          barSize={32}
                        />
                        <Bar 
                          dataKey="Đã chi" 
                          fill="url(#spentGradient)" 
                          radius={[0, 10, 10, 0]}
                          name="Đã chi"
                          barSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography color="textSecondary">Chưa có dữ liệu ngân sách</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid> */}
            </Grid>
          </>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
            {editingBudget ? "✏️ Chỉnh sửa ngân sách" : "➕ Tạo ngân sách mới"}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục (để trống = ngân sách tổng)</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Danh mục (để trống = ngân sách tổng)"
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>Ngân sách tổng tháng</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.categoryId} value={cat.categoryId.toString()}>
                        {cat.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Tháng</InputLabel>
                  <Select
                    value={formData.budgetMonth}
                    label="Tháng"
                    onChange={(e) => setFormData({ ...formData, budgetMonth: e.target.value })}
                  >
                    {[...Array(12)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Năm</InputLabel>
                  <Select
                    value={formData.budgetYear}
                    label="Năm"
                    onChange={(e) => setFormData({ ...formData, budgetYear: e.target.value })}
                  >
                    {[2024, 2025, 2026].map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số tiền ngân sách (VND)"
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ngưỡng cảnh báo (%)"
                  type="number"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                  InputProps={{
                    inputProps: { min: 1, max: 100 },
                  }}
                  helperText="Cảnh báo khi chi tiêu đạt % này của ngân sách"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(90deg, #5a6fd6 0%, #6a4190 100%)",
                },
              }}
            >
              {editingBudget ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
