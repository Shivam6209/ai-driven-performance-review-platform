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
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  VpnKey as PermissionIcon,
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { RbacService } from '../../services/rbac.service';
import { employeeService } from '../../services/employeeService';
import { Role, Permission, RoleAssignment, CreateRoleDto, AssignRoleDto } from '../../types/rbac';
import { Employee } from '../../types/employee';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// Define all permissions used in the backend based on the controllers
const ALL_BACKEND_PERMISSIONS = [
  // Reviews permissions
  { resource: 'reviews', action: 'create', description: 'Create performance reviews' },
  { resource: 'reviews', action: 'read', description: 'Read performance reviews' },
  { resource: 'reviews', action: 'update', description: 'Update performance reviews' },
  { resource: 'reviews', action: 'delete', description: 'Delete performance reviews' },
  { resource: 'reviews', action: 'approve', description: 'Approve performance reviews' },
  
  // Review Cycles permissions
  { resource: 'review_cycles', action: 'create', description: 'Create review cycles' },
  { resource: 'review_cycles', action: 'read', description: 'Read review cycles' },
  { resource: 'review_cycles', action: 'update', description: 'Update review cycles' },
  
  // Review Templates permissions
  { resource: 'review_templates', action: 'create', description: 'Create review templates' },
  { resource: 'review_templates', action: 'read', description: 'Read review templates' },
  { resource: 'review_templates', action: 'update', description: 'Update review templates' },
  
  // Review Sections permissions
  { resource: 'review_sections', action: 'create', description: 'Create review sections' },
  { resource: 'review_sections', action: 'read', description: 'Read review sections' },
  { resource: 'review_sections', action: 'update', description: 'Update review sections' },
  
  // Workflow Steps permissions
  { resource: 'workflow_steps', action: 'create', description: 'Create workflow steps' },
  { resource: 'workflow_steps', action: 'read', description: 'Read workflow steps' },
  { resource: 'workflow_steps', action: 'update', description: 'Update workflow steps' },
  
  // RBAC permissions
  { resource: 'rbac', action: 'create_role', description: 'Create roles' },
  { resource: 'rbac', action: 'read_roles', description: 'Read roles' },
  { resource: 'rbac', action: 'update_role', description: 'Update roles' },
  { resource: 'rbac', action: 'delete_role', description: 'Delete roles' },
  { resource: 'rbac', action: 'create_permission', description: 'Create permissions' },
  { resource: 'rbac', action: 'assign_role', description: 'Assign roles to users' },
  { resource: 'rbac', action: 'revoke_role', description: 'Revoke roles from users' },
  { resource: 'rbac', action: 'delegate_role', description: 'Delegate roles' },
  
  // Projects permissions
  { resource: 'projects', action: 'create', description: 'Create projects' },
  { resource: 'projects', action: 'read', description: 'Read projects' },
  { resource: 'projects', action: 'update', description: 'Update projects' },
  { resource: 'projects', action: 'delete', description: 'Delete projects' },
  
  // Integrations permissions
  { resource: 'integrations', action: 'create', description: 'Create integrations' },
  { resource: 'integrations', action: 'read', description: 'Read integrations' },
  { resource: 'integrations', action: 'update', description: 'Update integrations' },
  { resource: 'integrations', action: 'delete', description: 'Delete integrations' },
  
  // Documentation permissions
  { resource: 'documentation', action: 'create', description: 'Create documentation' },
  { resource: 'documentation', action: 'read', description: 'Read documentation' },
  
  // Feedback permissions
  { resource: 'feedback', action: 'analytics', description: 'View feedback analytics' },
  
  // Compliance permissions
  { resource: 'compliance', action: 'read_audit_logs', description: 'Read audit logs' },
  { resource: 'compliance', action: 'create_retention_policy', description: 'Create retention policies' },
  { resource: 'compliance', action: 'read_retention_policies', description: 'Read retention policies' },
  { resource: 'compliance', action: 'update_retention_policy', description: 'Update retention policies' },
  { resource: 'compliance', action: 'delete_retention_policy', description: 'Delete retention policies' },
  { resource: 'compliance', action: 'generate_reports', description: 'Generate compliance reports' },
  { resource: 'compliance', action: 'execute_retention_policies', description: 'Execute retention policies' },
  
  // Analytics permissions
  { resource: 'analytics', action: 'read', description: 'Read analytics data' },
];

interface UserPermissions {
  [employeeId: string]: {
    [resource: string]: {
      [action: string]: boolean;
    };
  };
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
      id={`rbac-tabpanel-${index}`}
      aria-labelledby={`rbac-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RBACManagementPage() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeRoles, setEmployeeRoles] = useState<Record<string, RoleAssignment[]>>({});
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingPermissions, setSavingPermissions] = useState<string | null>(null);

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

  // Group backend permissions by resource
  const groupedBackendPermissions = ALL_BACKEND_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, typeof ALL_BACKEND_PERMISSIONS>);

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
      const userPerms: UserPermissions = {};
      
      for (const employee of employeesData) {
        try {
          const assignments = await RbacService.getEmployeeRoles(employee.id);
          roleAssignments[employee.id] = assignments;
          
          // Get all permissions for the user (role-based + user-specific)
          try {
            const allPermissions = await RbacService.getAllUserPermissions(employee.id);
            
            // Build user permissions map from all permissions
            userPerms[employee.id] = {};
            
            // Add role-based permissions
            allPermissions.rolePermissions.forEach(permission => {
              if (!userPerms[employee.id][permission.resource]) {
                userPerms[employee.id][permission.resource] = {};
              }
              userPerms[employee.id][permission.resource][permission.action] = true;
            });
            
            // Add/override with user-specific permissions
            allPermissions.userPermissions.forEach(permission => {
              if (!userPerms[employee.id][permission.resource]) {
                userPerms[employee.id][permission.resource] = {};
              }
              userPerms[employee.id][permission.resource][permission.action] = permission.granted;
            });
          } catch (permErr) {
            // Fallback to role-based permissions only
            userPerms[employee.id] = {};
            assignments.forEach(assignment => {
              assignment.role.permissions.forEach(permission => {
                if (!userPerms[employee.id][permission.resource]) {
                  userPerms[employee.id][permission.resource] = {};
                }
                userPerms[employee.id][permission.resource][permission.action] = true;
              });
            });
          }
        } catch (err) {
          // If we can't fetch role assignments for an employee, set empty array
          roleAssignments[employee.id] = [];
          userPerms[employee.id] = {};
        }
      }
      
      setEmployeeRoles(roleAssignments);
      setUserPermissions(userPerms);
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

  const handleUserPermissionToggle = (employeeId: string, resource: string, action: string, checked: boolean) => {
    setUserPermissions(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [resource]: {
          ...prev[employeeId]?.[resource],
          [action]: checked
        }
      }
    }));
  };

  const saveUserPermissions = async (employeeId: string) => {
    try {
      setSavingPermissions(employeeId);
      
      // Convert user permissions to the format expected by the API
      const userPerms = userPermissions[employeeId] || {};
      const permissionsToUpdate: Array<{ resource: string; action: string; granted: boolean }> = [];
      
      Object.entries(userPerms).forEach(([resource, actions]) => {
        Object.entries(actions).forEach(([action, granted]) => {
          permissionsToUpdate.push({ resource, action, granted });
        });
      });
      
      // Only send permissions that are actually granted
      const grantedPermissions = permissionsToUpdate.filter(p => p.granted);
      
      if (grantedPermissions.length > 0) {
        await RbacService.updateUserPermissions(employeeId, grantedPermissions);
      }
      
      setSuccess('User permissions updated successfully');
      
      // Reload data to reflect changes
      await loadData();
      
    } catch (err) {
      setError('Failed to save user permissions');
      console.error('Error saving user permissions:', err);
    } finally {
      setSavingPermissions(null);
    }
  };

  const getUserPermissionCount = (employeeId: string) => {
    const perms = userPermissions[employeeId] || {};
    let count = 0;
    Object.values(perms).forEach(resourcePerms => {
      count += Object.values(resourcePerms).filter(Boolean).length;
    });
    return count;
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
            {/* Modern Header */}
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
                    RBAC Management
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: 'text.secondary',
                    fontWeight: 400,
                    opacity: 0.8
                  }}>
                    Manage roles, permissions, and user access across the organization
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

            {/* Tabs */}
            <Card sx={{ borderRadius: 3, boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}` }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={(e, newValue) => setTabValue(newValue)}
                  sx={{ px: 3 }}
                >
                  <Tab 
                    icon={<SecurityIcon />} 
                    label="Role Management" 
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 600,
                      minHeight: 72,
                      '&.Mui-selected': {
                        color: 'primary.main',
                      }
                    }} 
                  />
                  <Tab 
                    icon={<PersonIcon />} 
                    label="User Permissions" 
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 600,
                      minHeight: 72,
                      '&.Mui-selected': {
                        color: 'primary.main',
                      }
                    }} 
                  />
                </Tabs>
              </Box>

              {/* Role Management Tab */}
              <TabPanel value={tabValue} index={0}>
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

                {/* User Assignments */}
                <Box sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
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
                                <Avatar
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: 'primary.main',
                                    fontWeight: 600,
                                  }}
                                >
                                  {employee.firstName?.[0]}{employee.lastName?.[0]}
                                </Avatar>
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
                </Box>
              </TabPanel>

              {/* User Permissions Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    User Permission Management
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Manage individual user permissions. Changes are applied immediately and override role-based permissions.
                  </Typography>

                  <List sx={{ width: '100%' }}>
                    {filteredEmployees.map((employee) => {
                      const permissionCount = getUserPermissionCount(employee.id);
                      return (
                        <Card key={employee.id} sx={{ mb: 2, borderRadius: 2 }}>
                          <Accordion>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{ 
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                minHeight: 80,
                              }}
                            >
                              <ListItem sx={{ p: 0 }}>
                                <ListItemAvatar>
                                  <Badge badgeContent={permissionCount} color="primary" max={99}>
                                    <Avatar
                                      sx={{
                                        width: 56,
                                        height: 56,
                                        bgcolor: 'primary.main',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                                    </Avatar>
                                  </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {employee.firstName} {employee.lastName}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        {employee.jobTitle}
                                      </Typography>
                                      <Typography variant="caption" color="primary.main">
                                        {permissionCount} permissions assigned
                                      </Typography>
                                    </Box>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={savingPermissions === employee.id ? <CircularProgress size={16} /> : <SaveIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      saveUserPermissions(employee.id);
                                    }}
                                    disabled={savingPermissions === employee.id}
                                    sx={{ borderRadius: 2, mr: 2 }}
                                  >
                                    {savingPermissions === employee.id ? 'Saving...' : 'Save Changes'}
                                  </Button>
                                </ListItemSecondaryAction>
                              </ListItem>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box sx={{ pl: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PermissionIcon color="primary" />
                                  Permissions
                                </Typography>
                                
                                {Object.entries(groupedBackendPermissions).map(([resource, resourcePermissions]) => (
                                  <Card key={resource} sx={{ mb: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                                    <CardContent sx={{ py: 2 }}>
                                      <Typography variant="subtitle2" sx={{ 
                                        fontWeight: 600, 
                                        mb: 2, 
                                        color: 'primary.main', 
                                        textTransform: 'capitalize',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }}>
                                        <SecurityIcon fontSize="small" />
                                        {resource.replace(/_/g, ' ')}
                                      </Typography>
                                      <Grid container spacing={1}>
                                        {resourcePermissions.map((permission) => {
                                          const isChecked = userPermissions[employee.id]?.[permission.resource]?.[permission.action] || false;
                                          return (
                                            <Grid item xs={12} sm={6} md={4} key={`${permission.resource}-${permission.action}`}>
                                              <FormControlLabel
                                                control={
                                                  <Checkbox
                                                    checked={isChecked}
                                                    onChange={(e) => handleUserPermissionToggle(
                                                      employee.id, 
                                                      permission.resource, 
                                                      permission.action, 
                                                      e.target.checked
                                                    )}
                                                    color="primary"
                                                  />
                                                }
                                                label={
                                                  <Tooltip title={permission.description} arrow>
                                                    <Typography variant="body2" sx={{ 
                                                      textTransform: 'capitalize',
                                                      cursor: 'help'
                                                    }}>
                                                      {permission.action.replace(/_/g, ' ')}
                                                    </Typography>
                                                  </Tooltip>
                                                }
                                              />
                                            </Grid>
                                          );
                                        })}
                                      </Grid>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        </Card>
                      );
                    })}
                  </List>
                </Box>
              </TabPanel>
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