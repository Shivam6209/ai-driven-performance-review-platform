import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  Comment as CommentIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reviewsService } from '../../services/reviewsService';
import { AIReviewEditor } from './AIReviewEditor';

interface ReviewApprovalProcessProps {
  reviewId: string;
  employeeId: string;
  managerId: string;
  isManager?: boolean;
  isHR?: boolean;
  onComplete?: () => void;
}

interface ReviewData {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  reviewCycleId: string;
  reviewCycleName: string;
  status: 'draft' | 'self_assessment_pending' | 'manager_review_pending' | 'employee_acknowledgment_pending' | 'completed' | 'rejected';
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  content: {
    selfAssessment?: {
      achievements: string;
      challenges: string;
      skillsGained: string;
      goalsProgress: string;
      improvementAreas: string;
      overallRating: number;
    };
    managerAssessment?: {
      strengths: string;
      areasForImprovement: string;
      goalAssessment: string;
      skillsAssessment: string;
      overallFeedback: string;
      performanceRating: number;
    };
    peerReviews?: Array<{
      id: string;
      reviewerName: string;
      content: {
        strengths: string;
        improvements: string;
        collaboration: string;
        overall: string;
      };
    }>;
    employeeAcknowledgment?: {
      acknowledged: boolean;
      comments?: string;
      acknowledgedAt?: string;
    };
    hrNotes?: string;
    finalNotes?: string;
  };
  history: Array<{
    timestamp: string;
    action: string;
    actorId: string;
    actorName: string;
    notes?: string;
  }>;
}

export const ReviewApprovalProcess: React.FC<ReviewApprovalProcessProps> = ({
  reviewId,
  employeeId,
  managerId,
  isManager = false,
  isHR = false,
  onComplete,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [acknowledgmentComment, setAcknowledgmentComment] = useState('');
  const [managerNotes, setManagerNotes] = useState('');
  const [hrNotes, setHrNotes] = useState('');

  const queryClient = useQueryClient();

  // Fetch review data
  const {
    data: review,
    isLoading,
    error,
  } = useQuery<ReviewData>(
    ['review', reviewId],
    () => reviewsService.getReviewById(reviewId),
    {
      onSuccess: (data) => {
        // Set active step based on review status
        let stepIndex = data.currentStep;
        if (data.status === 'completed') {
          stepIndex = 3; // Force to completed step for completed reviews
        }
        setActiveStep(stepIndex);
        
        // Initialize form values from review data
        if (data.content.managerAssessment && isManager) {
          setManagerNotes(data.content.finalNotes || '');
        }
        if (data.content.hrNotes && isHR) {
          setHrNotes(data.content.hrNotes);
        }
      },
    }
  );

  // Update review status mutation
  const updateReviewStatusMutation = useMutation(
    (data: { status: ReviewData['status']; notes?: string }) =>
      reviewsService.updateReviewStatus(reviewId, data.status, data.notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['review', reviewId]);
        if (onComplete) {
          onComplete();
        }
      },
    }
  );

  // Submit manager assessment mutation
  const submitManagerAssessmentMutation = useMutation(
    (data: { assessment: ReviewData['content']['managerAssessment']; finalNotes?: string }) =>
      reviewsService.submitManagerAssessment(reviewId, data.assessment, data.finalNotes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['review', reviewId]);
        setIsEditing(false);
      },
    }
  );

  // Submit employee acknowledgment mutation
  const submitAcknowledgmentMutation = useMutation(
    (data: { acknowledged: boolean; comments?: string }) =>
      reviewsService.submitEmployeeAcknowledgment(reviewId, data.acknowledged, data.comments),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['review', reviewId]);
      },
    }
  );

  // Submit HR notes mutation
  const submitHrNotesMutation = useMutation(
    (notes: string) => reviewsService.submitHrNotes(reviewId, notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['review', reviewId]);
      },
    }
  );

  // Handle manager assessment submission
  const handleManagerAssessmentSubmit = (assessment: ReviewData['content']['managerAssessment']) => {
    submitManagerAssessmentMutation.mutate({
      assessment,
      finalNotes: managerNotes,
    });
  };

  // Handle employee acknowledgment
  const handleAcknowledgment = (acknowledged: boolean) => {
    submitAcknowledgmentMutation.mutate({
      acknowledged,
      comments: acknowledgmentComment,
    });
  };

  // Handle HR notes submission
  const handleHrNotesSubmit = () => {
    submitHrNotesMutation.mutate(hrNotes);
  };

  // Handle status update
  const handleStatusUpdate = (status: ReviewData['status'], notes?: string) => {
    updateReviewStatusMutation.mutate({ status, notes });
  };

  // Define the steps in the review process
  const steps = [
    {
      label: 'Self-Assessment',
      description: 'Employee completes self-assessment',
      status: 'self_assessment_pending',
    },
    {
      label: 'Manager Review',
      description: 'Manager reviews and provides feedback',
      status: 'manager_review_pending',
    },
    {
      label: 'Employee Acknowledgment',
      description: 'Employee acknowledges the review',
      status: 'employee_acknowledgment_pending',
    },
    {
      label: 'Completed',
      description: 'Review process completed',
      status: 'completed',
    },
  ];

  // Determine if the current user can take action on the current step
  const canTakeAction = () => {
    if (!review) return false;

    switch (review.status) {
      case 'self_assessment_pending':
        return employeeId === review.employeeId;
      case 'manager_review_pending':
        return isManager && managerId === review.managerId;
      case 'employee_acknowledgment_pending':
        return employeeId === review.employeeId;
      default:
        return false;
    }
  };

  // Determine if the review is overdue
  const isOverdue = () => {
    if (!review?.dueDate) return false;
    return new Date(review.dueDate) < new Date();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          Review Approval Process
        </Typography>
        <Box>
          {review && (
            <>
              <Chip
                label={review.status.replace(/_/g, ' ').toUpperCase()}
                color={
                  review.status === 'completed'
                    ? 'success'
                    : review.status === 'rejected'
                    ? 'error'
                    : isOverdue()
                    ? 'warning'
                    : 'primary'
                }
                sx={{ mr: 1 }}
              />
              <Tooltip title="View History">
                <IconButton onClick={() => setIsViewingHistory(true)}>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading review data. Please try again.
        </Alert>
      ) : review ? (
        <>
          {/* Review Info */}
          <Box mb={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Employee
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {review.employeeName}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      Manager
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {review.managerName}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Review Cycle
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {review.reviewCycleName}
                    </Typography>
                    
                    {review.dueDate && (
                      <>
                        <Typography variant="subtitle2" color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color={isOverdue() ? 'error' : 'text.primary'}
                        >
                          {new Date(review.dueDate).toLocaleDateString()}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="subtitle1">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {step.description}
                  </Typography>
                  
                  {/* Step-specific content */}
                  {index === 0 && review.content.selfAssessment && (
                    <Box mt={2}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            Key Achievements
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {review.content.selfAssessment.achievements}
                          </Typography>
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Challenges Faced
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {review.content.selfAssessment.challenges}
                          </Typography>
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Goals Progress
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {review.content.selfAssessment.goalsProgress}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            startIcon={<VisibilityIcon />}
                            size="small"
                            onClick={() => {/* View full self-assessment */}}
                          >
                            View Full Self-Assessment
                          </Button>
                        </CardActions>
                      </Card>
                    </Box>
                  )}
                  
                  {index === 1 && (
                    <Box mt={2}>
                      {isEditing ? (
                        <Box>
                          <AIReviewEditor
                            employeeId={review.employeeId}
                            reviewCycleId={review.reviewCycleId}
                            initialData={review.content.managerAssessment}
                            onSubmit={handleManagerAssessmentSubmit}
                            onCancel={() => setIsEditing(false)}
                          />
                          <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>
                              Manager Notes
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              value={managerNotes}
                              onChange={(e) => setManagerNotes(e.target.value)}
                              placeholder="Add any additional notes or context for this review..."
                            />
                          </Box>
                        </Box>
                      ) : review.content.managerAssessment ? (
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              Strengths
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {review.content.managerAssessment.strengths}
                            </Typography>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Areas for Improvement
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {review.content.managerAssessment.areasForImprovement}
                            </Typography>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Overall Feedback
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {review.content.managerAssessment.overallFeedback}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button 
                              startIcon={<VisibilityIcon />}
                              size="small"
                              onClick={() => {/* View full manager assessment */}}
                            >
                              View Full Assessment
                            </Button>
                            {isManager && review.status === 'manager_review_pending' && (
                              <Button 
                                startIcon={<EditIcon />}
                                size="small"
                                onClick={() => setIsEditing(true)}
                              >
                                Edit Assessment
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      ) : isManager && review.status === 'manager_review_pending' ? (
                        <Button
                          variant="contained"
                          onClick={() => setIsEditing(true)}
                          startIcon={<EditIcon />}
                        >
                          Provide Manager Assessment
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Manager assessment has not been provided yet.
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {index === 2 && (
                    <Box mt={2}>
                      {review.content.employeeAcknowledgment ? (
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                                Status:
                              </Typography>
                              <Chip
                                icon={review.content.employeeAcknowledgment.acknowledged ? <CheckCircleIcon /> : <CancelIcon />}
                                label={review.content.employeeAcknowledgment.acknowledged ? 'Acknowledged' : 'Disputed'}
                                color={review.content.employeeAcknowledgment.acknowledged ? 'success' : 'warning'}
                                size="small"
                              />
                            </Box>
                            
                            {review.content.employeeAcknowledgment.comments && (
                              <>
                                <Typography variant="subtitle2" gutterBottom>
                                  Employee Comments
                                </Typography>
                                <Typography variant="body2" paragraph>
                                  {review.content.employeeAcknowledgment.comments}
                                </Typography>
                              </>
                            )}
                            
                            {review.content.employeeAcknowledgment.acknowledgedAt && (
                              <Typography variant="caption" color="text.secondary">
                                Acknowledged on {new Date(review.content.employeeAcknowledgment.acknowledgedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ) : employeeId === review.employeeId && review.status === 'employee_acknowledgment_pending' ? (
                        <Box>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Comments (Optional)"
                            placeholder="Add any comments or feedback about your review..."
                            value={acknowledgmentComment}
                            onChange={(e) => setAcknowledgmentComment(e.target.value)}
                            sx={{ mb: 2 }}
                          />
                          <Box display="flex" gap={2}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleAcknowledgment(true)}
                              startIcon={<CheckCircleIcon />}
                            >
                              Acknowledge Review
                            </Button>
                            <Button
                              variant="outlined"
                              color="warning"
                              onClick={() => handleAcknowledgment(false)}
                              startIcon={<CommentIcon />}
                            >
                              Request Discussion
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Waiting for employee acknowledgment.
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {index === 3 && review.status === 'completed' && (
                    <Box mt={2}>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        This review has been completed on {review.completedAt ? new Date(review.completedAt).toLocaleDateString() : 'N/A'}.
                      </Alert>
                      
                      {review.content.finalNotes && (
                        <Card variant="outlined" sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              Final Notes
                            </Typography>
                            <Typography variant="body2">
                              {review.content.finalNotes}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}
                      
                      {isHR && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            HR Notes
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={hrNotes}
                            onChange={(e) => setHrNotes(e.target.value)}
                            placeholder="Add HR notes for this review (visible to HR only)..."
                            sx={{ mb: 2 }}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleHrNotesSubmit}
                            disabled={submitHrNotesMutation.isLoading}
                          >
                            {submitHrNotesMutation.isLoading ? 'Saving...' : 'Save HR Notes'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {/* Action buttons for each step */}
                  {canTakeAction() && index === activeStep && (
                    <Box sx={{ mt: 2 }}>
                      {index === 1 && isManager && review.content.managerAssessment && !isEditing && (
                        <Box display="flex" gap={2} mt={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleStatusUpdate('employee_acknowledgment_pending')}
                            startIcon={<SendIcon />}
                          >
                            Submit for Employee Acknowledgment
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {/* Navigation buttons */}
          <Box display="flex" justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prevStep) => prevStep - 1)}
              startIcon={<ArrowBackIcon />}
            >
              Previous Step
            </Button>
            <Button
              disabled={activeStep === steps.length - 1 || activeStep >= review.currentStep}
              onClick={() => setActiveStep((prevStep) => prevStep + 1)}
              endIcon={<ArrowForwardIcon />}
            >
              Next Step
            </Button>
          </Box>
        </>
      ) : null}

      {/* History Dialog */}
      <Dialog
        open={isViewingHistory}
        onClose={() => setIsViewingHistory(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Review History</DialogTitle>
        <DialogContent>
          {review?.history.map((event, index) => (
            <Box key={index} mb={2} pb={2} borderBottom={index < review.history.length - 1 ? 1 : 0} borderColor="divider">
              <Typography variant="subtitle2">
                {new Date(event.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>{event.actorName}</strong> {event.action}
              </Typography>
              {event.notes && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {event.notes}
                </Typography>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewingHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}; 