import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Button,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Reply as ReplyIcon, Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { feedbackService } from '../../services/feedback.service';
import { Feedback } from '../../types/feedback';

interface FeedbackThreadProps {
  feedbackId: string;
  onReplyAdded?: () => void;
}

export const FeedbackThread: React.FC<FeedbackThreadProps> = ({ feedbackId, onReplyAdded }) => {
  const { currentUser } = useAuth();
  const [thread, setThread] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [replyContent, setReplyContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        const threadData = await feedbackService.getThread(feedbackId);
        setThread(threadData);
        setError(null);
      } catch (err) {
        setError('Failed to load feedback thread');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [feedbackId]);

  const handleReply = async () => {
    if (!thread || !replyContent.trim()) return;

    try {
      setSubmitting(true);
      await feedbackService.replyToFeedback(feedbackId, {
        content: replyContent,
        receiver_id: thread.giver.id, // Reply to the original giver
        feedback_type: thread.feedback_type,
        visibility: thread.visibility,
      });
      
      // Refresh thread data
      const updatedThread = await feedbackService.getThread(feedbackId);
      setThread(updatedThread);
      
      // Clear input
      setReplyContent('');
      
      // Notify parent component if needed
      if (onReplyAdded) {
        onReplyAdded();
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to send reply');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={2}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!thread) {
    return (
      <Box my={2}>
        <Typography>Feedback not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Original feedback */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="flex-start" mb={2}>
            <Avatar 
              src={thread.giver.profileImageUrl || undefined} 
              alt={`${thread.giver.firstName} ${thread.giver.lastName}`}
              sx={{ mr: 2 }}
            >
              {thread.giver.firstName.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight="bold">
                  {thread.is_anonymous ? 'Anonymous' : `${thread.giver.firstName} ${thread.giver.lastName}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                to {`${thread.receiver.firstName} ${thread.receiver.lastName}`}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {thread.content}
          </Typography>

          <Stack direction="row" spacing={1} mb={1}>
            <Chip 
              size="small" 
              label={thread.feedback_type.replace('_', ' ')} 
              color="primary" 
              variant="outlined"
            />
            {thread.tags?.map(tag => (
              <Chip 
                key={tag.id} 
                size="small" 
                label={tag.name} 
                color="secondary" 
                variant="outlined" 
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Replies */}
      {thread.replies && thread.replies.length > 0 && (
        <Box ml={6} mb={3}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
          </Typography>
          
          {thread.replies.map((reply) => (
            <Card key={reply.id} variant="outlined" sx={{ mb: 1.5 }}>
              <CardContent>
                <Box display="flex" alignItems="flex-start" mb={1}>
                  <Avatar 
                    src={reply.giver.profileImageUrl || reply.giver.avatar_url || undefined} 
                    alt={`${reply.giver.firstName} ${reply.giver.lastName}`}
                    sx={{ mr: 2, width: 32, height: 32 }}
                  >
                    {reply.giver.firstName.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">
                        {reply.is_anonymous ? 'Anonymous' : `${reply.giver.firstName} ${reply.giver.lastName}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" ml={6}>
                  {reply.content}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Reply form */}
      <Box display="flex" alignItems="flex-start" mt={3}>
        <Avatar 
          src={currentUser?.profileImageUrl || undefined} 
          alt={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'You'}
          sx={{ mr: 2 }}
        >
          {currentUser?.firstName?.charAt(0) || 'U'}
        </Avatar>
        <Box flex={1}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            variant="outlined"
            disabled={submitting}
          />
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleReply}
              disabled={!replyContent.trim() || submitting}
            >
              {submitting ? 'Sending...' : 'Reply'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}; 