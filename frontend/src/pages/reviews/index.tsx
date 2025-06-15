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
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  reviewType: 'self' | 'peer' | 'manager' | 'upward' | '360';
  overallRating?: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
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

export default function ReviewsPage(): JSX.Element {
  const [currentTab, setCurrentTab] = useState(0);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  
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
      switch (currentTab) {
        case 0: // Reviews
          if (formData.id) {
            await reviewsService.updatePerformanceReview(formData.id, formData);
          } else {
            await reviewsService.createPerformanceReview(formData);
          }
          break;
        case 1: // Cycles
          if (formData.id) {
            await reviewsService.updateReviewCycle(formData.id, formData);
          } else {
            await reviewsService.createReviewCycle(formData);
          }
          break;
        case 2: // Templates
          if (formData.id) {
            await reviewsService.updateReviewTemplate(formData.id, formData);
          } else {
            await reviewsService.createReviewTemplate(formData);
          }
          break;
      }
      
      setCreateDialogOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    }
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    try {
      switch (currentTab) {
        case 0: // Reviews
          await reviewsService.deletePerformanceReview(selectedItem.id);
          break;
        // Note: Cycles and Templates don't have delete endpoints in the controller
      }
      
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    }
  };

  // Get status color
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'active':
        return 'success';
      case 'submitted':
      case 'in_progress':
        return 'primary';
      case 'draft':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'archived':
        return 'default';
      default:
        return 'info';
    }
  };

  // Render reviews table
  const renderReviewsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Reviewer</TableCell>
            <TableCell>Review Cycle</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center">Loading...</TableCell>
            </TableRow>
          ) : reviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">No reviews found</TableCell>
            </TableRow>
          ) : (
            reviews.map((review) => (
              <TableRow key={review.id} hover>
                <TableCell>
                  {review.employee.firstName} {review.employee.lastName}
                </TableCell>
                <TableCell>
                  {review.reviewer ? 
                    `${review.reviewer.firstName} ${review.reviewer.lastName}` : 
                    'Not assigned'
                  }
                </TableCell>
                <TableCell>{review.reviewCycle.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={review.reviewType} 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={review.status} 
                    color={getStatusColor(review.status) as any}
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : 'No due date'}
                </TableCell>
                <TableCell>
                  {review.overallRating ? `${review.overallRating}/5` : 'Not rated'}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuClick(e, review)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={reviews.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </TableContainer>
  );

  // Render cycles table
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
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center">Loading...</TableCell>
            </TableRow>
          ) : cycles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">No cycles found</TableCell>
            </TableRow>
          ) : (
            cycles.map((cycle) => (
              <TableRow key={cycle.id} hover>
                <TableCell>{cycle.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={cycle.cycleType} 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={cycle.status} 
                    color={getStatusColor(cycle.status) as any}
                    size="small" 
                  />
                </TableCell>
                <TableCell>{new Date(cycle.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(cycle.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(cycle.dueDate).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuClick(e, cycle)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render templates table
  const renderTemplatesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Review Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">Loading...</TableCell>
            </TableRow>
          ) : templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">No templates found</TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TableRow key={template.id} hover>
                <TableCell>{template.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={template.reviewType} 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={template.isActive ? 'Active' : 'Inactive'} 
                    color={template.isActive ? 'success' : 'default'}
                    size="small" 
                  />
                </TableCell>
                <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuClick(e, template)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <ProtectedRoute requiredRoles={['hr_admin', 'manager', 'employee'] as UserRole[]}>
      <Layout>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" component="h1">
                Performance Reviews Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
              >
                Create New
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab icon={<ViewIcon />} label="Reviews" />
                <Tab icon={<CycleIcon />} label="Review Cycles" />
                <Tab icon={<TemplateIcon />} label="Templates" />
              </Tabs>
            </Paper>

            {/* Content based on current tab */}
            {currentTab === 0 && renderReviewsTable()}
            {currentTab === 1 && renderCyclesTable()}
            {currentTab === 2 && renderTemplatesTable()}

            {/* Action Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleView}>
                <ViewIcon sx={{ mr: 1 }} />
                View Details
              </MenuItem>
              <MenuItem onClick={handleEdit}>
                <EditIcon sx={{ mr: 1 }} />
                Edit
              </MenuItem>
              {currentTab === 0 && (
                <MenuItem onClick={handleDelete}>
                  <DeleteIcon sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              )}
            </Menu>

            {/* Create/Edit Dialog */}
            <Dialog 
              open={createDialogOpen} 
              onClose={() => setCreateDialogOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>
                {formData.id ? 'Edit' : 'Create'} {
                  currentTab === 0 ? 'Review' : 
                  currentTab === 1 ? 'Review Cycle' : 
                  'Template'
                }
              </DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </Grid>
                    {currentTab === 1 && (
                      <>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                  {formData.id ? 'Update' : 'Create'}
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