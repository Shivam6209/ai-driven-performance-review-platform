import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Tabs,
  Tab,
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
  MenuItem as SelectMenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { feedbackService } from '@/services/feedback.service';
import { employeeService } from '@/services/employeeService';

// Mock feedback data
const mockFeedback = [
  {
    id: '1',
    content: 'Great work on the project presentation! Your attention to detail and clear communication really stood out.',
    giverName: 'John Smith',
    receiverName: 'Jane Doe',
    feedbackType: 'appreciation',
    visibility: 'public',
    createdAt: '2024-01-15T10:30:00Z',
    isRead: true,
  },
  {
    id: '2',
    content: 'I think there\'s room for improvement in time management. Consider using project management tools to track deadlines better.',
    giverName: 'Sarah Johnson',
    receiverName: 'Mike Wilson',
    feedbackType: 'constructive',
    visibility: 'private',
    createdAt: '2024-01-14T14:20:00Z',
    isRead: false,
  },
  {
    id: '3',
    content: 'Your leadership during the team meeting was excellent. You facilitated great discussions and kept everyone engaged.',
    giverName: 'Alex Brown',
    receiverName: 'Lisa Chen',
    feedbackType: 'appreciation',
    visibility: 'manager_only',
    createdAt: '2024-01-13T09:15:00Z',
    isRead: true,
  },
];



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
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function FeedbackPage(): JSX.Element {
  const [tabValue, setTabValue] = useState(0);
  const [feedback] = useState(mockFeedback);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    receiver: '',
    content: '',
    feedbackType: 'general',
    visibility: 'private',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch employees when dialog opens
  useEffect(() => {
    if (dialogOpen && employees.length === 0) {
      fetchEmployees();
    }
  }, [dialogOpen]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const employeeData = await employeeService.getAllEmployees();
      setEmployees(employeeData);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, feedbackItem: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedFeedback(feedbackItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFeedback(null);
  };

  const handleCreateFeedback = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setError(null);
    setSuccess(null);
    setNewFeedback({
      receiver: '',
      content: '',
      feedbackType: 'general',
      visibility: 'private',
    });
  };

  const handleSubmitFeedback = async () => {
    if (!newFeedback.receiver || !newFeedback.content) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create feedback data matching the backend DTO
      const feedbackData = {
        content: newFeedback.content,
        receiver_id: newFeedback.receiver, // This should be an employee ID, not name
        feedback_type: newFeedback.feedbackType,
        visibility: newFeedback.visibility,
        tag_ids: [], // Add tags if needed
      };

      await feedbackService.createFeedback(feedbackData);
      
      setSuccess('Feedback sent successfully!');
      handleDialogClose();
      
      // Refresh feedback data
      // You might want to add a function to reload feedback here
      
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'appreciation':
        return 'success';
      case 'constructive':
        return 'warning';
      case 'goal_related':
        return 'primary';
      case 'project_related':
        return 'info';
      default:
        return 'default';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'success';
      case 'private':
        return 'default';
      case 'manager_only':
        return 'warning';
      case 'hr_only':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFeedbackType = (type: string): string => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatVisibility = (visibility: string): string => {
    return visibility.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const receivedFeedback = feedback.filter(f => f.receiverName === 'Current User'); // Mock current user
  const givenFeedback = feedback.filter(f => f.giverName === 'Current User'); // Mock current user
  const allFeedback = feedback; // For demo purposes

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" component="h1">
                Feedback
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateFeedback}
              >
                Give Feedback
              </Button>
            </Box>

            <Paper sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="feedback tabs">
                  <Tab label="Received" />
                  <Tab label="Given" />
                  <Tab label="All Feedback" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <List>
                  {receivedFeedback.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary="No feedback received yet"
                        secondary="Feedback from colleagues will appear here"
                      />
                    </ListItem>
                  ) : (
                    receivedFeedback.map((item) => (
                      <ListItem
                        key={item.id}
                        secondaryAction={
                          <IconButton onClick={(e) => handleMenuClick(e, item)}>
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="subtitle2">
                                From: {item.giverName}
                              </Typography>
                              <Chip
                                label={formatFeedbackType(item.feedbackType)}
                                color={getFeedbackTypeColor(item.feedbackType) as any}
                                size="small"
                              />
                              <Chip
                                label={formatVisibility(item.visibility)}
                                color={getVisibilityColor(item.visibility) as any}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {item.content}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <List>
                  {givenFeedback.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary="No feedback given yet"
                        secondary="Feedback you've given to colleagues will appear here"
                      />
                    </ListItem>
                  ) : (
                    givenFeedback.map((item) => (
                      <ListItem key={item.id}>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="subtitle2">
                                To: {item.receiverName}
                              </Typography>
                              <Chip
                                label={formatFeedbackType(item.feedbackType)}
                                color={getFeedbackTypeColor(item.feedbackType) as any}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {item.content}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <List>
                  {allFeedback.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="subtitle2">
                              {item.giverName} → {item.receiverName}
                            </Typography>
                            <Chip
                              label={formatFeedbackType(item.feedbackType)}
                              color={getFeedbackTypeColor(item.feedbackType) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {item.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
            </Paper>
          </Box>
        </Container>

        {/* Action Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}>
            Mark as Read
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            Reply
          </MenuItem>
        </Menu>

        {/* Create Feedback Dialog */}
        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>Give Feedback</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Recipient</InputLabel>
                <Select
                  value={newFeedback.receiver}
                  onChange={(e) => setNewFeedback({ ...newFeedback, receiver: e.target.value })}
                  label="Recipient"
                >
                  {loadingEmployees ? (
                    <SelectMenuItem disabled>
                      <CircularProgress size={20} /> Loading employees...
                    </SelectMenuItem>
                  ) : (
                    employees.map((employee: any) => (
                      <SelectMenuItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.email})
                      </SelectMenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Feedback Type</InputLabel>
                <Select
                  value={newFeedback.feedbackType}
                  onChange={(e) => setNewFeedback({ ...newFeedback, feedbackType: e.target.value })}
                  label="Feedback Type"
                >
                  <SelectMenuItem value="general">General</SelectMenuItem>
                  <SelectMenuItem value="appreciation">Appreciation</SelectMenuItem>
                  <SelectMenuItem value="constructive">Constructive</SelectMenuItem>
                  <SelectMenuItem value="goal_related">Goal Related</SelectMenuItem>
                  <SelectMenuItem value="project_related">Project Related</SelectMenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={newFeedback.visibility}
                  onChange={(e) => setNewFeedback({ ...newFeedback, visibility: e.target.value })}
                  label="Visibility"
                >
                  <SelectMenuItem value="private">Private</SelectMenuItem>
                  <SelectMenuItem value="public">Public</SelectMenuItem>
                  <SelectMenuItem value="manager_only">Manager Only</SelectMenuItem>
                  <SelectMenuItem value="hr_only">HR Only</SelectMenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Feedback"
                value={newFeedback.content}
                onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
                multiline
                rows={4}
                placeholder="Write your feedback here..."
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
            <Button
              onClick={handleSubmitFeedback}
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              disabled={!newFeedback.receiver || !newFeedback.content || loading}
            >
              {loading ? 'Sending...' : 'Send Feedback'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 