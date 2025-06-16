import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Tooltip,
  Badge,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assessment as AnalyticsIcon,
  Schedule as CycleIcon,
  Description as TemplateIcon,
  AutoAwesome as AIIcon,
  Psychology as BrainIcon,
  CheckCircle as ApproveIcon,
  Send as SubmitIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { reviewsService } from '@/services/reviewsService';
import { UserRole } from '@/types';

interface PerformanceReview {
  id: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewCycle: {
    id: string;
    name: string;
  };
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'ai_generated';
  reviewType: 'self' | 'peer' | 'manager' | 'upward' | '360';
  overallRating?: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  // AI-specific fields
  isAiGenerated?: boolean;
  aiConfidenceScore?: number;
  aiGeneratedAt?: string;
  humanEdited?: boolean;
  humanEditedAt?: string;
  strengths?: string;
  areasForImprovement?: string;
  achievements?: string;
  goalsForNextPeriod?: string;
  developmentPlan?: string;
}

interface ReviewCycle {
  id: string;
  name: string;
  description?: string;
  cycleType: 'quarterly' | 'biannual' | 'annual' | 'custom';
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: string;
  endDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewTemplate {
  id: string;
  name: string;
  description?: string;
  reviewType: 'self' | 'peer' | 'manager' | 'upward' | '360';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AIGenerationDialog {
  open: boolean;
  employeeId: string;
  reviewCycleId: string;
  reviewType: 'self' | 'manager' | 'peer' | '360' | 'upward';
  loading: boolean;
}

export default function ReviewsPage(): JSX.Element {
  const [currentTab, setCurrentTab] = useState(0);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [aiGenerationDialog, setAiGenerationDialog] = useState<AIGenerationDialog>({
    open: false,
    employeeId: '',
    reviewCycleId: '',
    reviewType: 'manager',
    loading: false,
  });
  
  // Form data
  const [formData, setFormData] = useState<any>({});

  // Load data based on current tab
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      switch (currentTab) {
        case 0: // Reviews
          const reviewsData = await reviewsService.getAllPerformanceReviews({
            page: page + 1,
            limit: rowsPerPage,
          });
          setReviews(reviewsData);
          break;
        case 1: // Cycles
          const cyclesData = await reviewsService.getAllReviewCycles();
          setCycles(cyclesData);
          break;
        case 2: // Templates
          const templatesData = await reviewsService.getAllReviewTemplates();
          setTemplates(templatesData);
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTab, page, rowsPerPage]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPage(0); // Reset pagination
  };

  // Handle menu actions
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  // Handle AI generation
  const handleGenerateAI = () => {
    if (selectedItem) {
      setAiGenerationDialog({
        open: true,
        employeeId: selectedItem.employee?.id || '',
        reviewCycleId: selectedItem.reviewCycle?.id || '',
        reviewType: selectedItem.reviewType || 'manager',
        loading: false,
      });
    }
    handleMenuClose();
  };

  const handleAIGeneration = async () => {
    try {
      setAiGenerationDialog(prev => ({ ...prev, loading: true }));
      
      const result = await reviewsService.generateAIReview({
        employeeId: aiGenerationDialog.employeeId,
        reviewCycleId: aiGenerationDialog.reviewCycleId,
        reviewType: aiGenerationDialog.reviewType,
      });

      setSuccess('AI review generated successfully!');
      setAiGenerationDialog({ open: false, employeeId: '', reviewCycleId: '', reviewType: 'manager', loading: false });
      loadData(); // Refresh the data
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI review');
      setAiGenerationDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle review actions
  const handleSubmitReview = async (reviewId: string) => {
    try {
      await reviewsService.submitReview(reviewId);
      setSuccess('Review submitted successfully!');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await reviewsService.approveReview(reviewId);
      setSuccess('Review approved successfully!');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve review');
    }
  };

  // Handle create
  const handleCreate = () => {
    setFormData({});
    setCreateDialogOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    setFormData(selectedItem);
    setCreateDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedItem) {
      window.location.href = `/reviews/${selectedItem.id}`;
    }
    handleMenuClose();
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (formData.id) {
        // Update existing item
        switch (currentTab) {
          case 0:
            await reviewsService.updatePerformanceReview(formData.id, formData);
            break;
          case 1:
            await reviewsService.updateReviewCycle(formData.id, formData);
            break;
          case 2:
            await reviewsService.updateReviewTemplate(formData.id, formData);
            break;
        }
        setSuccess('Item updated successfully!');
      } else {
        // Create new item
        switch (currentTab) {
          case 0:
            await reviewsService.createPerformanceReview(formData);
            break;
          case 1:
            await reviewsService.createReviewCycle(formData);
            break;
          case 2:
            await reviewsService.createReviewTemplate(formData);
            break;
        }
        setSuccess('Item created successfully!');
      }
      
      setCreateDialogOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      
      switch (currentTab) {
        case 0:
          await reviewsService.deletePerformanceReview(selectedItem.id);
          break;
        case 1:
          await reviewsService.deleteReviewCycle(selectedItem.id);
          break;
        case 2:
          await reviewsService.deleteReviewTemplate(selectedItem.id);
          break;
      }
      
      setSuccess('Item deleted successfully!');
      setDeleteDialogOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'draft': return 'default';
      case 'in_progress': return 'info';
      case 'submitted': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'ai_generated': return 'secondary';
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getAIConfidenceColor = (score?: number): 'success' | 'warning' | 'error' => {
    if (!score) return 'error';
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const renderReviewsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Reviewer</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>AI Status</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {review.employee.firstName} {review.employee.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {review.employee.email}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                {review.reviewer ? (
                  <Box>
                    <Typography variant="body2">
                      {review.reviewer.firstName} {review.reviewer.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {review.reviewer.email}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No reviewer assigned
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip 
                  label={review.reviewType.toUpperCase()} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={review.status.replace('_', ' ').toUpperCase()} 
                  color={getStatusColor(review.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  {review.isAiGenerated && (
                    <Tooltip title={`AI Confidence: ${((review.aiConfidenceScore || 0) * 100).toFixed(1)}%`}>
                      <Chip
                        icon={<BrainIcon />}
                        label="AI"
                        size="small"
                        color={getAIConfidenceColor(review.aiConfidenceScore)}
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                  {review.humanEdited && (
                    <Tooltip title="Human Edited">
                      <Chip
                        icon={<EditIcon />}
                        label="Edited"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : 'No due date'}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  {review.status === 'draft' && (
                    <Tooltip title="Generate AI Review">
                      <IconButton 
                        size="small" 
                        color="secondary"
                        onClick={() => {
                          setSelectedItem(review);
                          handleGenerateAI();
                        }}
                      >
                        <AIIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {(review.status === 'ai_generated' || review.status === 'in_progress') && (
                    <Tooltip title="Submit Review">
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => handleSubmitReview(review.id)}
                      >
                        <SubmitIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {review.status === 'submitted' && (
                    <Tooltip title="Approve Review">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleApproveReview(review.id)}
                      >
                        <ApproveIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, review)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={reviews.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </TableContainer>
  );

  const renderCyclesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cycles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cycle) => (
            <TableRow key={cycle.id}>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {cycle.name}
                  </Typography>
                  {cycle.description && (
                    <Typography variant="caption" color="text.secondary">
                      {cycle.description}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={cycle.cycleType.toUpperCase()} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={cycle.status.toUpperCase()} 
                  color={getStatusColor(cycle.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(cycle.startDate).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(cycle.endDate).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(cycle.dueDate).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, cycle)}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={cycles.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </TableContainer>
  );

  const renderTemplatesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Review Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((template) => (
            <TableRow key={template.id}>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {template.name}
                  </Typography>
                  {template.description && (
                    <Typography variant="caption" color="text.secondary">
                      {template.description}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={template.reviewType.toUpperCase()} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={template.isActive ? 'ACTIVE' : 'INACTIVE'} 
                  color={template.isActive ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(template.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, template)}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={templates.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </TableContainer>
  );

  const renderAnalyticsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Reviews
                </Typography>
                <Typography variant="h4">
                  {reviews.length}
                </Typography>
              </Box>
              <AnalyticsIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  AI Generated
                </Typography>
                <Typography variant="h4">
                  {reviews.filter(r => r.isAiGenerated).length}
                </Typography>
              </Box>
              <BrainIcon color="secondary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4">
                  {reviews.filter(r => r.status === 'approved').length}
                </Typography>
              </Box>
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Active Cycles
                </Typography>
                <Typography variant="h4">
                  {cycles.filter(c => c.status === 'active').length}
                </Typography>
              </Box>
              <CycleIcon color="info" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE]}>
      <Layout>
        <Container maxWidth="xl">
          <Box sx={{ py: 4 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Performance Reviews
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{ borderRadius: 2 }}
              >
                Create New
              </Button>
            </Box>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            {/* Analytics Cards */}
            {renderAnalyticsCards()}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab 
                  icon={<AnalyticsIcon />} 
                  label="Reviews" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<CycleIcon />} 
                  label="Cycles" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<TemplateIcon />} 
                  label="Templates" 
                  iconPosition="start"
                />
              </Tabs>
            </Paper>

            {/* Loading */}
            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Content */}
            <Box>
              {currentTab === 0 && renderReviewsTable()}
              {currentTab === 1 && renderCyclesTable()}
              {currentTab === 2 && renderTemplatesTable()}
            </Box>

            {/* Action Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleView}>
                <ViewIcon sx={{ mr: 1 }} />
                View
              </MenuItem>
              <MenuItem onClick={handleEdit}>
                <EditIcon sx={{ mr: 1 }} />
                Edit
              </MenuItem>
              {currentTab === 0 && selectedItem?.status === 'draft' && (
                <MenuItem onClick={handleGenerateAI}>
                  <AIIcon sx={{ mr: 1 }} />
                  Generate AI Review
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </Menu>

            {/* AI Generation Dialog */}
            <Dialog 
              open={aiGenerationDialog.open} 
              onClose={() => !aiGenerationDialog.loading && setAiGenerationDialog(prev => ({ ...prev, open: false }))}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                <Box display="flex" alignItems="center">
                  <BrainIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  Generate AI Review
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2 }}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    AI will analyze the employee's OKRs, feedback, and performance data to generate a comprehensive review.
                  </Alert>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Review Type</InputLabel>
                    <Select
                      value={aiGenerationDialog.reviewType}
                      onChange={(e) => setAiGenerationDialog(prev => ({ 
                        ...prev, 
                        reviewType: e.target.value as any 
                      }))}
                      disabled={aiGenerationDialog.loading}
                    >
                      <MenuItem value="manager">Manager Review</MenuItem>
                      <MenuItem value="self">Self Assessment</MenuItem>
                      <MenuItem value="peer">Peer Review</MenuItem>
                      <MenuItem value="360">360 Review</MenuItem>
                      <MenuItem value="upward">Upward Review</MenuItem>
                    </Select>
                  </FormControl>

                  {aiGenerationDialog.loading && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Generating AI review... This may take a few moments.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setAiGenerationDialog(prev => ({ ...prev, open: false }))}
                  disabled={aiGenerationDialog.loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAIGeneration}
                  variant="contained"
                  disabled={aiGenerationDialog.loading}
                  startIcon={<BrainIcon />}
                >
                  {aiGenerationDialog.loading ? 'Generating...' : 'Generate AI Review'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to delete this item? This action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button onClick={confirmDelete} color="error" variant="contained">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Container>
      </Layout>
    </ProtectedRoute>
  );
} 