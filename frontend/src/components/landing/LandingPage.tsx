import React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Group,
  Psychology,
  Speed,
  Security,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  ArrowForward,
  CheckCircle,
  Star,
  Rocket,
  Analytics,
  AutoAwesome,
  Timeline,
  Shield,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const { currentUser, loading } = useAuth();

  const features = [
    {
      icon: <AutoAwesome />,
      title: 'AI-Powered Reviews',
      description: 'Generate comprehensive performance reviews with intelligent AI assistance that saves 70% of your time',
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    },
    {
      icon: <Timeline />,
      title: 'Smart OKR Management',
      description: 'Set, track, and achieve objectives with intelligent goal alignment and progress tracking',
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
    },
    {
      icon: <Group />,
      title: 'Continuous Feedback',
      description: 'Foster a culture of growth with real-time feedback loops and peer-to-peer insights',
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
    },
    {
      icon: <Analytics />,
      title: 'Real-time Analytics',
      description: 'Get actionable insights with advanced performance analytics and trend analysis',
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
    },
    {
      icon: <Shield />,
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access control and data encryption',
      color: theme.palette.error.main,
      gradient: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
    },
    {
      icon: <Rocket />,
      title: 'Performance Boost',
      description: 'Accelerate team performance with data-driven insights and personalized recommendations',
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
  ];

  const benefits = [
    'Reduce review time by 70%',
    'Eliminate bias with AI assistance',
    'Improve feedback quality',
    'Real-time performance insights',
    'Seamless team collaboration',
    'Enterprise-grade security',
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Users' },
    { number: '500+', label: 'Companies' },
    { number: '70%', label: 'Time Saved' },
    { number: '4.9/5', label: 'User Rating' },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              mx: 'auto',
              mb: 2,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="h6">Loading PerformAI...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Modern Navigation Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
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
                      height: '24px',
                    }}
                  >
                    {/* Bar 1 */}
                    <Box
                      sx={{
                        width: '5px',
                        height: '14px',
                        background: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '2px',
                      }}
                    />
                    {/* Bar 2 */}
                    <Box
                      sx={{
                        width: '5px',
                        height: '18px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '2px',
                      }}
                    />
                    {/* Bar 3 */}
                    <Box
                      sx={{
                        width: '5px',
                        height: '24px',
                        background: 'rgba(255, 255, 255, 1)',
                        borderRadius: '2px',
                      }}
                    />
                    {/* Bar 4 */}
                    <Box
                      sx={{
                        width: '5px',
                        height: '16px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '2px',
                      }}
                    />
                  </Box>
                  
                  {/* Subtle Growth Arrow */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '3px',
                      right: '3px',
                      width: '10px',
                      height: '10px',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        width: '7px',
                        height: '2px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        transform: 'rotate(45deg)',
                        transformOrigin: 'right',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '2px',
                        height: '7px',
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
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                PerformAI
              </Typography>
            </Stack>
            
            {currentUser ? (
              <Stack direction="row" alignItems="center" spacing={3}>
                <Chip
                  label={`Welcome back, ${currentUser.firstName}! 👋`}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    '& .MuiChip-label': { px: 2 },
                  }}
                />
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="contained"
                  size="large"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                  startIcon={<DashboardIcon />}
                >
                  Go to Dashboard
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={2}>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderWidth: 2,
                    },
                  }}
                  startIcon={<LoginIcon />}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="contained"
                  size="large"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                  startIcon={<RegisterIcon />}
                >
                  Get Started
                </Button>
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%)
            `,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={6}>
              <Box sx={{ mb: { xs: 6, lg: 0 } }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '5.5rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    color: theme.palette.text.primary,
                  }}
                >
                  Transform
                  <br />
                  <Box
                    component="span"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Performance
                  </Box>
                  <br />
                  Reviews
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 400,
                    mb: 4,
                    color: theme.palette.text.secondary,
                    lineHeight: 1.6,
                    maxWidth: 600,
                  }}
                >
                  Revolutionize your organization's performance management with AI-powered insights, 
                  streamlined OKR tracking, and continuous feedback loops that drive real results.
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
                  {benefits.slice(0, 3).map((benefit, index) => (
                    <Chip
                      key={index}
                      icon={<CheckCircle sx={{ fontSize: 18 }} />}
                      label={benefit}
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    />
                  ))}
                </Stack>

                {!currentUser && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                    <Button
                      component={Link}
                      href="/auth/register"
                      variant="contained"
                      size="large"
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        textTransform: 'none',
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                          transform: 'translateY(-3px)',
                          boxShadow: `0 16px 50px ${alpha(theme.palette.primary.main, 0.5)}`,
                        },
                        transition: 'all 0.3s ease',
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Start Free Trial
                    </Button>
                    <Button
                      component={Link}
                      href="/auth/login"
                      variant="outlined"
                      size="large"
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 4,
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        textTransform: 'none',
                        borderWidth: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                      startIcon={<LoginIcon />}
                    >
                      Sign In
                    </Button>
                  </Stack>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Box sx={{ position: 'relative', display: { xs: 'none', lg: 'block' } }}>
                {/* Hero Illustration/Visual Element */}
                <Box
                  sx={{
                    position: 'relative',
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Central Circle */}
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      animation: 'float 6s ease-in-out infinite',
                      '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-20px)' },
                      },
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 80, color: theme.palette.primary.main, opacity: 0.9 }} />
                  </Box>

                  {/* Floating Stats Cards */}
                  {stats.map((stat, index) => {
                    const positions = [
                      { top: '10%', left: '10%' },
                      { top: '15%', right: '5%' },
                      { bottom: '20%', left: '5%' },
                      { bottom: '10%', right: '15%' },
                    ];
                    
                    return (
                      <Box
                        key={index}
                        sx={{
                          position: 'absolute',
                          ...positions[index],
                          animation: `float${index + 1} ${4 + index}s ease-in-out infinite`,
                          [`@keyframes float${index + 1}`]: {
                            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                            '50%': { transform: `translateY(-${10 + index * 5}px) rotate(${index % 2 ? 2 : -2}deg)` },
                          },
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2.5,
                            minWidth: 120,
                            textAlign: 'center',
                            background: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 4,
                            boxShadow: theme.shadows[4],
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: theme.shadows[8],
                            },
                          }}
                        >
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 900, 
                              mb: 0.5,
                              color: theme.palette.text.primary,
                            }}
                          >
                            {stat.number}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              fontWeight: 600,
                              fontSize: '0.85rem',
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Paper>
                      </Box>
                    );
                  })}

                  {/* Decorative Elements */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '30%',
                      left: '50%',
                      width: 300,
                      height: 300,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                      transform: 'translate(-50%, -50%)',
                      animation: 'pulse 4s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
                        '50%': { transform: 'translate(-50%, -50%) scale(1.1)' },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                mb: 3,
                color: theme.palette.text.primary,
              }}
            >
              Powerful Features That Drive Results
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
            >
              Everything you need to revolutionize performance management and unlock your team's potential
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    background: theme.palette.background.paper,
                    boxShadow: theme.shadows[2],
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8],
                      '& .feature-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                      '&::before': {
                        opacity: 1,
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: feature.gradient,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      className="feature-icon"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 4,
                        background: feature.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mb: 3,
                        transition: 'all 0.3s ease',
                        boxShadow: `0 8px 32px ${alpha(feature.color, 0.3)}`,
                      }}
                    >
                      {React.cloneElement(feature.icon, { sx: { fontSize: 36 } })}
                    </Box>
                    
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 2,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        lineHeight: 1.7,
                        fontSize: '1rem',
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 12, background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.9)} 100%)` }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={6}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 4, 
                  color: 'white',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                Why Teams Choose PerformAI
              </Typography>
              
              <Stack spacing={3}>
                {benefits.map((benefit, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 500,
                      }}
                    >
                      {benefit}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Box
                sx={{
                  position: 'relative',
                  p: 4,
                  background: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(20px)',
                  borderRadius: 6,
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  Ready to Get Started?
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha('#ffffff', 0.8), 
                    mb: 4, 
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  Join thousands of organizations already transforming their performance management with PerformAI
                </Typography>

                {!currentUser && (
                  <Stack spacing={3}>
                    <Button
                      component={Link}
                      href="/auth/register"
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        textTransform: 'none',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Start Your Free Trial Today
                    </Button>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: alpha('#ffffff', 0.6), 
                        textAlign: 'center',
                      }}
                    >
                      No credit card required • 14-day free trial • Cancel anytime
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.text.primary, 0.95),
          color: '#ffffff',
          py: 6,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={4}
          >
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  PerformAI
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Transforming Performance Management
                </Typography>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={4} alignItems="center">
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                © 2025 PerformAI. All rights reserved.
              </Typography>
              <Stack direction="row" spacing={2}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 