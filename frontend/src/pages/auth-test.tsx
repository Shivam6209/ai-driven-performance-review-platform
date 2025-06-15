import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, TextField } from '@mui/material';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';

export default function AuthTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const testFirebaseLogin = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      setResult(`Firebase Login Successful! Token: ${token.substring(0, 50)}...`);
    } catch (err: any) {
      setError(`Firebase Login Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackendAuth = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      if (!user) {
        setError('Please login with Firebase first');
        return;
      }

      // Test the /me endpoint
      const response = await api.get('/auth/me');
      setResult(`Backend Auth Successful! User: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err: any) {
      if (err.response) {
        setError(`Backend Auth Error: ${err.response.status} - ${err.response.data?.message || err.message}`);
      } else {
        setError(`Backend Auth Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testDashboardAuth = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      if (!user) {
        setError('Please login with Firebase first');
        return;
      }

      // Test the dashboard endpoint
      const response = await api.get('/dashboard');
      setResult(`Dashboard Auth Successful! Data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err: any) {
      if (err.response) {
        setError(`Dashboard Auth Error: ${err.response.status} - ${err.response.data?.message || err.message}`);
      } else {
        setError(`Dashboard Auth Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setResult('Logged out successfully');
      setError('');
    } catch (err: any) {
      setError(`Logout Error: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Firebase Authentication Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This page tests Firebase authentication and backend token validation.
      </Typography>

      {/* Login Form */}
      <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Firebase Login
        </Typography>
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={testFirebaseLogin}
            disabled={loading}
          >
            Login with Firebase
          </Button>
          {user && (
            <Button 
              variant="outlined" 
              onClick={handleLogout}
              disabled={loading}
            >
              Logout
            </Button>
          )}
        </Box>
      </Box>

      {/* Auth Status */}
      <Box sx={{ mb: 3, p: 2, bgcolor: user ? 'success.light' : 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Authentication Status
        </Typography>
        <Typography variant="body2">
          Firebase User: {user ? `${user.email} (${user.uid})` : 'Not logged in'}
        </Typography>
        <Typography variant="body2">
          Email Verified: {user?.emailVerified ? 'Yes' : 'No'}
        </Typography>
      </Box>

      {/* Test Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={testBackendAuth}
          disabled={loading || !user}
        >
          Test /auth/me
        </Button>
        
        <Button 
          variant="contained" 
          onClick={testDashboardAuth}
          disabled={loading || !user}
        >
          Test /dashboard
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Testing...</Typography>
        </Box>
      )}

      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{result}</pre>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Instructions:
        </Typography>
        <Typography variant="body2" component="div">
          1. Enter your Firebase credentials and click "Login with Firebase"<br/>
          2. Once logged in, test the backend endpoints<br/>
          3. Check if the 401 errors are resolved<br/>
          4. The backend should now validate Firebase ID tokens properly
        </Typography>
      </Box>
    </Box>
  );
} 