import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AIReviewEditor } from './AIReviewEditor';
import { ReviewTemplate } from './ReviewTemplate';
import { ReviewSection } from '@/types/review';

export interface ReviewStep {
  id: string;
  label: string;
  type: 'self_assessment' | 'peer_review' | 'manager_review' | 'hr_review' | 'final_approval';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignee: {
    id: string;
    name: string;
    role: string;
  };
  dueDate: string;
  templateId?: string;
  aiAssisted?: boolean;
}

export interface ReviewWorkflowData {
  id: string;
  employeeId: string;
  reviewCycleId: string;
  currentStepIndex: number;
  steps: ReviewStep[];
  status: 'draft' | 'in_progress' | 'completed';
}

interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  isOptional?: boolean;
}

interface StepData {
  sections: ReviewSection[];
  comments?: string;
  attachments?: File[];
  [key: string]: unknown;
}

interface ReviewWorkflowProps {
  workflow: ReviewWorkflowData;
  onStepComplete: (stepId: string, data: StepData) => Promise<void>;
  onWorkflowComplete: () => Promise<void>;
  onSaveDraft: (stepId: string, data: StepData) => Promise<void>;
  onRegenerateAIContent?: (stepId: string) => Promise<void>;
  isCurrentUserAssignee: boolean;
}

/**
 * ReviewWorkflow Component
 * 
 * Manages the multi-step review process with AI assistance
 */
export const ReviewWorkflow: React.FC<ReviewWorkflowProps> = ({
  workflow,
  onStepComplete,
  onWorkflowComplete,
  onSaveDraft,
  onRegenerateAIContent,
  isCurrentUserAssignee,
}) => {
  const [activeStep, setActiveStep] = useState(workflow.currentStepIndex);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveStep(workflow.currentStepIndex);
  }, [workflow.currentStepIndex]);

  const handleNext = async (stepId: string, data: StepData) => {
    try {
      setLoading(true);
      setError(null);
      await onStepComplete(stepId, data);
      
      if (activeStep === workflow.steps.length - 1) {
        await onWorkflowComplete();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSaveDraft = async (stepId: string, data: StepData) => {
    try {
      setError(null);
      await onSaveDraft(stepId, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    }
  };

  const handleRegenerateAI = async (stepId: string) => {
    if (!onRegenerateAIContent) return;
    
    try {
      setLoading(true);
      setError(null);
      await onRegenerateAIContent(stepId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate AI content');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: ReviewStep) => {
    const isAssignee = isCurrentUserAssignee;
    const isCompleted = step.status === 'completed';
    
    if (step.aiAssisted) {
      return (
        <AIReviewEditor
          sections={[]} // TODO: Pass actual sections
          onSave={(data) => handleNext(step.id, data)}
          onRegenerateSection={
            onRegenerateAIContent
              ? () => handleRegenerateAI(step.id)
              : undefined
          }
          isEditable={isAssignee && !isCompleted}
        />
      );
    }

    return (
      <ReviewTemplate
        template={{
          id: step.templateId || '',
          name: step.label,
          reviewType: step.type === 'self_assessment' ? 'self' : 'manager',
          sections: [], // TODO: Pass actual template sections
        }}
        onSubmit={(data) => handleNext(step.id, data)}
        onSaveDraft={(data) => handleSaveDraft(step.id, data)}
        readOnly={!isAssignee || isCompleted}
      />
    );
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {workflow.steps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography>{step.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Due: {new Date(step.dueDate).toLocaleDateString()}
                </Typography>
              </Box>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                {renderStepContent(step)}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  disabled={index === 0 || loading}
                  onClick={handleBack}
                >
                  Back
                </Button>
                {loading ? (
                  <CircularProgress size={24} />
                ) : null}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === workflow.steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>Review process completed</Typography>
          <Button
            onClick={() => onWorkflowComplete()}
            sx={{ mt: 1, mr: 1 }}
          >
            Finish
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default ReviewWorkflow; 