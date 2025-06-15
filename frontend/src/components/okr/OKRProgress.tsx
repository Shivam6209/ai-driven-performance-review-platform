import React from 'react';
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Tooltip, 
  LinearProgress,
  Card,
  CardContent 
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface OKRProgressProps {
  value?: number; // 0-100
  progress?: number; // Alternative prop name for backward compatibility
  size?: number;
  title?: string;
  description?: string;
  showLabel?: boolean;
  showTitle?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  variant?: 'circular' | 'linear' | 'card';
}

// Move styled components outside to prevent recreation on every render
const ProgressWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ProgressLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  fontWeight: 600,
}));

const OKRCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

/**
 * OKRProgress Component
 * 
 * Displays a progress indicator for OKRs with title and optional description
 * 
 * @param value - Progress percentage (0-100)
 * @param progress - Alternative prop name for progress percentage
 * @param size - Optional size of the circular progress indicator
 * @param title - Optional title of the OKR
 * @param description - Optional description of the OKR
 * @param showLabel - Whether to show the progress percentage label
 * @param color - Optional color of the progress indicator
 * @param variant - Display variant: circular, linear, or card
 */
const OKRProgressComponent: React.FC<OKRProgressProps> = ({
  value,
  progress,
  size = 60,
  title,
  description,
  showLabel = true,
  showTitle = true,
  color = 'primary',
  variant = 'card',
}) => {
  // Use either value or progress prop
  const progressValue = value !== undefined ? value : (progress || 0);

  // Determine color based on progress
  const getProgressColor = (value: number): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    if (value >= 100) return 'success';
    if (value >= 70) return 'primary';
    if (value >= 40) return 'warning';
    return 'error';
  };

  const progressColor = color === 'primary' ? getProgressColor(progressValue) : color;

  // Circular variant
  if (variant === 'circular') {
    return (
      <Tooltip title={title || `${progressValue}% Complete`} arrow placement="top">
        <ProgressWrapper>
          <CircularProgress
            variant="determinate"
            value={progressValue}
            size={size}
            color={progressColor}
            thickness={4}
          />
          {showLabel && (
            <ProgressLabel>
              {progressValue}%
            </ProgressLabel>
          )}
        </ProgressWrapper>
      </Tooltip>
    );
  }

  // Linear variant
  if (variant === 'linear') {
    return (
      <Box sx={{ width: '100%', mb: 2 }}>
        {title && showTitle && (
          <Typography variant="subtitle2" gutterBottom>
            {title}
          </Typography>
        )}
        {description && showTitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              color={progressColor}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35 }}>
            {progressValue}%
          </Typography>
        </Box>
      </Box>
    );
  }

  // Card variant (default)
  return (
    <OKRCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            {title && showTitle && (
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
            )}
            {description && showTitle && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={progressValue}
                  color={progressColor}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35 }}>
                {progressValue}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ ml: 2 }}>
            <ProgressWrapper>
              <CircularProgress
                variant="determinate"
                value={progressValue}
                size={50}
                color={progressColor}
                thickness={4}
              />
              <ProgressLabel sx={{ fontSize: '0.75rem' }}>
                {progressValue}%
              </ProgressLabel>
            </ProgressWrapper>
          </Box>
        </Box>
      </CardContent>
    </OKRCard>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const OKRProgress = React.memo(OKRProgressComponent);

export default OKRProgress; 