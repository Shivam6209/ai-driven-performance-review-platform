import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { SentimentTrend } from '../feedback/SentimentAnalysis';
import { aiService, SentimentTrendResult } from '@/services/ai.service';
import { apiService } from '@/services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface PerformanceDashboardProps {
  employeeId?: string;
  departmentId?: string;
  isManager?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  employeeId,
  departmentId,
  isManager = false,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [timeframe, setTimeframe] = useState('12months');
  const [loading, setLoading] = useState(false);
  const [sentimentTrend, setSentimentTrend] = useState<SentimentTrendResult | null>(null);
  const [goalCompletionData, setGoalCompletionData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch real performance data from API
        const sentimentParams = new URLSearchParams();
        if (employeeId) sentimentParams.append('employeeId', employeeId);
        if (departmentId) sentimentParams.append('departmentId', departmentId);
        sentimentParams.append('timeframe', timeframe);
        
        const goalParams = new URLSearchParams();
        if (employeeId) goalParams.append('employeeId', employeeId);
        if (departmentId) goalParams.append('departmentId', departmentId);
        goalParams.append('timeframe', timeframe);
        
        const [sentimentData, goalData] = await Promise.all([
          apiService.get(`/analytics/sentiment-trend?${sentimentParams.toString()}`),
          apiService.get(`/analytics/goal-completion?${goalParams.toString()}`)
        ]);
        
        setSentimentTrend(sentimentData.data as SentimentTrendResult || {
          trend: 'stable' as const,
          averageQuality: 0,
          periodComparisons: [],
        });
        
        setGoalCompletionData(goalData.data as any[] || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty data instead of mock data
        setSentimentTrend({
          trend: 'stable',
          averageQuality: 0,
          periodComparisons: [],
        });
        setGoalCompletionData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [employeeId, departmentId, timeframe]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          {isManager ? 'Team Performance Dashboard' : 'Performance Dashboard'}
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
          <Select
            labelId="timeframe-select-label"
            id="timeframe-select"
            value={timeframe}
            onChange={handleTimeframeChange}
            label="Timeframe"
          >
            <MenuItem value="3months">Last 3 Months</MenuItem>
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="12months">Last 12 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Overview" />
          <Tab label="Goals" />
          <Tab label="Feedback" />
          {isManager && <Tab label="Team Analytics" />}
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Goal Completion
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsivePie
                        data={goalCompletionData}
                        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                        innerRadius={0.5}
                        padAngle={0.7}
                        cornerRadius={3}
                        activeOuterRadiusOffset={8}
                        borderWidth={1}
                        borderColor={{
                          from: 'color',
                          modifiers: [['darker', 0.2]],
                        }}
                        arcLinkLabelsSkipAngle={10}
                        arcLinkLabelsTextColor="#333333"
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsColor={{ from: 'color' }}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor={{
                          from: 'color',
                          modifiers: [['darker', 2]],
                        }}
                        legends={[
                          {
                            anchor: 'bottom',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 56,
                            itemsSpacing: 0,
                            itemWidth: 100,
                            itemHeight: 18,
                            itemTextColor: '#999',
                            itemDirection: 'left-to-right',
                            itemOpacity: 1,
                            symbolSize: 18,
                            symbolShape: 'circle',
                          },
                        ]}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                {sentimentTrend && <SentimentTrend {...sentimentTrend} />}
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Summary
                    </Typography>
                    <Typography variant="body1">
                      Based on the data from the last {timeframe === '3months' ? 'three' : timeframe === '6months' ? 'six' : 'twelve'} months, 
                      performance has been {sentimentTrend?.trend || 'stable'} with {goalCompletionData[0]?.value || 0}% of goals completed.
                      Feedback quality has been {sentimentTrend ? (sentimentTrend.averageQuality >= 75 ? 'excellent' : 
                        sentimentTrend.averageQuality >= 60 ? 'good' : 'fair') : 'unavailable'}.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6">Goals Analytics</Typography>
            <Typography variant="body1">
              Detailed goal analytics will be implemented in the next phase.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6">Feedback Analytics</Typography>
            <Typography variant="body1">
              Detailed feedback analytics will be implemented in the next phase.
            </Typography>
          </TabPanel>

          {isManager && (
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6">Team Analytics</Typography>
              <Typography variant="body1">
                Detailed team analytics will be implemented in the next phase.
              </Typography>
            </TabPanel>
          )}
        </>
      )}
    </Box>
  );
};

export default PerformanceDashboard; 