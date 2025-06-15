import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import ReviewTemplate from '@/components/reviews/ReviewTemplate';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';

// Sample review sections - in a real app, these would come from the backend
const reviewSections = [
  {
    id: 'achievements',
    sectionName: 'Key Achievements',
    sectionType: 'text' as const,
    description: 'Describe the major accomplishments during the review period.',
    isRequired: true,
    aiGenerationEnabled: true,
    maxLength: 1000,
  },
  {
    id: 'strengths',
    sectionName: 'Strengths',
    sectionType: 'text' as const,
    description: 'Highlight areas where the employee has demonstrated exceptional skills.',
    isRequired: true,
    aiGenerationEnabled: true,
    maxLength: 500,
  },
  {
    id: 'improvements',
    sectionName: 'Areas for Improvement',
    sectionType: 'text' as const,
    description: 'Identify opportunities for growth and development.',
    isRequired: true,
    aiGenerationEnabled: true,
    maxLength: 500,
  },
  {
    id: 'goals',
    sectionName: 'Goals for Next Period',
    sectionType: 'text' as const,
    description: 'Set clear, measurable goals for the next review period.',
    isRequired: true,
    aiGenerationEnabled: true,
    maxLength: 1000,
  },
];

const CreateReviewPage: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [reviewType, setReviewType] = useState<'self' | 'peer' | 'manager'>('self');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [reviewData, setReviewData] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // In a real app, fetch employees from API
    // For now, using mock data
    setEmployees([
      { id: 'emp1', name: 'John Doe' },
      { id: 'emp2', name: 'Jane Smith' },
      { id: 'emp3', name: 'Robert Johnson' },
    ]);
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReviewTypeChange = (event: SelectChangeEvent<string>) => {
    setReviewType(event.target.value as 'self' | 'peer' | 'manager');
  };

  const handleEmployeeChange = (event: SelectChangeEvent<string>) => {
    setSelectedEmployee(event.target.value);
  };

  const handleReviewSave = (data: Record<string, string | number>) => {
    setReviewData(data);
    handleNext();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // In a real app, submit to API
      // For now, just simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/reviews');
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ['Select Review Type', 'Complete Review', 'Review & Submit'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Review Type
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="review-type-label">Review Type</InputLabel>
                <Select
                  labelId="review-type-label"
                  id="review-type"
                  value={reviewType}
                  label="Review Type"
                  onChange={handleReviewTypeChange}
                >
                  <MenuItem value="self">Self Assessment</MenuItem>
                  <MenuItem value="peer">Peer Review</MenuItem>
                  <MenuItem value="manager">Manager Review</MenuItem>
                </Select>
              </FormControl>

              {(reviewType === 'peer' || reviewType === 'manager') && (
                <FormControl fullWidth>
                  <InputLabel id="employee-select-label">Select Employee</InputLabel>
                  <Select
                    labelId="employee-select-label"
                    id="employee-select"
                    value={selectedEmployee}
                    label="Select Employee"
                    onChange={handleEmployeeChange}
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Paper>
        );
      case 1:
        return (
          <ReviewTemplate
            templateName={`${
              reviewType === 'self'
                ? 'Self Assessment'
                : reviewType === 'peer'
                ? 'Peer Review'
                : 'Manager Review'
            }`}
            description="Complete the review form below. You can use AI assistance to generate content based on available data."
            sections={reviewSections}
            onSave={handleReviewSave}
            onCancel={handleBack}
            initialData={reviewData}
          />
        );
      case 2:
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Review Type:</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {reviewType === 'self'
                  ? 'Self Assessment'
                  : reviewType === 'peer'
                  ? 'Peer Review'
                  : 'Manager Review'}
              </Typography>

              {(reviewType === 'peer' || reviewType === 'manager') && (
                <>
                  <Typography variant="subtitle1">Employee:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {employees.find((emp) => emp.id === selectedEmployee)?.name || ''}
                  </Typography>
                </>
              )}

              {reviewSections.map((section) => (
                <Box key={section.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">{section.sectionName}:</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {reviewData[section.id] || 'Not provided'}
                    </Typography>
                  </Paper>
                </Box>
              ))}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Review
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {activeStep > 0 && activeStep < steps.length - 1 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}

          {activeStep === 0 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={reviewType !== 'self' && !selectedEmployee}
            >
              Next
            </Button>
          )}

          {activeStep === steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default CreateReviewPage; 