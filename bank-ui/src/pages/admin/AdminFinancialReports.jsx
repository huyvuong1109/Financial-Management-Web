import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  ComposedChart,
} from "recharts";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import { BANK_SERVICE_API } from "../../config/api";

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

export default function AdminFinancialReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const accountIdFromUrl = searchParams.get('accountId');
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(accountIdFromUrl || "");
  const [accounts, setAccounts] = useState([]);

  // Data states
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryExpense, setCategoryExpense] = useState([]);
  const [cashFlow, setCashFlow] = useState(null);
  const [summary, setSummary] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch all accounts
  useEffect(() => {
    fetch(`${BANK_SERVICE_API}/api/accounts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Filter only USER accounts
        const userAccounts = data.filter((acc) => acc.role === "USER");
        setAccounts(userAccounts);
        // Nếu có accountId từ URL, sử dụng nó; nếu không, chọn account đầu tiên
        if (accountIdFromUrl && userAccounts.find(acc => acc.accountId === accountIdFromUrl)) {
          setSelectedAccountId(accountIdFromUrl);
        } else if (userAccounts.length > 0 && !selectedAccountId) {
          setSelectedAccountId(userAccounts[0].accountId);
        }
      })
      .catch((err) => {
        console.error("Error fetching accounts:", err);
      });
  }, [token, accountIdFromUrl]);

  // Cập nhật selectedAccountId khi accountId từ URL thay đổi
  useEffect(() => {
    if (accountIdFromUrl && accounts.find(acc => acc.accountId === accountIdFromUrl)) {
      setSelectedAccountId(accountIdFromUrl);
    }
  }, [accountIdFromUrl, accounts]);


  // Fetch reports when account, year, or month changes
  useEffect(() => {
    if (selectedAccountId) {
      fetchAllReports();
    }
  }, [selectedAccountId, year, month]);

  const fetchAllReports = async () => {
    if (!selectedAccountId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const monthParam = month ? `&month=${month}` : "";
      
      // Fetch all reports in parallel using admin endpoints
      const [monthlyRes, categoryRes, cashFlowRes, summaryRes] =
        await Promise.all([
          fetch(
            `${BANK_SERVICE_API}/api/reports/admin/monthly/${selectedAccountId}?year=${year}${monthParam}`,
            { headers }
          ),
          fetch(
            `${BANK_SERVICE_API}/api/reports/admin/category-expense/${selectedAccountId}?year=${year}${monthParam}&type=EXPENSE`,
            { headers }
          ),
          fetch(
            `${BANK_SERVICE_API}/api/reports/admin/cash-flow/${selectedAccountId}?year=${year}${monthParam}`,
            { headers }
          ),
          fetch(
            `${BANK_SERVICE_API}/api/reports/admin/summary/${selectedAccountId}?year=${year}`,
            { headers }
          ),
        ]);

      if (!monthlyRes.ok || !categoryRes.ok || !cashFlowRes.ok || !summaryRes.ok) {
        throw new Error("Failed to fetch reports");
      }

      const [monthlyData, categoryData, cashFlowData, summaryData] =
        await Promise.all([
          monthlyRes.json(),
          categoryRes.json(),
          cashFlowRes.json(),
          summaryRes.json(),
        ]);

      setMonthlyData(Array.isArray(monthlyData) ? monthlyData : []);
      setCategoryExpense(Array.isArray(categoryData) ? categoryData : []);
      setCashFlow(cashFlowData);
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

  if (loading && !selectedAccountId) {
    return (
      <div className="admin-home">
        <AppBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} />
        <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "80vh",
            }}
          >
            <CircularProgress />
          </Box>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <AppBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />
      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", mb: 2, color: "#1976d2" }}
            >
              Báo Cáo Tài Chính - Admin
            </Typography>

            {/* Filters */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Chọn người dùng</InputLabel>
                <Select
                  value={selectedAccountId}
                  label="Chọn người dùng"
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  {accounts.map((acc) => (
                    <MenuItem key={acc.accountId} value={acc.accountId}>
                      {acc.customerName} ({acc.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Summary Cards */}
              {summary && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        boxShadow: 4,
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Tổng số dư
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                          {parseFloat(summary.totalBalance || 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                        color: "white",
                        boxShadow: 4,
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Tổng thu nhập
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                          {parseFloat(summary.totalIncome || 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        color: "white",
                        boxShadow: 4,
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Tổng chi tiêu
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                          {parseFloat(summary.totalExpense || 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        background:
                          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                        color: "white",
                        boxShadow: 4,
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Thu nhập ròng
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                          {parseFloat(summary.netAmount || 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Line Chart - Xu hướng Thu/Chi theo tháng */}
              <Box sx={{ width: "100%", mb: 4 }}>
                <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
                  <CardContent sx={{ backgroundColor: "#fafafa", p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}
                    >
                      📈 Xu hướng Thu/Chi theo tháng
                    </Typography>
                    <ResponsiveContainer width="100%" height={420}>
                      <LineChart
                        data={formatMonthlyData()}
                        margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e0e0e0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#666", fontSize: 12 }}
                          axisLine={{ stroke: "#ccc" }}
                        />
                        <YAxis
                          tick={{ fill: "#666", fontSize: 12 }}
                          axisLine={{ stroke: "#ccc" }}
                          tickFormatter={(value) =>
                            `${(value / 1000000).toFixed(1)}M`
                          }
                        />
                        <Tooltip
                          formatter={(value) =>
                            `${parseFloat(value).toLocaleString("vi-VN")} VNĐ`
                          }
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        <Line
                          type="monotone"
                          dataKey="Thu"
                          stroke="#43e97b"
                          strokeWidth={4}
                          dot={{ r: 6, fill: "#43e97b" }}
                          name="Thu nhập"
                        />
                        <Line
                          type="monotone"
                          dataKey="Chi"
                          stroke="#f5576c"
                          strokeWidth={4}
                          dot={{ r: 6, fill: "#f5576c" }}
                          name="Chi tiêu"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Box>

              {/* Bar Chart - Thu/Chi theo tháng */}
              <Box sx={{ width: "100%", mb: 4 }}>
                <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
                  <CardContent sx={{ backgroundColor: "#fafafa", p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}
                    >
                      📊 Báo cáo Thu/Chi theo tháng (Biểu đồ cột)
                    </Typography>
                    <ResponsiveContainer width="100%" height={420}>
                      <BarChart
                        data={formatMonthlyData()}
                        margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e0e0e0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="monthFull"
                          tick={{ fill: "#666", fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fill: "#666", fontSize: 12 }}
                          tickFormatter={(value) =>
                            `${(value / 1000000).toFixed(1)}M`
                          }
                        />
                        <Tooltip
                          formatter={(value) =>
                            `${parseFloat(value).toLocaleString("vi-VN")} VNĐ`
                          }
                        />
                        <Legend />
                        <Bar dataKey="Thu" fill="#43e97b" name="Thu nhập" />
                        <Bar dataKey="Chi" fill="#f5576c" name="Chi tiêu" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Box>

              <Grid container spacing={3}>
                {/* Pie Chart - Chi tiêu theo danh mục */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                    <CardContent sx={{ backgroundColor: "#fafafa" }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}
                      >
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
                            >
                              {formatCategoryData().map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) =>
                                `${parseFloat(value).toLocaleString("vi-VN")} VNĐ`
                              }
                            />
                            <Legend />
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

                {/* Bar Chart - So sánh tiền vào/ra */}
                {cashFlow && (
                  <Grid item xs={12} md={6}>
                    <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                      <CardContent sx={{ backgroundColor: "#fafafa" }}>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}
                        >
                          💸 So sánh Tiền vào/Tiền ra
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={formatInflowOutflowData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis
                              tickFormatter={(value) =>
                                `${(value / 1000000).toFixed(1)}M`
                              }
                            />
                            <Tooltip
                              formatter={(value) =>
                                `${parseFloat(value).toLocaleString("vi-VN")} VNĐ`
                              }
                            />
                            <Legend />
                            <Bar dataKey="Tiền vào" fill="#43e97b" />
                            <Bar dataKey="Tiền ra" fill="#f5576c" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Composed Chart - Thu/Chi/Thu nhập ròng */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                    <CardContent sx={{ backgroundColor: "#fafafa" }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}
                      >
                        📉 Tổng quan Thu/Chi/Thu nhập ròng
                      </Typography>
                      <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={formatMonthlyData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="monthFull"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            yAxisId="left"
                            tickFormatter={(value) =>
                              `${(value / 1000000).toFixed(1)}M`
                            }
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(value) =>
                              `${(value / 1000000).toFixed(1)}M`
                            }
                          />
                          <Tooltip
                            formatter={(value) =>
                              `${parseFloat(value).toLocaleString("vi-VN")} VNĐ`
                            }
                          />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="Thu"
                            fill="#43e97b"
                            name="Thu nhập"
                          />
                          <Bar
                            yAxisId="left"
                            dataKey="Chi"
                            fill="#f5576c"
                            name="Chi tiêu"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="Thu nhập ròng"
                            stroke="#4facfe"
                            strokeWidth={4}
                            name="Thu nhập ròng"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Cash Flow Summary */}
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

            </>
          )}
        </Container>
      </main>
    </div>
  );
}

