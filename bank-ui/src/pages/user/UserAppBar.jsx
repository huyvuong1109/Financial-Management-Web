import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
// import { over } from "stompjs";
// import Stomp from "stompjs";
import { Client } from '@stomp/stompjs';
import { jwtDecode } from "jwt-decode";
import { NOTIFICATION_SERVICE_API, WS_URL } from '../../config/api';

export default function UserAppBar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.sub);
      } catch (e) {
        console.error("Invalid token:", e);
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const token = localStorage.getItem("token");
      fetch(`${NOTIFICATION_SERVICE_API}/received/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((receivedNotis) => {
          fetch(`${NOTIFICATION_SERVICE_API}/sent/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((response) => response.json())
            .then((sentNotis) => {
              const allNotis = [...receivedNotis, ...sentNotis];
              allNotis.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              setNotifications(allNotis);
            });
        })
        .catch((error) => {
          console.error("Error fetching notifications:", error);
        });
    }
  }, [userId]);

  // useEffect(() => {
  //   const socket = new SockJS("/ws");
  //   //const stomp = over(socket);
  //   // const stomp = Stomp.client(socket);
  //   const stomp = new Client({ webSocketFactory: () => socket });
  //   stomp.connect({}, () => {
  //     if (userId) {
  //       stomp.subscribe("/topic/notifications", (message) => {
  //         const newNoti = JSON.parse(message.body);
  //         if (newNoti.toAccountId === userId || newNoti.fromAccountId === userId) {
  //           setNotifications((prev) => [newNoti, ...prev]);
  //           setUnreadCount((prev) => prev + 1);
  //         }
  //       });
  //     }
  //   });
  //   setStompClient(stomp);

  //   return () => {
  //     if (stompClient) stompClient.disconnect();
  //   };
  // }, [userId]);
  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS(WS_URL);
    const stomp = new Client({ webSocketFactory: () => socket });

    stomp.onConnect = () => {
        console.log('Connected to STOMP');
        stomp.subscribe("/topic/notifications", (message) => {
            const newNoti = JSON.parse(message.body);
            if (newNoti.toAccountId === userId || newNoti.fromAccountId === userId) {
                setNotifications((prev) => [newNoti, ...prev]);
                setUnreadCount((prev) => prev + 1);
            }
        });
    };

    stomp.activate();

    setStompClient(stomp);

    return () => {
        if (stompClient) {
            stompClient.deactivate();
        }
    };
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setUnreadCount(0);
  };

  const handleCloseMenu = () => setAnchorEl(null);
  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);

  const menuItems = [
    { label: "Trang Chủ", path: "/user-home" },
    { label: "Tài Khoản", path: "/account" },
    { label: "Lịch sử", path: "/transaction-history" },
    { label: "Báo cáo", path: "/financial-reports" },
    { label: "Ngân sách", path: "/budget" },
  ];

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: 3
        }}
      >
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component={Link}
            to="/user-home"
            sx={{ 
              textDecoration: "none", 
              color: "white", 
              fontWeight: "bold",
              mr: { xs: 1, md: 4 },
              "&:hover": { opacity: 0.8 }
            }}
          >
            MyBank
          </Typography>
  
          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
              {menuItems.map((item) => (
                <Button 
                  key={item.path}
                  color="inherit" 
                  component={Link} 
                  to={item.path}
                  sx={{ 
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                    borderRadius: 1
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile: Menu items in toolbar */}
          {isMobile && <Box sx={{ flexGrow: 1 }} />}
  
        {/* Icon thông báo */}
        <IconButton 
          color="inherit" 
          onClick={handleOpenMenu}
          sx={{ 
            mr: 2,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
  
        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              maxHeight: 400,
              width: 350,
              mt: 1
            }
          }}
        >
          {notifications.length === 0 ? (
            <MenuItem>
              <Typography variant="body2" color="text.secondary">
                Không có thông báo
              </Typography>
            </MenuItem>
          ) : (
            notifications.map((noti, idx) => (
              <MenuItem
                key={noti.paymentId || idx}
                onClick={() => {
                  handleCloseMenu();
                  navigate("/transaction-history");
                }}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderBottom: idx < notifications.length - 1 ? '1px solid #eee' : 'none',
                  padding: '12px 16px',
                  "&:hover": { backgroundColor: "#f5f5f5" }
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {noti.fromAccountId === userId
                    ? `Bạn đã chuyển tiền`
                    : `Bạn đã nhận được tiền`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Số tiền: {parseFloat(noti.amount).toLocaleString('vi-VN')} VNĐ
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Từ: {noti.fromAccountId} → Đến: {noti.toAccountId}
                </Typography>
              </MenuItem>
            ))
          )}
        </Menu>
  
        {/* Logout */}
        <Button 
          variant="contained" 
          onClick={handleLogout}
          size={isMobile ? "small" : "medium"}
          sx={{
            backgroundColor: "#ff5722",
            "&:hover": { backgroundColor: "#e64a19" },
            borderRadius: 2,
            px: { xs: 2, md: 3 }
          }}
        >
          {isMobile ? "Đăng xuất" : "Đăng Xuất"}
        </Button>
      </Toolbar>
    </AppBar>

    {/* Mobile Drawer */}
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: 280,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Menu
        </Typography>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleMobileMenuToggle}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
    </>
  );
}