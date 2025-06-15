import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  ArrowUpward as ArrowUpwardIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { OKR } from '@/types/okr';
import { OKRProgress } from './OKRProgress';

interface OKRDetailProps {
  okr: OKR;
  onEdit: () => void;
  onAddUpdate: () => void;
}

/**
 * OKRDetail Component
 * 
 * Displays detailed information about a selected OKR
 */
const OKRDetail: React.FC<OKRDetailProps> = ({ okr, onEdit, onAddUpdate }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (): string => {
    const now = new Date();
    const dueDate = new Date(okr.due_date);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="h6">OKR Details</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          Edit
        </Button>
      </Box>
      <Divider />
      
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mr: 2 }}>
            <OKRProgress value={okr.progress} size={64} showLabel={true} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {okr.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {okr.description}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Start Date
            </Typography>
            <Typography variant="body2">
              {formatDate(okr.start_date)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Due Date
            </Typography>
            <Typography variant="body2">
              {formatDate(okr.due_date)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Time Remaining
            </Typography>
            <Typography variant="body2" color={
              okr.status === 'overdue' ? 'error.main' : 
              okr.status === 'completed' ? 'success.main' : 'inherit'
            }>
              {okr.status === 'completed' ? 'Completed' : getTimeRemaining()}
            </Typography>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Priority
            </Typography>
            <Chip 
              label={okr.priority} 
              size="small" 
              sx={{ textTransform: 'capitalize' }} 
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip 
              label={okr.status} 
              size="small" 
              sx={{ textTransform: 'capitalize' }} 
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {okr.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
        
        {okr.parent_okr && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Parent OKR
            </Typography>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1 }}>
                  <OKRProgress value={okr.parent_okr.progress} size={32} showLabel={false} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {okr.parent_okr.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {okr.parent_okr.employee.name} • {okr.parent_okr.level}
                  </Typography>
                </Box>
                <Tooltip title="View Parent OKR">
                  <IconButton size="small">
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">Progress Updates</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddUpdate}
            >
              Add Update
            </Button>
          </Box>
          
          {okr.updates && okr.updates.length > 0 ? (
            okr.updates.map((update, index) => (
              <Paper 
                key={index} 
                variant="outlined" 
                sx={{ p: 1.5, mb: 1, borderLeft: '4px solid', borderLeftColor: 'primary.main' }}
              >
                <Typography variant="body2">{update.content}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {okr.employee.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(update.created_at)}
                  </Typography>
                </Box>
              </Paper>
            ))
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                No updates yet
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={onAddUpdate}
                sx={{ mt: 1 }}
              >
                Add First Update
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default OKRDetail; 