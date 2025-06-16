import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { reviewsService, PerformanceReview } from '@/services/reviews.service';

interface AIReviewEditorProps {
  reviewId: string;
  onSave?: (review: PerformanceReview) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

interface AIInsights {
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  confidenceScore: number;
  dataQuality: {
    okrData: number;
    feedbackData: number;
    overallScore: number;
  };
}

export const AIReviewEditor: React.FC<AIReviewEditorProps> = ({
  reviewId,
  onSave,
  onCancel,
  readOnly = false,
}) => {
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    strengths: '',
    areasForImprovement: '',
    achievements: '',
    goalsForNextPeriod: '',
    developmentPlan: '',
    managerComments: '',
    employeeComments: '',
    overallRating: 0,
  });

  useEffect(() => {
    loadReview();
    loadAIInsights();
  }, [reviewId]);

  const loadReview = async () => {
    try {
      setLoading(true);
      const reviewData = await reviewsService.getPerformanceReview(reviewId);
      setReview(reviewData);
      
      // Initialize form data
      setFormData({
        strengths: reviewData.strengths || '',
        areasForImprovement: reviewData.areasForImprovement || '',
        achievements: reviewData.achievements || '',
        goalsForNextPeriod: reviewData.goalsForNextPeriod || '',
        developmentPlan: reviewData.developmentPlan || '',
        managerComments: reviewData.managerComments || '',
        employeeComments: reviewData.employeeComments || '',
        overallRating: reviewData.overallRating || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const insights = await reviewsService.getAIInsights(reviewId);
      setAiInsights(insights);
    } catch (err) {
      console.warn('Failed to load AI insights:', err);
    }
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const updatedReview = await reviewsService.editAIReview(reviewId, formData);
      setReview(updatedReview);
      setHasChanges(false);
      setSuccess('Review saved successfully!');
      
      if (onSave) {
        onSave(updatedReview);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const getConfidenceColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const getDataQualityColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading AI review...
        </Typography>
      </Box>
    );
  }

  if (!review) {
    return (
      <Alert severity="error">
        Review not found or failed to load.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center">
            <BrainIcon sx={{ mr: 1, color: 'secondary.main' }} />
            AI Performance Review
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {review.employee.firstName} {review.employee.lastName} • {review.reviewType.toUpperCase()} Review
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {review.isAiGenerated && (
            <Chip
              icon={<AIIcon />}
              label={`AI Confidence: ${((review.aiConfidenceScore || 0) * 100).toFixed(1)}%`}
              color={getConfidenceColor(review.aiConfidenceScore || 0)}
              variant="outlined"
            />
          )}
          {review.humanEdited && (
            <Chip
              icon={<EditIcon />}
              label="Human Edited"
              color="info"
              variant="outlined"
            />
          )}
          <Chip
            label={review.status.replace('_', ' ').toUpperCase()}
            color={review.status === 'approved' ? 'success' : 'default'}
          />
        </Stack>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* AI Insights Panel */}
      {aiInsights && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">AI Insights & Data Quality</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Data Quality Assessment" />
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">OKR Data</Typography>
                          <Chip 
                            label={`${aiInsights.dataQuality.okrData}%`}
                            color={getDataQualityColor(aiInsights.dataQuality.okrData)}
                            size="small"
                          />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={aiInsights.dataQuality.okrData} 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Feedback Data</Typography>
                          <Chip 
                            label={`${aiInsights.dataQuality.feedbackData}%`}
                            color={getDataQualityColor(aiInsights.dataQuality.feedbackData)}
                            size="small"
                          />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={aiInsights.dataQuality.feedbackData} 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight="medium">Overall Score</Typography>
                          <Chip 
                            label={`${aiInsights.dataQuality.overallScore}%`}
                            color={getDataQualityColor(aiInsights.dataQuality.overallScore)}
                            size="small"
                          />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={aiInsights.dataQuality.overallScore} 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="AI Recommendations" />
                  <CardContent>
                    <Stack spacing={1}>
                      {aiInsights.recommendations.map((rec, index) => (
                        <Box key={index} display="flex" alignItems="flex-start">
                          <CheckIcon sx={{ mr: 1, mt: 0.5, fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2">{rec}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Review Form */}
      <Grid container spacing={3}>
        {/* Strengths */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Strengths" 
              action={
                <Tooltip title="AI Generated Content">
                  <BrainIcon color="secondary" />
                </Tooltip>
              }
            />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={formData.strengths}
                onChange={(e) => handleFieldChange('strengths', e.target.value)}
                placeholder="Key strengths and positive attributes..."
                disabled={readOnly || saving}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Areas for Improvement */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Areas for Improvement" 
              action={
                <Tooltip title="AI Generated Content">
                  <BrainIcon color="secondary" />
                </Tooltip>
              }
            />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={formData.areasForImprovement}
                onChange={(e) => handleFieldChange('areasForImprovement', e.target.value)}
                placeholder="Areas that need development..."
                disabled={readOnly || saving}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Key Achievements" 
              action={
                <Tooltip title="AI Generated Content">
                  <BrainIcon color="secondary" />
                </Tooltip>
              }
            />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={formData.achievements}
                onChange={(e) => handleFieldChange('achievements', e.target.value)}
                placeholder="Major accomplishments and milestones..."
                disabled={readOnly || saving}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Goals for Next Period */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Goals for Next Period" 
              action={
                <Tooltip title="AI Generated Content">
                  <BrainIcon color="secondary" />
                </Tooltip>
              }
            />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={formData.goalsForNextPeriod}
                onChange={(e) => handleFieldChange('goalsForNextPeriod', e.target.value)}
                placeholder="Objectives and targets for the next review period..."
                disabled={readOnly || saving}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Development Plan */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Development Plan" 
              action={
                <Tooltip title="AI Generated Content">
                  <BrainIcon color="secondary" />
                </Tooltip>
              }
            />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.developmentPlan}
                onChange={(e) => handleFieldChange('developmentPlan', e.target.value)}
                placeholder="Specific development activities and learning opportunities..."
                disabled={readOnly || saving}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Manager Comments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Manager Comments" />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.managerComments}
                onChange={(e) => handleFieldChange('managerComments', e.target.value)}
                placeholder="Additional manager feedback and observations..."
                disabled={readOnly || saving}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Employee Comments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Employee Comments" />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.employeeComments}
                onChange={(e) => handleFieldChange('employeeComments', e.target.value)}
                placeholder="Employee self-reflection and feedback..."
                disabled={readOnly || saving}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Overall Rating */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Overall Rating" />
            <CardContent>
              <TextField
                type="number"
                value={formData.overallRating}
                onChange={(e) => handleFieldChange('overallRating', parseFloat(e.target.value))}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                disabled={readOnly || saving}
                variant="outlined"
                sx={{ width: 200 }}
                helperText="Rating from 0.0 to 5.0"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      {!readOnly && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
          <Box>
            {hasChanges && (
              <Alert severity="warning" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1 }} />
                You have unsaved changes
              </Alert>
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => setPreviewOpen(true)}
              startIcon={<PreviewIcon />}
            >
              Preview
            </Button>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              startIcon={saving ? <RefreshIcon className="animate-spin" /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Review'}
            </Button>
          </Stack>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Strengths</Typography>
            <Typography variant="body2" paragraph>{formData.strengths}</Typography>
            
            <Typography variant="h6" gutterBottom>Areas for Improvement</Typography>
            <Typography variant="body2" paragraph>{formData.areasForImprovement}</Typography>
            
            <Typography variant="h6" gutterBottom>Key Achievements</Typography>
            <Typography variant="body2" paragraph>{formData.achievements}</Typography>
            
            <Typography variant="h6" gutterBottom>Goals for Next Period</Typography>
            <Typography variant="body2" paragraph>{formData.goalsForNextPeriod}</Typography>
            
            <Typography variant="h6" gutterBottom>Development Plan</Typography>
            <Typography variant="body2" paragraph>{formData.developmentPlan}</Typography>
            
            {formData.managerComments && (
              <>
                <Typography variant="h6" gutterBottom>Manager Comments</Typography>
                <Typography variant="body2" paragraph>{formData.managerComments}</Typography>
              </>
            )}
            
            {formData.employeeComments && (
              <>
                <Typography variant="h6" gutterBottom>Employee Comments</Typography>
                <Typography variant="body2" paragraph>{formData.employeeComments}</Typography>
              </>
            )}
            
            <Typography variant="h6" gutterBottom>Overall Rating</Typography>
            <Typography variant="body2">{formData.overallRating}/5.0</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIReviewEditor; 