import React from "react";
import { Container, Typography, Box, Grid, Card, CardContent, Fade, Grow } from "@mui/material";
import { Link } from "react-router-dom";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import UserAppBar from "./UserAppBar";

export default function UserHome() {
  const features = [
    {
      title: "Số dư",
      description: "Xem và quản lý số dư tài khoản",
      icon: <AccountBalanceIcon sx={{ fontSize: 56 }} />,
      link: "/account",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      delay: 0.1,
    },
    {
      title: "Quản lý thẻ",
      description: "Thêm, xóa hoặc khóa thẻ",
      icon: <CreditCardIcon sx={{ fontSize: 56 }} />,
      link: "/account",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      delay: 0.2,
    },
    {
      title: "Chuyển tiền",
      description: "Thực hiện giao dịch chuyển tiền",
      icon: <SendIcon sx={{ fontSize: 56 }} />,
      link: "/account",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      delay: 0.3,
    },
    {
      title: "Lịch sử",
      description: "Xem lịch sử giao dịch",
      icon: <HistoryIcon sx={{ fontSize: 56 }} />,
      link: "/transaction-history",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      delay: 0.4,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <UserAppBar />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: { xs: 6, md: 8 },
          mb: 6,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
        }}
      >
        <Container maxWidth="lg">
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  fontSize: { xs: "2rem", md: "3rem" },
                  textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                Chào mừng đến với MyBank!
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: 700,
                  mx: "auto",
                  opacity: 0.95,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  lineHeight: 1.8,
                }}
              >
                Quản lý tài chính của bạn một cách dễ dàng và an toàn. 
                Xem số dư, quản lý thẻ, chuyển tiền và theo dõi lịch sử giao dịch.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mb: 2,
                color: "#333",
                fontSize: { xs: "1.75rem", md: "2.125rem" },
              }}
            >
              Dịch vụ của chúng tôi
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              Chọn một dịch vụ bên dưới để bắt đầu
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4} sx={{ justifyContent: "center" }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in={true} timeout={600 + feature.delay * 1000} style={{ transitionDelay: `${feature.delay * 1000}ms` }}>
                <Box>
                  <Link to={feature.link} style={{ textDecoration: "none" }}>
                    <Card
                      sx={{
                        height: "100%",
                        minHeight: 280,
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        background: feature.color,
                        color: "white",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "translateY(-12px) scale(1.02)",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                          "& .icon-wrapper": {
                            transform: "scale(1.1) rotate(5deg)",
                          },
                          "& .card-content": {
                            transform: "translateY(-5px)",
                          },
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(255,255,255,0.1)",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                        },
                        "&:hover::before": {
                          opacity: 1,
                        },
                      }}
                      elevation={6}
                    >
                      <CardContent
                        className="card-content"
                        sx={{
                          textAlign: "center",
                          py: 5,
                          px: 3,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "relative",
                          zIndex: 1,
                          transition: "transform 0.4s ease",
                        }}
                      >
                        <Box
                          className="icon-wrapper"
                          sx={{
                            mb: 3,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            transition: "all 0.4s ease",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          {React.cloneElement(feature.icon, { sx: { fontSize: 56, color: "white" } })}
                        </Box>
                        <Typography
                          variant="h5"
                          gutterBottom
                          sx={{
                            fontWeight: "bold",
                            color: "white",
                            mb: 1.5,
                            fontSize: { xs: "1.25rem", md: "1.5rem" },
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "0.875rem", md: "1rem" },
                            lineHeight: 1.6,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Box>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer Section */}
      <Box
        sx={{
          mt: 8,
          py: 4,
          backgroundColor: "#fff",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            © 2024 MyBank. Tất cả quyền được bảo lưu.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
