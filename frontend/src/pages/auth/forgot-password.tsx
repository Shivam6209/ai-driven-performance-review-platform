import React, { useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
              Reset Password
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {isSubmitted ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Password reset instructions have been sent to your email.
                </Alert>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link href="/auth/login">
                    Return to Login
                  </Link>
                </Box>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter your email address and we'll send you instructions to reset your password.
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

export default ForgotPassword; 