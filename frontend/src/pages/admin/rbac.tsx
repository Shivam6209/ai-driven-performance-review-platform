import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Grid,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { RbacService } from '../../services/rbac.service';
import { employeeService } from '../../services/employeeService';
import { Role, Permission, RoleAssignment, CreateRoleDto, AssignRoleDto } from '../../types/rbac';
import { Employee } from '../../types/employee';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function RBACManagementPage() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeRoles, setEmployeeRoles] = useState<Record<string, RoleAssignment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form states
  const [newRole, setNewRole] = useState<CreateRoleDto>({
    name: '',
    description: '',
    permissionIds: [],
  });
  const [assignRoleForm, setAssignRoleForm] = useState<AssignRoleDto>({
    employeeId: '',
    roleId: '',
  });

  // Filter employees to exclude current user
  const filteredEmployees = employees.filter(employee => {
    return employee.id !== currentUser?.employeeId && employee.id !== currentUser?.id;
  });

  // Group permissions by resource for easier management
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData, employeesData] = await Promise.all([
        RbacService.getAllRoles(),
        RbacService.getAllPermissions(),
        employeeService.getAllEmployees(),
      ]);
      
      setRoles(rolesData);
      setPermissions(permissionsData);
      setEmployees(employeesData);

      // Fetch role assignments for each employee
      const roleAssignments: Record<string, RoleAssignment[]> = {};
      for (const employee of employeesData) {
        try {
          const assignments = await RbacService.getEmployeeRoles(employee.id);
          roleAssignments[employee.id] = assignments;
        } catch (err) {
          // If we can't fetch role assignments for an employee, set empty array
          roleAssignments[employee.id] = [];
        }
      }
      setEmployeeRoles(roleAssignments);
    } catch (err) {
      setError('Failed to load RBAC data');
      console.error('Error loading RBAC data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      await RbacService.createRole(newRole);
      setSuccess('Role created successfully');
      setRoleDialogOpen(false);
      setNewRole({ name: '', description: '', permissionIds: [] });
      loadData();
    } catch (err) {
      setError('Failed to create role');
      console.error('Error creating role:', err);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    try {
      await RbacService.updateRole(editingRole.id, newRole);
      setSuccess('Role updated successfully');
      setRoleDialogOpen(false);
      setEditingRole(null);
      setNewRole({ name: '', description: '', permissionIds: [] });
      loadData();
    } catch (err) {
      setError('Failed to update role');
      console.error('Error updating role:', err);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await RbacService.deleteRole(roleId);
      setSuccess('Role deleted successfully');
      loadData();
    } catch (err) {
      setError('Failed to delete role');
      console.error('Error deleting role:', err);
    }
  };

  const handleAssignRole = async () => {
    try {
      await RbacService.assignRole(assignRoleForm);
      setSuccess('Role assigned successfully');
      setAssignRoleDialogOpen(false);
      setAssignRoleForm({ employeeId: '', roleId: '' });
      loadData();
    } catch (err) {
      setError('Failed to assign role');
      console.error('Error assigning role:', err);
    }
  };

  const openEditRoleDialog = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions.map(p => p.id),
    });
    setRoleDialogOpen(true);
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setNewRole(prev => ({
      ...prev,
      permissionIds: checked
        ? [...(prev.permissionIds || []), permissionId]
        : (prev.permissionIds || []).filter(id => id !== permissionId)
    }));
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'hr'] as UserRole[]}>
      <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Modern Header matching OKRs page */}
          <Box sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderRadius: 4,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%), 
                          radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
              zIndex: 0,
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  mb: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}>
                  Role Management
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  opacity: 0.8
                }}>
                  Manage user roles and permissions across the organization
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => setAssignRoleDialogOpen(true)}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Assign Role
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRole(null);
                    setNewRole({ name: '', description: '', permissionIds: [] });
                    setRoleDialogOpen(true);
                  }}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.5)}`,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Create Role
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.2)}`,
              }} 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Roles Table */}
          <Card sx={{ borderRadius: 3, boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}` }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Role Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Permissions</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {role.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {role.description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {role.permissions.slice(0, 3).map((permission) => (
                              <Chip
                                key={permission.id}
                                label={permission.action}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ borderRadius: 2 }}
                              />
                            ))}
                            {role.permissions.length > 3 && (
                              <Chip
                                label={`+${role.permissions.length - 3} more`}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={role.is_system_role ? 'System' : 'Custom'}
                            color={role.is_system_role ? 'default' : 'primary'}
                            size="small"
                            sx={{ borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              onClick={() => openEditRoleDialog(role)}
                              color="primary"
                              size="small"
                              sx={{ borderRadius: 2 }}
                            >
                              <EditIcon />
                            </IconButton>
                            {!role.is_system_role && (
                              <IconButton
                                onClick={() => handleDeleteRole(role.id)}
                                color="error"
                                size="small"
                                sx={{ borderRadius: 2 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* User Assignments */}
          <Card sx={{ mt: 4, borderRadius: 3, boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}` }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                User Role Assignments
              </Typography>
              <Grid container spacing={3}>
                {filteredEmployees.map((employee) => {
                  const assignments = employeeRoles[employee.id] || [];
                  return (
                    <Grid item xs={12} md={6} lg={4} key={employee.id}>
                      <Card sx={{ 
                        height: '100%', 
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        '&:hover': {
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            >
                              {employee.firstName?.[0]}{employee.lastName?.[0]}
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {employee.firstName} {employee.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {employee.jobTitle}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Assigned Roles:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {assignments.length > 0 ? (
                              assignments.map((assignment) => (
                                <Chip 
                                  key={assignment.id}
                                  label={assignment.role.name} 
                                  size="small" 
                                  color="primary" 
                                  sx={{ borderRadius: 2 }} 
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No roles assigned
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Create/Edit Role Dialog */}
        <Dialog
          open={roleDialogOpen}
          onClose={() => setRoleDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            fontWeight: 700,
            fontSize: '1.5rem'
          }}>
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={newRole.name}
              onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newRole.description}
              onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Permissions
            </Typography>
            
            {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
              <Card key={resource} sx={{ mb: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', textTransform: 'capitalize' }}>
                    {resource}
                  </Typography>
                  <Grid container spacing={1}>
                    {resourcePermissions.map((permission) => (
                      <Grid item xs={6} sm={4} key={permission.id}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={newRole.permissionIds?.includes(permission.id) || false}
                              onChange={(e) => handlePermissionToggle(permission.id, e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {permission.action}
                            </Typography>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button onClick={() => setRoleDialogOpen(false)} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              onClick={editingRole ? handleUpdateRole : handleCreateRole}
              variant="contained"
              sx={{ borderRadius: 2, px: 3 }}
            >
              {editingRole ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Role Dialog */}
        <Dialog
          open={assignRoleDialogOpen}
          onClose={() => setAssignRoleDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            fontWeight: 700,
            fontSize: '1.5rem'
          }}>
            Assign Role to User
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Employee</InputLabel>
              <Select
                value={assignRoleForm.employeeId}
                onChange={(e) => setAssignRoleForm(prev => ({ ...prev, employeeId: e.target.value }))}
                label="Employee"
                disabled={loading || filteredEmployees.length === 0}
              >
                {loading ? (
                  <MenuItem disabled>Loading employees...</MenuItem>
                ) : filteredEmployees.length === 0 ? (
                  <MenuItem disabled>No employees available</MenuItem>
                ) : (
                  filteredEmployees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} - {employee.jobTitle}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={assignRoleForm.roleId}
                onChange={(e) => setAssignRoleForm(prev => ({ ...prev, roleId: e.target.value }))}
                label="Role"
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button onClick={() => setAssignRoleDialogOpen(false)} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button onClick={handleAssignRole} variant="contained" sx={{ borderRadius: 2, px: 3 }}>
              Assign Role
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ borderRadius: 2 }}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
    </ProtectedRoute>
  );
} 