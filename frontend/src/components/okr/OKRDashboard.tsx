import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tab,
  Tabs,
  Button,
  useTheme,
  useMediaQuery,
  Skeleton,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import OKRList from './OKRList';
import OKRDetail from './OKRDetail';
import OKRUpdateForm from './OKRUpdateForm';
import OKRProgress from './OKRProgress';
import { OKR, OKRSummary } from '@/types/okr';
import { okrService } from '@/services/okr.service';
import GoalEditor from './GoalEditor';

interface OKRDashboardSummary {
  totalOKRs: number;
  completedOKRs: number;
  averageProgress: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    draft: number;
    active: number;
    completed: number;
    cancelled: number;
    overdue: number;
  };
}

// Move styled component outside to prevent recreation on every render
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

const OKRDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOKR, setSelectedOKR] = useState<OKR | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [summary, setSummary] = useState<OKRDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch OKRs and summary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [okrsData, summaryData] = await Promise.all([
          okrService.getOKRs(),
          okrService.getOKRSummary()
        ]);
        setOkrs(okrsData);
        setSummary(summaryData);
      } catch (err) {
        console.error('Error fetching OKR data:', err);
        setError('Failed to load OKR data');
        setOkrs([]);
        setSummary({
          totalOKRs: 0,
          completedOKRs: 0,
          averageProgress: 0,
          byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
          byStatus: { draft: 0, active: 0, completed: 0, cancelled: 0, overdue: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleOKRSelect = (okr: OKR) => {
    setSelectedOKR(okr);
  };

  const handleAddOKR = () => {
    setIsEditorOpen(true);
  };

  const handleEditOKR = (okr: OKR) => {
    setSelectedOKR(okr);
    setIsEditorOpen(true);
  };

  const handleUpdateOKR = (okr: OKR) => {
    setSelectedOKR(okr);
    setIsUpdateFormOpen(true);
  };

  const handleSaveOKR = async (okrData: any) => {
    try {
      if (selectedOKR) {
        await okrService.updateOKR(selectedOKR.id, okrData);
      } else {
        await okrService.createOKR(okrData);
      }
      // Refresh data
      const [okrsData, summaryData] = await Promise.all([
        okrService.getOKRs(),
        okrService.getOKRSummary()
      ]);
      setOkrs(okrsData);
      setSummary(summaryData);
      setIsEditorOpen(false);
      setSelectedOKR(null);
    } catch (error) {
      console.error('Error saving OKR:', error);
    }
  };

  const handleSaveUpdate = async (updateData: any) => {
    try {
      if (selectedOKR) {
        await okrService.updateOKRProgress(selectedOKR.id, updateData);
        // Refresh data
        const [okrsData, summaryData] = await Promise.all([
          okrService.getOKRs(),
          okrService.getOKRSummary()
        ]);
        setOkrs(okrsData);
        setSummary(summaryData);
      }
      setIsUpdateFormOpen(false);
      setSelectedOKR(null);
    } catch (error) {
      console.error('Error saving update:', error);
    }
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedOKR(null);
  };

  const handleCloseUpdateForm = () => {
    setIsUpdateFormOpen(false);
    setSelectedOKR(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          OKR Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddOKR}
          size={isMobile ? 'small' : 'medium'}
        >
          Add OKR
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <Typography variant="h6" color="primary" gutterBottom>
              Total OKRs
            </Typography>
            <Typography variant="h3">{summary?.totalOKRs || 0}</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <Typography variant="h6" color="success.main" gutterBottom>
              Completed
            </Typography>
            <Typography variant="h3">{summary?.completedOKRs || 0}</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <Typography variant="h6" color="info.main" gutterBottom>
              Average Progress
            </Typography>
            <Typography variant="h3">{summary?.averageProgress || 0}%</Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <Typography variant="h6" color="warning.main" gutterBottom>
              Active OKRs
            </Typography>
            <Typography variant="h3">{summary?.byStatus.active || 0}</Typography>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="All OKRs" />
          <Tab label="My OKRs" />
          <Tab label="Team OKRs" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={selectedOKR ? 8 : 12}>
          {selectedTab === 0 && (
            <OKRList
              okrs={okrs}
              onSelect={handleOKRSelect}
              onEdit={handleEditOKR}
              onDelete={(id) => console.log('Delete OKR:', id)}
              onAdd={handleAddOKR}
            />
          )}
          {selectedTab === 1 && (
            <OKRList
              okrs={okrs.filter(okr => okr.employee?.id === 'current-user-id')}
              onSelect={handleOKRSelect}
              onEdit={handleEditOKR}
              onDelete={(id) => console.log('Delete OKR:', id)}
              onAdd={handleAddOKR}
            />
          )}
          {selectedTab === 2 && (
            <OKRList
              okrs={okrs}
              onSelect={handleOKRSelect}
              onEdit={handleEditOKR}
              onDelete={(id) => console.log('Delete OKR:', id)}
              onAdd={handleAddOKR}
            />
          )}
          {selectedTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                OKR Analytics
              </Typography>
              {okrs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No OKRs available for analytics
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {okrs.map((okr) => (
                    <Grid item xs={12} sm={6} key={okr.id}>
                      <OKRProgress
                        title={okr.title}
                        progress={okr.progress}
                        variant="card"
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Grid>

        {selectedOKR && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedOKR.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedOKR.description}
              </Typography>
              <OKRProgress
                title="Progress"
                progress={selectedOKR.progress}
                variant="linear"
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Dialogs */}
      {isEditorOpen && (
        <GoalEditor
          initialData={selectedOKR || undefined}
          isOpen={isEditorOpen}
          onSave={handleSaveOKR}
          onClose={handleCloseEditor}
        />
      )}

      {isUpdateFormOpen && selectedOKR && (
        <OKRUpdateForm
          okr={selectedOKR}
          isOpen={isUpdateFormOpen}
          onSubmit={handleSaveUpdate}
          onClose={handleCloseUpdateForm}
        />
      )}
    </Box>
  );
};

export default OKRDashboard; 