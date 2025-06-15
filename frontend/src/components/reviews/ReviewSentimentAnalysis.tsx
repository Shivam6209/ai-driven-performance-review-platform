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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  SentimentVeryDissatisfied as NegativeIcon,
  SentimentDissatisfied as SlightlyNegativeIcon,
  SentimentNeutral as NeutralIcon,
  SentimentSatisfied as SlightlyPositiveIcon,
  SentimentVerySatisfied as PositiveIcon,
  Info as InfoIcon,
  LocalOffer as TagIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
  overall: number; // -1 to 1
}

export interface TopicSentiment {
  topic: string;
  score: number;
  count: number;
  examples: string[];
}

export interface KeyPhrase {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

interface ReviewSentimentAnalysisProps {
  sentimentScores: SentimentScore;
  topicSentiments: TopicSentiment[];
  keyPhrases: KeyPhrase[];
}

/**
 * ReviewSentimentAnalysis Component
 * 
 * Displays sentiment analysis of review content including overall sentiment,
 * topic-based sentiment, and key phrases
 */
export const ReviewSentimentAnalysis: React.FC<ReviewSentimentAnalysisProps> = ({
  sentimentScores,
  topicSentiments,
  keyPhrases,
}) => {
  const getSentimentIcon = (score: number) => {
    if (score >= 0.8) return <PositiveIcon color="success" />;
    if (score >= 0.6) return <SlightlyPositiveIcon color="success" />;
    if (score >= 0.4) return <NeutralIcon color="action" />;
    if (score >= 0.2) return <SlightlyNegativeIcon color="warning" />;
    return <NegativeIcon color="error" />;
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#81C784';
    if (score >= 0.4) return '#9E9E9E';
    if (score >= 0.2) return '#FFB74D';
    return '#E57373';
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sentiment Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Overall Sentiment
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getSentimentIcon(sentimentScores.overall)}
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={sentimentScores.overall * 100}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#f5f5f5',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getSentimentColor(sentimentScores.overall),
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2">
                  {Math.round(sentimentScores.overall * 100)}%
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Sentiment Breakdown
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PositiveIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Positive"
                    secondary={
                      <LinearProgress
                        variant="determinate"
                        value={sentimentScores.positive * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#f5f5f5',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#4CAF50',
                          },
                        }}
                      />
                    }
                  />
                  <Typography variant="body2">
                    {Math.round(sentimentScores.positive * 100)}%
                  </Typography>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <NeutralIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Neutral"
                    secondary={
                      <LinearProgress
                        variant="determinate"
                        value={sentimentScores.neutral * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#f5f5f5',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#9E9E9E',
                          },
                        }}
                      />
                    }
                  />
                  <Typography variant="body2">
                    {Math.round(sentimentScores.neutral * 100)}%
                  </Typography>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <NegativeIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Negative"
                    secondary={
                      <LinearProgress
                        variant="determinate"
                        value={sentimentScores.negative * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#f5f5f5',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#E57373',
                          },
                        }}
                      />
                    }
                  />
                  <Typography variant="body2">
                    {Math.round(sentimentScores.negative * 100)}%
                  </Typography>
                </ListItem>
              </List>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Divider orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />
            <Box sx={{ pl: { md: 3 } }}>
              <Typography variant="subtitle1" gutterBottom>
                Topic Analysis
              </Typography>
              <List>
                {topicSentiments.map((topic) => (
                  <ListItem
                    key={topic.topic}
                    sx={{
                      borderLeft: 3,
                      borderColor: getSentimentColor(topic.score),
                      mb: 1,
                      bgcolor: 'background.default',
                    }}
                  >
                    <ListItemIcon>
                      <TagIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {topic.topic}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {topic.count} mentions
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Tooltip title={topic.examples[0]}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            {getSentimentIcon(topic.score)}
                            <Typography variant="body2">
                              Score: {(topic.score * 100).toFixed(0)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Phrases
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {keyPhrases.map((phrase, index) => (
                    <Tooltip
                      key={index}
                      title={`Confidence: ${(phrase.confidence * 100).toFixed(0)}%`}
                    >
                      <Chip
                        label={phrase.text}
                        icon={getSentimentIcon(
                          phrase.sentiment === 'positive' ? 0.8 :
                          phrase.sentiment === 'negative' ? -0.8 :
                          0
                        )}
                        sx={{
                          backgroundColor: getSentimentColor(
                            phrase.sentiment === 'positive' ? 0.8 :
                            phrase.sentiment === 'negative' ? -0.8 :
                            0
                          ),
                          color: 'white',
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ReviewSentimentAnalysis; 