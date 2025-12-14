import React, { useEffect, useState, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import UserAppBar from "./UserAppBar";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Button, 
    Typography, 
    Box,
    Container,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    MenuItem,
    Grid,
    Card,
    CardContent,
    Fade,
    Grow,
    IconButton,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from "react-router-dom";
import { BANK_SERVICE_API } from '../../config/api';

export default function TransactionHistory() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [showFilter, setShowFilter] = useState(true);
    const [accountId, setAccountId] = useState(null);

    // Lấy accountId từ token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setAccountId(decoded.sub);
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, []);

    // Fetch tất cả transactions để có thể filter
    useEffect(() => {
        const fetchAllTransactionHistory = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch tất cả transactions (lấy nhiều pages)
                let allData = [];
                let currentPage = 0;
                let hasMore = true;

                while (hasMore) {
                    const response = await fetch(`${BANK_SERVICE_API}/transactions/my-history?page=${currentPage}&size=100`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch transaction history');
                    }

                    const data = await response.json();
                    allData = [...allData, ...data.content];
                    
                    if (data.content.length === 0 || currentPage >= data.totalPages - 1) {
                        hasMore = false;
                    } else {
                        currentPage++;
                    }
                }

                setAllTransactions(allData);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching transaction history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllTransactionHistory();
    }, [navigate]);

    // Filter transactions theo tháng/năm
    const filteredTransactions = useMemo(() => {
        let filtered = [...allTransactions];

        if (selectedMonth) {
            filtered = filtered.filter(tx => {
                const txDate = new Date(tx.completedAt);
                return (txDate.getMonth() + 1).toString() === selectedMonth;
            });
        }

        if (selectedYear) {
            filtered = filtered.filter(tx => {
                const txDate = new Date(tx.completedAt);
                return txDate.getFullYear().toString() === selectedYear;
            });
        }

        return filtered;
    }, [allTransactions, selectedMonth, selectedYear]);

    // Pagination cho filtered transactions
    const itemsPerPage = 10;
    const paginatedTransactions = useMemo(() => {
        const startIndex = page * itemsPerPage;
        return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTransactions, page]);

    const totalFilteredPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    // Get unique years và months từ transactions
    const availableYears = useMemo(() => {
        const years = new Set();
        allTransactions.forEach(tx => {
            const year = new Date(tx.completedAt).getFullYear();
            years.add(year);
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [allTransactions]);

    const availableMonths = useMemo(() => {
        const months = new Set();
        allTransactions.forEach(tx => {
            const txDate = new Date(tx.completedAt);
            if (!selectedYear || txDate.getFullYear().toString() === selectedYear) {
                months.add(txDate.getMonth() + 1);
            }
        });
        return Array.from(months).sort((a, b) => b - a);
    }, [allTransactions, selectedYear]);

    const handleNextPage = () => {
        if (page < totalFilteredPages - 1) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    const handleResetFilter = () => {
        setSelectedMonth('');
        setSelectedYear('');
        setPage(0);
    };

    // Reset page khi filter thay đổi
    useEffect(() => {
        setPage(0);
    }, [selectedMonth, selectedYear]);

    if (loading) {
        return (
            <Box sx={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                minHeight: "100vh",
                backgroundColor: "#0f0f1e",
            }}>
                <CircularProgress sx={{ color: "#667eea" }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#1a1a2e" }}>
                <UserAppBar />
                <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                position: "relative",
                backgroundColor: "#0f0f1e",
                "&::before": {
                    content: '""',
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    zIndex: 0,
                },
            }}
        >
            <UserAppBar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: "relative", zIndex: 1 }}>
                <Fade in={true} timeout={800}>
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    }}
                                >
                                    <HistoryIcon sx={{ fontSize: 32, color: "white" }} />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        component="h1"
                                        sx={{
                                            fontWeight: "bold",
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        Lịch Sử Giao Dịch
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                                        Xem tất cả các giao dịch của bạn
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton
                                onClick={() => setShowFilter(!showFilter)}
                                sx={{
                                    background: showFilter
                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        : "rgba(255, 255, 255, 0.1)",
                                    color: showFilter ? "white" : "rgba(255, 255, 255, 0.9)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #5568d3 0%, #653d8f 100%)",
                                        color: "white",
                                    },
                                }}
                            >
                                <FilterListIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Fade>

                {/* Filter Section */}
                {showFilter && (
                    <Grow in={showFilter} timeout={400}>
                        <Card
                            sx={{
                                mb: 4,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                                borderRadius: 3,
                                background: "rgba(26, 26, 46, 0.9)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "rgba(255, 255, 255, 0.9)" }}>
                                    Bộ lọc giao dịch
                                </Typography>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Chọn năm"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            SelectProps={{
                                                MenuProps: {
                                                    PaperProps: {
                                                        sx: {
                                                            backgroundColor: "#1a1a2e",
                                                            color: "#ffffff",
                                                            "& .MuiMenuItem-root": {
                                                                color: "#ffffff",
                                                                "&:hover": {
                                                                    backgroundColor: "rgba(102, 126, 234, 0.3)",
                                                                },
                                                                "&.Mui-selected": {
                                                                    backgroundColor: "rgba(102, 126, 234, 0.5)",
                                                                    "&:hover": {
                                                                        backgroundColor: "rgba(102, 126, 234, 0.5)",
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 2,
                                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                                    "& fieldset": {
                                                        borderColor: "rgba(255, 255, 255, 0.2)",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "rgba(255, 255, 255, 0.3)",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#667eea",
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "rgba(255, 255, 255, 0.7)",
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "rgba(255, 255, 255, 0.9)",
                                                },
                                            }}
                                        >
                                            <MenuItem value="" sx={{ color: "#ffffff" }}>Tất cả năm</MenuItem>
                                            {availableYears.map((year) => (
                                                <MenuItem key={year} value={year.toString()} sx={{ color: "#ffffff" }}>
                                                    {year}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Chọn tháng"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            disabled={!selectedYear}
                                            SelectProps={{
                                                MenuProps: {
                                                    PaperProps: {
                                                        sx: {
                                                            backgroundColor: "#1a1a2e",
                                                            color: "#ffffff",
                                                            "& .MuiMenuItem-root": {
                                                                color: "#ffffff",
                                                                "&:hover": {
                                                                    backgroundColor: "rgba(102, 126, 234, 0.3)",
                                                                },
                                                                "&.Mui-selected": {
                                                                    backgroundColor: "rgba(102, 126, 234, 0.5)",
                                                                    "&:hover": {
                                                                        backgroundColor: "rgba(102, 126, 234, 0.5)",
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 2,
                                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                                    "& fieldset": {
                                                        borderColor: "rgba(255, 255, 255, 0.2)",
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "rgba(255, 255, 255, 0.3)",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#667eea",
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "rgba(255, 255, 255, 0.7)",
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "rgba(255, 255, 255, 0.9)",
                                                },
                                            }}
                                        >
                                            <MenuItem value="" sx={{ color: "#ffffff" }}>Tất cả tháng</MenuItem>
                                            {availableMonths.map((month) => (
                                                <MenuItem key={month} value={month.toString()} sx={{ color: "#ffffff" }}>
                                                    {new Date(2000, month - 1).toLocaleString('vi-VN', { month: 'long' })}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Button
                                            variant="contained"
                                            onClick={handleResetFilter}
                                            fullWidth
                                            sx={{
                                                borderRadius: 2,
                                                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                                                "&:hover": {
                                                    background: "linear-gradient(135deg, #e85d8a 0%, #f5d82e 100%)",
                                                },
                                                py: 1.5,
                                            }}
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                background: "rgba(102, 126, 234, 0.1)",
                                                border: "1px solid rgba(102, 126, 234, 0.3)",
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: "500" }}>
                                                Tìm thấy <strong style={{ color: "#667eea" }}>{filteredTransactions.length}</strong> giao dịch
                                                {selectedYear && ` trong năm ${selectedYear}`}
                                                {selectedMonth && `, tháng ${new Date(2000, parseInt(selectedMonth) - 1).toLocaleString('vi-VN', { month: 'long' })}`}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grow>
                )}
                <Grow in={true} timeout={1000}>
                    <TableContainer
                        component={Paper}
                        sx={{
                            borderRadius: 3,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                            background: "#ffffff",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                            overflow: "hidden",
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        background: "#f5f5f5",
                                        borderBottom: "2px solid #667eea",
                                    }}
                                >
                                    <TableCell sx={{ color: "#000000", fontWeight: "bold", fontSize: "0.95rem" }}>
                                        ID Giao Dịch
                                    </TableCell>
                                    <TableCell sx={{ color: "#000000", fontWeight: "bold", fontSize: "0.95rem" }}>
                                        Ngày Giao Dịch
                                    </TableCell>
                                    <TableCell sx={{ color: "#000000", fontWeight: "bold", fontSize: "0.95rem" }}>
                                        Số Tiền
                                    </TableCell>
                                    <TableCell sx={{ color: "#000000", fontWeight: "bold", fontSize: "0.95rem" }}>
                                        Loại Giao Dịch
                                    </TableCell>
                                    <TableCell sx={{ color: "#000000", fontWeight: "bold", fontSize: "0.95rem" }}>
                                        Trạng Thái
                                    </TableCell>
                                    <TableCell sx={{ color: "#000000", fontWeight: "bold", fontSize: "0.95rem" }}>
                                        Người Gửi
                                    </TableCell>
                                    <TableCell sx={{ color: "#000000", fontWeight: "bold", fontSize: "0.95rem" }}>
                                        Người Nhận
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedTransactions.length > 0 ? (
                                    paginatedTransactions.map((transaction, index) => (
                                        <Fade
                                            in={true}
                                            timeout={600 + index * 50}
                                            key={transaction.id}
                                        >
                                            <TableRow
                                                sx={{
                                                    backgroundColor: "#ffffff",
                                                    "&:nth-of-type(even)": {
                                                        backgroundColor: "#f5f5f5",
                                                    },
                                                    "&:hover": {
                                                        backgroundColor: "#e3f2fd",
                                                        transform: "scale(1.01)",
                                                        transition: "all 0.2s ease",
                                                    },
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: "500", color: "#000000" }}>
                                                    {transaction.id}
                                                </TableCell>
                                                <TableCell sx={{ color: "#000000" }}>
                                                    {new Date(transaction.completedAt).toLocaleString("vi-VN", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        fontWeight: "bold",
                                                        fontSize: "1rem",
                                                        color: (() => {
                                                            // Nếu là WITHDRAWAL, WITHDRAW hoặc TRANSFER thì luôn màu đỏ
                                                            if (transaction.transactionType === "WITHDRAWAL" || 
                                                                transaction.transactionType === "WITHDRAW" ||
                                                                transaction.transactionType === "TRANSFER") {
                                                                return "#f44336";
                                                            }
                                                            
                                                            // Nếu là DEPOSIT và status là APPROVED thì màu xanh dương
                                                            if (transaction.transactionType === "DEPOSIT" && transaction.status === "APPROVED") {
                                                                return "#2196f3";
                                                            }
                                                            
                                                            // DEPOSIT mặc định là màu xanh
                                                            if (transaction.transactionType === "DEPOSIT") {
                                                                return "#2196f3";
                                                            }
                                                            
                                                            // Mặc định màu đỏ
                                                            return "#f44336";
                                                        })(),
                                                    }}
                                                >
                                                    {(() => {
                                                        // Xác định dấu + hoặc -
                                                        if (transaction.transactionType === "DEPOSIT") {
                                                            return "+";
                                                        } else if (transaction.transactionType === "WITHDRAW" || transaction.transactionType === "WITHDRAWAL") {
                                                            return "-";
                                                        } else if (transaction.transactionType === "TRANSFER") {
                                                            // Nếu user là người nhận thì tiền vào (+), nếu là người gửi thì tiền ra (-)
                                                            return transaction.toAccountId === accountId ? "+" : "-";
                                                        }
                                                        return "";
                                                    })()}
                                                    {parseFloat(transaction.amount).toLocaleString("vi-VN")} VNĐ
                                                </TableCell>
                                                <TableCell sx={{ color: "#000000" }}>
                                                    <Typography sx={{ color: "#000000", fontWeight: "500" }}>
                                                        {transaction.transactionType}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={transaction.status}
                                                        size="small"
                                                        sx={{
                                                            background:
                                                                transaction.status === "APPROVED" || transaction.status === "COMPLETED"
                                                                    ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                                                    : transaction.status === "PENDING" ||
                                                                      transaction.status === "AWAITING_APPROVAL"
                                                                    ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                                                                    : "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                                                            color: "white",
                                                            fontWeight: "bold",
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.9rem", color: "#000000" }}>
                                                    {transaction.fromAccountId || "-"}
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.9rem", color: "#000000" }}>
                                                    {transaction.toAccountId || "-"}
                                                </TableCell>
                                            </TableRow>
                                        </Fade>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6, backgroundColor: "#ffffff" }}>
                                            <HistoryIcon
                                                sx={{
                                                    fontSize: 64,
                                                    color: "#cbd5e0",
                                                    mb: 2,
                                                    opacity: 0.5,
                                                }}
                                            />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: "bold",
                                                    mb: 1,
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                }}
                                            >
                                                Không có giao dịch nào
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#666666" }}>
                                                {selectedMonth || selectedYear
                                                    ? "Thử thay đổi bộ lọc để xem thêm giao dịch"
                                                    : "Chưa có giao dịch nào được ghi nhận"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grow>

                <Box
                    sx={{
                        mt: 4,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={handlePreviousPage}
                        disabled={page === 0}
                        sx={{
                            borderRadius: 2,
                            background: page === 0 ? "#e2e8f0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: page === 0 ? "#a0aec0" : "white",
                            "&:hover": {
                                background: page === 0 ? "#e2e8f0" : "linear-gradient(135deg, #5568d3 0%, #653d8f 100%)",
                            },
                            px: 3,
                            py: 1.5,
                            fontWeight: "600",
                        }}
                    >
                        Trang trước
                    </Button>
                    <Paper
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            background: "rgba(26, 26, 46, 0.9)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: "bold",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Trang {page + 1} / {totalFilteredPages || 1}
                        </Typography>
                    </Paper>
                    <Button
                        variant="contained"
                        onClick={handleNextPage}
                        disabled={page >= totalFilteredPages - 1}
                        sx={{
                            borderRadius: 2,
                            background:
                                page >= totalFilteredPages - 1
                                    ? "#e2e8f0"
                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: page >= totalFilteredPages - 1 ? "#a0aec0" : "white",
                            "&:hover": {
                                background:
                                    page >= totalFilteredPages - 1
                                        ? "#e2e8f0"
                                        : "linear-gradient(135deg, #5568d3 0%, #653d8f 100%)",
                            },
                            px: 3,
                            py: 1.5,
                            fontWeight: "600",
                        }}
                    >
                        Trang sau
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}