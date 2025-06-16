import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  alpha,
  Stack,
  Divider,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { invitationsService, Invitation, CreateInvitationRequest } from '@/services/invitations.service';
import { useRouter } from 'next/router';

interface InvitationFormData {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  permissions: string[];
}

const InvitationsPage: React.FC = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<InvitationFormData>({
    email: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    role: 'employee',
    permissions: []
  });

  const availablePermissions = ['CREATE', 'READ', 'WRITE', 'DELETE'];
  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'hr', label: 'HR' }
  ];

  // Check if user has permission to manage invitations
  useEffect(() => {
    if (currentUser && !['admin', 'hr'].includes(currentUser.role)) {
      router.push('/unauthorized');
      return;
    }
  }, [currentUser, router]);

  // Load invitations
  useEffect(() => {
    if (currentUser && ['admin', 'hr'].includes(currentUser.role)) {
      loadInvitations();
    }
  }, [currentUser]);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const data = await invitationsService.getInvitations();
      setInvitations(data);
    } catch (err: any) {
      setError('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value
    }));
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.organizationId) {
      setError('Organization ID not found. Please contact support.');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      const invitationData = {
        ...formData,
        organizationId: currentUser.organizationId
      };

      await invitationsService.createInvitation(invitationData);
      setSuccess(`Invitation sent to ${formData.email} with temporary credentials`);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        jobTitle: '',
        role: 'employee',
        permissions: []
      });
      setShowCreateForm(false);
      await loadInvitations();
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      await invitationsService.resendInvitation(invitationId);
      setSuccess(`Invitation resent to ${email} with new credentials`);
      await loadInvitations();
    } catch (err: any) {
      setError('Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Are you sure you want to cancel the invitation for ${email}?`)) {
      return;
    }

    try {
      await invitationsService.cancelInvitation(invitationId);
      setSuccess(`Invitation cancelled for ${email}`);
      await loadInvitations();
    } catch (err: any) {
      setError('Failed to cancel invitation');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Chip
            icon={<PendingIcon />}
            label="Pending"
            color="warning"
            size="small"
            sx={{ borderRadius: 2 }}
          />
        );
      case 'accepted':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Accepted"
            color="success"
            size="small"
            sx={{ borderRadius: 2 }}
          />
        );
      case 'expired':
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Expired"
            color="error"
            size="small"
            sx={{ borderRadius: 2 }}
          />
        );
      default:
        return (
          <Chip
            label="Unknown"
            color="default"
            size="small"
            sx={{ borderRadius: 2 }}
          />
        );
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!currentUser || !['admin', 'hr'].includes(currentUser.role)) {
    return null;
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Modern Header matching dashboard theme */}
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
                  Invitation Management
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  opacity: 0.8
                }}>
                  Send invitations with temporary credentials via email
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowCreateForm(true)}
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
                Send Invitation
              </Button>
            </Box>
          </Box>

          {/* Invitations Table */}
          <Card sx={{ borderRadius: 3, boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}` }}>
            <CardContent sx={{ p: 0 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Sent Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invitations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                              No invitations found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Send your first invitation to get started
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        invitations.map((invitation) => (
                          <TableRow key={invitation.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                            <TableCell>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {invitation.firstName} {invitation.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {invitation.jobTitle}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {invitation.email}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={formatRole(invitation.role)}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ borderRadius: 2 }}
                              />
                            </TableCell>
                            <TableCell>
                              {getStatusChip(invitation.status)}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(invitation.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                {invitation.status === 'pending' && (
                                  <>
                                    <IconButton
                                      onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                                      color="primary"
                                      size="small"
                                      sx={{ borderRadius: 2 }}
                                    >
                                      <RefreshIcon />
                                    </IconButton>
                                    <IconButton
                                      onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                                      color="error"
                                      size="small"
                                      sx={{ borderRadius: 2 }}
                                    >
                                      <CancelIcon />
                                    </IconButton>
                                  </>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Create Invitation Dialog */}
        <Dialog
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            fontWeight: 700,
            fontSize: '1.5rem'
          }}>
            Send New Invitation
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <form onSubmit={handleCreateInvitation}>
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Role Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Role & Position
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={handleRoleChange}
                      label="Role"
                    >
                      {roleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button 
              onClick={() => setShowCreateForm(false)} 
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvitation}
              variant="contained"
              startIcon={isCreating ? <CircularProgress size={16} /> : <SendIcon />}
              disabled={isCreating}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {isCreating ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbars */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: 2 }}>
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default InvitationsPage; 