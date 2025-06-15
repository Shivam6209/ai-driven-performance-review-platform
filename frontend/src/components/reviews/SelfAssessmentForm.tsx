import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, TextField, Typography, Box, Paper, CircularProgress, Divider, Chip, Rating } from '@mui/material';
import { useQuery, useMutation } from 'react-query';
import { reviewsService } from '../../services/reviewsService';
import { aiService } from '../../services/aiService';
import { okrService } from '../../services/okrService';

interface SelfAssessmentFormProps {
  employeeId: string;
  reviewCycleId: string;
  onSubmit: (data: SelfAssessmentFormData) => void;
  onCancel: () => void;
  initialData?: SelfAssessmentFormData;
}

export interface SelfAssessmentFormData {
  achievements: string;
  challenges: string;
  skillsGained: string;
  goalsProgress: string;
  improvementAreas: string;
  overallRating: number;
}

export const SelfAssessmentForm: React.FC<SelfAssessmentFormProps> = ({
  employeeId,
  reviewCycleId,
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Partial<SelfAssessmentFormData> | null>(null);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<SelfAssessmentFormData>({
    defaultValues: initialData || {
      achievements: '',
      challenges: '',
      skillsGained: '',
      goalsProgress: '',
      improvementAreas: '',
      overallRating: 3,
    },
  });

  // Fetch employee OKRs for the review period
  const { data: employeeOkrs, isLoading: isLoadingOkrs } = useQuery(
    ['employeeOkrs', employeeId, reviewCycleId],
    () => okrService.getEmployeeOkrsForReviewCycle(employeeId, reviewCycleId)
  );

  // Fetch feedback for the employee during the review period
  const { data: employeeFeedback, isLoading: isLoadingFeedback } = useQuery(
    ['employeeFeedback', employeeId, reviewCycleId],
    () => reviewsService.getEmployeeFeedbackForReviewCycle(employeeId, reviewCycleId)
  );

  // Generate AI suggestions for self-assessment
  const generateAiSuggestions = async () => {
    setIsGeneratingAI(true);
    try {
      const suggestions = await aiService.generateSelfAssessmentSuggestions(
        employeeId, 
        reviewCycleId
      );
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Apply AI suggestions to form
  const applyAiSuggestions = () => {
    if (aiSuggestions) {
      Object.entries(aiSuggestions).forEach(([key, value]) => {
        if (value && key in { achievements: '', challenges: '', skillsGained: '', goalsProgress: '', improvementAreas: '' }) {
          setValue(key as keyof SelfAssessmentFormData, value);
        }
      });
    }
  };

  const onFormSubmit = (data: SelfAssessmentFormData) => {
    onSubmit(data);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Self-Assessment
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {(isLoadingOkrs || isLoadingFeedback) ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {/* OKR Summary Section */}
          {employeeOkrs && employeeOkrs.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Your OKRs for this Review Period
              </Typography>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                {employeeOkrs.map((okr) => (
                  <Box key={okr.id} mb={1} display="flex" alignItems="center">
                    <CircularProgress 
                      variant="determinate" 
                      value={okr.progress} 
                      size={30} 
                      sx={{ mr: 2 }} 
                    />
                    <Box>
                      <Typography variant="body1">{okr.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Progress: {okr.progress}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* AI Assistance Section */}
          <Box mb={3} p={2} bgcolor="background.paper" borderRadius={1}>
            <Typography variant="subtitle1" gutterBottom>
              AI Assistance
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Let AI help you draft your self-assessment based on your goals and feedback.
            </Typography>
            <Box display="flex" gap={2}>
              <Button 
                variant="outlined" 
                onClick={generateAiSuggestions}
                disabled={isGeneratingAI}
                startIcon={isGeneratingAI ? <CircularProgress size={20} /> : null}
              >
                {isGeneratingAI ? 'Generating...' : 'Generate AI Draft'}
              </Button>
              {aiSuggestions && (
                <Button 
                  variant="contained" 
                  onClick={applyAiSuggestions}
                >
                  Apply AI Suggestions
                </Button>
              )}
            </Box>
          </Box>

          {/* Key Achievements */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Key Achievements
            </Typography>
            <TextField
              {...register('achievements', { required: 'This field is required' })}
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your key achievements during this review period..."
              error={!!errors.achievements}
              helperText={errors.achievements?.message}
            />
          </Box>

          {/* Challenges Faced */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Challenges Faced
            </Typography>
            <TextField
              {...register('challenges')}
              fullWidth
              multiline
              rows={4}
              placeholder="Describe any challenges you faced and how you addressed them..."
            />
          </Box>

          {/* Skills Gained */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Skills Gained or Improved
            </Typography>
            <TextField
              {...register('skillsGained')}
              fullWidth
              multiline
              rows={3}
              placeholder="List skills you've developed or improved..."
            />
          </Box>

          {/* Goals Progress */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Goals Progress
            </Typography>
            <TextField
              {...register('goalsProgress', { required: 'This field is required' })}
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your progress on goals set for this period..."
              error={!!errors.goalsProgress}
              helperText={errors.goalsProgress?.message}
            />
          </Box>

          {/* Areas for Improvement */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Areas for Improvement
            </Typography>
            <TextField
              {...register('improvementAreas')}
              fullWidth
              multiline
              rows={3}
              placeholder="Identify areas where you'd like to improve..."
            />
          </Box>

          {/* Overall Self Rating */}
          <Box mb={4}>
            <Typography variant="subtitle1" gutterBottom>
              Overall Self Rating
            </Typography>
            <Controller
              name="overallRating"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  precision={0.5}
                  size="large"
                />
              )}
            />
          </Box>

          {/* Form Actions */}
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit Self-Assessment
            </Button>
          </Box>
        </form>
      )}
    </Paper>
  );
}; 