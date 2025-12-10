import React, { useState } from 'react';
import { login } from '../services/AuthService.jsx';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
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
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(formData);
      const token = res.data.token;
      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);

      if (decoded.role === 'ADMIN') {
        navigate('/admin-home');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
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
              Quản lý tài chính cá nhân thông minh
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
              Đăng nhập
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
              Chào mừng bạn trở lại!
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
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
                label="Mật khẩu"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
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

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
              </Button>

              <Typography variant="body2" textAlign="center" color="text.secondary">
                Chưa có tài khoản?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate('/register')}
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Đăng ký ngay
                </Link>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
