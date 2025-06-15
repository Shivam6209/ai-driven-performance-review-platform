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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { employeeService } from '@/services/employeeService';
import { Employee, UserRole } from '@/types';

/**
 * Employee Management Page
 * 
 * Displays a list of employees with search, pagination, and CRUD operations
 */
export default function EmployeesPage(): JSX.Element {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Load employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployees({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
      });
      
      setEmployees(response.data.employees);
      setTotalCount(response.data.total);
      setError('');
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
      case 'hr_admin':
        return 'error';
      case 'manager':
        return 'primary';
      case 'executive':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Format role display
  const formatRole = (role: string): string => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <ProtectedRoute requiredRoles={['hr_admin', 'manager'] as UserRole[]}>
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" component="h1">
                Employee Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                href="/employees/new"
              >
                Add Employee
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Search */}
            <Box mb={3}>
              <TextField
                fullWidth
                placeholder="Search employees..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Employee Table */}
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((employee) => (
                        <TableRow key={employee.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                src={employee.profileImageUrl}
                                alt={`${employee.firstName} ${employee.lastName}`}
                              >
                                <PersonIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">
                                  {employee.firstName} {employee.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {employee.id.slice(0, 8)}...
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={formatRole(employee.role)}
                              color={getRoleColor(employee.role)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {employee.departmentId || 'Not assigned'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={employee.isActive ? 'Active' : 'Inactive'}
                              color={employee.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={(e) => handleMenuClick(e, employee)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Box>
        </Container>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedEmployee?.firstName} {selectedEmployee?.lastName}?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </ProtectedRoute>
  );
} 