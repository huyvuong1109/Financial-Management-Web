import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import UserAppBar from "./UserAppBar";
import { BANK_SERVICE_API } from '../../config/api';

export default function Transfer() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [cardInfo, setCardInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiverCardNumber, setReceiverCardNumber] = useState('');
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${BANK_SERVICE_API}/api/cards/${cardId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu thẻ");
        }
        return response.json();
      })
      .then((data) => {
        setCardInfo(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [cardId, token]);

  if (loading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (!cardInfo) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>Không tìm thấy thông tin thẻ.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ backgroundColor: "orange", marginTop: "10px" }}
        >
          Trở lại
        </button>
      </div>
    );
  }

  const handleSearch = () => {
    fetch(`${BANK_SERVICE_API}/api/cards/${receiverCardNumber}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không tìm thấy người nhận");
        }
        return response.json();
      })
      .then((data) => {
        setReceiverInfo(data);
        alert(`Đã tìm thấy: ${data.customerName}`);
      })
      .catch((error) => {
        console.error(error);
        setReceiverInfo(null);
        alert(error.message);
      });
  };

  const handleConfirmTransfer = () => {
    if (!receiverInfo || !amount) {
      alert("Vui lòng nhập đủ thông tin người nhận và số tiền.");
      return;
    }

    const transactionData = {
      fromAccountId: cardInfo.accountId,
      toAccountId: receiverInfo.accountId,
      amount: parseFloat(amount),
    };

    fetch(`${BANK_SERVICE_API}/transactions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Lỗi khi tạo giao dịch.");
        }
        return response.json();
      })
      .then((data) => {
        setTransactionId(data.id);
        setShowOtpInput(true);
        alert("Giao dịch đã được tạo. OTP đã được gửi tới email của bạn. Vui lòng nhập OTP để xác nhận.");
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  };

  // ... (các đoạn code khác giữ nguyên)

const handleVerifyOtp = () => {
  if (!otp) {
      alert("Vui lòng nhập mã OTP.");
      return;
  }

  const verificationData = {
      verificationCode: otp,
  };

  fetch(`${BANK_SERVICE_API}/transactions/${transactionId}/verify`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(verificationData),
  })
  .then((response) => {
      if (!response.ok) {
          // Trường hợp lỗi HTTP như 400 Bad Request
          throw new Error("Xác thực OTP thất bại. Vui lòng thử lại.");
      }
      return response.json();
  })
  .then((data) => {
      // Kiểm tra status từ dữ liệu trả về
      if (data.status === "AWAITING_APPROVAL") {
          alert("Chuyển khoản thành công!");
          // Reset form sau khi thành công
          setReceiverCardNumber('');
          setReceiverInfo(null);
          setAmount('');
          setShowOtpInput(false);
          setOtp('');
          setTransactionId(null);
      } else if (data.status === "FAILED") {
          alert("Bạn đã nhập sai OTP quá 3 lần. Giao dịch đã bị hủy.");
          // Reset form và các trạng thái liên quan
          setReceiverCardNumber('');
          setReceiverInfo(null);
          setAmount('');
          setShowOtpInput(false);
          setOtp('');
          setTransactionId(null);
      } else if (data.status === "PENDING") {
          // Khi OTP sai nhưng vẫn còn lượt thử
          alert(`Mã OTP không đúng. Bạn còn ${3 - data.attempts} lần thử.`);
          setOtp(''); // Xóa mã OTP đã nhập để người dùng nhập lại
      } else {
          alert("Trạng thái giao dịch không xác định.");
      }
  })
  .catch((error) => {
      console.error(error);
      alert(error.message);
  });
};

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <UserAppBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Trở lại
          </Button>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
            Chuyển khoản
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Thông tin thẻ của bạn */}
          <Grid item xs={12} md={5}>
            <Card sx={{ boxShadow: 4, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3, color: "#1976d2" }}>
                  Thông tin thẻ của bạn
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Số thẻ</Typography>
                    <Typography variant="h6">{cardInfo.cardId}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Chủ thẻ</Typography>
                    <Typography variant="h6">{cardInfo.customerName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{cardInfo.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                    <Typography variant="body1">{cardInfo.phoneNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Loại thẻ</Typography>
                    <Typography variant="body1">{cardInfo.cardType}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Ngày hết hạn</Typography>
                    <Typography variant="body1">{cardInfo.expiryDate}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">Số dư khả dụng</Typography>
                      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                        {(cardInfo.availableBalance ?? 0).toLocaleString()} VNĐ
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Số dư bị giữ: {(cardInfo.holdBalance ?? 0).toLocaleString()} VNĐ
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Form chuyển khoản */}
          <Grid item xs={12} md={7}>
            <Card sx={{ boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3, color: "#1976d2" }}>
                  Thông tin người nhận
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Số thẻ người nhận"
                    placeholder="Nhập số thẻ"
                    value={receiverCardNumber}
                    onChange={(e) => setReceiverCardNumber(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    sx={{ mb: 3 }}
                  >
                    Tìm kiếm
                  </Button>
                </Box>

                {receiverInfo && (
                  <Paper sx={{ p: 3, backgroundColor: "#f1f8e9", mb: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                      Thông tin người nhận
                    </Typography>
                    <Typography variant="body1">
                      <strong>Số thẻ:</strong> {receiverInfo.cardId}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Tên người nhận:</strong> {receiverInfo.customerName}
                    </Typography>
                  </Paper>
                )}

                {receiverInfo && (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Số tiền (VNĐ)"
                      type="number"
                      placeholder="Nhập số tiền"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<SendIcon />}
                      onClick={handleConfirmTransfer}
                      sx={{
                        backgroundColor: "#1976d2",
                        "&:hover": { backgroundColor: "#1565c0" },
                        py: 1.5,
                      }}
                    >
                      Xác nhận chuyển khoản
                    </Button>
                  </Box>
                )}

                {showOtpInput && (
                  <Paper sx={{ p: 3, backgroundColor: "#fff3e0", borderRadius: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <VerifiedUserIcon sx={{ mr: 1, color: "#ff9800" }} />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Xác thực OTP
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Mã OTP đã được gửi tới email của bạn. Vui lòng nhập mã OTP để xác nhận.
                    </Typography>
                    <TextField
                      fullWidth
                      label="Mã OTP"
                      placeholder="Nhập mã OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<VerifiedUserIcon />}
                      onClick={handleVerifyOtp}
                      sx={{
                        backgroundColor: "#4caf50",
                        "&:hover": { backgroundColor: "#388e3c" },
                        py: 1.5,
                      }}
                    >
                      Xác nhận OTP
                    </Button>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}