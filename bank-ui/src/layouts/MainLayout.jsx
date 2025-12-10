import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Popover,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  SwapHoriz as TransactionIcon,
  PieChart as BudgetIcon,
  Savings as SavingsIcon,
  Assessment as ReportIcon,
  Category as CategoryIcon,
  CreditCard as CardIcon,
  Notifications as NotificationIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Giao dịch', icon: <TransactionIcon />, path: '/transactions' },
  { text: 'Ngân sách', icon: <BudgetIcon />, path: '/budget' },
  { text: 'Mục tiêu tiết kiệm', icon: <SavingsIcon />, path: '/savings' },
  { text: 'Báo cáo', icon: <ReportIcon />, path: '/reports' },
  { text: 'Danh mục', icon: <CategoryIcon />, path: '/categories' },
  { text: 'Thẻ & Tài khoản', icon: <CardIcon />, path: '/accounts' },
];

// Mock notifications - trong thực tế sẽ fetch từ API
const mockNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'Chuyển tiền thành công',
    message: 'Bạn đã chuyển 500,000 VNĐ đến tài khoản 1234****5678',
    time: '5 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Cảnh báo ngân sách',
    message: 'Bạn đã sử dụng 90% ngân sách "Ăn uống" tháng này',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'Mục tiêu tiết kiệm',
    message: 'Còn 2 tuần nữa đến hạn mục tiêu "Mua laptop mới"',
    time: '3 giờ trước',
    read: false,
  },
  {
    id: 4,
    type: 'success',
    title: 'Nhận tiền',
    message: 'Bạn đã nhận được 2,000,000 VNĐ từ Nguyễn Văn A',
    time: '1 ngày trước',
    read: true,
  },
];

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  let userName = 'Người dùng';
  let userEmail = '';
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userName = decoded.name || decoded.sub || 'Người dùng';
      userEmail = decoded.email || '';
    } catch (e) {
      console.error('Invalid token');
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'info':
        return <InfoIcon sx={{ color: 'info.main' }} />;
      default:
        return <NotificationIcon sx={{ color: 'primary.main' }} />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <WalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            FinanceHub
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Quản lý tài chính thông minh
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* User info */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: 'grey.100',
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {userEmail}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flex: 1 }} />
          
          <IconButton color="inherit" sx={{ mr: 1 }} onClick={handleNotificationClick}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>

          {/* Notification Popover */}
          <Popover
            open={Boolean(notificationAnchor)}
            anchorEl={notificationAnchor}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: { width: 380, maxHeight: 480 }
            }}
          >
            <Card elevation={0}>
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight="bold">
                    Thông báo
                  </Typography>
                }
                action={
                  unreadCount > 0 && (
                    <Button
                      size="small"
                      startIcon={<DoneAllIcon />}
                      onClick={handleMarkAllAsRead}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )
                }
                sx={{ pb: 1 }}
              />
              <Divider />
              <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <NotificationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      Không có thông báo nào
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notification) => (
                    <Box
                      key={notification.id}
                      sx={{
                        p: 2,
                        display: 'flex',
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Box sx={{ mt: 0.5 }}>
                        {getNotificationIcon(notification.type)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip label="Mới" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {notification.time}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))
                )}
              </Box>
              {notifications.length > 0 && (
                <>
                  <Divider />
                  <Box sx={{ p: 1.5, textAlign: 'center' }}>
                    <Button size="small" onClick={handleNotificationClose}>
                      Xem tất cả thông báo
                    </Button>
                  </Box>
                </>
              )}
            </Card>
          </Popover>
          
          <IconButton onClick={handleMenuClick}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              Hồ sơ
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              Cài đặt
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
