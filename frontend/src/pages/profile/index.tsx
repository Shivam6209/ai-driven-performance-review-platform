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
  Chip,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { userService, UpdateProfileRequest, UpdatePasswordRequest, UserProfile } from '../../services/userService';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
        setError(null);

        // Fetch profile from API
        const profileData = await userService.getCurrentProfile();

        setProfile(profileData);
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          jobTitle: profileData.jobTitle || '',
          phoneNumber: profileData.phoneNumber || '',
          bio: profileData.bio || '',
        });
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile data. Please try again.');
        
        // Fallback to current user data if API fails
        if (currentUser) {
          const fallbackProfile: UserProfile = {
            id: currentUser.id,
            email: currentUser.email,
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            role: currentUser.role,
            isActive: currentUser.isActive,
            profileImageUrl: currentUser.profileImageUrl,
            departmentId: currentUser.departmentId,
            managerId: currentUser.managerId,
            userType: 'employee',
            jobTitle: '',
            phoneNumber: '',
            bio: '',
          };
          
          setProfile(fallbackProfile);
          setFormData({
            firstName: fallbackProfile.firstName,
            lastName: fallbackProfile.lastName,
            email: fallbackProfile.email,
            jobTitle: fallbackProfile.jobTitle || '',
            phoneNumber: fallbackProfile.phoneNumber || '',
            bio: fallbackProfile.bio || '',
          });
        }
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
    if (!currentUser || !profile) return;

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

      // Update profile via API
      const updatedProfile = await userService.updateProfile(profile.id, updateData);

      setProfile(updatedProfile);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
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
      // Update password via API
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
      setError(err.message || 'Failed to update password. Please check your current password and try again.');
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
        <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading your profile...
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <Container sx={{ py: 4 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }>
            Failed to load profile data. Please refresh the page or try again later.
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            My Profile
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 3,
                    fontSize: '3rem',
                    bgcolor: 'primary.main'
                  }}
                  alt={`${formData.firstName} ${formData.lastName}`}
                  src={profile.profileImageUrl || ''}
                >
                  {`${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`}
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                  {`${formData.firstName} ${formData.lastName}`}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  {formData.jobTitle || 'User'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  {formData.email}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                  <Chip 
                    label={profile.role.replace('_', ' ').toUpperCase()} 
                    color="primary" 
                    size="small"
                    variant="outlined"
                  />
                  
                  {profile.userType && (
                    <Chip 
                      label={`Account: ${profile.userType}`} 
                      color="secondary" 
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {formData.bio && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                      "{formData.bio}"
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Settings Card */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="Account Settings" 
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              />
              <Divider />
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab label="Personal Information" />
                  <Tab label="Change Password" />
                </Tabs>
              </Box>

              {success && (
                <Box sx={{ p: 3 }}>
                  <Alert severity="success">{success}</Alert>
                </Box>
              )}

              {error && (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              )}

              <CardContent>
                {/* Personal Information Tab */}
                <TabPanel value={tabValue} index={0}>
                  <Box component="form" onSubmit={handleProfileSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleProfileChange}
                          required
                          variant="outlined"
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
                          variant="outlined"
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
                          variant="outlined"
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
                          variant="outlined"
                          helperText="Your role or position in the organization"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleProfileChange}
                          variant="outlined"
                          helperText="Your contact number (optional)"
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
                          rows={4}
                          variant="outlined"
                          placeholder="Tell us about yourself, your interests, and your professional background..."
                          helperText="A brief description about yourself (optional)"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isLoading}
                          size="large"
                          sx={{ minWidth: 140, py: 1.5 }}
                        >
                          {isLoading ? (
                            <>
                              <CircularProgress size={20} sx={{ mr: 1 }} />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </TabPanel>

                {/* Change Password Tab */}
                <TabPanel value={tabValue} index={1}>
                  <Box component="form" onSubmit={handlePasswordSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          variant="outlined"
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
                          variant="outlined"
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
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isLoading}
                          size="large"
                          sx={{ minWidth: 140, py: 1.5 }}
                        >
                          {isLoading ? (
                            <>
                              <CircularProgress size={20} sx={{ mr: 1 }} />
                              Updating...
                            </>
                          ) : (
                            'Update Password'
                          )}
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