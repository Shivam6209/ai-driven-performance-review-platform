import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  Divider,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '@/layouts/DashboardLayout';
import SentimentTrendsChart from '@/components/analytics/SentimentTrendsChart';
import BiasAlertsPanel from '@/components/analytics/BiasAlertsPanel';
import { sentimentService, BiasSummary } from '@/services/sentiment.service';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sentiment-tabpanel-${index}`}
      aria-labelledby={`sentiment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SentimentAnalyticsPage: NextPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [biasSummary, setBiasSummary] = useState<BiasSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser) {
      fetchBiasSummary();
    }
  }, [currentUser, authLoading, departmentId]); // Removed router from dependencies

  const fetchBiasSummary = async () => {
    try {
      setIsLoading(true);
      const data = await sentimentService.getBiasSummary(departmentId || undefined);
      setBiasSummary(data);
    } catch (error) {
      console.error('Failed to fetch bias summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value as 'week' | 'month' | 'quarter' | 'year');
  };

  const handleDepartmentChange = (event: SelectChangeEvent) => {
    setDepartmentId(event.target.value);
  };

  const renderBiasSummaryChart = () => {
    if (!biasSummary) return null;

    const data = [
      { name: 'Unbiased Feedback', value: biasSummary.totalFeedback - biasSummary.biasDetected },
      { name: 'Biased Feedback', value: biasSummary.biasDetected },
    ];

    const COLORS = ['#4caf50', '#f44336'];

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bias Detection Summary
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} feedback items`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1">
                {biasSummary.biasPercentage.toFixed(1)}% of feedback contains potential bias
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Based on {biasSummary.totalFeedback} feedback items analyzed
              </Typography>
            </Box>
            {biasSummary.commonBiasTypes.length > 0 && (
              <Box sx={{ mt: 3, width: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Most Common Bias Types
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {biasSummary.commonBiasTypes.map((biasType, index) => (
                    <Typography component="li" key={index} variant="body2">
                      {biasType.type}: {biasType.count} occurrences
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Sentiment Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor feedback sentiment trends, quality metrics, and bias detection across your organization.
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="sentiment analytics tabs">
            <Tab label="Overview" />
            <Tab label="Trends" />
            <Tab label="Bias Detection" />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="period-select-label">Time Period</InputLabel>
            <Select
              labelId="period-select-label"
              id="period-select"
              value={period}
              label="Time Period"
              onChange={handlePeriodChange}
            >
              <MenuItem value="week">Weekly</MenuItem>
              <MenuItem value="month">Monthly</MenuItem>
              <MenuItem value="quarter">Quarterly</MenuItem>
              <MenuItem value="year">Yearly</MenuItem>
            </Select>
          </FormControl>

          {currentUser?.role === 'hr_admin' && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="department-select-label">Department</InputLabel>
              <Select
                labelId="department-select-label"
                id="department-select"
                value={departmentId}
                label="Department"
                onChange={handleDepartmentChange}
              >
                <MenuItem value="">All Departments</MenuItem>
                <MenuItem value="dept1">Engineering</MenuItem>
                <MenuItem value="dept2">Marketing</MenuItem>
                <MenuItem value="dept3">Sales</MenuItem>
                <MenuItem value="dept4">Customer Support</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <SentimentTrendsChart
                employeeId={currentUser?.role === 'employee' ? currentUser?.id : undefined}
                managerId={currentUser?.role === 'manager' ? currentUser?.id : undefined}
                defaultPeriod={period}
                showControls={false}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <BiasAlertsPanel
                employeeId={currentUser?.role === 'employee' || currentUser?.role === 'manager' ? currentUser?.id : undefined}
                maxAlerts={5}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Sentiment Analytics Overview
                </Typography>
                <Typography variant="body1" paragraph>
                  This dashboard provides insights into feedback sentiment across the organization.
                  Monitor trends, detect potential bias, and ensure feedback quality remains high.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Key Features:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body2">
                    Track sentiment trends over time
                  </Typography>
                  <Typography component="li" variant="body2">
                    Identify potential bias in feedback
                  </Typography>
                  <Typography component="li" variant="body2">
                    Monitor feedback quality metrics
                  </Typography>
                  <Typography component="li" variant="body2">
                    Receive alerts for significant sentiment shifts or bias detection
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SentimentTrendsChart
                employeeId={currentUser?.role === 'employee' ? currentUser?.id : undefined}
                managerId={currentUser?.role === 'manager' ? currentUser?.id : undefined}
                defaultPeriod={period}
                height={500}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderBiasSummaryChart()}
            </Grid>
            <Grid item xs={12} md={6}>
              <BiasAlertsPanel
                employeeId={currentUser?.role === 'employee' || currentUser?.role === 'manager' ? currentUser?.id : undefined}
                maxAlerts={10}
                onlyUnacknowledged={false}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
    </DashboardLayout>
  );
};

export default SentimentAnalyticsPage; 