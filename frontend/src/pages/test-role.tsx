import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { userProfileService } from '../services/user-profile.service';

export default function TestRolePage(): JSX.Element {
  const { currentUser, loading } = useAuth();
  const [profileData, setProfileData] = React.useState<any>(null);
  const [error, setError] = React.useState<string>('');

  const fetchProfile = async () => {
    if (!currentUser) return;
    
    try {
      const profile = await userProfileService.getUserProfile(currentUser.id);
      setProfileData(profile);
    } catch (err: any) {
      setError(err.message);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="warning">
            Please log in to test the role system.
          </Alert>
        </Box>
      </Container>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'hr': return 'error';
      case 'executive': return 'secondary';
      case 'manager': return 'warning';
      case 'employee': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'hr': return 'HR Admin';
      case 'executive': return 'Executive';
      case 'manager': return 'Manager';
      case 'employee': return 'Employee';
      default: return role;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Role System Test
        </Typography>

        <Stack spacing={3}>
          {/* Current User Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current User (from AuthContext)
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Name:
                  </Typography>
                  <Typography variant="body1">
                    {currentUser.firstName} {currentUser.lastName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email:
                  </Typography>
                  <Typography variant="body1">
                    {currentUser.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Role:
                  </Typography>
                  <Chip
                    label={getRoleLabel(currentUser.role)}
                    color={getRoleColor(currentUser.role) as any}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    User ID:
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {currentUser.id}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Firestore Profile Data */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Firestore Profile Data
              </Typography>
              <Button onClick={fetchProfile} variant="outlined" size="small" sx={{ mb: 2 }}>
                Refresh Profile
              </Button>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Error: {error}
                </Alert>
              )}
              
              {profileData ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Profile Role:
                    </Typography>
                    <Chip
                      label={getRoleLabel(profileData.role)}
                      color={getRoleColor(profileData.role) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created At:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(profileData.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Updated At:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(profileData.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Raw Profile Data:
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        backgroundColor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        maxHeight: 200,
                      }}
                    >
                      {JSON.stringify(profileData, null, 2)}
                    </Box>
                  </Box>
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No profile data found in Firestore
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Role-Based Access Test */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role-Based Access Test
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Employee Access:
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    ✅ All users can access this
                  </Typography>
                </Box>
                
                {(currentUser.role === 'manager' || currentUser.role === 'hr' || currentUser.role === 'executive') && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Manager+ Access:
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      ✅ You have manager-level access
                    </Typography>
                  </Box>
                )}
                
                {(currentUser.role === 'hr' || currentUser.role === 'executive') && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      HR Admin+ Access:
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      ✅ You have HR admin-level access
                    </Typography>
                  </Box>
                )}
                
                {currentUser.role === 'executive' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Executive Access:
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      ✅ You have executive-level access
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
} 