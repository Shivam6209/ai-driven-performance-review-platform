import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { RbacService } from '../../services/rbac.service';
import { Role } from '../../types/rbac';

const RolesList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
                      const response = await RbacService.getAllRoles();
        setRoles(response);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
              await RbacService.deleteRole(selectedRole.id);
      setRoles(roles.filter(role => role.id !== selectedRole.id));
      setDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return <Typography>Loading roles...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Roles Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* Handle add role */}}
        >
          Add Role
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Chip key={permission.id} label={permission.name} size="small" />
                        ))}
                        {role.permissions.length > 3 && (
                          <Chip label={`+${role.permissions.length - 3} more`} size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.is_system_role ? 'System' : 'Custom'}
                        color={role.is_system_role ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => {/* Handle edit */}}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => openDeleteDialog(role)}>
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

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the role "{selectedRole?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteRole} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesList;
