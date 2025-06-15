import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export interface FeedbackItem {
  id: string;
  content: string;
  giverName: string;
  receiverName: string;
  feedbackType: 'general' | 'appreciation' | 'constructive' | 'goal_related' | 'project_related';
  visibility: 'public' | 'private' | 'manager_only' | 'hr_only';
  createdAt: string;
  reactions: Array<{
    type: 'helpful' | 'insightful' | 'actionable';
    count: number;
  }>;
  sentimentScore?: number;
}

interface FeedbackTimelineProps {
  feedback: FeedbackItem[];
  onReactionClick: (feedbackId: string, reactionType: string) => void;
}

/**
 * FeedbackTimeline Component
 * 
 * Displays a chronological timeline of feedback with reactions and sentiment analysis
 */
export const FeedbackTimeline: React.FC<FeedbackTimelineProps> = ({
  feedback,
  onReactionClick,
}) => {
  const getFeedbackTypeColor = (type: string): string => {
    const colors = {
      general: '#757575',
      appreciation: '#4CAF50',
      constructive: '#FF9800',
      goal_related: '#2196F3',
      project_related: '#9C27B0',
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  const getSentimentColor = (score: number): string => {
    if (score >= 0.5) return '#4CAF50';
    if (score >= 0) return '#FFC107';
    return '#F44336';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {feedback.map((item) => (
        <Card key={item.id} sx={{ width: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {formatDate(item.createdAt)}
              </Typography>
              <Chip
                label={item.feedbackType.replace('_', ' ')}
                size="small"
                sx={{
                  backgroundColor: getFeedbackTypeColor(item.feedbackType),
                  color: 'white',
                }}
              />
            </Box>

            <Typography variant="body1" gutterBottom>
              {item.content}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  From: {item.giverName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  To: {item.receiverName}
                </Typography>
              </Box>

              {item.sentimentScore !== undefined && (
                <Tooltip title="Sentiment Score">
                  <Chip
                    label={`${(item.sentimentScore * 100).toFixed(0)}%`}
                    size="small"
                    sx={{
                      backgroundColor: getSentimentColor(item.sentimentScore),
                      color: 'white',
                    }}
                  />
                </Tooltip>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Tooltip title="Helpful">
                <IconButton
                  size="small"
                  onClick={() => onReactionClick(item.id, 'helpful')}
                  color={item.reactions.some(r => r.type === 'helpful' && r.count > 0) ? 'primary' : 'default'}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Insightful">
                <IconButton
                  size="small"
                  onClick={() => onReactionClick(item.id, 'insightful')}
                  color={item.reactions.some(r => r.type === 'insightful' && r.count > 0) ? 'primary' : 'default'}
                >
                  <LightbulbIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actionable">
                <IconButton
                  size="small"
                  onClick={() => onReactionClick(item.id, 'actionable')}
                  color={item.reactions.some(r => r.type === 'actionable' && r.count > 0) ? 'primary' : 'default'}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {item.reactions.map((reaction) => (
                reaction.count > 0 && (
                  <Chip
                    key={reaction.type}
                    label={`${reaction.count} ${reaction.type}`}
                    size="small"
                    variant="outlined"
                  />
                )
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default FeedbackTimeline; 