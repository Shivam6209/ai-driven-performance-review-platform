import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { feedbackService } from '../../services/feedback.service';
import { FeedbackAnalytics as FeedbackAnalyticsType } from '../../types/feedback';

interface FeedbackAnalyticsProps {
  teamId?: string;
  departmentId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ teamId, departmentId }) => {
  const [activeTab, setActiveTab] = useState<string>('frequency');
  const [analytics, setAnalytics] = useState<FeedbackAnalyticsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(teamId);
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(departmentId);

  // Memoize fetchAnalytics to prevent infinite loops
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        type: activeTab !== 'all' ? activeTab : undefined,
        team_id: selectedTeam,
        department_id: selectedDepartment,
      };

      const data = await feedbackService.getFeedbackAnalytics(params);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching feedback analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, activeTab, selectedTeam, selectedDepartment]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    // fetchAnalytics will be called automatically via useEffect when activeTab changes
  };

  const handleApplyFilters = () => {
    // fetchAnalytics will be called automatically via useEffect when dependencies change
    fetchAnalytics();
  };

  const renderFrequencyChart = () => {
    if (!analytics?.frequency) return null;

    const { frequency_data, group_by } = analytics.frequency;
    const data = Object.entries(frequency_data).map(([key, value]) => ({
      period: key,
      count: value,
    }));

    return (
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Feedback Count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
        <Typography variant="caption" color="text.secondary" align="center" display="block" mt={1}>
          Feedback frequency by {group_by}
        </Typography>
      </Box>
    );
  };

  const renderQualityChart = () => {
    if (!analytics?.quality) return null;

    const { distribution } = analytics.quality;
    const data = [
      { name: 'Excellent', value: distribution.excellent },
      { name: 'Good', value: distribution.good },
      { name: 'Average', value: distribution.average },
      { name: 'Poor', value: distribution.poor },
      { name: 'Very Poor', value: distribution.very_poor },
    ];

    return (
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <Typography variant="subtitle1" align="center" mt={2}>
          Average Quality Score: {analytics.quality.average_score.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Based on {analytics.quality.sample_size} feedback items
        </Typography>
      </Box>
    );
  };

  const renderSentimentChart = () => {
    if (!analytics?.sentiment) return null;

    const { trend } = analytics.sentiment;
    const data = trend.map(item => ({
      date: typeof item.date === 'string' ? item.date.split('T')[0] : format(item.date, 'yyyy-MM-dd'),
      score: Number(item.score),
    }));

    return (
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              name="Sentiment Score"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <Typography variant="subtitle1" align="center" mt={2}>
          Average Sentiment Score: {analytics.sentiment.average_sentiment.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Based on {analytics.sentiment.sample_size} feedback items
        </Typography>
      </Box>
    );
  };

  const renderResponseTimeChart = () => {
    if (!analytics?.response_time) return null;

    const { distribution } = analytics.response_time;
    const data = [
      { name: '< 1 hour', value: distribution.under_1_hour },
      { name: '1-24 hours', value: distribution.under_24_hours },
      { name: '24-48 hours', value: distribution.under_48_hours },
      { name: '2-7 days', value: distribution.under_week },
      { name: '> 7 days', value: distribution.over_week },
    ];

    return (
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Response Count" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
        <Typography variant="subtitle1" align="center" mt={2}>
          Average Response Time: {analytics.response_time.average_response_time.toFixed(1)} hours
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Based on {analytics.response_time.sample_size} feedback threads
        </Typography>
      </Box>
    );
  };

  const renderActionCompletionChart = () => {
    if (!analytics?.action_completion) return null;

    const { action_rate, acknowledged_count, total_count } = analytics.action_completion;
    const data = [
      { name: 'Acknowledged', value: acknowledged_count },
      { name: 'Not Acknowledged', value: total_count - acknowledged_count },
    ];

    return (
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              <Cell fill="#00C49F" />
              <Cell fill="#FF8042" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <Typography variant="subtitle1" align="center" mt={2}>
          Action Rate: {(action_rate * 100).toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          {acknowledged_count} of {total_count} feedback items acknowledged
        </Typography>
      </Box>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!analytics) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          No analytics data available
        </Alert>
      );
    }

    switch (activeTab) {
      case 'frequency':
        return renderFrequencyChart();
      case 'quality':
        return renderQualityChart();
      case 'sentiment':
        return renderSentimentChart();
      case 'response_time':
        return renderResponseTimeChart();
      case 'action_completion':
        return renderActionCompletionChart();
      case 'all':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderFrequencyChart()}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderQualityChart()}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderSentimentChart()}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderResponseTimeChart()}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderActionCompletionChart()}
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader title="Feedback Analytics" />
      <Divider />
      <CardContent>
        <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Team</InputLabel>
                <Select
                  value={selectedTeam || ''}
                  onChange={(e) => setSelectedTeam(e.target.value || undefined)}
                  label="Team"
                >
                  <MenuItem value="">All Teams</MenuItem>
                  {/* Add team options dynamically */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab label="Frequency" value="frequency" />
          <Tab label="Quality" value="quality" />
          <Tab label="Sentiment" value="sentiment" />
          <Tab label="Response Time" value="response_time" />
          <Tab label="Action Completion" value="action_completion" />
          <Tab label="All Analytics" value="all" />
        </Tabs>

        {renderContent()}
      </CardContent>
    </Card>
  );
}; 