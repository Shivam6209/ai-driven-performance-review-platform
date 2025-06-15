import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import api from '@/lib/api';

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testApiConnection = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      // Test basic API connection with health check
      const response = await api.get('/dashboard/health');
      setResult(`API Connection Successful! Status: ${response.status} - ${(response.data as any)?.message || 'OK'}`);
    } catch (err: any) {
      if (err.response) {
        setError(`API Error: ${err.response.status} - ${err.response.data?.message || err.message}`);
      } else if (err.request) {
        setError('Network Error: No response from server. Check if backend is running on http://localhost:3001');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testCorsDirectly = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      // Test CORS directly with fetch
      const response = await fetch('http://localhost:3001/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        },
      });
      
      if (response.ok) {
        setResult(`Direct CORS Test Successful! Status: ${response.status}`);
      } else {
        setError(`Direct CORS Test Failed: ${response.status} - ${response.statusText}`);
      }
    } catch (err: any) {
      setError(`Direct CORS Test Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        API Connection Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This page tests the API connection and CORS configuration.
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={testApiConnection}
          disabled={loading}
        >
          Test API Health
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testCorsDirectly}
          disabled={loading}
        >
          Test CORS Directly
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={() => window.open('http://localhost:3001/api', '_blank')}
        >
          View Swagger Docs
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
          {result}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Configuration Info:
        </Typography>
        <Typography variant="body2">
          Frontend URL: http://localhost:3000
        </Typography>
        <Typography variant="body2">
          Backend URL: http://localhost:3001/api
        </Typography>
        <Typography variant="body2">
          API Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}
        </Typography>
      </Box>
    </Box>
  );
} 