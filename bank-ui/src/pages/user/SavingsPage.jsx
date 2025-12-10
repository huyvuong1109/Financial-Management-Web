import React, { useState } from 'react';
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
  IconButton,
  Avatar,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flight as TravelIcon,
  Laptop as LaptopIcon,
  AccountBalance as BankIcon,
  Home as HomeIcon,
  DirectionsCar as CarIcon,
  School as EducationIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';

const goalIcons = {
  'Du lịch': <TravelIcon />,
  'Công nghệ': <LaptopIcon />,
  'Tiết kiệm': <BankIcon />,
  'Nhà cửa': <HomeIcon />,
  'Xe cộ': <CarIcon />,
  'Giáo dục': <EducationIcon />,
  'Khác': <CelebrationIcon />,
};

const goalColors = {
  'Du lịch': '#3b82f6',
  'Công nghệ': '#8b5cf6',
  'Tiết kiệm': '#10b981',
  'Nhà cửa': '#f97316',
  'Xe cộ': '#ef4444',
  'Giáo dục': '#eab308',
  'Khác': '#6b7280',
};

export default function SavingsPage() {
  const [goals, setGoals] = useState([
    { 
      id: 1, 
      name: 'Du lịch Đà Nẵng', 
      category: 'Du lịch',
      target: 15000000, 
      current: 8000000,
      deadline: '2025-06-30',
      monthlyContribution: 2000000,
    },
    { 
      id: 2, 
      name: 'Mua MacBook Pro', 
      category: 'Công nghệ',
      target: 35000000, 
      current: 12000000,
      deadline: '2025-12-31',
      monthlyContribution: 3000000,
    },
    { 
      id: 3, 
      name: 'Quỹ khẩn cấp', 
      category: 'Tiết kiệm',
      target: 50000000, 
      current: 25000000,
      deadline: '2026-06-30',
      monthlyContribution: 2500000,
    },
    { 
      id: 4, 
      name: 'Đặt cọc mua nhà', 
      category: 'Nhà cửa',
      target: 200000000, 
      current: 45000000,
      deadline: '2027-12-31',
      monthlyContribution: 5000000,
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [openContributeDialog, setOpenContributeDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const [newGoal, setNewGoal] = useState({
    name: '',
    category: 'Tiết kiệm',
    target: '',
    current: '0',
    deadline: '',
    monthlyContribution: '',
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateMonthlyNeeded = (goal) => {
    const remaining = goal.target - goal.current;
    const daysRemaining = calculateDaysRemaining(goal.deadline);
    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
    return Math.ceil(remaining / monthsRemaining);
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setNewGoal({
        name: goal.name,
        category: goal.category,
        target: goal.target.toString(),
        current: goal.current.toString(),
        deadline: goal.deadline,
        monthlyContribution: goal.monthlyContribution.toString(),
      });
    } else {
      setEditingGoal(null);
      setNewGoal({
        name: '',
        category: 'Tiết kiệm',
        target: '',
        current: '0',
        deadline: '',
        monthlyContribution: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = () => {
    if (editingGoal) {
      setGoals(goals.map(g => 
        g.id === editingGoal.id 
          ? { 
              ...g, 
              ...newGoal,
              target: parseFloat(newGoal.target),
              current: parseFloat(newGoal.current),
              monthlyContribution: parseFloat(newGoal.monthlyContribution),
            }
          : g
      ));
    } else {
      setGoals([...goals, {
        id: Date.now(),
        ...newGoal,
        target: parseFloat(newGoal.target),
        current: parseFloat(newGoal.current || 0),
        monthlyContribution: parseFloat(newGoal.monthlyContribution),
      }]);
    }
    handleCloseDialog();
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleOpenContribute = (goal) => {
    setSelectedGoal(goal);
    setContributeAmount('');
    setOpenContributeDialog(true);
  };

  const handleContribute = () => {
    const amount = parseFloat(contributeAmount);
    if (amount > 0 && selectedGoal) {
      setGoals(goals.map(g => 
        g.id === selectedGoal.id 
          ? { ...g, current: Math.min(g.current + amount, g.target) }
          : g
      ));
    }
    setOpenContributeDialog(false);
    setSelectedGoal(null);
    setContributeAmount('');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Mục tiêu tiết kiệm
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thiết lập và theo dõi các mục tiêu tiết kiệm của bạn
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Thêm mục tiêu
        </Button>
      </Box>

      {/* Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                Tổng mục tiêu
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(totalTarget)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {goals.length} mục tiêu đang thực hiện
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                Đã tiết kiệm
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(totalSaved)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {Math.round(overallProgress)}% hoàn thành
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                Còn thiếu
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(totalTarget - totalSaved)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Tiếp tục cố gắng!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Goals Grid */}
      <Grid container spacing={3}>
        {goals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100;
          const daysRemaining = calculateDaysRemaining(goal.deadline);
          const monthlyNeeded = calculateMonthlyNeeded(goal);
          const isCompleted = percentage >= 100;
          const isOnTrack = goal.monthlyContribution >= monthlyNeeded;

          return (
            <Grid item xs={12} md={6} key={goal.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56,
                          bgcolor: `${goalColors[goal.category]}20`,
                          color: goalColors[goal.category],
                        }}
                      >
                        {goalIcons[goal.category] || <CelebrationIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {goal.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={goal.category} 
                            size="small" 
                            sx={{ 
                              bgcolor: `${goalColors[goal.category]}20`,
                              color: goalColors[goal.category],
                            }}
                          />
                          {isCompleted ? (
                            <Chip label="Hoàn thành" size="small" color="success" />
                          ) : isOnTrack ? (
                            <Chip label="Đúng tiến độ" size="small" color="primary" />
                          ) : (
                            <Chip label="Cần tăng tốc" size="small" color="warning" />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(goal)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteGoal(goal.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Progress */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {formatCurrency(goal.current)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        / {formatCurrency(goal.target)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: isCompleted ? 'success.main' : goalColors[goal.category],
                          borderRadius: 6,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(percentage)}% hoàn thành
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Còn {formatCurrency(goal.target - goal.current)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Details */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Hạn hoàn thành
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(goal.deadline)}
                      </Typography>
                      <Typography variant="caption" color={daysRemaining > 30 ? 'text.secondary' : 'error.main'}>
                        (còn {daysRemaining} ngày)
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Tiết kiệm hàng tháng
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(goal.monthlyContribution)}
                      </Typography>
                      <Typography variant="caption" color={isOnTrack ? 'success.main' : 'warning.main'}>
                        (cần {formatCurrency(monthlyNeeded)}/tháng)
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Action Button */}
                  {!isCompleted && (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleOpenContribute(goal)}
                      sx={{ borderRadius: 2 }}
                    >
                      Thêm tiền tiết kiệm
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGoal ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên mục tiêu"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Danh mục"
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                SelectProps={{ native: true }}
              >
                {Object.keys(goalIcons).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hạn hoàn thành"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số tiền mục tiêu"
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Đã tiết kiệm"
                type="number"
                value={newGoal.current}
                onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiết kiệm hàng tháng"
                type="number"
                value={newGoal.monthlyContribution}
                onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ/tháng</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveGoal}
            disabled={!newGoal.name || !newGoal.target || !newGoal.deadline}
          >
            {editingGoal ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={openContributeDialog} onClose={() => setOpenContributeDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm tiền tiết kiệm</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Thêm tiền vào mục tiêu: {selectedGoal?.name}
          </Typography>
          <TextField
            fullWidth
            label="Số tiền"
            type="number"
            value={contributeAmount}
            onChange={(e) => setContributeAmount(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenContributeDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleContribute}
            disabled={!contributeAmount || parseFloat(contributeAmount) <= 0}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
