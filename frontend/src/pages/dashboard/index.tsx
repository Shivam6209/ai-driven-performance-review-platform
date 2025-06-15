import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  Skeleton,
  Alert,
  useTheme,
  alpha,
  Paper,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  Feedback,
  Analytics,
  Schedule,
  Star,
  ArrowUpward,
  ArrowDownward,
  Timeline,
  EmojiEvents,
  PlayArrow,
} from '@mui/icons-material';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, DashboardData, RecentActivity, QuickAction } from '@/services/dashboard.service';
import Link from 'next/link';

/**
 * Modern Dashboard Component with Enhanced UI
 */
export default function Dashboard(): JSX.Element {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardData();
        
        const safeData: DashboardData = {
          stats: data?.stats || {
            totalOKRs: 0,
            completedOKRs: 0,
            averageProgress: 0,
            activeOKRs: 0,
            pendingReviews: 0,
            feedbackReceived: 0,
            goalCompletionRate: 0,
            feedbackScore: 0,
            reviewProgress: 0,
          },
          recentActivities: data?.recentActivities || [],
          quickActions: data?.quickActions || [],
        };
        
        setDashboardData(safeData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        
        setDashboardData({
          stats: {
            totalOKRs: 0,
            completedOKRs: 0,
            averageProgress: 0,
            activeOKRs: 0,
            pendingReviews: 0,
            feedbackReceived: 0,
            goalCompletionRate: 0,
            feedbackScore: 0,
            reviewProgress: 0,
          },
          recentActivities: [],
          quickActions: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);



  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Assignment':
        return <Assignment sx={{ fontSize: 24 }} />;
      case 'Feedback':
        return <Feedback sx={{ fontSize: 24 }} />;
      case 'Analytics':
        return <Analytics sx={{ fontSize: 24 }} />;
      default:
        return <Assignment sx={{ fontSize: 24 }} />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <EmojiEvents sx={{ fontSize: 20 }} />;
      case 'feedback':
        return <Feedback sx={{ fontSize: 20 }} />;
      case 'review':
        return <Analytics sx={{ fontSize: 20 }} />;
      default:
        return <Timeline sx={{ fontSize: 20 }} />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ 
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 }
        }}>
          <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
            <Skeleton variant="text" width={400} height={80} sx={{ mb: 2 }} />
            <Skeleton variant="text" width={300} height={40} sx={{ mb: 6 }} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} lg={3} key={item}>
                  <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ 
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 }
        }}>
          <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                '& .MuiAlert-message': { fontSize: '1.1rem' }
              }}
            >
              {error}
            </Alert>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => window.location.reload()}
              sx={{ borderRadius: 2, px: 4, py: 1.5 }}
            >
              Retry Loading
            </Button>
          </Box>
        </Box>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <Box sx={{ 
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 }
        }}>
          <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
            <Skeleton variant="text" width={400} height={80} sx={{ mb: 2 }} />
            <Skeleton variant="text" width={300} height={40} sx={{ mb: 6 }} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} lg={3} key={item}>
                  <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 1, sm: 2 }
      }}>
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
          {/* Enhanced Header */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                  }}
                >
                  Welcome back, {currentUser?.firstName || 'User'}! 🚀
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 400,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  Ready to crush your goals today? Let's see how you're performing.
                </Typography>
              </Box>

            </Stack>
          </Box>

          {/* Enhanced Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                color: 'white',
                height: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px rgba(102, 126, 234, 0.4)`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle, ${alpha('#fff', 0.15)}, transparent)`,
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)'
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.25)', 
                      width: 56, 
                      height: 56,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Assignment sx={{ 
                        fontSize: 28, 
                        color: '#4f46e5',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {dashboardData?.stats.activeOKRs || 0}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ArrowUpward sx={{ fontSize: 16 }} />
                        <Typography variant="caption">+12%</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    Active OKRs
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                    Goals you're currently working on
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, #11998e 0%, #38ef7d 100%)`,
                color: 'white',
                height: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px rgba(17, 153, 142, 0.4)`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle, ${alpha('#fff', 0.15)}, transparent)`,
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)'
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.25)', 
                      width: 56, 
                      height: 56,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Feedback sx={{ 
                        fontSize: 28, 
                        color: '#059669',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {dashboardData?.stats.feedbackReceived || 0}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ArrowUpward sx={{ fontSize: 16 }} />
                        <Typography variant="caption">+8%</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    Feedback Received
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                    Insights from your colleagues
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)`,
                color: 'white',
                height: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px rgba(255, 107, 107, 0.4)`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle, ${alpha('#fff', 0.15)}, transparent)`,
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)'
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.25)', 
                      width: 56, 
                      height: 56,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Schedule sx={{ 
                        fontSize: 28, 
                        color: '#dc2626',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {dashboardData?.stats.pendingReviews || 0}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ArrowDownward sx={{ fontSize: 16 }} />
                        <Typography variant="caption">-3%</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    Pending Reviews
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                    Reviews awaiting your attention
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                color: 'white',
                height: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px rgba(102, 126, 234, 0.4)`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle, ${alpha('#fff', 0.15)}, transparent)`,
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)'
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.25)', 
                      width: 56, 
                      height: 56,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                      <TrendingUp sx={{ 
                        fontSize: 28, 
                        color: '#7c3aed',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }} />
                    </Avatar>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {dashboardData?.stats.averageProgress || 0}%
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ArrowUpward sx={{ fontSize: 16 }} />
                        <Typography variant="caption">+15%</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    Average Progress
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                    Overall goal completion rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Enhanced Quick Actions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Quick Actions ⚡
            </Typography>
            <Grid container spacing={3}>
              {(dashboardData?.quickActions || []).map((action: QuickAction, index: number) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8,
                      borderColor: `${action.color}.main`,
                    },
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.primary.main, 0.08)})`
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
                        <Avatar sx={{ 
                          bgcolor: `${action.color}.main`, 
                          width: 48, 
                          height: 48,
                          boxShadow: 3
                        }}>
                          {getIconComponent(action.icon)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {action.description}
                          </Typography>
                        </Box>
                      </Stack>
                      <Button
                        component={Link}
                        href={action.href}
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<PlayArrow />}
                        sx={{ 
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Enhanced Content Grid */}
          <Grid container spacing={3}>
            {/* Recent Activities */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Timeline /> Recent Activities
                    </Typography>
                    <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                      View All
                    </Button>
                  </Stack>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  {(dashboardData?.recentActivities || []).length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                      <Timeline sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No recent activities
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Your activities will appear here as you use the platform
                      </Typography>
                    </Box>
                  ) : (
                    <Stack>
                      {(dashboardData?.recentActivities || []).map((activity: RecentActivity, index: number) => (
                        <Box 
                          key={activity.id || index} 
                          sx={{ 
                            p: 3,
                            borderBottom: index < (dashboardData?.recentActivities || []).length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={3}>
                            <Avatar sx={{ 
                              bgcolor: `${activity.color}.main`, 
                              width: 44, 
                              height: 44,
                              boxShadow: 2
                            }}>
                              {getActivityIcon(activity.type || 'default')}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {activity.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                                {activity.description}
                              </Typography>
                            </Box>
                            <Chip 
                              label={activity.time} 
                              size="small" 
                              variant="outlined"
                              sx={{ borderRadius: 2 }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Overview */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)}, ${alpha(theme.palette.info.main, 0.05)})`,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics /> Performance Overview
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={4}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Goal Completion
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {dashboardData?.stats.goalCompletionRate || 0}%
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={dashboardData?.stats.goalCompletionRate || 0} 
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                          }
                        }} 
                      />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Feedback Score
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Star sx={{ fontSize: 20, color: 'warning.main' }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            {dashboardData?.stats.feedbackScore ? `${dashboardData.stats.feedbackScore}/5` : '0/5'}
                          </Typography>
                        </Stack>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={dashboardData?.stats.feedbackScore ? (dashboardData.stats.feedbackScore / 5) * 100 : 0} 
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
                          }
                        }} 
                      />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Review Progress
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                          {dashboardData?.stats.reviewProgress || 0}%
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={dashboardData?.stats.reviewProgress || 0} 
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`
                          }
                        }} 
                      />
                    </Box>

                    <Divider />

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                        🎯
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Keep up the great work!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You're making excellent progress on your goals
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Layout>
  );
} 