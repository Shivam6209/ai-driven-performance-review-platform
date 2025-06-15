import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Link,
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  RateReview as ReviewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

export interface SourceReferenceData {
  id: string;
  type: 'feedback' | 'goal' | 'review' | 'project';
  title?: string;
  preview: string;
  date?: string;
  timestamp?: string;
  confidence: number;
  url?: string;
}

interface SourceReferenceProps {
  sources: SourceReferenceData[];
  expanded?: boolean;
  onToggle?: () => void;
  onSourceClick?: (source: SourceReferenceData) => void;
}

const SourceReference: React.FC<SourceReferenceProps> = ({
  sources,
  expanded = true,
  onToggle,
  onSourceClick,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(expanded);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const isExpanded = onToggle ? expanded : internalExpanded;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'feedback':
        return <FeedbackIcon fontSize="small" />;
      case 'goal':
        return <AssignmentIcon fontSize="small" />;
      case 'project':
        return <WorkIcon fontSize="small" />;
      case 'review':
        return <ReviewIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const handleSourceClick = (source: SourceReferenceData) => {
    if (onSourceClick) {
      onSourceClick(source);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (sources.length === 0) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">AI Source References</Typography>
        {onToggle && (
          <IconButton onClick={handleToggle} size="small" sx={{ ml: 1 }}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      <Collapse in={isExpanded}>
        {sources.map((source) => (
          <Card
            key={source.id}
            variant="outlined"
            sx={{
              mb: 2,
              cursor: onSourceClick ? 'pointer' : 'default',
              '&:hover': onSourceClick ? { bgcolor: 'action.hover' } : {},
            }}
            onClick={() => handleSourceClick(source)}
            role="article"
          >
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getSourceIcon(source.type)}
                  <Typography variant="subtitle2" sx={{ ml: 1 }}>
                    {source.title || source.type}
                  </Typography>
                  <Chip
                    label={source.type}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    {formatDate(source.date || source.timestamp || '')}
                  </Typography>
                </Box>
                <Tooltip title={`Source confidence: ${Math.round(source.confidence * 100)}%`}>
                  <Chip
                    label={`${Math.round(source.confidence * 100)}%`}
                    size="small"
                    color={getConfidenceColor(source.confidence) as "success" | "warning" | "error"}
                    variant="outlined"
                  />
                </Tooltip>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                {source.preview}
              </Typography>
              {source.url && (
                <Link
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  sx={{ fontSize: '0.875rem' }}
                >
                  View Source
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </Collapse>
    </Box>
  );
};

export default SourceReference;
export { SourceReference }; 