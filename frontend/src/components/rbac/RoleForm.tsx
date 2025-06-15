import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Role, Permission, CreateRoleDto, UpdateRoleDto } from '../../types/rbac';
import { RbacService } from '../../services/rbac.service';

interface RoleFormProps {
  roleId?: string; // If provided, we're editing an existing role
}

const RoleForm: React.FC<RoleFormProps> = ({ roleId }) => {
  const isEditMode = !!roleId;
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<CreateRoleDto | UpdateRoleDto>({
    name: '',
    description: '',
    permissionIds: [],
    parentRoleId: undefined,
  });
  
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all permissions
        const permissionsData = await RbacService.getAllPermissions();
        setPermissions(permissionsData);
        
        // Fetch all roles for parent role selection
        const rolesData = await RbacService.getAllRoles();
        setRoles(rolesData);
        
        // If editing, fetch the role data
        if (isEditMode && roleId) {
          const roleData = await RbacService.getRoleById(roleId);
          setFormData({
            name: roleData.name,
            description: roleData.description || '',
            permissionIds: roleData.permissions.map((p) => p.id),
            parentRoleId: roleData.parent_role_id,
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        enqueueSnackbar('Failed to load data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [roleId, isEditMode, enqueueSnackbar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParentRoleChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    setFormData((prev) => ({ ...prev, parentRoleId: value === 'none' ? undefined : value }));
  };

  const handlePermissionsChange = (_event: React.SyntheticEvent, values: Permission[]) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: values.map((p) => p.id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (isEditMode && roleId) {
        await RbacService.updateRole(roleId, formData as UpdateRoleDto);
        enqueueSnackbar('Role updated successfully', { variant: 'success' });
      } else {
        await RbacService.createRole(formData as CreateRoleDto);
        enqueueSnackbar('Role created successfully', { variant: 'success' });
      }
      
      navigate('/admin/roles');
    } catch (error) {
      console.error('Failed to save role:', error);
      enqueueSnackbar('Failed to save role', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Get selected permissions objects from IDs
  const selectedPermissions = permissions.filter((p) =>
    formData.permissionIds?.includes(p.id)
  );

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEditMode ? 'Edit Role' : 'Create Role'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                multiline
                rows={3}
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="parent-role-label">Parent Role</InputLabel>
                <Select
                  labelId="parent-role-label"
                  value={formData.parentRoleId || 'none'}
                  onChange={handleParentRoleChange}
                  disabled={submitting}
                  label="Parent Role"
                >
                  <MenuItem value="none">None</MenuItem>
                  {roles
                    .filter((r) => r.id !== roleId) // Exclude current role to prevent circular reference
                    .map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                id="permissions"
                options={permissions}
                value={selectedPermissions}
                getOptionLabel={(option) => option.name}
                onChange={handlePermissionsChange}
                renderInput={(params) => (
                  <TextField {...params} label="Permissions" placeholder="Select permissions" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      size="small"
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/roles')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Saving...
                    </>
                  ) : isEditMode ? (
                    'Update Role'
                  ) : (
                    'Create Role'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default RoleForm; 