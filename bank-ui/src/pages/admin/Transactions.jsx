import React, { useState, useEffect } from 'react';
import AppBar from './AppBar';
import Sidebar from './Sidebar'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Transactions.css'; 

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [transactionType, setTransactionType] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [isUpdateLoading, setIsUpdateLoading] = useState(false);

    const token = localStorage.getItem("token"); // Lấy token từ localStorage

    useEffect(() => {
        fetchTransactions();
    }, [page, size, transactionType, status, token]); // Gọi lại API khi các tham số thay đổi

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `/bankservice/transactions/all?page=${page}&size=${size}&transactionType=${transactionType}&status=${status}`;
            
            const response = await axios.get(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            setTransactions(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError("Failed to fetch transactions. Please check your network or token.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSuccess = (transactionId) => {
        setSelectedTransactionId(transactionId);
        setIsModalOpen(true);
    };
    
    // Thêm hàm xử lý phê duyệt (Approve)
    const handleApprove = async () => {
        setIsUpdateLoading(true);
        setError(null);
        try {
            const url = `/bankservice/transactions/${selectedTransactionId}/approve`;
            await axios.post(url, {}, { // Gửi POST request rỗng
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            // Sau khi thành công, đóng modal và làm mới dữ liệu
            setIsModalOpen(false);
            fetchTransactions(); 
        } catch (err) {
            setError("Failed to approve transaction.");
            console.error("Error approving transaction:", err);
        } finally {
            setIsUpdateLoading(false);
        }
    };
    
    // Thêm hàm xử lý từ chối (Reject)
    const handleReject = async () => {
        setIsUpdateLoading(true);
        setError(null);
        try {
            const url = `/bankservice/transactions/${selectedTransactionId}/reject`;
            await axios.post(url, {}, { // Gửi POST request rỗng
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            // Sau khi thành công, đóng modal và làm mới dữ liệu
            setIsModalOpen(false);
            fetchTransactions();
        } catch (err) {
            setError("Failed to reject transaction.");
            console.error("Error rejecting transaction:", err);
        } finally {
            setIsUpdateLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };
    
    return (
        <div className="transactions-page">
            <AppBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <Sidebar isOpen={sidebarOpen} />

            <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
                <h2>Table Transactions</h2>
                {error && <p className="error-message">{error}</p>}

                {/* Các bộ lọc tìm kiếm */}
                <div className="filter-controls">
                    <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="DEPOSIT">DEPOSIT</option>
                        <option value="WITHDRAWAL">WITHDRAWAL</option>
                        <option value="TRANSFER">TRANSFER</option>
                    </select>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="EXPIRED">EXPIRED</option>
                        <option value="FAILED">FAILED</option>
                        <option value="AWAITING_APPROVAL">AWAITING_APPROVAL</option>
                    </select>
                </div>

                {/* Bảng giao dịch */}
                {loading ? (
                    <p>Loading transactions...</p>
                ) : (
                    <table border="1" cellPadding="8" className="transactions-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>fromAccountId</th>
                                <th>toAccountId</th>
                                <th>fromCardId</th>
                                <th>toCardId</th>
                                <th>categoryId</th>
                                <th>Amount</th>
                                <th>Transaction Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map(t => (
                                    <tr key={t.id}>
                                        <td>{t.id}</td>
                                        <td>{t.fromAccountId}</td>
                                        <td>{t.toAccountId}</td>
                                        <td>{t.fromCardId ?? "-"}</td>
                                        <td>{t.toCardId ?? "-"}</td>
                                        <td>{t.categoryId ?? "-"}</td>
                                        <td>{t.amount?.toLocaleString('vi-VN')}</td>
                                        <td>{t.transactionType}</td>
                                        <td>{t.status}</td>
                                        <td>
                                        <button
                                            className="update-btn"
                                            onClick={() => handleUpdateSuccess(t.id)}
                                            // Vô hiệu hóa nút nếu trạng thái không phải là PENDING
                                            disabled={t.status !== 'AWAITING_APPROVAL'} 
                                        >
                                            Update status
                                        </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center' }}>No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Phân trang */}
                <div className="pagination">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
                        &laquo;
                    </button>
                    <span> {page + 1} / {totalPages} </span>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1}>
                        &raquo;
                    </button>
                </div>
                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h4>Update Transaction Status</h4>
                            <p>Are you sure you want to change the status of this transaction?</p>
                            <div className="modal-actions">
                                <button
                                    className="approve-btn"
                                    onClick={handleApprove}
                                    disabled={isUpdateLoading}
                                >
                                    {isUpdateLoading ? "Updating..." : "Approve"}
                                </button>
                                <button
                                    className="reject-btn"
                                    onClick={handleReject}
                                    disabled={isUpdateLoading}
                                >
                                    {isUpdateLoading ? "Updating..." : "Reject"}
                                </button>
                                <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Transactions;