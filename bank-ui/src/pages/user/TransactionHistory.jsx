import React, { useEffect, useState } from "react";
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
    Alert
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { BANK_SERVICE_API } from '../../config/api';

export default function TransactionHistory() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactionHistory = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${BANK_SERVICE_API}/transactions/my-history?page=${page}&size=10`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch transaction history');
                }

                const data = await response.json();
                setTransactions(data.content);
                setTotalPages(data.totalPages);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching transaction history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionHistory();
    }, [page, navigate]);

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
                <UserAppBar />
                <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
            <UserAppBar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom 
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                    >
                        Lịch Sử Giao Dịch
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Xem tất cả các giao dịch của bạn
                    </Typography>
                </Box>
                
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID Giao Dịch</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày Giao Dịch</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Số Tiền</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loại Giao Dịch</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng Thái</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Người Gửi</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Người Nhận</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.length > 0 ? (
                                transactions.map((transaction, index) => (
                                    <TableRow 
                                        key={transaction.id}
                                        sx={{ 
                                            '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                                            '&:hover': { backgroundColor: '#e3f2fd' }
                                        }}
                                    >
                                        <TableCell>{transaction.id}</TableCell>
                                        <TableCell>{new Date(transaction.completedAt).toLocaleString('vi-VN')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                            {parseFloat(transaction.amount).toLocaleString('vi-VN')} VNĐ
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={transaction.transactionType} 
                                                size="small"
                                                color={transaction.transactionType === 'TRANSFER' ? 'primary' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={transaction.status} 
                                                size="small"
                                                color={
                                                    transaction.status === 'AWAITING_APPROVAL' ? 'success' :
                                                    transaction.status === 'PENDING' ? 'warning' :
                                                    transaction.status === 'FAILED' ? 'error' : 'default'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{transaction.fromAccountId}</TableCell>
                                        <TableCell>{transaction.toAccountId}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="h6" color="text.secondary">
                                        Không có giao dịch nào
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        onClick={handlePreviousPage} 
                        disabled={page === 0}
                        sx={{ borderRadius: 2 }}
                    >
                        Trang trước
                    </Button>
                    <Paper sx={{ px: 3, py: 1, borderRadius: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Trang {page + 1} / {totalPages}
                    </Typography>
                    </Paper>
                    <Button 
                        variant="contained" 
                        onClick={handleNextPage} 
                        disabled={page >= totalPages - 1}
                        sx={{ borderRadius: 2 }}
                    >
                        Trang sau
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}