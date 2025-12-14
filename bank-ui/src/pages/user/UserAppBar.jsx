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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
// import { over } from "stompjs";
// import Stomp from "stompjs";
import { Client } from '@stomp/stompjs';
import { jwtDecode } from "jwt-decode";
import { NOTIFICATION_SERVICE_API, WS_URL } from '../../config/api';

export default function UserAppBar() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: 3
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h5"
          component={Link}
          to="/user-home"
          sx={{ 
            textDecoration: "none", 
            color: "white", 
            fontWeight: "bold",
            mr: 4,
            "&:hover": { opacity: 0.8 }
          }}
        >
          MyBank
        </Typography>
  
        {/* Menu */}
        <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/user-home"
            sx={{ 
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              borderRadius: 1
            }}
          >
            Trang Chủ
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/account"
            sx={{ 
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              borderRadius: 1
            }}
          >
            Tài Khoản
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/transaction-history"
            sx={{ 
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              borderRadius: 1
            }}
          >
            Lịch sử
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/financial-reports"
            sx={{ 
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              borderRadius: 1
            }}
          >
            Báo cáo
          </Button>
        </Box>
  
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
          sx={{
            backgroundColor: "#ff5722",
            "&:hover": { backgroundColor: "#e64a19" },
            borderRadius: 2,
            px: 3
          }}
        >
          Đăng Xuất
        </Button>
      </Toolbar>
    </AppBar>
  );
}