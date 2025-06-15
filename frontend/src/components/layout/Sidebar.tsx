import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Stack,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BarChart as AnalyticsIcon,
  Assignment as OKRsIcon,
  Chat as FeedbackIcon,
  People as TeamIcon,
  RateReview as ReviewsIcon,
  Person as ProfileIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  badge?: string;
}

/**
 * Clean, Simple Sidebar Design
 */
const Sidebar: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { currentUser } = useAuth();
  const userRole = currentUser?.role || 'employee';

  // Simplified navigation items
  const navigation: NavItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: <DashboardIcon />, 
      roles: ['employee', 'manager', 'hr_admin', 'executive'],
    },
    { 
      name: 'My Profile', 
      href: '/profile', 
      icon: <ProfileIcon />, 
      roles: ['employee', 'manager', 'hr_admin', 'executive'],
    },
    { 
      name: 'OKRs & Goals', 
      href: '/okrs', 
      icon: <OKRsIcon />, 
      roles: ['employee', 'manager', 'hr_admin', 'executive'],
    },
    { 
      name: 'Reviews', 
      href: '/reviews', 
      icon: <ReviewsIcon />, 
      roles: ['employee', 'manager', 'hr_admin'],
      badge: 'New',
    },
    { 
      name: 'Feedback', 
      href: '/feedback', 
      icon: <FeedbackIcon />, 
      roles: ['employee', 'manager', 'hr_admin'],
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: <AnalyticsIcon />, 
      roles: ['manager', 'hr_admin', 'executive'],
    },
    { 
      name: 'Team Management', 
      href: '/team', 
      icon: <TeamIcon />, 
      roles: ['manager', 'hr_admin'],
    },
    { 
      name: 'RBAC Management', 
      href: '/admin/rbac', 
      icon: <AdminPanelSettingsIcon />, 
      roles: ['hr_admin'],
      badge: 'Admin',
    },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  const drawerWidth = 280;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          position: 'static',
          height: '100%',
        },
      }}
    >
      {/* Modern Brand Header */}
      <Box
        sx={{
          px: 4,
          py: 1,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ height: '100%' }}>
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
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
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
            <Box>
              <Typography
                variant="h6"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.5px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                PerformAI
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                Performance Platform
              </Typography>
            </Box>
          </Stack>
        </Link>
      </Box>
      

      
      {/* Simple Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {filteredNavigation.map((item) => {
            const isActive = router.pathname === item.href || 
                            (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
            
            return (
              <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 500,
                      },
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        backgroundColor: theme.palette.warning.main,
                        color: 'white',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Simple Footer */}
      <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            textAlign: 'center',
            display: 'block',
          }}
        >
          © 2025 PerformAI • v2.1.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 