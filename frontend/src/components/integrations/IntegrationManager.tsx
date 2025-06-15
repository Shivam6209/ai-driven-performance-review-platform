import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
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
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Sync as SyncIcon,
  Timeline as TimelineIcon,
  Webhook as WebhookIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Integration {
  id: string;
  name: string;
  type: 'hr_system' | 'sso' | 'calendar' | 'notification' | 'webhook';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastSync?: Date;
  configuration: Record<string, any>;
  healthStatus: 'healthy' | 'warning' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationManager: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    // Mock data
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'Workday HR Integration',
        type: 'hr_system',
        provider: 'workday',
        status: 'active',
        lastSync: new Date(Date.now() - 3600000),
        configuration: { apiUrl: 'https://api.workday.com', syncInterval: 24 },
        healthStatus: 'healthy',
        createdAt: new Date(Date.now() - 86400000 * 30),
        updatedAt: new Date(Date.now() - 3600000),
      },
    ];
    setIntegrations(mockIntegrations);
  };

  const renderIntegrationCard = (integration: Integration) => (
    <Card key={integration.id} sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{integration.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {integration.provider} • {integration.type.replace('_', ' ')}
        </Typography>
        <Chip 
          label={integration.status} 
          color={integration.status === 'active' ? 'success' : 'default'}
          size="small"
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Integration Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Integration
        </Button>
      </Box>

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab 
          label={
            <Badge badgeContent={integrations.length} color="primary">
              Integrations
            </Badge>
          } 
        />
        <Tab label="Webhooks" />
        <Tab label="Logs" />
        <Tab label="Settings" />
      </Tabs>

      {selectedTab === 0 && (
        <Box>
          {integrations.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CloudIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No integrations configured
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Connect external systems to streamline your performance management workflow.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Add Your First Integration
              </Button>
            </Paper>
          ) : (
            integrations.map(renderIntegrationCard)
          )}
        </Box>
      )}

      {/* Create Integration Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Integration</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Integration creation wizard would be implemented here with step-by-step configuration.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationManager;