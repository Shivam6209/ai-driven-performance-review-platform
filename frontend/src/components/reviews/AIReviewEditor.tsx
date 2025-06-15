import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Rating,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

interface ManagerAssessment {
  strengths: string;
  areasForImprovement: string;
  goalAssessment: string;
  skillsAssessment: string;
  overallFeedback: string;
  performanceRating: number;
}

interface AIReviewEditorProps {
  employeeId: string;
  reviewCycleId: string;
  initialData?: ManagerAssessment;
  onSubmit: (assessment: ManagerAssessment) => void;
  onCancel: () => void;
}

export const AIReviewEditor: React.FC<AIReviewEditorProps> = ({
  employeeId,
  reviewCycleId,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [assessment, setAssessment] = useState<ManagerAssessment>({
    strengths: initialData?.strengths || '',
    areasForImprovement: initialData?.areasForImprovement || '',
    goalAssessment: initialData?.goalAssessment || '',
    skillsAssessment: initialData?.skillsAssessment || '',
    overallFeedback: initialData?.overallFeedback || '',
    performanceRating: initialData?.performanceRating || 3,
  });

  const handleSubmit = () => {
    onSubmit(assessment);
  };

  const handleFieldChange = (field: keyof ManagerAssessment, value: string | number) => {
    setAssessment(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Manager Assessment
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Strengths"
              value={assessment.strengths}
              onChange={(e) => handleFieldChange('strengths', e.target.value)}
              placeholder="Describe the employee's key strengths and accomplishments..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Areas for Improvement"
              value={assessment.areasForImprovement}
              onChange={(e) => handleFieldChange('areasForImprovement', e.target.value)}
              placeholder="Identify areas where the employee can grow and improve..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Goal Assessment"
              value={assessment.goalAssessment}
              onChange={(e) => handleFieldChange('goalAssessment', e.target.value)}
              placeholder="Evaluate the employee's progress on their goals..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Skills Assessment"
              value={assessment.skillsAssessment}
              onChange={(e) => handleFieldChange('skillsAssessment', e.target.value)}
              placeholder="Assess the employee's technical and soft skills..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Overall Feedback"
              value={assessment.overallFeedback}
              onChange={(e) => handleFieldChange('overallFeedback', e.target.value)}
              placeholder="Provide overall feedback and recommendations..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box>
              <Typography component="legend" gutterBottom>
                Performance Rating
              </Typography>
              <Rating
                value={assessment.performanceRating}
                onChange={(event, newValue) => {
                  handleFieldChange('performanceRating', newValue || 1);
                }}
                max={5}
                size="large"
              />
            </Box>
          </Grid>
        </Grid>
        
        <Box display="flex" gap={2} mt={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
          >
            Save Assessment
          </Button>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 