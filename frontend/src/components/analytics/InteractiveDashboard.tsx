import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Switch,
  Slider,
  Autocomplete,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as DrillDownIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { apiService } from '@/services/api';

interface DashboardFilter {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text';
  options?: { value: string; label: string }[];
  value: any;
}

interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'composed';
  dataKey: string;
  xAxis?: string;
  yAxis?: string;
  color?: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  drillDownEnabled: boolean;
}

interface DashboardData {
  performance: any[];
  goals: any[];
  feedback: any[];
  reviews: any[];
  trends: any[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

const InteractiveDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    performance: [],
    goals: [],
    feedback: [],
    reviews: [],
    trends: [],
  });
  const [filters, setFilters] = useState<DashboardFilter[]>([
    {
      id: 'department',
      label: 'Department',
      type: 'multiselect',
      options: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'product', label: 'Product' },
        { value: 'design', label: 'Design' },
        { value: 'sales', label: 'Sales' },
        { value: 'marketing', label: 'Marketing' },
      ],
      value: [],
    },
    {
      id: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      value: [subMonths(new Date(), 6), new Date()],
    },
    {
      id: 'performanceThreshold',
      label: 'Performance Threshold',
      type: 'number',
      value: 70,
    },
  ]);
  const [charts, setCharts] = useState<ChartConfig[]>([
    {
      id: 'performance-trend',
      title: 'Performance Trends',
      type: 'line',
      dataKey: 'trends',
      xAxis: 'month',
      yAxis: 'score',
      drillDownEnabled: true,
      size: 'large',
    },
    {
      id: 'goal-completion',
      title: 'Goal Completion by Department',
      type: 'bar',
      dataKey: 'goals',
      xAxis: 'department',
      yAxis: 'completion',
      drillDownEnabled: true,
      size: 'medium',
    },
    {
      id: 'feedback-sentiment',
      title: 'Feedback Sentiment Distribution',
      type: 'pie',
      dataKey: 'feedback',
      drillDownEnabled: false,
      size: 'medium',
    },
    {
      id: 'review-scores',
      title: 'Review Score Distribution',
      type: 'area',
      dataKey: 'reviews',
      xAxis: 'score',
      yAxis: 'count',
      drillDownEnabled: true,
      size: 'medium',
    },
  ]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [chartConfigDialogOpen, setChartConfigDialogOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartConfig | null>(null);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownDialogOpen, setDrillDownDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Fetch real analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = filters.reduce((acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      }, {} as any);
      
      const queryString = new URLSearchParams(filterParams).toString();
      const url = `/analytics/dashboard${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(url);
      
      const defaultData: DashboardData = {
        performance: [],
        goals: [],
        feedback: [],
        reviews: [],
        trends: [],
      };
      
      setData(response.data ? { ...defaultData, ...response.data } : defaultData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
      setData({
        performance: [],
        goals: [],
        feedback: [],
        reviews: [],
        trends: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount and when filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, filters]);

  const handleFilterChange = (filterId: string, value: any) => {
    setFilters(prev => prev.map(filter => 
      filter.id === filterId ? { ...filter, value } : filter
    ));
  };

  const handleChartDrillDown = (chartId: string, dataPoint: any) => {
    setDrillDownData({ chartId, dataPoint });
    setDrillDownDialogOpen(true);
  };

  const handleExportData = (format: 'csv' | 'pdf' | 'excel') => {
    // Implementation for data export
    console.log(`Exporting data as ${format}`);
  };

  const renderChart = (chart: ChartConfig) => {
    const chartData = data[chart.dataKey as keyof DashboardData] || [];
    const height = chart.size === 'small' ? 200 : chart.size === 'medium' ? 300 : chart.size === 'large' ? 400 : 500;

    if (chartData.length === 0) {
      return (
        <Box sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'text.secondary'
        }}>
          <Typography variant="body2">No data available</Typography>
        </Box>
      );
    }

    const commonProps = {
      width: '100%',
      height,
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const handleClick = chart.drillDownEnabled ? (data: any) => handleChartDrillDown(chart.id, data) : undefined;

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={chart.yAxis} 
                stroke={chart.color || '#8884d8'} 
                strokeWidth={2}
                onClick={handleClick}
              />
              {chart.id === 'performance-trend' && (
                <>
                  <Line type="monotone" dataKey="engagement" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="productivity" stroke="#ffc658" strokeWidth={2} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar 
                dataKey={chart.yAxis || 'value'} 
                fill={chart.color || '#8884d8'} 
                onClick={handleClick}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onClick={handleClick}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={chart.yAxis || 'value'} 
                stroke={chart.color || '#8884d8'} 
                fill={chart.color || '#8884d8'} 
                onClick={handleClick}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <Typography>Chart type not supported</Typography>;
    }
  };

  const renderFilters = () => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <Button
          startIcon={<FilterIcon />}
          onClick={() => setFilterDialogOpen(true)}
          variant="outlined"
          size="small"
        >
          Advanced Filters
        </Button>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchAnalyticsData}
          variant="outlined"
          size="small"
          disabled={loading}
        >
          Refresh
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
          }
          label="Auto Refresh"
        />
        {autoRefresh && (
          <Box sx={{ width: 200 }}>
            <Typography variant="caption">Refresh Interval (seconds)</Typography>
            <Slider
              value={refreshInterval}
              onChange={(_, value) => setRefreshInterval(value as number)}
              min={10}
              max={300}
              step={10}
              valueLabelDisplay="auto"
            />
          </Box>
        )}
      </Box>
      
      <Grid container spacing={2}>
        {filters.map((filter) => (
          <Grid item xs={12} sm={6} md={3} key={filter.id}>
            {filter.type === 'select' && (
              <FormControl fullWidth size="small">
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  value={filter.value}
                  label={filter.label}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                >
                  {filter.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {filter.type === 'multiselect' && (
              <Autocomplete
                multiple
                options={filter.options || []}
                getOptionLabel={(option) => option.label}
                value={filter.options?.filter(option => filter.value.includes(option.value)) || []}
                onChange={(_, newValue) => 
                  handleFilterChange(filter.id, newValue.map(v => v.value))
                }
                renderInput={(params) => (
                  <TextField {...params} label={filter.label} size="small" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.label}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  if (loading && data.trends.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={400} height={60} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Interactive Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Data">
            <IconButton onClick={() => handleExportData('csv')}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dashboard Settings">
            <IconButton onClick={() => setChartConfigDialogOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderFilters()}

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Performance" />
        <Tab label="Goals & OKRs" />
        <Tab label="Feedback" />
        <Tab label="Custom Reports" />
      </Tabs>

      <Grid container spacing={3}>
        {charts.map((chart) => (
          <Grid 
            item 
            xs={12} 
            md={chart.size === 'large' || chart.size === 'xlarge' ? 12 : 6}
            key={chart.id}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{chart.title}</Typography>
                  {chart.drillDownEnabled && (
                    <IconButton size="small">
                      <DrillDownIcon />
                    </IconButton>
                  )}
                </Box>
                {loading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : (
                  renderChart(chart)
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Drill Down Dialog */}
      <Dialog
        open={drillDownDialogOpen}
        onClose={() => setDrillDownDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Drill Down Analysis</DialogTitle>
        <DialogContent>
          {drillDownData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Chart: {drillDownData.chartId}
              </Typography>
              <pre>{JSON.stringify(drillDownData.dataPoint, null, 2)}</pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrillDownDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InteractiveDashboard; 