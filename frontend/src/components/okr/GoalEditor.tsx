import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Chip,
  OutlinedInput,
  FormHelperText,
  Typography,
  Autocomplete,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { OKR, OKRLevel, OKRPriority, OKRStatus } from '@/types/okr';

interface GoalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (okrData: Partial<OKR>) => void;
  initialData?: OKR;
}

/**
 * GoalEditor Component
 * 
 * Modal dialog for creating or editing OKRs
 */
const GoalEditor: React.FC<GoalEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<OKR>>({
    title: '',
    description: '',
    level: 'individual' as OKRLevel,
    priority: 'medium' as OKRPriority,
    status: 'draft' as OKRStatus,
    target_value: 100,
    current_value: 0,
    unit_of_measure: 'percentage',
    weight: 1.0,
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
    tags: [],
    progress: 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Mock data - in a real app, these would come from API
  const availableTags = [
    'development', 'productivity', 'quality', 'innovation', 'customer-satisfaction',
    'growth', 'efficiency', 'learning', 'team-building', 'leadership',
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      });
      setSelectedTags(initialData.tags || []);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: 'individual' as OKRLevel,
      priority: 'medium' as OKRPriority,
      status: 'draft' as OKRStatus,
      target_value: 100,
      current_value: 0,
      unit_of_measure: 'percentage',
      weight: 1.0,
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      tags: [],
      progress: 0,
    });
    setSelectedTags([]);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Clear error when field is edited
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: date.toISOString().split('T')[0] }));
      
      // Clear error when field is edited
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleTagsChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    setSelectedTags(newValue);
    setFormData((prev) => ({ ...prev, tags: newValue }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    } else if (formData.start_date && new Date(formData.due_date) <= new Date(formData.start_date)) {
      newErrors.due_date = 'Due date must be after start date';
    }
    
    if (formData.target_value === undefined || formData.target_value <= 0) {
      newErrors.target_value = 'Target value must be greater than 0';
    }
    
    if (formData.current_value === undefined) {
      newErrors.current_value = 'Current value is required';
    }
    
    if (!formData.unit_of_measure?.trim()) {
      newErrors.unit_of_measure = 'Unit of measure is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Calculate progress based on current and target values
      const progress = Math.min(
        100,
        Math.round((formData.current_value! / formData.target_value!) * 100)
      );
      
      onSave({
        ...formData,
        progress,
        tags: selectedTags,
      });
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle>
        {initialData ? 'Edit OKR' : 'Create New OKR'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Title"
              value={formData.title || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              value={formData.description || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="level-label">Level</InputLabel>
              <Select
                labelId="level-label"
                name="level"
                value={formData.level || ''}
                onChange={handleSelectChange}
                label="Level"
              >
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="company">Company</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={formData.priority || ''}
                onChange={handleSelectChange}
                label="Priority"
              >
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status || ''}
                onChange={handleSelectChange}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="weight"
              label="Weight"
              type="number"
              value={formData.weight || ''}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 0.1, max: 1.0, step: 0.1 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="target_value"
              label="Target Value"
              type="number"
              value={formData.target_value || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.target_value}
              helperText={errors.target_value}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="current_value"
              label="Current Value"
              type="number"
              value={formData.current_value || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.current_value}
              helperText={errors.current_value}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="unit_of_measure"
              label="Unit of Measure"
              value={formData.unit_of_measure || ''}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.unit_of_measure}
              helperText={errors.unit_of_measure}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.start_date ? new Date(formData.start_date) : null}
                onChange={(date) => handleDateChange('start_date', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.start_date,
                    helperText: errors.start_date,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={formData.due_date ? new Date(formData.due_date) : null}
                onChange={(date) => handleDateChange('due_date', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.due_date,
                    helperText: errors.due_date,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={availableTags}
              value={selectedTags}
              onChange={handleTagsChange}
              freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    variant="outlined" 
                    label={option} 
                    size="small"
                    {...getTagProps({ index })} 
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags"
                  helperText="You can add custom tags or select from the list"
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalEditor; 