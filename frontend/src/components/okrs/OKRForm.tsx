import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  Paper,
  Chip,
} from '@mui/material';
import { OKR } from '@/types/okr';

interface OKRFormProps {
  okr?: OKR;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface KeyResult {
  id: number;
  title: string;
  description: string;
}

const OKRForm: React.FC<OKRFormProps> = ({ okr, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: okr?.title || '',
    description: okr?.description || '',
    level: okr?.level || 'individual',
    status: okr?.status || 'not_started',
    tags: okr?.tags || [],
    keyResults: [] as KeyResult[],
  });

  const [newTag, setNewTag] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddKeyResult = () => {
    setFormData((prev) => ({
      ...prev,
      keyResults: [...prev.keyResults, { id: Date.now(), title: '', description: '' }],
    }));
  };

  const handleRemoveKeyResult = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyResults: prev.keyResults.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              OKR Details
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={formData.level}
                onChange={(e) => handleChange('level', e.target.value)}
                label="Level"
                required
              >
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="company">Company</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                label="Status"
                required
              >
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Tags Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button onClick={handleAddTag} variant="outlined" size="small">
                Add Tag
              </Button>
            </Box>
          </Grid>

          {/* Key Results Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Key Results
            </Typography>
            {formData.keyResults.map((kr, index) => (
              <Box key={kr.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Key Result {index + 1}
                </Typography>
                <TextField
                  fullWidth
                  label="Title"
                  value={kr.title}
                  onChange={(e) => {
                    const newKeyResults = [...formData.keyResults];
                    newKeyResults[index] = { ...kr, title: e.target.value };
                    handleChange('keyResults', newKeyResults);
                  }}
                  sx={{ mb: 1 }}
                />
                <Button
                  onClick={() => handleRemoveKeyResult(index)}
                  color="error"
                  size="small"
                  aria-label="delete"
                >
                  Delete
                </Button>
              </Box>
            ))}
            <Button onClick={handleAddKeyResult} variant="outlined">
              Add Key Result
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={onCancel} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {okr ? 'Update OKR' : 'Create OKR'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default OKRForm; 