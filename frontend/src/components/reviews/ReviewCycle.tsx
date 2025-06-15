import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export interface ReviewCycleParticipant {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  completedSteps: number;
  totalSteps: number;
}

export interface ReviewCycleData {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  participants: ReviewCycleParticipant[];
  templateId: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface ReviewCycleProps {
  cycle: ReviewCycleData;
  onEdit?: () => void;
  onArchive?: () => void;
  onViewParticipant: (participantId: string) => void;
  onSendReminder: (participantId: string) => void;
  onExportResults?: () => void;
}

/**
 * ReviewCycle Component
 * 
 * Displays review cycle information and participant progress
 */
export const ReviewCycle: React.FC<ReviewCycleProps> = ({
  cycle,
  onEdit,
  onArchive,
  onViewParticipant,
  onSendReminder,
  onExportResults,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [participantMenuAnchorEl, setParticipantMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleParticipantMenuClick = (event: React.MouseEvent<HTMLElement>, participantId: string) => {
    event.stopPropagation();
    setSelectedParticipant(participantId);
    setParticipantMenuAnchorEl(event.currentTarget);
  };

  const handleParticipantMenuClose = () => {
    setParticipantMenuAnchorEl(null);
    setSelectedParticipant(null);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'overdue':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'overdue':
        return <WarningIcon fontSize="small" color="error" />;
      default:
        return undefined;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateProgress = (): number => {
    const totalParticipants = cycle.participants.length;
    if (totalParticipants === 0) return 0;

    const completedParticipants = cycle.participants.filter(
      (p) => p.status === 'completed'
    ).length;

    return (completedParticipants / totalParticipants) * 100;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {cycle.name}
            </Typography>
            {cycle.description && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {cycle.description}
              </Typography>
            )}
          </Box>
          
          <Box>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              {onEdit && (
                <MenuItem onClick={() => { handleMenuClose(); onEdit(); }}>
                  Edit Cycle
                </MenuItem>
              )}
              {onArchive && (
                <MenuItem onClick={() => { handleMenuClose(); onArchive(); }}>
                  Archive Cycle
                </MenuItem>
              )}
              {onExportResults && (
                <MenuItem onClick={() => { handleMenuClose(); onExportResults(); }}>
                  Export Results
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Start Date
                </Typography>
                <Typography>
                  {formatDate(cycle.startDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  End Date
                </Typography>
                <Typography>
                  {formatDate(cycle.endDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Participants
                </Typography>
                <Typography>
                  {cycle.participants.length}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Progress
                </Typography>
                <Typography>
                  {calculateProgress().toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={calculateProgress()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Participants
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {cycle.participants.map((participant) => (
            <Card
              key={participant.id}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => onViewParticipant(participant.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle1">
                        {participant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {participant.department} • {participant.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={participant.status}
                      sx={{
                        backgroundColor: getStatusColor(participant.status),
                        color: 'white',
                      }}
                      icon={getStatusIcon(participant.status)}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleParticipantMenuClick(e, participant.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(participant.completedSteps / participant.totalSteps) * 100}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {participant.completedSteps} of {participant.totalSteps} steps completed
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Menu
          anchorEl={participantMenuAnchorEl}
          open={Boolean(participantMenuAnchorEl)}
          onClose={handleParticipantMenuClose}
        >
          <MenuItem
            onClick={() => {
              if (selectedParticipant) {
                onSendReminder(selectedParticipant);
              }
              handleParticipantMenuClose();
            }}
          >
            Send Reminder
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default ReviewCycle; 