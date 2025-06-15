import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  IconButton,
  Divider,
  Alert,
  Skeleton,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import DoneIcon from '@mui/icons-material/Done';
import { sentimentService, SentimentAlert } from '@/services/sentiment.service';

interface BiasAlertsPanelProps {
  employeeId?: string;
  onlyUnacknowledged?: boolean;
  maxAlerts?: number;
  onAlertClick?: (alert: SentimentAlert) => void;
}

const BiasAlertsPanel: React.FC<BiasAlertsPanelProps> = ({
  employeeId,
  onlyUnacknowledged = true,
  maxAlerts: initialMaxAlerts = 5,
  onAlertClick,
}) => {
  const [alerts, setAlerts] = useState<SentimentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<SentimentAlert | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(initialMaxAlerts);

  useEffect(() => {
    fetchAlerts();
  }, [employeeId, onlyUnacknowledged]);

  const fetchAlerts = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    setError(null);

    try {
      const fetchedAlerts = await sentimentService.getSentimentAlerts(employeeId, onlyUnacknowledged);
      setAlerts(fetchedAlerts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await sentimentService.acknowledgeAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err: any) {
      setError(err.message || 'Failed to acknowledge alert');
    }
  };

  const handleAlertClick = (alert: SentimentAlert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
    if (onAlertClick) {
      onAlertClick(alert);
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <ErrorOutlineIcon color="error" />;
      case 'medium':
        return <WarningAmberIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): "error" | "warning" | "info" | "success" => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'sentiment_shift':
        return 'Sentiment Shift';
      case 'concerning_feedback':
        return 'Concerning Feedback';
      case 'quality_drop':
        return 'Quality Drop';
      case 'bias_detected':
        return 'Bias Detected';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bias & Sentiment Alerts
          </Typography>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bias & Sentiment Alerts
          </Typography>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Bias & Sentiment Alerts
            {alerts.length > 0 && (
              <Badge
                badgeContent={alerts.length}
                color="error"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Tooltip title={onlyUnacknowledged ? "Showing unacknowledged alerts" : "Showing all alerts"}>
            <IconButton size="small" onClick={() => fetchAlerts()}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
            <Typography variant="body1" color="text.secondary">
              No alerts to display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {onlyUnacknowledged
                ? "You've acknowledged all alerts"
                : "No alerts have been generated"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {alerts.slice(0, displayCount).map((alert, index) => (
              <React.Fragment key={alert.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleAlertClick(alert)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="acknowledge"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(alert.id);
                      }}
                    >
                      <DoneIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>{getSeverityIcon(alert.severity)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" component="span">
                          {alert.message}
                        </Typography>
                        <Chip
                          label={getAlertTypeLabel(alert.type)}
                          size="small"
                          color={getSeverityColor(alert.severity)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(alert.timestamp)}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
            {alerts.length > displayCount && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button size="small" onClick={() => setDisplayCount((prev: number) => prev + 5)}>
                  Show More ({alerts.length - displayCount} remaining)
                </Button>
              </Box>
            )}
          </List>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedAlert && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getSeverityIcon(selectedAlert.severity)}
                <Typography variant="h6">
                  {getAlertTypeLabel(selectedAlert.type)}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {selectedAlert.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {formatDate(selectedAlert.timestamp)}
              </Typography>
              <Alert severity={getSeverityColor(selectedAlert.severity)} sx={{ mt: 2 }}>
                This alert was generated based on feedback analysis and may require your attention.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  handleAcknowledge(selectedAlert.id);
                  setDialogOpen(false);
                }}
              >
                Acknowledge
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
};

export default BiasAlertsPanel; 