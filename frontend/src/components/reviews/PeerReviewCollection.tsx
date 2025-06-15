import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reviewsService } from '../../services/reviewsService';
import { employeeService } from '../../services/employeeService';
import { aiService } from '../../services/aiService';
import { Employee } from '../../types/employee';

// Import PeerReview type from service
type PeerReview = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerAvatar?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  content?: {
    strengths: string;
    improvements: string;
    collaboration: string;
    overall: string;
  };
};

interface PeerReviewCollectionProps {
  employeeId: string;
  reviewCycleId: string;
  managerId?: string;
  isManager?: boolean;
}

export const PeerReviewCollection: React.FC<PeerReviewCollectionProps> = ({
  employeeId,
  reviewCycleId,
  managerId,
  isManager = false,
}) => {
  const [selectedReview, setSelectedReview] = useState<PeerReview | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [availablePeers, setAvailablePeers] = useState<Employee[]>([]);
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    strengths: '',
    improvements: '',
    collaboration: '',
    overall: '',
  });

  const queryClient = useQueryClient();

  // Fetch peer reviews for the employee
  const { 
    data: peerReviews, 
    isLoading: isLoadingReviews, 
    error: reviewsError 
  } = useQuery(
    ['peerReviews', employeeId, reviewCycleId],
    () => reviewsService.getPeerReviews(employeeId, reviewCycleId)
  );

  // Fetch available peers for review requests
  const { 
    data: peers, 
    isLoading: isLoadingPeers 
  } = useQuery(
    ['availablePeers', employeeId],
    () => employeeService.getAvailablePeersForReview(employeeId),
    {
      enabled: isAddDialogOpen, // Only fetch when dialog is open
      onSuccess: (data) => {
        setAvailablePeers(data);
      },
    }
  );

  // Request peer reviews mutation
  const requestReviewsMutation = useMutation(
    (peerIds: string[]) => reviewsService.requestPeerReviews(employeeId, reviewCycleId, peerIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['peerReviews', employeeId, reviewCycleId]);
        setIsAddDialogOpen(false);
        setSelectedPeers([]);
      },
    }
  );

  // Submit peer review mutation
  const submitReviewMutation = useMutation(
    (reviewData: { reviewId: string; content: typeof reviewFormData }) => 
      reviewsService.submitPeerReview(employeeId, reviewCycleId, reviewData.content),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['peerReviews', employeeId, reviewCycleId]);
        setIsReviewDialogOpen(false);
        setSelectedReview(null);
        setReviewFormData({
          strengths: '',
          improvements: '',
          collaboration: '',
          overall: '',
        });
      },
    }
  );

  // Approve/reject review mutation
  const updateReviewStatusMutation = useMutation(
    (data: { reviewId: string; status: 'approved' | 'rejected' }) => 
      reviewsService.updateReviewStatus(data.reviewId, data.status === 'approved' ? 'completed' : 'rejected'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['peerReviews', employeeId, reviewCycleId]);
      },
    }
  );

  // Generate AI suggestions for peer review
  const generateAiSuggestions = async () => {
    if (!selectedReview) return;
    
    setIsGeneratingAI(true);
    try {
      const response = await aiService.generateReview({
        employeeId: employeeId,
        reviewType: 'peer',
        context: `Peer review for employee ${employeeId} by reviewer ${selectedReview.reviewerId}`
      });
      
      setReviewFormData({
        strengths: response.content.strengths.join('\n') || '',
        improvements: response.content.areasForImprovement.join('\n') || '',
        collaboration: response.content.specificExamples.join('\n') || '',
        overall: response.content.summary || '',
      });
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleRequestReviews = () => {
    if (selectedPeers.length > 0) {
      requestReviewsMutation.mutate(selectedPeers);
    }
  };

  const handleSubmitReview = () => {
    if (selectedReview) {
      submitReviewMutation.mutate({
        reviewId: selectedReview.id,
        content: reviewFormData,
      });
    }
  };

  const handleOpenReviewDialog = (review: PeerReview) => {
    setSelectedReview(review);
    if (review.content) {
      setReviewFormData(review.content);
    } else {
      setReviewFormData({
        strengths: '',
        improvements: '',
        collaboration: '',
        overall: '',
      });
    }
    setIsReviewDialogOpen(true);
  };

  const handlePeerSelection = (peerId: string) => {
    setSelectedPeers((prev) => {
      if (prev.includes(peerId)) {
        return prev.filter((id) => id !== peerId);
      } else {
        return [...prev, peerId];
      }
    });
  };

  const handleInputChange = (field: keyof typeof reviewFormData, value: string) => {
    setReviewFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Group reviews by status for better organization
  const groupedReviews = peerReviews ? {
    pending: peerReviews.filter(review => review.status === 'pending'),
    submitted: peerReviews.filter(review => review.status === 'submitted'),
    completed: peerReviews.filter(review => ['approved', 'rejected'].includes(review.status)),
  } : { pending: [], submitted: [], completed: [] };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          Peer Reviews
        </Typography>
        <Box>
          {isManager && (
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={() => setIsAddDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Request Reviews
            </Button>
          )}
          <Button 
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries(['peerReviews', employeeId, reviewCycleId])}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {isLoadingReviews ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : reviewsError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading peer reviews. Please try again.
        </Alert>
      ) : (
        <>
          {/* Pending Reviews */}
          {groupedReviews.pending.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                Pending Reviews
              </Typography>
              <List>
                {groupedReviews.pending.map((review) => (
                  <ListItem 
                    key={review.id} 
                    divider 
                    secondaryAction={
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenReviewDialog(review)}
                      >
                        {review.reviewerId === managerId ? 'Provide Review' : 'View'}
                      </Button>
                    }
                  >
                    <ListItemText 
                      primary={review.reviewerName} 
                      secondary={review.reviewerRole} 
                    />
                    <Chip 
                      label="Pending" 
                      size="small" 
                      color="warning" 
                      sx={{ mr: 2 }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Submitted Reviews */}
          {groupedReviews.submitted.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                Submitted Reviews
              </Typography>
              <Grid container spacing={2}>
                {groupedReviews.submitted.map((review) => (
                  <Grid item xs={12} md={6} key={review.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar src={review.reviewerAvatar} sx={{ mr: 2 }}>
                            {review.reviewerName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">
                              {review.reviewerName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {review.reviewerRole}
                            </Typography>
                          </Box>
                          <Chip 
                            label="Submitted" 
                            size="small" 
                            color="info" 
                            sx={{ ml: 'auto' }} 
                          />
                        </Box>
                        
                        {review.content && (
                          <>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <strong>Strengths:</strong>
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {review.content.strengths.substring(0, 100)}
                              {review.content.strengths.length > 100 ? '...' : ''}
                            </Typography>
                          </>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => handleOpenReviewDialog(review)}
                        >
                          View Full Review
                        </Button>
                        {isManager && (
                          <>
                            <Button 
                              size="small" 
                              color="primary"
                              startIcon={<CheckIcon />}
                              onClick={() => updateReviewStatusMutation.mutate({
                                reviewId: review.id,
                                status: 'approved'
                              })}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="small" 
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => updateReviewStatusMutation.mutate({
                                reviewId: review.id,
                                status: 'rejected'
                              })}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Completed Reviews */}
          {groupedReviews.completed.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                Completed Reviews
              </Typography>
              <Grid container spacing={2}>
                {groupedReviews.completed.map((review) => (
                  <Grid item xs={12} md={6} key={review.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar src={review.reviewerAvatar} sx={{ mr: 2 }}>
                            {review.reviewerName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">
                              {review.reviewerName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {review.reviewerRole}
                            </Typography>
                          </Box>
                          <Chip 
                            label={review.status === 'approved' ? 'Approved' : 'Rejected'} 
                            size="small" 
                            color={review.status === 'approved' ? 'success' : 'error'} 
                            sx={{ ml: 'auto' }} 
                          />
                        </Box>
                        
                        {review.content && review.status === 'approved' && (
                          <>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <strong>Overall Assessment:</strong>
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {review.content.overall.substring(0, 100)}
                              {review.content.overall.length > 100 ? '...' : ''}
                            </Typography>
                          </>
                        )}
                      </CardContent>
                      <CardActions>
                        {review.status === 'approved' && (
                          <Button 
                            size="small" 
                            onClick={() => handleOpenReviewDialog(review)}
                          >
                            View Full Review
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Empty state */}
          {!peerReviews?.length && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No peer reviews have been requested yet.
              </Typography>
              {isManager && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Request Peer Reviews
                </Button>
              )}
            </Box>
          )}
        </>
      )}

      {/* Dialog for requesting peer reviews */}
      <Dialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Request Peer Reviews</DialogTitle>
        <DialogContent>
          {isLoadingPeers ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                Select team members to request peer reviews from:
              </Typography>
              <List>
                {availablePeers.map((peer) => (
                  <ListItem 
                    key={peer.id}
                    secondaryAction={
                      <IconButton 
                        edge="end"
                        onClick={() => handlePeerSelection(peer.id)}
                      >
                        {selectedPeers.includes(peer.id) ? (
                          <CheckIcon color="primary" />
                        ) : (
                          <AddIcon />
                        )}
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={peer.name || 'Unknown'} 
                      secondary={`${peer.role || 'Unknown Role'} • ${peer.department || 'Unknown Department'}`} 
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRequestReviews}
            disabled={selectedPeers.length === 0 || requestReviewsMutation.isLoading}
            startIcon={requestReviewsMutation.isLoading ? <CircularProgress size={20} /> : null}
          >
            {requestReviewsMutation.isLoading ? 'Sending...' : 'Send Requests'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for viewing/submitting peer review */}
      <Dialog 
        open={isReviewDialogOpen} 
        onClose={() => setIsReviewDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedReview?.status === 'pending' && selectedReview?.reviewerId === managerId
            ? 'Provide Peer Review'
            : 'Peer Review Details'
          }
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar src={selectedReview.reviewerAvatar} sx={{ mr: 2, width: 56, height: 56 }}>
                  {selectedReview.reviewerName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedReview.reviewerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedReview.reviewerRole}
                  </Typography>
                </Box>
                <Chip 
                  label={
                    selectedReview.status === 'pending' ? 'Pending' :
                    selectedReview.status === 'submitted' ? 'Submitted' :
                    selectedReview.status === 'approved' ? 'Approved' : 'Rejected'
                  } 
                  size="small" 
                  color={
                    selectedReview.status === 'pending' ? 'warning' :
                    selectedReview.status === 'submitted' ? 'info' :
                    selectedReview.status === 'approved' ? 'success' : 'error'
                  } 
                  sx={{ ml: 'auto' }} 
                />
              </Box>

              {/* AI Assistance for reviewers */}
              {selectedReview.status === 'pending' && selectedReview.reviewerId === managerId && (
                <Box mb={3} p={2} bgcolor="background.paper" borderRadius={1} border={1} borderColor="divider">
                  <Typography variant="subtitle1" gutterBottom>
                    AI Assistance
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Let AI help you draft a peer review based on your work history with this employee.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={generateAiSuggestions}
                    disabled={isGeneratingAI}
                    startIcon={isGeneratingAI ? <CircularProgress size={20} /> : null}
                  >
                    {isGeneratingAI ? 'Generating...' : 'Generate AI Draft'}
                  </Button>
                </Box>
              )}

              {/* Review form/content */}
              {(selectedReview.status === 'pending' && selectedReview.reviewerId === managerId) ? (
                // Editable form for reviewers
                <>
                  <TextField
                    label="Strengths"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    value={reviewFormData.strengths}
                    onChange={(e) => handleInputChange('strengths', e.target.value)}
                    placeholder="Describe the employee's key strengths and accomplishments..."
                  />
                  <TextField
                    label="Areas for Improvement"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    value={reviewFormData.improvements}
                    onChange={(e) => handleInputChange('improvements', e.target.value)}
                    placeholder="Suggest areas where the employee could improve..."
                  />
                  <TextField
                    label="Collaboration & Teamwork"
                    multiline
                    rows={3}
                    fullWidth
                    margin="normal"
                    value={reviewFormData.collaboration}
                    onChange={(e) => handleInputChange('collaboration', e.target.value)}
                    placeholder="Comment on how the employee works with others..."
                  />
                  <TextField
                    label="Overall Assessment"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    value={reviewFormData.overall}
                    onChange={(e) => handleInputChange('overall', e.target.value)}
                    placeholder="Provide an overall assessment of the employee's performance..."
                  />
                </>
              ) : selectedReview.content ? (
                // Read-only view for submitted reviews
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Strengths
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedReview.content.strengths}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Areas for Improvement
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedReview.content.improvements}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Collaboration & Teamwork
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedReview.content.collaboration}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Overall Assessment
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedReview.content.overall}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  This review has not been submitted yet.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsReviewDialogOpen(false)}>
            Close
          </Button>
          {selectedReview?.status === 'pending' && selectedReview?.reviewerId === managerId && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSubmitReview}
              disabled={submitReviewMutation.isLoading || !reviewFormData.strengths || !reviewFormData.overall}
              startIcon={submitReviewMutation.isLoading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {submitReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          )}
          {selectedReview?.status === 'submitted' && isManager && (
            <>
              <Button 
                variant="outlined" 
                color="success"
                onClick={() => updateReviewStatusMutation.mutate({
                  reviewId: selectedReview.id,
                  status: 'approved'
                })}
                disabled={updateReviewStatusMutation.isLoading}
              >
                Approve
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => updateReviewStatusMutation.mutate({
                  reviewId: selectedReview.id,
                  status: 'rejected'
                })}
                disabled={updateReviewStatusMutation.isLoading}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}; 