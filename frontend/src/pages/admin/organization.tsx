import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  Autocomplete,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';

interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  managerName?: string;
  hrIds: string[];
  hrNames: string[];
  employeeCount: number;
  createdAt: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId?: string;
  departmentName?: string;
}

const OrganizationSetupPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Form states
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
  });
  const [assignmentForm, setAssignmentForm] = useState({
    departmentId: '',
    managerId: '',
    hrIds: [] as string[],
  });

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchData();
    }
  }, [currentUser]);

  // Check if user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mt: 4 }}>
            Access denied. Only administrators can access this page.
          </Alert>
        </Container>
      </Layout>
    );
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch departments
      const deptResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartments(deptData);
      }

      // Fetch employees
      const empResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (empResponse.ok) {
        const empData = await empResponse.json();
        setEmployees(empData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(departmentForm),
      });

      if (response.ok) {
        setSuccess('Department created successfully!');
        setDepartmentDialogOpen(false);
        setDepartmentForm({ name: '', description: '' });
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create department');
      }
    } catch (error) {
      setError('Failed to create department');
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(departmentForm),
      });

      if (response.ok) {
        setSuccess('Department updated successfully!');
        setDepartmentDialogOpen(false);
        setEditingDepartment(null);
        setDepartmentForm({ name: '', description: '' });
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update department');
      }
    } catch (error) {
      setError('Failed to update department');
    }
  };

  const handleAssignRoles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/${assignmentForm.departmentId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          managerId: assignmentForm.managerId || null,
          hrIds: assignmentForm.hrIds,
        }),
      });

      if (response.ok) {
        setSuccess('Roles assigned successfully! Notifications sent to assigned users.');
        setAssignmentDialogOpen(false);
        setAssignmentForm({ departmentId: '', managerId: '', hrIds: [] });
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to assign roles');
      }
    } catch (error) {
      setError('Failed to assign roles');
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/${departmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setSuccess('Department deleted successfully!');
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete department');
      }
    } catch (error) {
      setError('Failed to delete department');
    }
  };

  const openEditDialog = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      name: department.name,
      description: department.description,
    });
    setDepartmentDialogOpen(true);
  };

  const openAssignmentDialog = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    setAssignmentForm({
      departmentId,
      managerId: dept?.managerId || '',
      hrIds: dept?.hrIds || [],
    });
    setAssignmentDialogOpen(true);
  };

  const getAvailableManagers = () => {
    return employees.filter(emp => 
      emp.role === 'manager' && 
      !departments.some(dept => dept.managerId === emp.id && dept.id !== assignmentForm.departmentId)
    );
  };

  const getAvailableHR = () => {
    return employees.filter(emp => emp.role === 'hr');
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Organization Setup
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage departments, assign managers and HR personnel
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BusinessIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {departments.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Departments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PeopleIcon color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {employees.filter(e => e.role === 'manager').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Managers
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon color="warning" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {employees.filter(e => e.role === 'hr').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        HR Personnel
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PeopleIcon color="info" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {employees.filter(e => e.role === 'employee').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Employees
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Departments Table */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Departments
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDepartmentDialogOpen(true)}
                >
                  Create Department
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Manager</TableCell>
                      <TableCell>HR Personnel</TableCell>
                      <TableCell>Employees</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {department.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {department.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {department.managerName ? (
                            <Chip
                              label={department.managerName}
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              Not assigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {department.hrNames.length > 0 ? (
                              department.hrNames.map((name, index) => (
                                <Chip
                                  key={index}
                                  label={name}
                                  color="warning"
                                  size="small"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.disabled">
                                Not assigned
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {department.employeeCount} employees
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => openAssignmentDialog(department.id)}
                            title="Assign Roles"
                          >
                            <NotificationsIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(department)}
                            title="Edit Department"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteDepartment(department.id)}
                            title="Delete Department"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Create/Edit Department Dialog */}
          <Dialog open={departmentDialogOpen} onClose={() => setDepartmentDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editingDepartment ? 'Edit Department' : 'Create New Department'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  label="Department Name"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Description"
                  value={departmentForm.description}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDepartmentDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
                variant="contained"
              >
                {editingDepartment ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Assignment Dialog */}
          <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Assign Roles to Department</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Manager</InputLabel>
                  <Select
                    value={assignmentForm.managerId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, managerId: e.target.value })}
                    label="Manager"
                  >
                    <MenuItem value="">
                      <em>No Manager</em>
                    </MenuItem>
                    {getAvailableManagers().map((manager) => (
                      <MenuItem key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName} ({manager.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Autocomplete
                  multiple
                  options={getAvailableHR()}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                  value={getAvailableHR().filter(hr => assignmentForm.hrIds.includes(hr.id))}
                  onChange={(_, newValue) => {
                    setAssignmentForm({ ...assignmentForm, hrIds: newValue.map(hr => hr.id) });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="HR Personnel"
                      placeholder="Select HR personnel"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={`${option.firstName} ${option.lastName}`}
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                />

                <Alert severity="info">
                  <Typography variant="body2">
                    • One manager can only be assigned to one department<br/>
                    • HR personnel can be assigned to multiple departments<br/>
                    • Assigned users will receive notifications about their new responsibilities
                  </Typography>
                </Alert>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignRoles} variant="contained">
                Assign Roles
              </Button>
            </DialogActions>
          </Dialog>

          {/* Success/Error Snackbars */}
          <Snackbar
            open={!!success}
            autoHideDuration={6000}
            onClose={() => setSuccess(null)}
          >
            <Alert onClose={() => setSuccess(null)} severity="success">
              {success}
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
          >
            <Alert onClose={() => setError(null)} severity="error">
              {error}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </Layout>
  );
};

export default OrganizationSetupPage; 