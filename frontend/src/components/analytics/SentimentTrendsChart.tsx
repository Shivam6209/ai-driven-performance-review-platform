import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Skeleton,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  SelectChangeEvent,
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { sentimentService, SentimentTrend } from '@/services/sentiment.service';
import { format, parseISO } from 'date-fns';

interface SentimentTrendsChartProps {
  employeeId?: string;
  managerId?: string;
  defaultPeriod?: 'week' | 'month' | 'quarter' | 'year';
  height?: number;
  showControls?: boolean;
}

const SentimentTrendsChart: React.FC<SentimentTrendsChartProps> = ({
  employeeId,
  managerId,
  defaultPeriod = 'month',
  height = 400,
  showControls = true,
}) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>(defaultPeriod);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SentimentTrend | SentimentTrend[] | null>(null);

  useEffect(() => {
    fetchData();
  }, [employeeId, managerId, period]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (employeeId) {
        result = await sentimentService.getEmployeeSentimentTrend(employeeId, period);
        setData(result);
      } else if (managerId) {
        result = await sentimentService.getTeamSentimentTrend(managerId, period);
        setData(result);
      } else {
        throw new Error('Either employeeId or managerId must be provided');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sentiment trends');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (event: SelectChangeEvent<'week' | 'month' | 'quarter' | 'year'>) => {
    setPeriod(event.target.value as 'week' | 'month' | 'quarter' | 'year');
  };

  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newChartType: 'line' | 'area' | 'bar' | null
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, period === 'week' ? 'MMM d' : 'MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatTooltipValue = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  const renderChart = () => {
    if (!data) return null;

    const chartData = Array.isArray(data) 
      ? data.flatMap(item => item.trends) 
      : data.trends;

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
              domain={[0, 1]}
              tick={{ fontSize: 12 }}
            />
            <RechartsTooltip 
              formatter={formatTooltipValue}
              labelFormatter={formatDate}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sentiment.positive" 
              name="Positive" 
              stroke="#4caf50" 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="sentiment.neutral" 
              name="Neutral" 
              stroke="#2196f3" 
            />
            <Line 
              type="monotone" 
              dataKey="sentiment.constructive" 
              name="Constructive" 
              stroke="#ff9800" 
            />
            <Line 
              type="monotone" 
              dataKey="sentiment.concerning" 
              name="Concerning" 
              stroke="#f44336" 
            />
            <Line 
              type="monotone" 
              dataKey="averageScore" 
              name="Overall Score" 
              stroke="#9c27b0" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
              domain={[0, 1]}
              tick={{ fontSize: 12 }}
            />
            <RechartsTooltip 
              formatter={formatTooltipValue}
              labelFormatter={formatDate}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="sentiment.positive" 
              name="Positive" 
              stackId="1"
              stroke="#4caf50" 
              fill="#4caf50" 
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="sentiment.neutral" 
              name="Neutral" 
              stackId="1"
              stroke="#2196f3" 
              fill="#2196f3" 
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="sentiment.constructive" 
              name="Constructive" 
              stackId="1"
              stroke="#ff9800" 
              fill="#ff9800" 
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="sentiment.concerning" 
              name="Concerning" 
              stackId="1"
              stroke="#f44336" 
              fill="#f44336" 
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
            domain={[0, 1]}
            tick={{ fontSize: 12 }}
          />
          <RechartsTooltip 
            formatter={formatTooltipValue}
            labelFormatter={formatDate}
          />
          <Legend />
          <Bar 
            dataKey="quality.high" 
            name="High Quality" 
            stackId="a"
            fill="#4caf50" 
          />
          <Bar 
            dataKey="quality.medium" 
            name="Medium Quality" 
            stackId="a"
            fill="#ff9800" 
          />
          <Bar 
            dataKey="quality.low" 
            name="Low Quality" 
            stackId="a"
            fill="#f44336" 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sentiment Trends
          </Typography>
          <Skeleton variant="rectangular" height={height} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sentiment Trends
          </Typography>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h6">
            {Array.isArray(data) ? 'Team Sentiment Trends' : 'Sentiment Trends'}
          </Typography>
          
          {showControls && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="period-select-label">Period</InputLabel>
                <Select
                  labelId="period-select-label"
                  id="period-select"
                  value={period}
                  label="Period"
                  onChange={handlePeriodChange}
                >
                  <MenuItem value="week">Weekly</MenuItem>
                  <MenuItem value="month">Monthly</MenuItem>
                  <MenuItem value="quarter">Quarterly</MenuItem>
                  <MenuItem value="year">Yearly</MenuItem>
                </Select>
              </FormControl>
              
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={handleChartTypeChange}
                aria-label="chart type"
                size="small"
              >
                <ToggleButton value="line" aria-label="line chart">
                  Line
                </ToggleButton>
                <ToggleButton value="area" aria-label="area chart">
                  Area
                </ToggleButton>
                <ToggleButton value="bar" aria-label="bar chart">
                  Bar
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </Box>
        
        {renderChart()}
        
        {chartType === 'line' && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            Showing sentiment trends over time. Higher values indicate more positive feedback.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentTrendsChart; 