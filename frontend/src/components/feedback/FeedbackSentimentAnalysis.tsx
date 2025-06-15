import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  CircularProgress,
  Collapse,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { sentimentService, SentimentAnalysisResult, SentimentType } from '@/services/sentiment.service';

interface FeedbackSentimentAnalysisProps {
  content: string;
  onAnalysisComplete?: (result: SentimentAnalysisResult) => void;
  autoAnalyze?: boolean;
}

const FeedbackSentimentAnalysis: React.FC<FeedbackSentimentAnalysisProps> = ({
  content,
  onAnalysisComplete,
  autoAnalyze = false,
}) => {
  const [analysis, setAnalysis] = useState<SentimentAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Memoize the analyzeFeedback function to prevent infinite loops
  const analyzeFeedback = useCallback(async () => {
    if (!content || content.trim().length < 10) {
      setError('Content must be at least 10 characters long for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await sentimentService.analyzeFeedback(content);
      setAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze feedback');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, onAnalysisComplete]);

  useEffect(() => {
    if (autoAnalyze && content && content.trim().length > 10) {
      analyzeFeedback();
    }
  }, [autoAnalyze, content, analyzeFeedback]);

  const getSentimentColor = (sentiment: SentimentType): "success" | "info" | "warning" | "error" | "default" => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'neutral':
        return 'info';
      case 'constructive':
        return 'warning';
      case 'concerning':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderSentimentIcon = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbUpIcon fontSize="small" />;
      case 'neutral':
        return <CheckCircleIcon fontSize="small" />;
      case 'constructive':
        return <TrendingUpIcon fontSize="small" />;
      case 'concerning':
        return <ThumbDownIcon fontSize="small" />;
      default:
        return <CheckCircleIcon fontSize="small" />;
    }
  };

  const getQualityColor = (score: number): "success" | "info" | "warning" | "error" => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'info';
    if (score >= 0.4) return 'warning';
    return 'error';
  };

  if (isAnalyzing) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Analyzing feedback...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Feedback Analysis</Typography>
          <Chip
            icon={renderSentimentIcon(analysis.sentiment)}
            label={`${analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)} (${Math.round(
              analysis.score * 100
            )}%)`}
            color={getSentimentColor(analysis.sentiment)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Feedback Quality
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1, mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={analysis.qualityScore * 100}
                color={getQualityColor(analysis.qualityScore)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round(analysis.qualityScore * 100)}%
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => setShowDetails(!showDetails)}
        >
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            Detailed Analysis
          </Typography>
          <Chip
            label={showDetails ? 'Hide Details' : 'Show Details'}
            size="small"
            variant="outlined"
          />
        </Box>

        <Collapse in={showDetails}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Tooltip title="How specific the feedback is with concrete examples">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Specificity
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.specificity * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    {Math.round(analysis.specificity * 100)}%
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
            
            <Grid item xs={6}>
              <Tooltip title="How actionable the feedback is with clear guidance">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Actionability
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.actionability * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    {Math.round(analysis.actionability * 100)}%
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>

          {analysis.biasDetected && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Potential Bias Detected</Typography>
              <Typography variant="body2">{analysis.biasExplanation}</Typography>
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key Points
            </Typography>
            <Typography variant="body2">{analysis.summary}</Typography>
          </Box>

          {analysis.keywords.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {analysis.keywords.map((keyword, index) => (
                  <Chip key={index} label={keyword} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}


        </Collapse>
      </CardContent>
    </Card>
  );
};

export default FeedbackSentimentAnalysis; 