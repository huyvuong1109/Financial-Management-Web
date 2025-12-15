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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import UserAppBar from "./UserAppBar";
import { BANK_SERVICE_API } from '../../config/api';

export default function Transfer() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [cardInfo, setCardInfo] = useState(null);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiverCardNumber, setReceiverCardNumber] = useState('');
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const token = localStorage.getItem("token");
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Hàm xử lý khi chọn item trong Select
  const handleCategoryChange = (event) => {
    const value = event.target.value;
    if (value === "ADD_NEW") {
      setOpenCategoryDialog(true); // Mở popup nếu chọn "Thêm mới"
    } else {
      setSelectedCategory(value); // Chọn category bình thường
    }
  };

  // Hàm gọi API tạo category
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Vui lòng nhập tên phân loại");
      return;
    }

    setIsCreatingCategory(true);

    const newCategoryData = {
      categoryName: newCategoryName,
      categoryType: "EXPENSE" // Mặc định là chi tiêu khi chuyển khoản
    };

    fetch(`${BANK_SERVICE_API}/api/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newCategoryData),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Lỗi khi tạo phân loại");
        return response.json();
      })
      .then((data) => {
        // 1. Thêm category mới vào danh sách hiện tại
        setCategories((prev) => [...prev, data]);
        // 2. Tự động chọn category vừa tạo
        setSelectedCategory(String(data.categoryId));
        // 3. Reset và đóng dialog
        setNewCategoryName("");
        setOpenCategoryDialog(false);
        alert("Tạo phân loại thành công!");
      })
      .catch((error) => {
        console.error(error);
        alert("Không thể tạo phân loại mới.");
      })
      .finally(() => {
        setIsCreatingCategory(false);
      });
  };
  // Default categories with emoji
  const defaultCategories = [
    { name: "Cá nhân", emoji: "👤", type: "EXPENSE" },
    { name: "Mua sắm – Dịch vụ", emoji: "🛒", type: "EXPENSE" },
    { name: "Công việc", emoji: "💼", type: "EXPENSE" },
    { name: "Giáo dục", emoji: "🎓", type: "EXPENSE" },
    { name: "Y tế", emoji: "🏥", type: "EXPENSE" },
    { name: "Sinh hoạt", emoji: "🏠", type: "EXPENSE" },
    { name: "Khác", emoji: "📦", type: "EXPENSE" },
  ];

  // Component hiển thị card preview
  const CardPreview = ({ cardType, cardNumber, expiryDate, customerName }) => {
    const getCardGradient = (type) => {
      switch (type) {
        case "VISA":
          return "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)";
        case "DEBIT":
          return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
        case "CREDIT":
          return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
        default:
          return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      }
    };

    const getCardLogo = (type) => {
      switch (type) {
        case "VISA":
          return "VISA";
        case "DEBIT":
          return "DEBIT";
        case "CREDIT":
          return "CREDIT";
        default:
          return "CARD";
      }
    };

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          height: 240,
          borderRadius: 4,
          background: getCardGradient(cardType),
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          color: "white",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", zIndex: 1 }}>
          <CreditCardIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", letterSpacing: 2 }}>
            {getCardLogo(cardType)}
          </Typography>
        </Box>
        <Box sx={{ zIndex: 1 }}>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontSize: "0.85rem" }}>
            Số thẻ
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: "monospace", letterSpacing: 2, mb: 3 }}>
            {cardNumber || "**** **** **** ****"}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.75rem", mb: 0.5 }}>
                Hết hạn
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                {expiryDate || "MM/YY"}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.75rem", mb: 0.5 }}>
                Chủ thẻ
              </Typography>
              <Typography variant="body1" sx={{ textTransform: "uppercase", fontSize: "0.9rem" }}>
                {customerName?.split(" ").map(n => n[0]).join("") || "USER"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  // Fetch card info
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

  // Fetch balances - đồng bộ với Account page
  const fetchBalances = () => {
    fetch(`${BANK_SERVICE_API}/api/balances`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setBalances(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchBalances();
  }, [token]);

  // Fetch categories and create default ones if needed
  useEffect(() => {
    if (token) {
      fetch(`${BANK_SERVICE_API}/api/category/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Lỗi khi lấy danh sách phân loại");
          }
          return response.json();
        })
        .then((data) => {
          const existingCategories = data || [];
          
          // Check if default categories exist, if not create them
          const categoryNames = existingCategories.map(cat => cat.categoryName);
          const missingCategories = defaultCategories.filter(
            defaultCat => !categoryNames.includes(defaultCat.name)
          );

          // Create missing categories
          if (missingCategories.length > 0) {
            const createPromises = missingCategories.map(category => 
              fetch(`${BANK_SERVICE_API}/api/category`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  categoryName: category.name,
                  categoryType: category.type,
                }),
              })
            );

            Promise.all(createPromises)
              .then(() => {
                // Fetch categories again after creating
                return fetch(`${BANK_SERVICE_API}/api/category/my`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });
              })
              .then(response => response.json())
              .then(updatedCategories => {
                setCategories(updatedCategories || []);
              })
              .catch(error => {
                console.error("Error creating categories:", error);
                setCategories(existingCategories);
              });
          } else {
            setCategories(existingCategories);
          }
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
          // If fetch fails, use default categories structure (but they won't have IDs)
          setCategories([]);
        });
    }
  }, [token]);

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
    if (!receiverInfo || !amount || !selectedCategory) {
      alert("Vui lòng nhập đủ thông tin người nhận, số tiền và phân loại.");
      return;
    }

    setIsCreatingTransaction(true);

    const transactionData = {
      fromAccountId: cardInfo.accountId,
      toAccountId: receiverInfo.accountId,
      amount: parseFloat(amount),
      categoryId: selectedCategory,
      fromCardId: cardInfo.cardId,
      toCardId: receiverInfo.cardId,
    };

    fetch(`${BANK_SERVICE_API}/transactions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Lỗi khi tạo giao dịch.");
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
      })
      .finally(() => {
        setIsCreatingTransaction(false);
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
          // Cập nhật số dư ngay lập tức
          fetchBalances();
          // Reset form sau khi thành công
          setReceiverCardNumber('');
          setReceiverInfo(null);
          setAmount('');
          setSelectedCategory('');
          setShowOtpInput(false);
          setOtp('');
          setTransactionId(null);
      } else if (data.status === "FAILED") {
          alert("Bạn đã nhập sai OTP quá 3 lần. Giao dịch đã bị hủy.");
          // Reset form và các trạng thái liên quan
          setReceiverCardNumber('');
          setReceiverInfo(null);
          setAmount('');
          setSelectedCategory('');
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
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(8px)",
          opacity: 0.3,
          zIndex: 0,
        },
      }}
    >
      {/* Loading Overlay */}
      {isCreatingTransaction && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <CircularProgress
            size={60}
            sx={{
              color: "#667eea",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Đang xử lý chuyển khoản...
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mt: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Vui lòng đợi trong giây lát
          </Typography>
        </Box>
      )}

      <UserAppBar />
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          mb: 4,
          position: "relative",
          zIndex: 1,
          filter: isCreatingTransaction ? "blur(4px)" : "none",
          pointerEvents: isCreatingTransaction ? "none" : "auto",
          transition: "filter 0.3s ease",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              mr: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #653d8f 100%)",
              },
              color: "white",
            }}
          >
            Trở lại
          </Button>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Chuyển khoản
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Thông tin thẻ của bạn */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                borderRadius: 3,
                height: "100%",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Thông tin thẻ của bạn
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {/* Card Preview */}
                <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                  <CardPreview
                    cardType={cardInfo.cardType || "VISA"}
                    cardNumber={
                      cardInfo.cardId
                        ? cardInfo.cardId
                            .toString()
                            .replace(/\s/g, "")
                            .replace(/(.{4})/g, "$1 ")
                            .trim()
                        : undefined
                    }
                    expiryDate={
                      cardInfo.expiryDate
                        ? new Date(cardInfo.expiryDate).toLocaleDateString("en-GB", {
                            month: "2-digit",
                            year: "2-digit",
                          })
                        : ""
                    }
                    customerName={cardInfo.customerName}
                  />
                </Box>

                {/* Balance Info */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Số dư khả dụng
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    {(balances?.availableBalance ?? 0).toLocaleString()} VNĐ
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                    Đang chờ xử lý: {(balances?.holdBalance ?? 0).toLocaleString()} VNĐ
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Form chuyển khoản */}
          <Grid item xs={12} md={7}>
            <Card
              sx={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
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
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        mb: 2,
                        background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Thông tin người nhận
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <CardPreview
                        cardType={receiverInfo.cardType || "VISA"}
                        cardNumber={
                          receiverInfo.cardId
                            ? receiverInfo.cardId
                                .toString()
                                .replace(/\s/g, "")
                                .replace(/(.{4})/g, "$1 ")
                                .trim()
                            : undefined
                        }
                        expiryDate={
                          receiverInfo.expiryDate
                            ? new Date(receiverInfo.expiryDate).toLocaleDateString("en-GB", {
                                month: "2-digit",
                                year: "2-digit",
                              })
                            : ""
                        }
                        customerName={receiverInfo.customerName}
                      />
                    </Box>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: "#f1f8e9",
                        borderRadius: 2,
                        border: "1px solid rgba(76, 175, 80, 0.2)",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Tên người nhận
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                        {receiverInfo.customerName}
                      </Typography>
                    </Paper>
                  </Box>
                )}

        {receiverInfo && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 2, color: "#1976d2" }}>
                      Thông tin chuyển khoản
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <TextField
                      fullWidth
                      label="Số tiền (VNĐ)"
                      type="number"
                      placeholder="Nhập số tiền"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Phân loại</InputLabel>
                      <Select
                        value={selectedCategory}
                        label="Phân loại"
                        onChange={handleCategoryChange} // Sử dụng hàm handle mới
                        renderValue={(selected) => {
                          // Logic hiển thị tên khi đã chọn
                          const cat = categories.find(c => String(c.categoryId) === selected);
                          if (!cat) return "";
                          const defaultCat = defaultCategories.find(dc => dc.name === cat.categoryName);
                          return defaultCat ? `${defaultCat.emoji} ${cat.categoryName}` : `🆕 ${cat.categoryName}`;
                        }}
                      >
                        {/* Render danh sách category */}
                        {categories
                          // .filter(...) <-- BỎ DÒNG FILTER NÀY ĐỂ HIỆN CATEGORY MỚI TẠO
                          .sort((a, b) => {
                            // Logic sort cũ của bạn vẫn giữ được
                            const indexA = defaultCategories.findIndex(dc => dc.name === a.categoryName);
                            const indexB = defaultCategories.findIndex(dc => dc.name === b.categoryName);
                            // Đưa những cái custom xuống dưới cùng nếu không tìm thấy trong default
                            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                          })
                          .map((category) => {
                            const defaultCat = defaultCategories.find(dc => dc.name === category.categoryName);
                            return (
                              <MenuItem key={category.categoryId} value={String(category.categoryId)}>
                                {defaultCat ? `${defaultCat.emoji} ${category.categoryName}` : `🆕 ${category.categoryName}`}
                              </MenuItem>
                            );
                          })}

                        {/* Dòng kẻ ngăn cách */}
                        <Divider />
                        
                        {/* Nút thêm mới nằm ngay trong Select */}
                        <MenuItem 
                          value="ADD_NEW" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#667eea',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                          Thêm phân loại mới
                        </MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<SendIcon />}
                      onClick={handleConfirmTransfer}
                      disabled={isCreatingTransaction}
                      sx={{
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #5568d3 0%, #653d8f 100%)",
                        },
                        "&:disabled": {
                          background: "linear-gradient(135deg, #9e9e9e 0%, #757575 100%)",
                          opacity: 0.7,
                        },
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                        py: 1.5,
                        fontWeight: "600",
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
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #38d973 0%, #2ee5c5 100%)",
                        },
                        boxShadow: "0 4px 15px rgba(67, 233, 123, 0.4)",
                        py: 1.5,
                        fontWeight: "600",
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
      {/* Dialog tạo Category mới */}
      <Dialog 
        open={openCategoryDialog} 
        onClose={() => setOpenCategoryDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3, padding: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Tạo phân loại mới 🆕
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Nhập tên cho khoản chi tiêu mới của bạn.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Tên phân loại"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ví dụ: Du lịch, Đám cưới..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setOpenCategoryDialog(false)} 
            color="inherit"
          >
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleCreateCategory} 
            variant="contained"
            disabled={isCreatingCategory}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              px: 3
            }}
          >
            {isCreatingCategory ? <CircularProgress size={24} color="inherit"/> : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}