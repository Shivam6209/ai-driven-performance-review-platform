import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { authService } from '../../services/auth.service';

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if no token is provided
    if (router.isReady && !token) {
      router.push('/auth/forgot-password');
    }
  }, [router, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        token: token as string,
        password,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && router.isReady) {
    return null; // Will redirect in useEffect
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', mt: 3 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Set New Password
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {isSubmitted ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your password has been successfully reset.
                </Alert>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link href="/auth/login">
                    Return to Login
                  </Link>
                </Box>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="New Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Link href="/auth/login">
                    Back to Login
                  </Link>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ResetPassword; 