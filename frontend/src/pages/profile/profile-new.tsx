import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { userService, UpdateProfileRequest, UpdatePasswordRequest } from '../../services/userService';
import Layout from '../../components/layout/Layout';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    phoneNumber: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoadingProfile(true);
        const profile = await userService.getCurrentProfile();
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          jobTitle: profile.jobTitle || '',
          phoneNumber: profile.phoneNumber || '',
          bio: profile.bio || '',
        });
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const updateData: UpdateProfileRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        jobTitle: formData.jobTitle,
        phoneNumber: formData.phoneNumber || undefined,
        bio: formData.bio || undefined,
      };

      await userService.updateProfile(currentUser.id, updateData);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const updateData: UpdatePasswordRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };

      await userService.updatePassword(updateData);
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <Container sx={{ py: 4 }}>
          <Alert severity="warning">Please log in to view your profile.</Alert>
        </Container>
      </Layout>
    );
  }

  if (isLoadingProfile) {
    return (
      <Layout>
        <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 100, height: 100, mb: 2 }}
                  alt={`${formData.firstName} ${formData.lastName}`}
                  src={currentUser.profileImageUrl || ''}
                />
                <Typography variant="h6">{`${formData.firstName} ${formData.lastName}`}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.jobTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {formData.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Account Settings" />
              <Divider />
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab label="Personal Information" />
                  <Tab label="Change Password" />
                </Tabs>
              </Box>

              {success && (
                <Box sx={{ p: 2 }}>
                  <Alert severity="success">{success}</Alert>
                </Box>
              )}

              {error && (
                <Box sx={{ p: 2 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              )}

              <CardContent>
                <TabPanel value={tabValue} index={0}>
                  <Box component="form" onSubmit={handleProfileSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleProfileChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleProfileChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          value={formData.email}
                          onChange={handleProfileChange}
                          disabled
                          helperText="Email cannot be changed"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Job Title"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleProfileChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleProfileChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleProfileChange}
                          multiline
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isLoading}
                          sx={{ minWidth: 120 }}
                        >
                          {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Box component="form" onSubmit={handlePasswordSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="New Password"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          helperText="Password must be at least 8 characters long"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isLoading}
                          sx={{ minWidth: 120 }}
                        >
                          {isLoading ? <CircularProgress size={24} /> : 'Update Password'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default ProfilePage; 