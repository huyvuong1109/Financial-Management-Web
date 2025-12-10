import React, { useState } from 'react';
import { register } from '../services/AuthService.jsx';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Container,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountBalanceWallet as WalletIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    customerName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...submitData } = formData;
      await register(submitData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              py: 4,
              px: 3,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <WalletIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold">
              Finance Manager
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
              Tạo tài khoản để bắt đầu quản lý tài chính
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/login')}
              sx={{ mb: 2 }}
            >
              Quay lại đăng nhập
            </Button>

            <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
              Đăng ký tài khoản
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Đăng ký thành công! Đang chuyển đến trang đăng nhập...
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Số điện thoại"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                helperText="Mật khẩu phải có ít nhất 6 ký tự"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || success}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
              </Button>

              <Typography variant="body2" textAlign="center" color="text.secondary">
                Đã có tài khoản?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate('/login')}
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Đăng nhập
                </Link>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
