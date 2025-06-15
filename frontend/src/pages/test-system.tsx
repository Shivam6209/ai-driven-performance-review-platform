import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { employeeService } from '@/services/employeeService';
import { feedbackService } from '@/services/feedback.service';
import { RbacService } from '@/services/rbac.service';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
}

export default function SystemTestPage(): JSX.Element {
  const { currentUser } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const updateTestResult = (name: string, status: 'success' | 'error' | 'loading', data?: any, error?: string) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        existing.status = status;
        existing.data = data;
        existing.error = error;
        return [...prev];
      } else {
        return [...prev, { name, status, data, error }];
      }
    });
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 1: Current User Info
    updateTestResult('Current User Info', 'loading');
    try {
      updateTestResult('Current User Info', 'success', currentUser);
    } catch (err: any) {
      updateTestResult('Current User Info', 'error', null, err.message);
    }

    // Test 2: Fetch All Employees
    updateTestResult('Fetch All Employees', 'loading');
    try {
      const employees = await employeeService.getAllEmployees();
      updateTestResult('Fetch All Employees', 'success', employees);
    } catch (err: any) {
      updateTestResult('Fetch All Employees', 'error', null, err.message);
    }

    // Test 3: Fetch All Departments
    updateTestResult('Fetch All Departments', 'loading');
    try {
      const departments = await employeeService.getAllDepartments();
      updateTestResult('Fetch All Departments', 'success', departments);
    } catch (err: any) {
      updateTestResult('Fetch All Departments', 'error', null, err.message);
    }

    // Test 4: Get Organization Chart
    updateTestResult('Organization Chart', 'loading');
    try {
      const orgChart = await employeeService.getOrganizationChart();
      updateTestResult('Organization Chart', 'success', orgChart);
    } catch (err: any) {
      updateTestResult('Organization Chart', 'error', null, err.message);
    }

    // Test 5: Get User Roles (if currentUser exists)
    if (currentUser?.id) {
      updateTestResult('User Roles', 'loading');
      try {
        const roles = await RbacService.getEmployeeRoles(currentUser.id);
        updateTestResult('User Roles', 'success', roles);
      } catch (err: any) {
        updateTestResult('User Roles', 'error', null, err.message);
      }
    }

    // Test 6: Get Received Feedback
    updateTestResult('Received Feedback', 'loading');
    try {
      const receivedFeedback = await feedbackService.getReceivedFeedback();
      updateTestResult('Received Feedback', 'success', receivedFeedback);
    } catch (err: any) {
      updateTestResult('Received Feedback', 'error', null, err.message);
    }

    // Test 7: Get Given Feedback
    updateTestResult('Given Feedback', 'loading');
    try {
      const givenFeedback = await feedbackService.getGivenFeedback();
      updateTestResult('Given Feedback', 'success', givenFeedback);
    } catch (err: any) {
      updateTestResult('Given Feedback', 'error', null, err.message);
    }

    setLoading(false);
  };

  const testCreateEmployee = async () => {
    updateTestResult('Create Test Employee', 'loading');
    try {
      const testEmployee = {
        firstName: 'Test',
        lastName: 'Employee',
        email: `test.employee.${Date.now()}@company.com`,
        jobTitle: 'Software Developer',
        departmentId: 'dept-1',
        isActive: true,
        hireDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const createdEmployee = await employeeService.createEmployee(testEmployee);
      updateTestResult('Create Test Employee', 'success', createdEmployee);
    } catch (err: any) {
      updateTestResult('Create Test Employee', 'error', null, err.message);
    }
  };

  const testCreateDepartment = async () => {
    updateTestResult('Create Test Department', 'loading');
    try {
      const testDepartment = {
        name: `Test Department ${Date.now()}`,
        description: 'A test department for system testing',
        managerId: 'manager-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const createdDepartment = await employeeService.createDepartment(testDepartment);
      updateTestResult('Create Test Department', 'success', createdDepartment);
    } catch (err: any) {
      updateTestResult('Create Test Department', 'error', null, err.message);
    }
  };

  const renderTestResult = (result: TestResult) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'success': return 'success';
        case 'error': return 'error';
        case 'loading': return 'info';
        default: return 'default';
      }
    };

    return (
      <Accordion key={result.name}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">{result.name}</Typography>
            <Chip 
              label={result.status} 
              color={getStatusColor(result.status) as any}
              size="small"
            />
            {result.status === 'loading' && <CircularProgress size={16} />}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {result.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {result.error}
            </Alert>
          )}
          {result.data && (
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" gutterBottom>
                Data:
              </Typography>
              <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </Paper>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              System Structure Test Page
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Test and understand the employee-manager-HR relationships and system functionality.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Control Panel */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <SecurityIcon sx={{ mr: 1 }} />
                    Test Controls
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Run tests to understand the system structure and relationships.
                  </Typography>
                </CardContent>
                <CardActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={runAllTests}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
                  >
                    {loading ? 'Running Tests...' : 'Run All Tests'}
                  </Button>
                  <Divider sx={{ width: '100%', my: 1 }} />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={testCreateEmployee}
                    startIcon={<PersonIcon />}
                  >
                    Test Create Employee
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={testCreateDepartment}
                    startIcon={<BusinessIcon />}
                  >
                    Test Create Department
                  </Button>
                </CardActions>
              </Card>

              {/* Current User Info */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <PersonIcon sx={{ mr: 1 }} />
                    Current User
                  </Typography>
                  {currentUser ? (
                    <List dense>
                      <ListItem>
                        <ListItemText primary="ID" secondary={currentUser.id} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Name" secondary={`${currentUser.firstName} ${currentUser.lastName}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Email" secondary={currentUser.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Role" secondary={currentUser.role} />
                      </ListItem>
                    </List>
                  ) : (
                    <Typography color="text.secondary">No user logged in</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Test Results */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <GroupIcon sx={{ mr: 1 }} />
                  Test Results
                </Typography>
                {testResults.length === 0 ? (
                  <Alert severity="info">
                    Click "Run All Tests" to start testing the system functionality.
                  </Alert>
                ) : (
                  <Box>
                    {testResults.map(renderTestResult)}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Instructions */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 How to Test the System
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>1. Understanding Relationships:</strong>
                </Typography>
                <List dense>
                  <ListItem>• Employees have managers (managerId field)</ListItem>
                  <ListItem>• Departments have heads (head_id field)</ListItem>
                  <ListItem>• Roles are assigned via RBAC system</ListItem>
                  <ListItem>• HR admins can manage all employees</ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>2. Testing Feedback:</strong>
                </Typography>
                <List dense>
                  <ListItem>• Create employees first</ListItem>
                  <ListItem>• Assign manager relationships</ListItem>
                  <ListItem>• Test feedback between employees</ListItem>
                  <ListItem>• Verify role-based permissions</ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 