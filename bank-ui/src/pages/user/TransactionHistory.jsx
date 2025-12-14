import React, { useEffect, useState } from "react";
import UserAppBar from "./UserAppBar";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box } from '@mui/material';
import { useNavigate } from "react-router-dom";

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
                const response = await fetch(`/bankservice/transactions/my-history?page=${page}&size=10`, {
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
        return <p>Đang tải lịch sử giao dịch...</p>;
    }

    if (error) {
        return <p>Đã xảy ra lỗi: {error}</p>;
    }

    return (
        <div>
            <UserAppBar />
            <div style={{ padding: "20px" }}>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Lịch Sử Giao Dịch
                    </Typography>
                </Box>
                
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>ID Giao Dịch</TableCell>
                                <TableCell>Ngày Giao Dịch</TableCell>
                                <TableCell>Thẻ Gửi</TableCell>
                                <TableCell>Thẻ Nhận</TableCell>
                                <TableCell>Danh Mục</TableCell>
                                <TableCell>Số Tiền</TableCell>
                                <TableCell>Loại Giao Dịch</TableCell>
                                <TableCell>Trạng Thái</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.length > 0 ? (
                                transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{transaction.id}</TableCell>
                                        <TableCell>{new Date(transaction.completedAt).toLocaleString()}</TableCell>
                                        <TableCell>{transaction.fromCardId}</TableCell>
                                        <TableCell>{transaction.toCardId}</TableCell>
                                        <TableCell>{transaction.categoryId}</TableCell>
                                        <TableCell>{transaction.amount} VNĐ</TableCell>
                                        <TableCell>{transaction.transactionType}</TableCell>
                                        <TableCell>{transaction.status}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Không có giao dịch nào
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        onClick={handlePreviousPage} 
                        disabled={page === 0}
                    >
                        Trang trước
                    </Button>
                    <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                        Trang {page + 1} trên {totalPages}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={handleNextPage} 
                        disabled={page >= totalPages - 1}
                    >
                        Trang sau
                    </Button>
                </Box>

            </div>
        </div>
    );
}