import React, { useState } from 'react';
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
  Typography,
  Slider,
  SelectChangeEvent,
} from '@mui/material';
import { OKR, OKRUpdate } from '@/types/okr';

interface OKRUpdateFormProps {
  okr: OKR;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updateData: Partial<OKRUpdate>) => void;
}

/**
 * OKRUpdateForm Component
 * 
 * Dialog form for adding updates to an OKR
 */
const OKRUpdateForm: React.FC<OKRUpdateFormProps> = ({
  okr,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [updateType, setUpdateType] = useState<'progress' | 'status' | 'note'>('progress');
  const [newProgress, setNewProgress] = useState<number>(okr.progress);
  const [newStatus, setNewStatus] = useState<string>(okr.status);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdateTypeChange = (event: SelectChangeEvent) => {
    setUpdateType(event.target.value as 'progress' | 'status' | 'note');
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setNewStatus(event.target.value);
  };

  const handleProgressChange = (_event: Event, value: number | number[]) => {
    setNewProgress(value as number);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!content.trim()) {
      newErrors.content = 'Update content is required';
    }
    
    if (updateType === 'progress' && (newProgress < 0 || newProgress > 100)) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }
    
    if (updateType === 'status' && !newStatus) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const updateData: Partial<OKRUpdate> = {
        content,
        update_type: updateType,
      };
      
      if (updateType === 'progress') {
        updateData.old_value = okr.progress.toString();
        updateData.new_value = newProgress.toString();
      } else if (updateType === 'status') {
        updateData.old_value = okr.status;
        updateData.new_value = newStatus;
      }
      
      onSubmit(updateData);
      resetForm();
    }
  };

  const resetForm = () => {
    setContent('');
    setUpdateType('progress');
    setNewProgress(okr.progress);
    setNewStatus(okr.status);
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Update for "{okr.title}"</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="update-type-label">Update Type</InputLabel>
              <Select
                labelId="update-type-label"
                value={updateType}
                onChange={handleUpdateTypeChange}
                label="Update Type"
              >
                <MenuItem value="progress">Progress Update</MenuItem>
                <MenuItem value="status">Status Change</MenuItem>
                <MenuItem value="note">General Note</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {updateType === 'progress' && (
            <Grid item xs={12}>
              <Typography gutterBottom>
                Current Progress: {okr.progress}%
              </Typography>
              <Typography id="progress-slider" gutterBottom>
                New Progress: {newProgress}%
              </Typography>
              <Slider
                value={newProgress}
                onChange={handleProgressChange}
                aria-labelledby="progress-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
              {errors.progress && (
                <Typography color="error" variant="caption">
                  {errors.progress}
                </Typography>
              )}
            </Grid>
          )}

          {updateType === 'status' && (
            <Grid item xs={12}>
              <Typography gutterBottom>
                Current Status: {okr.status}
              </Typography>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel id="new-status-label">New Status</InputLabel>
                <Select
                  labelId="new-status-label"
                  value={newStatus}
                  onChange={handleStatusChange}
                  label="New Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
                {errors.status && (
                  <Typography color="error" variant="caption">
                    {errors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              label="Update Details"
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              required
              error={!!errors.content}
              helperText={errors.content || 'Provide details about this update'}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OKRUpdateForm; 