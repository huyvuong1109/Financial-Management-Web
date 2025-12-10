import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as FoodIcon,
  ShoppingCart as ShoppingIcon,
  DirectionsCar as TransportIcon,
  Receipt as BillIcon,
  Movie as EntertainmentIcon,
  LocalHospital as HealthIcon,
  School as EducationIcon,
  MoreHoriz as OtherIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const categoryIcons = {
  'Ăn uống': <FoodIcon />,
  'Mua sắm': <ShoppingIcon />,
  'Di chuyển': <TransportIcon />,
  'Hóa đơn': <BillIcon />,
  'Giải trí': <EntertainmentIcon />,
  'Sức khỏe': <HealthIcon />,
  'Giáo dục': <EducationIcon />,
  'Khác': <OtherIcon />,
};

const categoryColors = {
  'Ăn uống': '#ef4444',
  'Mua sắm': '#f97316',
  'Di chuyển': '#eab308',
  'Hóa đơn': '#22c55e',
  'Giải trí': '#3b82f6',
  'Sức khỏe': '#ec4899',
  'Giáo dục': '#8b5cf6',
  'Khác': '#6b7280',
};

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([
    { id: 1, category: 'Ăn uống', limit: 5000000, spent: 3500000 },
    { id: 2, category: 'Mua sắm', limit: 3000000, spent: 2800000 },
    { id: 3, category: 'Di chuyển', limit: 2000000, spent: 1200000 },
    { id: 4, category: 'Hóa đơn', limit: 3000000, spent: 2500000 },
    { id: 5, category: 'Giải trí', limit: 1500000, spent: 800000 },
    { id: 6, category: 'Sức khỏe', limit: 1000000, spent: 300000 },
  ]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: '',
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const getProgressColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'primary';
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  const handleOpenDialog = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setNewBudget({ category: budget.category, limit: budget.limit.toString() });
    } else {
      setEditingBudget(null);
      setNewBudget({ category: '', limit: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
    setNewBudget({ category: '', limit: '' });
  };

  const handleSaveBudget = () => {
    if (editingBudget) {
      setBudgets(budgets.map(b => 
        b.id === editingBudget.id 
          ? { ...b, category: newBudget.category, limit: parseFloat(newBudget.limit) }
          : b
      ));
    } else {
      setBudgets([...budgets, {
        id: Date.now(),
        category: newBudget.category,
        limit: parseFloat(newBudget.limit),
        spent: 0,
      }]);
    }
    handleCloseDialog();
  };

  const handleDeleteBudget = (id) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const availableCategories = Object.keys(categoryIcons).filter(
    cat => !budgets.find(b => b.category === cat) || editingBudget?.category === cat
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ngân sách
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thiết lập và theo dõi ngân sách chi tiêu hàng tháng
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Thêm ngân sách
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tổng ngân sách
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {formatCurrency(totalBudget)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Đã chi tiêu
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {formatCurrency(totalSpent)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round((totalSpent / totalBudget) * 100)}% ngân sách
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Còn lại
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                color={remainingBudget >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(remainingBudget)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {remainingBudget >= 0 ? 'Trong ngân sách' : 'Vượt ngân sách'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Overall Progress */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Tiến độ tổng thể
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min((totalSpent / totalBudget) * 100, 100)}
            color={getProgressColor(totalSpent, totalBudget)}
            sx={{ height: 12, borderRadius: 6 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              0%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round((totalSpent / totalBudget) * 100)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              100%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Budget Cards */}
      <Grid container spacing={3}>
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = percentage >= 100;
          const isNearLimit = percentage >= 80;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={budget.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderLeft: 4,
                  borderColor: categoryColors[budget.category] || '#6b7280',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: `${categoryColors[budget.category]}20`,
                          color: categoryColors[budget.category],
                        }}
                      >
                        {categoryIcons[budget.category] || <OtherIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {budget.category}
                        </Typography>
                        {isOverBudget && (
                          <Chip 
                            icon={<WarningIcon />} 
                            label="Vượt ngân sách" 
                            size="small" 
                            color="error"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                        {!isOverBudget && isNearLimit && (
                          <Chip 
                            label="Gần hết" 
                            size="small" 
                            color="warning"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(budget)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteBudget(budget.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Đã chi
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(budget.spent)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      color={getProgressColor(budget.spent, budget.limit)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Giới hạn: {formatCurrency(budget.limit)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={isOverBudget ? 'error.main' : 'success.main'}
                    >
                      {isOverBudget 
                        ? `-${formatCurrency(budget.spent - budget.limit)}`
                        : formatCurrency(budget.limit - budget.spent)
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBudget ? 'Chỉnh sửa ngân sách' : 'Thêm ngân sách mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={newBudget.category}
                  label="Danh mục"
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                >
                  {availableCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {categoryIcons[cat]}
                        {cat}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Giới hạn ngân sách"
                type="number"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBudget}
            disabled={!newBudget.category || !newBudget.limit}
          >
            {editingBudget ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
