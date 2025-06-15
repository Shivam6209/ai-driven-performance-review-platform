import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowBack,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Clean Login Page Component
 * 
 * Minimal, professional login page matching landing page theme
 */
export default function LoginPage(): JSX.Element {
  const theme = useTheme();
  const router = useRouter();
  const { login, currentUser, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!authLoading && currentUser) {
      console.log('🔐 Login: User already authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [currentUser, authLoading, router]);

  // Show loading if checking auth
  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Login: Attempting to log in user...');
      await login(formData.email, formData.password);
      console.log('🔐 Login: Success! Redirecting to dashboard...');
      await router.replace('/dashboard');
    } catch (err: any) {
      console.error('🔐 Login: Error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Left Side - Login Form */}
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
        <Box sx={{ width: '100%', maxWidth: 400 }}>
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
              {/* Professional Performance Icon */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Performance Chart Bars */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '3px',
                    height: '20px',
                  }}
                >
                  {/* Bar 1 */}
                  <Box
                    sx={{
                      width: '4px',
                      height: '12px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '2px',
                    }}
                  />
                  {/* Bar 2 */}
                  <Box
                    sx={{
                      width: '4px',
                      height: '16px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '2px',
                    }}
                  />
                  {/* Bar 3 */}
                  <Box
                    sx={{
                      width: '4px',
                      height: '20px',
                      background: 'rgba(255, 255, 255, 1)',
                      borderRadius: '2px',
                    }}
                  />
                  {/* Bar 4 */}
                  <Box
                    sx={{
                      width: '4px',
                      height: '14px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '2px',
                    }}
                  />
                </Box>
                
                {/* Subtle Growth Arrow */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: '6px',
                      height: '2px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      transform: 'rotate(45deg)',
                      transformOrigin: 'right',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '2px',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      right: 0,
                      transform: 'rotate(45deg)',
                      transformOrigin: 'bottom',
                    },
                  }}
                />
              </Box>
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
              }}
            >
              PerformAI
            </Typography>
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 2 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to continue to your dashboard
          </Typography>

          {/* Login Form */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                '& .MuiAlert-message': { fontSize: '0.875rem' }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ 
                        color: theme.palette.text.secondary,
                        transition: 'color 0.3s ease',
                      }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.grey[50], 0.5),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      },
                      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '2px',
                      },
                      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ 
                        color: theme.palette.text.secondary,
                        transition: 'color 0.3s ease',
                      }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={loading}
                        sx={{
                          transition: 'color 0.3s ease',
                          '&:hover': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.grey[50], 0.5),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      },
                      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '2px',
                      },
                      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !formData.email || !formData.password}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
                    transition: 'left 0.5s ease',
                  },
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.5)}`,
                    transform: 'translateY(-2px) scale(1.02)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(0.98)',
                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  '&:disabled': {
                    background: theme.palette.grey[300],
                    boxShadow: 'none',
                    transform: 'none',
                    '&::before': {
                      display: 'none',
                    },
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              New to PerformAI?
            </Typography>
          </Divider>

          <Button
            component={Link}
            href="/auth/register"
            fullWidth
            variant="outlined"
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 2,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '0%',
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                transition: 'width 0.4s ease',
                zIndex: 0,
              },
              '& .MuiButton-label, & > *': {
                position: 'relative',
                zIndex: 1,
              },
              '&:hover': {
                backgroundColor: 'transparent',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                '&::before': {
                  width: '100%',
                },
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Create Account
          </Button>

          {/* Demo Credentials */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Demo Credentials:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
              <strong>HR Admin:</strong> hr.admin@company.com / password123<br />
              <strong>Manager:</strong> john.smith@company.com / password123<br />
              <strong>Employee:</strong> alex.wilson@company.com / password123
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Welcome Panel */}
      <Box
        sx={{
          flex: 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          p: 6,
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
            Welcome Back!
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
            Sign in to access your performance dashboard and unlock AI-powered insights for better team management.
          </Typography>
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
              {/* Professional Performance Icon */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Performance Chart Bars */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    height: '32px',
                  }}
                >
                  {/* Bar 1 */}
                  <Box
                    sx={{
                      width: '6px',
                      height: '20px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '3px',
                    }}
                  />
                  {/* Bar 2 */}
                  <Box
                    sx={{
                      width: '6px',
                      height: '26px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '3px',
                    }}
                  />
                  {/* Bar 3 */}
                  <Box
                    sx={{
                      width: '6px',
                      height: '32px',
                      background: 'rgba(255, 255, 255, 1)',
                      borderRadius: '3px',
                    }}
                  />
                  {/* Bar 4 */}
                  <Box
                    sx={{
                      width: '6px',
                      height: '24px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '3px',
                    }}
                  />
                </Box>
                
                {/* Subtle Growth Arrow */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '12px',
                    height: '12px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: '8px',
                      height: '2px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      transform: 'rotate(45deg)',
                      transformOrigin: 'right',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '2px',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      right: 0,
                      transform: 'rotate(45deg)',
                      transformOrigin: 'bottom',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            New to PerformAI?{' '}
            <Link 
              href="/auth/register" 
              style={{ 
                color: 'white', 
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              Create an account
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
} 