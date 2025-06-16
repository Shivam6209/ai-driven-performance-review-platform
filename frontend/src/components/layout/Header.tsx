import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  useTheme,
  alpha,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';

/**
 * Clean, Simple Header Design
 */
const Header: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    router.push('/auth/login');
  };

  const drawerWidth = 280;

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        color: theme.palette.text.primary,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        borderRadius: '0 !important',
        backdropFilter: 'blur(10px)',
        '& .MuiPaper-root': {
          borderRadius: '0 !important',
        },
        '& .MuiAppBar-root': {
          borderRadius: '0 !important',
        },
      }}
    >
      <Toolbar sx={{ 
        px: 4, 
        py: 1, 
        borderRadius: '0 !important', 
        minHeight: '64px !important', 
        height: 64,
        background: 'transparent',
      }}>
        {/* Simple Brand Section */}
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
              {/* Dashboard Grid Icon */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Dashboard Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: '1fr 1fr',
                    gap: '3px',
                    width: '18px',
                    height: '18px',
                  }}
                >
                  {/* Grid Item 1 */}
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '2px',
                    }}
                  />
                  {/* Grid Item 2 */}
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '2px',
                    }}
                  />
                  {/* Grid Item 3 */}
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '2px',
                    }}
                  />
                  {/* Grid Item 4 */}
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 1)',
                      borderRadius: '2px',
                    }}
                  />
                </Box>
              </Box>
            </Box>
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
              Dashboard
            </Typography>
          </Stack>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        {/* Simple Action Buttons */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              color: theme.palette.text.secondary,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2.5,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
              },
            }}
          >
            <NotificationBell />
          </Box>



          {/* Simple User Profile Button */}
          {currentUser && (
            <>
              <IconButton
                onClick={handleMenuOpen}
                size="medium"
                sx={{
                  ml: 1.5,
                  p: 0.5,
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '50% !important',
                    clipPath: 'circle(50%)',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {currentUser.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>

              {/* Simple Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{
                  mt: 1.5,
                  '& .MuiPaper-root': {
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[8],
                    minWidth: 200,
                    border: `1px solid ${theme.palette.divider}`,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* User Info */}
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {`${currentUser.firstName} ${currentUser.lastName}` || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser.email}
                  </Typography>
                </Box>

                <Divider />

                {/* Menu Items */}
                <MenuItem onClick={handleMenuClose} component={Link} href="/profile">
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Profile</ListItemText>
                </MenuItem>



                <Divider />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText sx={{ color: theme.palette.error.main }}>
                    Sign Out
                  </ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 