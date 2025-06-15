import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  useTheme,
  alpha,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  AdminPanelSettings,
  Groups,
  Business,
  Email,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage(): JSX.Element | null {
  const theme = useTheme();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [registrationType, setRegistrationType] = useState('employee');

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) {
      router.replace('/dashboard');
    }
  }, [currentUser, router]);

  // Handle registration type change
  const handleRegistrationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationType(event.target.value);
  };

  // Handle admin registration
  const handleAdminRegistration = () => {
    router.push('/auth/register-admin');
  };

  // Handle employee registration
  const handleEmployeeRegistration = () => {
    router.push('/auth/register-with-invitation');
  };

  // Handle request invitation
  const handleRequestInvitation = () => {
    alert('Please contact your organization administrator for an invitation link.');
  };

  if (currentUser) {
    return null; // Will redirect
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Left Side - Registration Form */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 500 }}>
          {/* Back Button */}
          <Box sx={{ mb: 4 }}>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowBack />}
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  color: theme.palette.primary.main,
                }
              }}
            >
              Back to Home
            </Button>
          </Box>

          {/* Logo */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                  borderRadius: 3,
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '3px',
                    height: '20px',
                  }}
                >
                  <Box
                    sx={{
                      width: '4px',
                      height: '12px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '2px',
                    }}
                  />
                  <Box
                    sx={{
                      width: '4px',
                      height: '16px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '2px',
                    }}
                  />
                  <Box
                    sx={{
                      width: '4px',
                      height: '20px',
                      background: 'rgba(255, 255, 255, 1)',
                      borderRadius: '2px',
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              PerformAI
            </Typography>
          </Stack>

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1,
                letterSpacing: '-0.02em',
              }}
            >
              Join Our Platform
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '1.1rem',
              }}
            >
              Choose how you'd like to get started
            </Typography>
          </Box>

          {/* Registration Options */}
          <Stack spacing={3}>
            {/* Admin Registration Option */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `2px solid ${registrationType === 'admin' ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                },
              }}
              onClick={() => setRegistrationType('admin')}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Radio
                  checked={registrationType === 'admin'}
                  onChange={handleRegistrationTypeChange}
                  value="admin"
                  sx={{ mt: -0.5 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <AdminPanelSettings sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Register as Organization Admin
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Create a new organization and become its administrator. You'll be able to invite employees and manage the organization.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleAdminRegistration}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                    }}
                  >
                    Create Organization
                  </Button>
                </Box>
              </Stack>
            </Paper>

            {/* Employee Registration Option */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `2px solid ${registrationType === 'employee' ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                },
              }}
              onClick={() => setRegistrationType('employee')}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Radio
                  checked={registrationType === 'employee'}
                  onChange={handleRegistrationTypeChange}
                  value="employee"
                  sx={{ mt: -0.5 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Groups sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Join an Existing Organization
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Employees must be invited by their organization administrator. If you have an invitation link, use it to register.
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={handleEmployeeRegistration}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                      }}
                    >
                      I have an invitation
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleRequestInvitation}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                      }}
                    >
                      Request invitation
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Information Box */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: 2,
              }}
            >
              <Stack direction="row" spacing={2}>
                <Business sx={{ color: theme.palette.info.main, fontSize: 24, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.info.main }}>
                    How it works
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      • <strong>Organization Admins</strong> create organizations and invite employees
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      • <strong>Employees</strong> receive invitation emails with registration links
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      • All users within an organization share the same performance management system
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            <Divider sx={{ my: 2 }} />

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Already have an account?{' '}
                <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                  <Typography
                    component="span"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign in here
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Right Side - Gradient Background */}
      <Box
        sx={{
          flex: 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
          p: 6,
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, white 2px, transparent 2px)
            `,
            backgroundSize: '50px 50px',
            backgroundPosition: '0 0, 25px 25px',
          }}
        />
        
        {/* Content */}
        <Box sx={{ textAlign: 'center', color: 'white', zIndex: 1, maxWidth: 400 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              letterSpacing: '-0.02em',
            }}
          >
            Welcome to PerformAI
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              fontWeight: 400,
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            Join thousands of organizations using our platform to drive performance and achieve goals
          </Typography>
          
          {/* Performance Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha('#fff', 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  borderRadius: '50%',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    height: '32px',
                  }}
                >
                  <Box
                    sx={{
                      width: '6px',
                      height: '20px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '3px',
                    }}
                  />
                  <Box
                    sx={{
                      width: '6px',
                      height: '26px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '3px',
                    }}
                  />
                  <Box
                    sx={{
                      width: '6px',
                      height: '32px',
                      background: 'rgba(255, 255, 255, 1)',
                      borderRadius: '3px',
                    }}
                  />
                  <Box
                    sx={{
                      width: '6px',
                      height: '24px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '3px',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 