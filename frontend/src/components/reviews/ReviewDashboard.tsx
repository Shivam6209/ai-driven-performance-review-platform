import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export interface ReviewMetric {
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  description: string;
}

export interface ReviewStatus {
  completed: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
  total: number;
}

export interface DepartmentMetrics {
  name: string;
  completionRate: number;
  averageScore: number;
  participantCount: number;
}

export interface ReviewInsight {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
  metric?: string;
  change?: number;
}

interface ReviewDashboardProps {
  metrics: ReviewMetric[];
  status: ReviewStatus;
  departmentMetrics: DepartmentMetrics[];
  insights: ReviewInsight[];
  onExportReport?: () => void;
}

/**
 * ReviewDashboard Component
 * 
 * Displays review cycle analytics and insights
 */
export const ReviewDashboard: React.FC<ReviewDashboardProps> = ({
  metrics,
  status,
  departmentMetrics,
  insights,
  onExportReport,
}) => {
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getStatusColor = (type: string): string => {
    switch (type) {
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

  const getInsightColor = (type: string): string => {
    switch (type) {
      case 'positive':
        return '#4CAF50';
      case 'negative':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Review Analytics
        </Typography>
        {onExportReport && (
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={onExportReport}
          >
            Export Report
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {metric.label}
                  </Typography>
                  <Tooltip title={metric.description}>
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="h4" sx={{ my: 1 }}>
                  {metric.value}
                  <Typography component="span" variant="body2" color="text.secondary">
                    {metric.unit}
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {calculatePercentageChange(metric.value, metric.previousValue) > 0 ? (
                    <TrendingUpIcon color="success" />
                  ) : (
                    <TrendingDownIcon color="error" />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    vs previous cycle
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Status
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Progress
                  </Typography>
                  <Typography variant="body2">
                    {((status.completed / status.total) * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(status.completed / status.total) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon color="success" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                      <Typography variant="h6">
                        {status.completed}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                      <Typography variant="h6">
                        {status.inProgress}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon color="disabled" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Not Started
                      </Typography>
                      <Typography variant="h6">
                        {status.notStarted}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Overdue
                      </Typography>
                      <Typography variant="h6">
                        {status.overdue}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Performance
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {departmentMetrics.map((dept) => (
                  <Box key={dept.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {dept.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dept.participantCount} participants
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={dept.completionRate}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2">
                        {dept.averageScore.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Key Insights
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {insights.map((insight, index) => (
              <Chip
                key={index}
                label={insight.message}
                color={insight.type === 'positive' ? 'success' : insight.type === 'negative' ? 'error' : 'default'}
                sx={{
                  backgroundColor: getInsightColor(insight.type),
                  color: 'white',
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReviewDashboard; 