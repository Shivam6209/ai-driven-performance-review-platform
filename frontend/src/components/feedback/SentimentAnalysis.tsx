import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Grid,
  Divider,
  Alert,
  Button,
  Paper,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { SentimentAnalysisResult } from '@/services/ai.service';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';

interface SentimentAnalysisProps {
  result?: SentimentAnalysisResult;
  isLoading?: boolean;
  onImprove?: () => void;
}

interface CustomBarDatum {
  metric: string;
  value: number;
  color: string;
  [key: string]: any;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  result,
  isLoading = false,
  onImprove,
}) => {
  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'positive':
        return 'success';
      case 'neutral':
        return 'info';
      case 'constructive':
        return 'warning';
      case 'negative':
        return 'error';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'info.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Analyzing feedback...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!result) {
    return null;
  }

  const { tone, quality, specificity, actionability, biasIndicators, keywords, summary } = result;

  // Prepare data for bar chart
  const barData: CustomBarDatum[] = [
    {
      metric: 'Quality',
      value: quality,
      color: getScoreColor(quality),
    },
    {
      metric: 'Specificity',
      value: specificity,
      color: getScoreColor(specificity),
    },
    {
      metric: 'Actionability',
      value: actionability,
      color: getScoreColor(actionability),
    },
  ];

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Feedback Analysis</Typography>
          <Chip
            label={`Tone: ${tone.charAt(0).toUpperCase() + tone.slice(1)}`}
            color={getToneColor(tone) as "success" | "info" | "warning" | "error" | "default"}
            size="small"
          />
        </Box>

        {summary && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {summary}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Quality Metrics
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveBar
                data={barData}
                keys={['value']}
                indexBy="metric"
                margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
                padding={0.3}
                valueScale={{ type: 'linear', min: 0, max: 100 }}
                colors={({ data }: { data: CustomBarDatum }) => data.color}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  tickValues: [0, 25, 50, 75, 100],
                }}
                labelFormat={(value: string | number) => `${value}%`}
                tooltip={({ data }: { data: CustomBarDatum }) => (
                  <Paper sx={{ p: 1 }}>
                    <Typography variant="body2">
                      {data.metric}: {data.value}% ({getQualityLabel(data.value)})
                    </Typography>
                  </Paper>
                )}
                animate={true}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Key Insights
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Overall Quality:</strong> {getQualityLabel(quality)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={quality}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: getScoreColor(quality),
                  },
                }}
              />
            </Box>
            {keywords.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Keywords:</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {keywords.map((keyword: string, index: number) => (
                    <Chip key={index} label={keyword} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>

        {biasIndicators.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Potential Bias Detected</Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {biasIndicators.map((indicator: string, index: number) => (
                  <li key={index}>{indicator}</li>
                ))}
              </ul>
            </Alert>
          </>
        )}

        {onImprove && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={onImprove}
              size="small"
            >
              Suggest Improvements
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface SentimentTrendProps {
  trend: 'improving' | 'stable' | 'declining';
  averageQuality: number;
  periodComparisons: { period: string; quality: number }[];
}

export const SentimentTrend: React.FC<SentimentTrendProps> = ({
  trend,
  averageQuality,
  periodComparisons,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingUpIcon color="success" />;
      case 'declining':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="info" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'improving':
        return 'success.main';
      case 'declining':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

  // Prepare data for line chart
  const lineData = [
    {
      id: 'quality',
      color: getTrendColor(),
      data: periodComparisons.map((item) => ({
        x: item.period,
        y: item.quality,
      })),
    },
  ];

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Feedback Quality Trend</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getTrendIcon()}
            <Typography variant="body2" sx={{ ml: 1 }}>
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Average Quality: {Math.round(averageQuality)}%
        </Typography>

        {periodComparisons.length > 0 ? (
          <Box sx={{ height: 300 }}>
            <ResponsiveLine
              data={lineData}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              xScale={{ type: 'point' }}
              yScale={{
                type: 'linear',
                min: 0,
                max: 100,
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Period',
                legendOffset: 40,
                legendPosition: 'middle',
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Quality Score',
                legendOffset: -40,
                legendPosition: 'middle',
              }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              colors={[getTrendColor()]}
              curve="monotoneX"
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Not enough data to display trend
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis; 