import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from "recharts";
import UserAppBar from "./UserAppBar";
import { BANK_SERVICE_API } from "../../config/api";
import { jwtDecode } from "jwt-decode";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

export default function FinancialReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(null);
  const [accountId, setAccountId] = useState(null);

  // Data states
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryExpense, setCategoryExpense] = useState([]);
  const [cashFlow, setCashFlow] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [summary, setSummary] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAccountId(decoded.sub);
      } catch (e) {
        console.error("Invalid token:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchAllReports();
    }
  }, [accountId, year, month]);

  const fetchAllReports = async () => {
    if (!accountId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch all reports in parallel
      const [monthlyRes, categoryRes, cashFlowRes, walletRes, summaryRes] =
        await Promise.all([
          fetch(
            `${BANK_SERVICE_API}/api/reports/monthly?year=${year}${month ? `&month=${month}` : ""}`,
            { headers }
          ),
          fetch(
            `${BANK_SERVICE_API}/api/reports/category-expense?year=${year}${month ? `&month=${month}` : ""}&type=EXPENSE`,
            { headers }
          ),
          fetch(
            `${BANK_SERVICE_API}/api/reports/cash-flow?year=${year}${month ? `&month=${month}` : ""}`,
            { headers }
          ),
          fetch(`${BANK_SERVICE_API}/api/reports/wallet-balance`, { headers }),
          fetch(`${BANK_SERVICE_API}/api/reports/summary?year=${year}`, {
            headers,
          }),
        ]);

      if (!monthlyRes.ok || !categoryRes.ok || !cashFlowRes.ok || !walletRes.ok || !summaryRes.ok) {
        throw new Error("Failed to fetch reports");
      }

      const [monthlyData, categoryData, cashFlowData, walletData, summaryData] =
        await Promise.all([
          monthlyRes.json(),
          categoryRes.json(),
          cashFlowRes.json(),
          walletRes.json(),
          summaryRes.json(),
        ]);

      setMonthlyData(monthlyData);
      setCategoryExpense(categoryData);
      setCashFlow(cashFlowData);
      setWalletBalance(walletData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format data for charts
  const formatMonthlyData = () => {
    return monthlyData.map((item) => ({
      month: `T${item.month}`,
      monthNum: item.month,
      monthFull: `Tháng ${item.month}`,
      Thu: parseFloat(item.totalIncome || 0),
      Chi: parseFloat(item.totalExpense || 0),
      "Thu nhập ròng": parseFloat(item.netAmount || 0),
    }));
  };

  const formatCategoryData = () => {
    return categoryExpense.map((item) => ({
      name: item.categoryName || "Khác",
      value: parseFloat(item.totalAmount || 0),
      percentage: item.percentage || 0,
    }));
  };

  const formatCashFlowData = () => {
    if (!cashFlow) return [];
    return [
      {
        name: "Tiền vào",
        value: parseFloat(cashFlow.totalInflow || 0),
        fill: "#43e97b",
      },
      {
        name: "Tiền ra",
        value: parseFloat(cashFlow.totalOutflow || 0),
        fill: "#f5576c",
      },
    ];
  };

  const formatInflowOutflowData = () => {
    if (!cashFlow) return [];
    return [
      {
        name: "Dòng tiền",
        "Tiền vào": parseFloat(cashFlow.totalInflow || 0),
        "Tiền ra": parseFloat(cashFlow.totalOutflow || 0),
      },
    ];
  };

  const formatBalanceData = () => {
    if (!walletBalance) return [];
    return [
      {
        name: "Số dư",
        "Khả dụng": parseFloat(walletBalance.availableBalance || 0),
        "Đang giữ": parseFloat(walletBalance.holdBalance || 0),
        "Tổng": parseFloat(walletBalance.totalBalance || 0),
      },
    ];
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <UserAppBar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <UserAppBar />

      {/* Full-width main chart (edge-to-edge) */}
     

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", mb: 2, color: "#1976d2" }}
          >
            Báo Cáo Tài Chính
          </Typography>

          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Năm</InputLabel>
              <Select
                value={year}
                label="Năm"
                onChange={(e) => setYear(e.target.value)}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
                  (y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Tháng</InputLabel>
              <Select
                value={month || ""}
                label="Tháng"
                onChange={(e) => setMonth(e.target.value || null)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <MenuItem key={m} value={m}>
                    Tháng {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

        </Box>

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", boxShadow: 4, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Tổng số dư
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {parseFloat(summary.totalBalance || 0).toLocaleString("vi-VN")} VNĐ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white", boxShadow: 4, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Tổng thu nhập
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {parseFloat(summary.totalIncome || 0).toLocaleString("vi-VN")} VNĐ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white", boxShadow: 4, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Tổng chi tiêu
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {parseFloat(summary.totalExpense || 0).toLocaleString("vi-VN")} VNĐ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white", boxShadow: 4, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Thu nhập ròng
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {parseFloat(summary.netAmount || 0).toLocaleString("vi-VN")} VNĐ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
 <Box sx={{ width: "100%", mb: 4 }}>
        <Card sx={{ boxShadow: 4, borderRadius: 0, overflow: "hidden" }}>
          <CardContent sx={{ backgroundColor: "#fafafa", p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
              📈 Xu hướng Thu/Chi theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={formatMonthlyData()} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43e97b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#43e97b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorChi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5576c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f5576c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 12 }} axisLine={{ stroke: "#ccc" }} />
                <YAxis tick={{ fill: "#666", fontSize: 12 }} axisLine={{ stroke: "#ccc" }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => `${parseFloat(value).toLocaleString("vi-VN")} VNĐ`} contentStyle={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} labelStyle={{ fontWeight: "bold", color: "#333" }} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
                <Line type="monotone" dataKey="Thu" stroke="#43e97b" strokeWidth={4} dot={{ r: 6, fill: "#43e97b", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 10, fill: "#43e97b", strokeWidth: 2, stroke: "#fff" }} name="Thu nhập" />
                <Line type="monotone" dataKey="Chi" stroke="#f5576c" strokeWidth={4} dot={{ r: 6, fill: "#f5576c", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 10, fill: "#f5576c", strokeWidth: 2, stroke: "#fff" }} name="Chi tiêu" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Bar Chart - Thu/Chi theo tháng */}
      <Box sx={{ width: "100%", mb: 4 }}>
        <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ backgroundColor: "#fafafa", p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
              📊 Báo cáo Thu/Chi theo tháng (Biểu đồ cột)
            </Typography>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={formatMonthlyData()} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThuBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#43e97b" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="colorChiBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5576c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f5576c" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis 
                  dataKey="monthFull" 
                  tick={{ fill: "#666", fontSize: 12 }} 
                  axisLine={{ stroke: "#ccc" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: "#666", fontSize: 12 }} 
                  axisLine={{ stroke: "#ccc" }} 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} 
                />
                <Tooltip 
                  formatter={(value) => `${parseFloat(value).toLocaleString("vi-VN")} VNĐ`} 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #ddd", 
                    borderRadius: "8px", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                  }} 
                  labelStyle={{ fontWeight: "bold", color: "#333" }} 
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar 
                  dataKey="Thu" 
                  fill="url(#colorThuBar)" 
                  radius={[12, 12, 0, 0]}
                  stroke="#43e97b"
                  strokeWidth={2}
                  name="Thu nhập"
                />
                <Bar 
                  dataKey="Chi" 
                  fill="url(#colorChiBar)" 
                  radius={[12, 12, 0, 0]}
                  stroke="#f5576c"
                  strokeWidth={2}
                  name="Chi tiêu"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

        <Grid container spacing={3}>
          {/* 2. Pie chart chi tiêu theo danh mục */}
          <Grid item xs={12} sm={6} md={6}>
            <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
              <CardContent sx={{ backgroundColor: "#fafafa" }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
                  🥧 Chi tiêu theo danh mục
                </Typography>
                {categoryExpense.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={formatCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) =>
                          `${name}\n${percentage?.toFixed(1)}%`
                        }
                        outerRadius={110}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {formatCategoryData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          `${parseFloat(value).toLocaleString("vi-VN")} VNĐ`
                        }
                        contentStyle={{ 
                          backgroundColor: "#fff", 
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "20px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      height: 350,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 3. Area Chart - Thu/Chi theo tháng */}
       

         

          {/* 5. Composed Chart - Thu/Chi/Thu nhập ròng */}
          <Grid item xs={12} sm={6} md={6}>
            <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
              <CardContent sx={{ backgroundColor: "#fafafa" }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
                  📉 Tổng quan Thu/Chi/Thu nhập ròng
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={formatMonthlyData()} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis 
                      dataKey="monthFull" 
                      tick={{ fill: "#666", fontSize: 11 }}
                      axisLine={{ stroke: "#ccc" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      yAxisId="left" 
                      tick={{ fill: "#666", fontSize: 12 }}
                      axisLine={{ stroke: "#ccc" }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: "#666", fontSize: 12 }}
                      axisLine={{ stroke: "#ccc" }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(value) =>
                        `${parseFloat(value).toLocaleString("vi-VN")} VNĐ`
                      }
                      contentStyle={{ 
                        backgroundColor: "#fff", 
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="Thu" 
                      fill="#43e97b" 
                      radius={[8, 8, 0, 0]}
                      name="Thu nhập"
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="Chi" 
                      fill="#f5576c" 
                      radius={[8, 8, 0, 0]}
                      name="Chi tiêu"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Thu nhập ròng"
                      stroke="#4facfe"
                      strokeWidth={4}
                      dot={{ r: 6, fill: "#4facfe", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 10, fill: "#4facfe", strokeWidth: 2, stroke: "#fff" }}
                      name="Thu nhập ròng"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

         

          {/* 7. Chi tiết dòng tiền vào/ra */}
          {cashFlow && (cashFlow.inflows?.length > 0 || cashFlow.outflows?.length > 0) && (
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                    Chi tiết Dòng tiền
                  </Typography>
                  {cashFlow.inflows && cashFlow.inflows.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1, color: "#2e7d32" }}>
                        Tiền vào
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Danh mục</TableCell>
                              <TableCell align="right">Số tiền</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cashFlow.inflows.slice(0, 5).map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.categoryName || "Khác"}</TableCell>
                                <TableCell align="right">
                                  {parseFloat(item.amount || 0).toLocaleString("vi-VN")} VNĐ
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {cashFlow.outflows && cashFlow.outflows.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1, color: "#c62828" }}>
                        Tiền ra
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Danh mục</TableCell>
                              <TableCell align="right">Số tiền</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cashFlow.outflows.slice(0, 5).map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.categoryName || "Khác"}</TableCell>
                                <TableCell align="right">
                                  {parseFloat(item.amount || 0).toLocaleString("vi-VN")} VNĐ
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
 {/* 6. Báo cáo dòng tiền chi tiết */}
          {cashFlow && (
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                    Tóm tắt Dòng tiền
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, backgroundColor: "#e3f2fd" }}>
                        <Typography variant="body2" color="text.secondary">
                          Số dư đầu kỳ
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                          {parseFloat(cashFlow.openingBalance || 0).toLocaleString("vi-VN")} VNĐ
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, backgroundColor: "#f1f8e9" }}>
                        <Typography variant="body2" color="text.secondary">
                          Số dư cuối kỳ
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#388e3c" }}>
                          {parseFloat(cashFlow.closingBalance || 0).toLocaleString("vi-VN")} VNĐ
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor:
                            parseFloat(cashFlow.netCashFlow || 0) >= 0
                              ? "#e8f5e9"
                              : "#ffebee",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Dòng tiền ròng
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            color:
                              parseFloat(cashFlow.netCashFlow || 0) >= 0
                                ? "#2e7d32"
                                : "#c62828",
                          }}
                        >
                          {parseFloat(cashFlow.netCashFlow || 0).toLocaleString("vi-VN")} VNĐ
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                </CardContent>
              </Card>
            </Grid>
          )}
        
        </Grid>
      </Container>
    </Box>
  );
}


