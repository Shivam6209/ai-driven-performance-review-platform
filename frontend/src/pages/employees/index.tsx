import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { employeeService } from '@/services/employeeService';
import { Employee as MainEmployee, UserRole } from '@/types';
import { useAuth } from '../../contexts/AuthContext';
import { employeesService, Employee } from '../../services/employees.service';
import { departmentsService, Department } from '../../services/departments.service';

/**
 * Employee Management Page
 * 
 * Displays a list of employees with search, pagination, and CRUD operations
 */
export default function EmployeesPage(): JSX.Element {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Assignment dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Show loading if user is not available yet
  if (!user) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  // Employee role should not have access to this page
  if (isEmployee) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <Alert severity="warning">
              Access denied. This page is only available to Admin, HR, and Manager roles.
            </Alert>
          </Box>
        </Container>
      </Layout>
    );
  }

  // Load employees based on role
  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      // Use the employeesService which has role-based filtering
      const employeesData = await employeesService.getAll();
      
      // Filter based on role and business logic
      let filteredEmployees = employeesData;
      
      if (isAdmin) {
        // Admin: All users from organization except admin users
        filteredEmployees = employeesData.filter(emp => emp.role !== 'admin');
      } else if (isHR || isManager) {
        // HR/Manager: Only employees from their assigned departments
        // Backend should already filter this, but we ensure it here
        filteredEmployees = employeesData.filter(emp => emp.role !== 'admin');
      }
      
      // Apply search filter
      if (searchTerm) {
        filteredEmployees = filteredEmployees.filter(emp => 
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setEmployees(filteredEmployees);
      setTotalCount(filteredEmployees.length);
      setError('');

      // Load unassigned employees ONLY for Admin
      if (isAdmin) {
        const unassignedData = await employeesService.getUnassigned();
        // Filter out admin users from unassigned list
        const filteredUnassigned = unassignedData.filter(emp => emp.role !== 'admin');
        setUnassignedEmployees(filteredUnassigned);
      } else {
        // HR and Manager don't need unassigned employees
        setUnassignedEmployees([]);
      }

      // Load departments for assignment dialog
      try {
        const departmentsData = await departmentsService.getAll();
        setDepartments(departmentsData);
      } catch (deptErr) {
        console.warn('Failed to load departments:', deptErr);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, rowsPerPage, searchTerm]);

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle menu actions
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, employee: Employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleEdit = () => {
    if (selectedEmployee) {
      // Navigate to edit page
      window.location.href = `/employees/${selectedEmployee.id}/edit`;
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedEmployee) {
      try {
        await employeeService.deleteEmployee(selectedEmployee.id);
        setDeleteDialogOpen(false);
        setSelectedEmployee(null);
        loadEmployees(); // Reload the list
      } catch (err: any) {
        setError(err.message || 'Failed to delete employee');
      }
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedEmployee(null);
  };

  // Get role color
  const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (role) {
      case 'admin': return 'error';
      case 'hr': return 'warning';
      case 'manager': return 'info';
      case 'employee': return 'success';
      default: return 'default';
    }
  };

  // Format role display
  const formatRole = (role: string): string => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAssignDepartment = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedDepartment('');
    setAssignDialogOpen(true);
  };

  const handleRemoveFromDepartment = async (employeeId: string) => {
    try {
      await employeesService.removeFromDepartment(employeeId);
      setSuccess('Employee removed from department successfully');
      loadEmployees();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove employee from department');
    }
  };

  const handleConfirmAssignment = async () => {
    if (!selectedEmployee) return;

    // Validation: Manager and Employee can only be assigned to one department
    if (selectedEmployee.role === 'manager' || selectedEmployee.role === 'employee') {
      if (selectedEmployee.department && selectedDepartment) {
        setError('Managers and Employees can only be assigned to one department. Please remove from current department first.');
        return;
      }
    }

    try {
      await employeesService.assignDepartment({
        employeeId: selectedEmployee.id,
        departmentId: selectedDepartment || undefined,
      });

      setSuccess(
        selectedDepartment 
          ? 'Employee assigned to department successfully'
          : 'Employee removed from department successfully'
      );
      
      setAssignDialogOpen(false);
      setSelectedEmployee(null);
      setSelectedDepartment('');
      loadEmployees();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign employee');
    }
  };

  const getStats = () => {
    // Admin users are already filtered out in loadEmployees
    const assignedCount = employees.filter(emp => emp.department).length;
    const unassignedCount = unassignedEmployees.length;
    const totalCount = assignedCount + unassignedCount;

    return { assignedCount, unassignedCount, totalCount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Layout>
        <Typography>Loading...</Typography>
      </Layout>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'hr', 'manager'] as UserRole[]}>
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Employee Management
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6">{stats.totalCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Employees
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 2, color: 'success.main' }} />
                    <Box>
                      <Typography variant="h6">{stats.assignedCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Assigned to Departments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonRemoveIcon sx={{ mr: 2, color: 'warning.main' }} />
                    <Box>
                      <Typography variant="h6">{stats.unassignedCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs for Admin to separate assigned and unassigned employees */}
          {isAdmin && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label={`Assigned Employees (${stats.assignedCount})`} />
                <Tab label={`Unassigned Employees (${stats.unassignedCount})`} />
              </Tabs>
            </Box>
          )}

          {/* Assigned Employees Tab */}
          <TabPanel value={tabValue} index={0}>
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={formatRole(employee.role)}
                            color={getRoleColor(employee.role) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {employee.department ? (
                            <Chip
                              label={employee.department.name}
                              variant="outlined"
                              size="small"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No Department
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.isActive ? 'Active' : 'Inactive'}
                            color={employee.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {(isAdmin || isHR || isManager) && (
                            <>
                              <Tooltip title="Assign/Change Department">
                                <IconButton
                                  size="small"
                                  onClick={() => handleAssignDepartment(employee)}
                                >
                                  <PersonAddIcon />
                                </IconButton>
                              </Tooltip>
                              {employee.department && (isAdmin || isHR || isManager) && (
                                <Tooltip title="Remove from Department">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveFromDepartment(employee.id)}
                                    color="error"
                                  >
                                    <PersonRemoveIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </TabPanel>

          {/* Unassigned Employees Tab - Only for Admin */}
          {isAdmin && (
            <TabPanel value={tabValue} index={1}>
              <Paper>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unassignedEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            {employee.firstName} {employee.lastName}
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={formatRole(employee.role)}
                              color={getRoleColor(employee.role) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={employee.isActive ? 'Active' : 'Inactive'}
                              color={employee.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Assign to Department">
                              <IconButton
                                size="small"
                                onClick={() => handleAssignDepartment(employee)}
                                color="primary"
                              >
                                <PersonAddIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </TabPanel>
          )}

          {/* Assignment Dialog */}
          <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {selectedEmployee?.department ? 'Change Department' : 'Assign to Department'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Employee: {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                </Typography>
                {selectedEmployee?.department && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Department: {selectedEmployee.department.name}
                  </Typography>
                )}
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    label="Department"
                  >
                    <MenuItem value="">
                      <em>Remove from Department</em>
                    </MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmAssignment} variant="contained">
                {selectedDepartment ? 'Assign' : 'Remove'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
} 