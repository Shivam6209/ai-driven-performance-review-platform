import React from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';

const UnauthorizedPage: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <LockIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              {currentUser
                ? `Sorry, you don't have permission to access this page. This area requires a higher access level than your current role (${currentUser.role}).`
                : 'You need to be logged in to access this page.'}
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button variant="outlined" onClick={handleGoBack}>
                  Go Back
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={handleGoHome}>
                  Go to Dashboard
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default UnauthorizedPage; 