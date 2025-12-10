import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  AttachMoney as IncomeIcon,
  Work as WorkIcon,
  CardGiftcard as BonusIcon,
  TrendingUp as InvestmentIcon,
  Store as BusinessIcon,
} from '@mui/icons-material';

const expenseIcons = {
  'Ăn uống': <FoodIcon />,
  'Mua sắm': <ShoppingIcon />,
  'Di chuyển': <TransportIcon />,
  'Hóa đơn': <BillIcon />,
  'Giải trí': <EntertainmentIcon />,
  'Sức khỏe': <HealthIcon />,
  'Giáo dục': <EducationIcon />,
  'Khác': <OtherIcon />,
};

const incomeIcons = {
  'Lương': <WorkIcon />,
  'Thưởng': <BonusIcon />,
  'Đầu tư': <InvestmentIcon />,
  'Kinh doanh': <BusinessIcon />,
  'Khác': <IncomeIcon />,
};

const expenseColors = {
  'Ăn uống': '#ef4444',
  'Mua sắm': '#f97316',
  'Di chuyển': '#eab308',
  'Hóa đơn': '#22c55e',
  'Giải trí': '#3b82f6',
  'Sức khỏe': '#ec4899',
  'Giáo dục': '#8b5cf6',
  'Khác': '#6b7280',
};

const incomeColors = {
  'Lương': '#10b981',
  'Thưởng': '#34d399',
  'Đầu tư': '#059669',
  'Kinh doanh': '#047857',
  'Khác': '#065f46',
};

export default function CategoriesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [expenseCategories, setExpenseCategories] = useState([
    { id: 1, name: 'Ăn uống', icon: 'FoodIcon', color: '#ef4444', transactionCount: 45 },
    { id: 2, name: 'Mua sắm', icon: 'ShoppingIcon', color: '#f97316', transactionCount: 23 },
    { id: 3, name: 'Di chuyển', icon: 'TransportIcon', color: '#eab308', transactionCount: 34 },
    { id: 4, name: 'Hóa đơn', icon: 'BillIcon', color: '#22c55e', transactionCount: 12 },
    { id: 5, name: 'Giải trí', icon: 'EntertainmentIcon', color: '#3b82f6', transactionCount: 18 },
    { id: 6, name: 'Sức khỏe', icon: 'HealthIcon', color: '#ec4899', transactionCount: 5 },
    { id: 7, name: 'Giáo dục', icon: 'EducationIcon', color: '#8b5cf6', transactionCount: 8 },
    { id: 8, name: 'Khác', icon: 'OtherIcon', color: '#6b7280', transactionCount: 15 },
  ]);

  const [incomeCategories, setIncomeCategories] = useState([
    { id: 1, name: 'Lương', icon: 'WorkIcon', color: '#10b981', transactionCount: 12 },
    { id: 2, name: 'Thưởng', icon: 'BonusIcon', color: '#34d399', transactionCount: 3 },
    { id: 3, name: 'Đầu tư', icon: 'InvestmentIcon', color: '#059669', transactionCount: 8 },
    { id: 4, name: 'Kinh doanh', icon: 'BusinessIcon', color: '#047857', transactionCount: 15 },
    { id: 5, name: 'Khác', icon: 'IncomeIcon', color: '#065f46', transactionCount: 5 },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3b82f6',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory({ name: category.name, color: category.color });
    } else {
      setEditingCategory(null);
      setNewCategory({ name: '', color: '#3b82f6' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setNewCategory({ name: '', color: '#3b82f6' });
  };

  const handleSaveCategory = () => {
    const categories = tabValue === 0 ? expenseCategories : incomeCategories;
    const setCategories = tabValue === 0 ? setExpenseCategories : setIncomeCategories;

    if (editingCategory) {
      setCategories(categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, name: newCategory.name, color: newCategory.color }
          : c
      ));
    } else {
      setCategories([...categories, {
        id: Date.now(),
        name: newCategory.name,
        color: newCategory.color,
        icon: 'OtherIcon',
        transactionCount: 0,
      }]);
    }
    handleCloseDialog();
  };

  const handleDeleteCategory = (id) => {
    if (tabValue === 0) {
      setExpenseCategories(expenseCategories.filter(c => c.id !== id));
    } else {
      setIncomeCategories(incomeCategories.filter(c => c.id !== id));
    }
  };

  const getIcon = (category, type) => {
    if (type === 'expense') {
      return expenseIcons[category.name] || <OtherIcon />;
    }
    return incomeIcons[category.name] || <IncomeIcon />;
  };

  const currentCategories = tabValue === 0 ? expenseCategories : incomeCategories;

  const colorOptions = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280',
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Danh mục
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý danh mục thu nhập và chi tiêu
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Thêm danh mục
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Chi tiêu
                <Chip label={expenseCategories.length} size="small" color="error" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Thu nhập
                <Chip label={incomeCategories.length} size="small" color="success" />
              </Box>
            } 
          />
        </Tabs>
      </Card>

      {/* Categories Grid */}
      <Grid container spacing={3}>
        {currentCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56,
                      bgcolor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {getIcon(category, tabValue === 0 ? 'expense' : 'income')}
                  </Avatar>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(category)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={category.transactionCount > 0}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                  {category.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: category.color 
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    {category.transactionCount} giao dịch
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Summary */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Thống kê danh mục
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, color: 'white' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Danh mục chi tiêu
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {expenseCategories.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng {expenseCategories.reduce((sum, c) => sum + c.transactionCount, 0)} giao dịch
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Danh mục thu nhập
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {incomeCategories.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng {incomeCategories.reduce((sum, c) => sum + c.transactionCount, 0)} giao dịch
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên danh mục"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Chọn màu
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {colorOptions.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: color,
                      cursor: 'pointer',
                      border: newCategory.color === color ? '3px solid' : 'none',
                      borderColor: 'primary.main',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Avatar sx={{ bgcolor: `${newCategory.color}20`, color: newCategory.color }}>
                  <OtherIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {newCategory.name || 'Tên danh mục'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Xem trước
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveCategory}
            disabled={!newCategory.name}
          >
            {editingCategory ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
