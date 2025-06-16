import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  useTheme,
  alpha,
  Fab,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Tabs,
  Tab,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon,
  Timeline as TimelineIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Layout from '@/components/layout/Layout';
import OKRProgress from '@/components/okr/OKRProgress';
import { okrService } from '@/services/okr.service';
import { OKR, OKRStatus, OKRLevel, OKRPriority } from '@/types/okr';
import { departmentsService } from '@/services/departments.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`okr-tabpanel-${index}`}
      aria-labelledby={`okr-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * OKRs Page Component
 * 
 * Interactive OKR management page with backend API integration
 */
export default function OKRsPage(): JSX.Element {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOKR, setSelectedOKR] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | OKRStatus>('all');
  const [newOKR, setNewOKR] = useState({
    title: '',
    description: '',
    level: 'individual' as OKRLevel,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    parentObjectiveId: '',
    status: 'draft' as OKRStatus,
    progress: 0,
    departmentId: '',
  });
  const [parentOKRs, setParentOKRs] = useState<OKR[]>([]);
  const [editingOKR, setEditingOKR] = useState<OKR | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  // Load OKRs and departments from backend API
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        setError(null);
        
        // Load OKRs and departments in parallel
        const [userOKRs, departmentsList] = await Promise.all([
          okrService.getOKRs(),
          departmentsService.getAll()
        ]);
        
        setOkrs(userOKRs);
        setDepartments(departmentsList);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser?.id]);

  // Load parent OKRs when dialog opens
  useEffect(() => {
    const loadModalData = async () => {
      if (openDialog) {
        try {
          // Load potential parent OKRs (company and department level)
          const allOKRs = await okrService.getOKRs();
          const potentialParents = allOKRs.filter(okr => 
            okr.level === 'company' || okr.level === 'department'
          );
          setParentOKRs(potentialParents);
        } catch (error) {
          console.error('Failed to load modal data:', error);
        }
      }
    };

    loadModalData();
  }, [openDialog]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, okrId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedOKR(okrId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOKR(null);
  };

  const handleEditOKR = (okrId: string) => {
    const okrToEdit = okrs.find(okr => okr.id === okrId);
    if (okrToEdit) {
      setEditingOKR(okrToEdit);
      setNewOKR({
        title: okrToEdit.title,
        description: okrToEdit.description,
        level: okrToEdit.level,
        startDate: okrToEdit.start_date.split('T')[0],
        endDate: okrToEdit.due_date.split('T')[0],
        parentObjectiveId: okrToEdit.parent_okr?.id || '',
        status: okrToEdit.status,
        progress: okrToEdit.progress,
        departmentId: '', // Will be populated from backend
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleOpenCreateDialog = () => {
    // Reset form to default values for creating new OKR
    setNewOKR({
      title: '',
      description: '',
      level: 'individual' as OKRLevel,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      parentObjectiveId: '',
      status: 'draft' as OKRStatus,
      progress: 0,
      departmentId: '',
    });
    setEditingOKR(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOKR(null);
    // Reset form to default values to prevent data leakage
    setNewOKR({
      title: '',
      description: '',
      level: 'individual' as OKRLevel,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      parentObjectiveId: '',
      status: 'draft' as OKRStatus,
      progress: 0,
      departmentId: '',
    });
  };

  const handleCreateOKR = async () => {
    if (!newOKR.title || !newOKR.description || !currentUser?.employeeId) return;

    try {
      setLoading(true);
      
      // Create OKR with backend API using the new comprehensive form data
      const okrData = {
        title: newOKR.title,
        description: newOKR.description,
        level: newOKR.level,
        employee: {
          id: currentUser.employeeId,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          role: currentUser.role || 'employee'
        },
        parent_okr: newOKR.parentObjectiveId ? { id: newOKR.parentObjectiveId } : undefined,
        target_value: 100,
        current_value: newOKR.progress,
        unit_of_measure: 'percentage',
        weight: 1,
        priority: 'medium' as OKRPriority,
        start_date: new Date(newOKR.startDate).toISOString(),
        due_date: new Date(newOKR.endDate).toISOString(),
        status: newOKR.status,
        progress: newOKR.progress,
        updates: [],
        tags: [],
        departmentId: newOKR.level === 'department' ? newOKR.departmentId : undefined,
      } as any;

      let resultOKR: OKR;
      
      if (editingOKR) {
        // Update existing OKR
        resultOKR = await okrService.updateOKR(editingOKR.id, okrData);
        // Update in local state
        setOkrs(prev => prev.map(okr => okr.id === editingOKR.id ? resultOKR : okr));
      } else {
        // Create new OKR
        resultOKR = await okrService.createOKR(okrData);
        // Add to local state
        setOkrs(prev => [resultOKR, ...prev]);
      }
      
      // Reset form
      setNewOKR({
        title: '',
        description: '',
        level: 'individual' as OKRLevel,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        parentObjectiveId: '',
        status: 'draft' as OKRStatus,
        progress: 0,
        departmentId: '',
      });
      setEditingOKR(null);
      setOpenDialog(false);
      setError(null);
    } catch (error) {
      console.error(`Failed to ${editingOKR ? 'update' : 'create'} OKR:`, error);
      setError(`Failed to ${editingOKR ? 'update' : 'create'} OKR. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOKR = async (okrId: string) => {
    if (!okrId) return;

    try {
      await okrService.deleteOKR(okrId);
      
      // Remove from local state
      setOkrs(prev => prev.filter(okr => okr.id !== okrId));
      
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete OKR:', error);
      setError('Failed to delete OKR. Please try again.');
    }
  };

  const handleUpdateProgress = async (okrId: string, progress: number) => {
    try {
      await okrService.updateOKRProgress(okrId, { progress });
      
      // Update local state
      setOkrs(prev => prev.map(okr => 
        okr.id === okrId ? { ...okr, progress } : okr
      ));
    } catch (error) {
      console.error('Failed to update OKR progress:', error);
      setError('Failed to update progress. Please try again.');
    }
  };

  const getStatusColor = (status: OKRStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const filteredOKRs = okrs.filter(okr => {
    if (filter === 'all') return true;
    return okr.status === filter;
  });

  if (loading && okrs.length === 0) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Modern Header with Gradient Background */}
          <Box sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderRadius: 4,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%), 
                          radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
              zIndex: 0,
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  mb: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}>
                  My OKRs
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  opacity: 0.8
                }}>
                  Track your objectives and key results with precision
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.5)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Create OKR
              </Button>
            </Box>
          </Box>

          {/* Error Alert with Modern Styling */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.2)}`,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                },
              }} 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Modern Filters with Enhanced Styling */}
          <Box sx={{ 
            mb: 4,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Filter by:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontWeight: 500 }}>Status</InputLabel>
              <Select
                value={filter}
                label="Status"
                onChange={(e) => setFilter(e.target.value as 'all' | OKRStatus)}
                sx={{
                  borderRadius: 3,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <SelectMenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'grey.400' }} />
                    All OKRs
                  </Box>
                </SelectMenuItem>
                <SelectMenuItem value="draft">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    Draft
                  </Box>
                </SelectMenuItem>
                <SelectMenuItem value="active">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    Active
                  </Box>
                </SelectMenuItem>
                <SelectMenuItem value="completed">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                    Completed
                  </Box>
                </SelectMenuItem>
                <SelectMenuItem value="cancelled">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                    Cancelled
                  </Box>
                </SelectMenuItem>
                <SelectMenuItem value="overdue">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.dark' }} />
                    Overdue
                  </Box>
                </SelectMenuItem>
              </Select>
            </FormControl>
            
            {/* Stats Summary */}
            <Box sx={{ 
              ml: 'auto',
              display: 'flex',
              gap: 3,
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {filteredOKRs.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filter === 'all' ? 'Total' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Typography>
              </Box>
              {filter === 'all' && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {Math.round(okrs.reduce((acc, okr) => acc + Number(okr.progress || 0), 0) / (okrs.length || 1))}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg Progress
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* OKRs Grid with Enhanced Cards */}
          {filteredOKRs.length === 0 ? (
            <Card sx={{ 
              textAlign: 'center', 
              py: 8,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.grey[100], 0.4)} 100%)`,
              border: `2px dashed ${alpha(theme.palette.grey[300], 0.5)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                zIndex: 0,
              }
            }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}>
                  <FlagIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                  No OKRs found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                  {filter === 'all' 
                    ? "You haven't created any OKRs yet. Start by creating your first objective and track your progress towards success!"
                    : `No OKRs with status "${filter}" found. Try adjusting your filter or create a new OKR.`
                  }
                </Typography>
                {filter === 'all' && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                    size="large"
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    Create Your First OKR
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredOKRs.map((okr) => (
                <Grid item xs={12} md={6} lg={4} key={okr.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        zIndex: 1,
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        '& .okr-progress-bar': {
                          transform: 'scaleX(1.02)',
                        },
                        '& .okr-menu-button': {
                          opacity: 1,
                          transform: 'scale(1)',
                        }
                      },
                    }}
                  >
                    <CardContent sx={{ flex: 1, p: 3 }}>
                      {/* Header with Status and Menu */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Chip
                          label={okr.status.charAt(0).toUpperCase() + okr.status.slice(1)}
                          color={getStatusColor(okr.status)}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            borderRadius: 2,
                            '& .MuiChip-label': {
                              px: 1.5,
                            }
                          }}
                        />
                        <IconButton
                          className="okr-menu-button"
                          size="small"
                          onClick={(e) => handleMenuClick(e, okr.id)}
                          sx={{
                            opacity: 0.7,
                            transform: 'scale(0.9)',
                            transition: 'all 0.3s ease',
                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                            }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      {/* Title and Description */}
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700, 
                        mb: 2,
                        color: 'text.primary',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {okr.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 3,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {okr.description}
                      </Typography>

                      {/* Progress Section */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Progress
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: okr.progress >= 100 ? 'success.main' : okr.progress >= 70 ? 'warning.main' : 'primary.main'
                          }}>
                            {okr.progress}%
                          </Typography>
                        </Box>
                        <Box sx={{ position: 'relative' }}>
                          <LinearProgress
                            className="okr-progress-bar"
                            variant="determinate"
                            value={okr.progress}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: alpha(theme.palette.grey[300], 0.3),
                              transition: 'transform 0.3s ease',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                background: okr.progress >= 100 
                                  ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                                  : okr.progress >= 70
                                  ? `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
                                  : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                              },
                            }}
                          />
                          {okr.progress > 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: `${Math.min(okr.progress, 95)}%`,
                                transform: 'translate(-50%, -50%)',
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'background.paper',
                                boxShadow: `0 0 0 2px ${okr.progress >= 100 ? theme.palette.success.main : okr.progress >= 70 ? theme.palette.warning.main : theme.palette.primary.main}`,
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Due Date and Level */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pt: 2,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}>
                        {okr.due_date && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimelineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Due: {new Date(okr.due_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        <Chip
                          label={okr.level}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            textTransform: 'capitalize',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            color: 'primary.main',
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Context Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                minWidth: 160,
                '& .MuiMenuItem-root': {
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateX(4px)',
                  }
                }
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => {
              if (selectedOKR) {
                handleEditOKR(selectedOKR);
              }
            }}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiSvgIcon-root': {
                  transform: 'scale(1.1)',
                }
              }
            }}>
              <EditIcon sx={{ mr: 1.5, fontSize: 18, transition: 'transform 0.2s ease' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Edit
              </Typography>
            </MenuItem>
            <MenuItem 
              onClick={() => {
                if (selectedOKR) {
                  handleDeleteOKR(selectedOKR);
                }
              }}
              sx={{ 
                color: 'error.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1)',
                  }
                }
              }}
            >
              <DeleteIcon sx={{ mr: 1.5, fontSize: 18, transition: 'transform 0.2s ease' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Delete
              </Typography>
            </MenuItem>
          </Menu>

          {/* Create OKR Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => {
              setOpenDialog(false);
              setEditingOKR(null);
              // Reset form to default values to prevent data leakage
              setNewOKR({
                title: '',
                description: '',
                level: 'individual' as OKRLevel,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                parentObjectiveId: '',
                status: 'draft' as OKRStatus,
                progress: 0,
                departmentId: '',
              });
            }}
            maxWidth="md" 
            fullWidth
            scroll="paper"
            PaperProps={{
              sx: {
                borderRadius: 4,
                boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
                maxHeight: '95vh',
                height: 'auto',
                overflow: 'hidden',
                margin: { xs: 1, sm: 2 },
                border: `2px solid transparent`,
                background: `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box,
                           linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%) border-box`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.01)} 100%)`,
                  borderRadius: 4,
                  zIndex: -1,
                },
              }
            }}
          >
            <DialogTitle sx={{ 
              p: 0,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.7)} 50%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
              borderRadius: '16px 16px 0 0',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 20% 80%, ${alpha('#ffffff', 0.3)} 0%, transparent 50%), 
                            radial-gradient(circle at 80% 20%, ${alpha('#ffffff', 0.4)} 0%, transparent 50%)`,
                zIndex: 0,
              }
            }}>
              <Box sx={{ 
                p: 4,
                display: 'flex', 
                alignItems: 'center', 
                gap: 3,
                color: 'white',
                position: 'relative',
                zIndex: 1
              }}>
                <Box sx={{
                  p: 2,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha('#ffffff', 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                }}>
                  <FlagIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800, 
                    mb: 0.5,
                    textShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}`,
                    letterSpacing: '-0.5px'
                  }}>
                    {editingOKR ? 'Edit OKR' : 'Create New OKR'}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    opacity: 0.95,
                    fontWeight: 400,
                    textShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.1)}`
                  }}>
                    {editingOKR ? 'Update your objective and key results' : 'Define your objective and key results'}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ 
              p: { xs: 2, sm: 4 },
              maxHeight: 'calc(95vh - 200px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(theme.palette.grey[300], 0.3),
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.primary.main, 0.3),
                borderRadius: '4px',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.5),
                },
              },
            }}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Basic Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Objective Title"
                    value={newOKR.title}
                    onChange={(e) => setNewOKR({ ...newOKR, title: e.target.value })}
                    placeholder="e.g., Increase customer satisfaction score to 4.5/5"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={newOKR.description}
                    onChange={(e) => setNewOKR({ ...newOKR, description: e.target.value })}
                    placeholder="Provide a detailed description of what you want to achieve and why it matters..."
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>

                {/* Configuration */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: 'text.primary' }}>
                    Configuration
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>OKR Level</InputLabel>
                    <Select
                      value={newOKR.level}
                      label="OKR Level"
                      onChange={(e) => setNewOKR({ ...newOKR, level: e.target.value as OKRLevel })}
                      sx={{ borderRadius: 2 }}
                    >
                      <SelectMenuItem value="individual">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                          Personal
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (Only you can see this)
                          </Typography>
                        </Box>
                      </SelectMenuItem>
                      {/* Department level - Only for HR and Managers (not Admin) */}
                      {(currentUser?.role === 'hr' || currentUser?.role === 'manager') && (
                        <SelectMenuItem value="department">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                            Department
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              (Visible to department members)
                            </Typography>
                          </Box>
                        </SelectMenuItem>
                      )}
                      {/* Organization level - Only for Admin and HR */}
                      {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
                        <SelectMenuItem value="company">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                            Organization
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              (Visible to everyone)
                            </Typography>
                          </Box>
                        </SelectMenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newOKR.status}
                      label="Status"
                      onChange={(e) => setNewOKR({ ...newOKR, status: e.target.value as OKRStatus })}
                      sx={{ borderRadius: 2 }}
                    >
                      <SelectMenuItem value="draft">
                        <Chip label="Draft" color="warning" size="small" sx={{ mr: 1 }} />
                        Draft
                      </SelectMenuItem>
                      <SelectMenuItem value="active">
                        <Chip label="Active" color="success" size="small" sx={{ mr: 1 }} />
                        Active
                      </SelectMenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Initial Progress"
                    type="number"
                    value={newOKR.progress}
                    onChange={(e) => setNewOKR({ ...newOKR, progress: Math.max(0, Math.min(100, Number(e.target.value))) })}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText="Progress percentage (0-100%)"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>

                {/* Timeline */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: 'text.primary' }}>
                    Timeline
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={newOKR.startDate}
                    onChange={(e) => setNewOKR({ ...newOKR, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={newOKR.endDate}
                    onChange={(e) => setNewOKR({ ...newOKR, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>

                {/* Optional Fields */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: 'text.primary' }}>
                    Optional Settings
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Parent OKR</InputLabel>
                    <Select
                      value={newOKR.parentObjectiveId}
                      label="Parent OKR"
                      onChange={(e) => setNewOKR({ ...newOKR, parentObjectiveId: e.target.value })}
                      sx={{ borderRadius: 2 }}
                    >
                      <SelectMenuItem value="">
                        <em>No Parent OKR</em>
                      </SelectMenuItem>
                      {parentOKRs.map((okr) => (
                        <SelectMenuItem key={okr.id} value={okr.id}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {okr.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {okr.level} • {okr.progress}% complete
                            </Typography>
                          </Box>
                        </SelectMenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.info.main, 0.1), 
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                  }}>
                    <Typography variant="body2" color="info.main" sx={{ fontWeight: 500, mb: 1 }}>
                      💡 Pro Tip
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Make your OKR specific, measurable, and time-bound. Link it to higher-level objectives when possible to ensure alignment.
                    </Typography>
                  </Box>
                </Grid>

                {/* Department Selection - Only show for department level OKRs */}
                {newOKR.level === 'department' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={newOKR.departmentId}
                        label="Department"
                        onChange={(e) => setNewOKR({ ...newOKR, departmentId: e.target.value })}
                        sx={{ borderRadius: 2 }}
                      >
                        {departments.map((dept) => (
                          <SelectMenuItem key={dept.id} value={dept.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BusinessIcon fontSize="small" color="action" />
                              {dept.name}
                            </Box>
                          </SelectMenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ 
              p: 4, 
              pt: 3,
              gap: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 50%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
              borderRadius: '0 0 16px 16px',
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 50% 100%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                zIndex: 0,
              }
            }}>
              <Button 
                onClick={handleCloseDialog}
                variant="outlined"
                size="large"
                sx={{ 
                  borderRadius: 4,
                  px: 5,
                  py: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: `2px solid ${alpha(theme.palette.grey[400], 0.3)}`,
                  color: theme.palette.text.secondary,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.grey[100], 0.4)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    border: `2px solid ${alpha(theme.palette.grey[400], 0.5)}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.grey[100], 0.9)} 0%, ${alpha(theme.palette.grey[200], 0.5)} 100%)`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 16px ${alpha(theme.palette.grey[400], 0.2)}`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleCreateOKR}
                disabled={!newOKR.title || !newOKR.description || loading}
                sx={{
                  borderRadius: 4,
                  px: 6,
                  py: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                  border: `2px solid ${alpha('#ffffff', 0.2)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 16px 50px ${alpha(theme.palette.primary.main, 0.5)}`,
                    transform: 'translateY(-3px) scale(1.02)',
                  },
                  '&:disabled': {
                    background: `linear-gradient(135deg, ${alpha(theme.palette.grey[400], 0.4)} 0%, ${alpha(theme.palette.grey[300], 0.3)} 100%)`,
                    color: alpha(theme.palette.text.disabled, 0.7),
                    boxShadow: 'none',
                    border: `2px solid ${alpha(theme.palette.grey[300], 0.2)}`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={20} color="inherit" />
                    <Typography variant="inherit" sx={{ fontWeight: 'inherit' }}>
                      {editingOKR ? 'Updating...' : 'Creating...'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {editingOKR ? <EditIcon sx={{ fontSize: 20 }} /> : <AddIcon sx={{ fontSize: 20 }} />}
                    <Typography variant="inherit" sx={{ fontWeight: 'inherit' }}>
                      {editingOKR ? 'Update OKR' : 'Create OKR'}
                    </Typography>
                  </Box>
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Layout>
  );
} 