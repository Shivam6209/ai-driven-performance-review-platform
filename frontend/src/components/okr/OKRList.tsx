import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Chip,
  Paper,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { OKR, OKRPriority, OKRStatus } from '@/types/okr';
import { OKRProgress } from './OKRProgress';

interface OKRListProps {
  okrs: OKR[];
  onEdit: (okr: OKR) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSelect?: (okr: OKR) => void;
}

/**
 * OKRList Component
 * 
 * Displays a list of OKRs with their progress, status, and actions
 */
const OKRList: React.FC<OKRListProps> = ({ 
  okrs, 
  onEdit, 
  onDelete, 
  onAdd,
  onSelect 
}) => {
  const getPriorityColor = (priority: OKRPriority): string => {
    const colors: Record<OKRPriority, string> = {
      critical: '#f44336',
      high: '#ff9800',
      medium: '#2196f3',
      low: '#4caf50',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status: OKRStatus): string => {
    const colors: Record<OKRStatus, string> = {
      draft: '#9e9e9e',
      active: '#2196f3',
      completed: '#4caf50',
      cancelled: '#f44336',
      overdue: '#ff9800',
      not_started: '#9e9e9e',
      in_progress: '#2196f3',
    };
    return colors[status] || colors.active;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Objectives & Key Results</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add OKR
        </Button>
      </Box>
      <Divider />
      
      {okrs.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary" gutterBottom>
            No OKRs found
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ mt: 2 }}
          >
            Create your first OKR
          </Button>
        </Box>
      ) : (
        <List sx={{ overflow: 'auto', flexGrow: 1 }}>
          {okrs.map((okr) => (
            <React.Fragment key={okr.id}>
              <ListItem
                alignItems="flex-start"
                sx={{ 
                  cursor: onSelect ? 'pointer' : 'default',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => onSelect && onSelect(okr)}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <OKRProgress value={okr.progress} size={48} />
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mr: 1 }}>
                        {okr.title}
                      </Typography>
                      <Chip
                        label={okr.priority}
                        size="small"
                        sx={{
                          bgcolor: getPriorityColor(okr.priority),
                          color: 'white',
                          textTransform: 'capitalize',
                          mr: 1,
                        }}
                      />
                      <Chip
                        label={okr.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(okr.status),
                          color: 'white',
                          textTransform: 'capitalize',
                          mr: 1,
                        }}
                      />
                      <Chip
                        label={okr.level}
                        size="small"
                        variant="outlined"
                        sx={{
                          textTransform: 'capitalize',
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1,
                        }}
                      >
                        {okr.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Due: {formatDate(okr.due_date)}
                        </Typography>
                        {okr.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {okr.tags.slice(0, 3).map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            ))}
                            {okr.tags.length > 3 && (
                              <Chip
                                label={`+${okr.tags.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(okr);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(okr.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default OKRList; 