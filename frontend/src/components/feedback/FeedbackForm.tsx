import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  SelectChangeEvent,
  InputLabel,
  FormHelperText,
  Grid,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FeedbackSentimentAnalysis from './FeedbackSentimentAnalysis';
import { SentimentAnalysisResult } from '@/services/sentiment.service';

// Define types locally since we're having issues with imports
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Skill {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

enum FeedbackType {
  PEER = 'peer',
  UPWARD = 'upward',
  DOWNWARD = 'downward',
  SELF = 'self'
}

enum FeedbackVisibility {
  RECIPIENT_ONLY = 'recipient_only',
  RECIPIENT_AND_MANAGER = 'recipient_and_manager',
  PUBLIC = 'public'
}

interface Feedback {
  id?: string;
  senderId?: string;
  recipientId: string;
  type: FeedbackType;
  content: string;
  visibility: FeedbackVisibility;
  context: 'general' | 'project' | 'skill';
  projectId?: string;
  skillIds?: string[];
  sentimentAnalysis?: SentimentAnalysisResult | null;
}

interface FeedbackFormProps {
  onSubmit: (feedback: Feedback) => Promise<void>;
  recipient?: User | null;
  recipientOptions?: User[];
  projectOptions?: Project[];
  skillOptions?: Skill[];
  initialValues?: Partial<Feedback>;
  isSubmitting?: boolean;
  error?: string | null;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  recipient,
  recipientOptions = [],
  projectOptions = [],
  skillOptions = [],
  initialValues,
  isSubmitting = false,
  error = null,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysisResult | null>(null);
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false);
  const lastRecipientIdRef = useRef<string | null>(null);

  const validationSchema = Yup.object({
    recipientId: Yup.string().required('Recipient is required'),
    type: Yup.string().required('Feedback type is required'),
    content: Yup.string().required('Feedback content is required').min(10, 'Feedback must be at least 10 characters'),
    visibility: Yup.string().required('Visibility setting is required'),
    projectId: Yup.string().when('context', {
      is: (val: string) => val === 'project',
      then: (schema) => schema.required('Project is required when context is project'),
    }),
  });

  const formik = useFormik({
    initialValues: {
      recipientId: recipient?.id || initialValues?.recipientId || '',
      type: initialValues?.type || FeedbackType.PEER,
      content: initialValues?.content || '',
      visibility: initialValues?.visibility || FeedbackVisibility.RECIPIENT_AND_MANAGER,
      context: initialValues?.context || 'general',
      projectId: initialValues?.projectId || '',
      skillIds: initialValues?.skillIds || [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit({
          ...values,
          type: values.type as FeedbackType,
          visibility: values.visibility as FeedbackVisibility,
          skillIds: selectedSkills.map((skill) => skill.id),
          sentimentAnalysis: sentimentAnalysis,
        });
        formik.resetForm();
        setSelectedSkills([]);
        setSentimentAnalysis(null);
        setShowSentimentAnalysis(false);
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    },
  });

  useEffect(() => {
    if (recipient && recipient.id && recipient.id !== lastRecipientIdRef.current) {
      formik.setFieldValue('recipientId', recipient.id);
      lastRecipientIdRef.current = recipient.id;
    }
  }, [recipient?.id]);

  useEffect(() => {
    if (initialValues?.skillIds && initialValues.skillIds.length > 0) {
      const initialSkills = skillOptions.filter((skill) =>
        initialValues.skillIds?.includes(skill.id)
      );
      setSelectedSkills(initialSkills);
    }
  }, [initialValues?.skillIds, skillOptions]);

  const handleSkillChange = (event: SelectChangeEvent<string[]>) => {
    const skillIds = event.target.value as string[];
    const skills = skillOptions.filter((skill) => skillIds.includes(skill.id));
    setSelectedSkills(skills);
    formik.setFieldValue('skillIds', skillIds);
  };

  const handleDeleteSkill = (skillId: string) => {
    const updatedSkills = selectedSkills.filter((skill) => skill.id !== skillId);
    setSelectedSkills(updatedSkills);
    formik.setFieldValue(
      'skillIds',
      updatedSkills.map((skill) => skill.id)
    );
  };

  const handleAnalysisComplete = (result: SentimentAnalysisResult) => {
    setSentimentAnalysis(result);
    
    // Show warnings for concerning sentiment or bias
    if (result.sentiment === 'concerning' || result.biasDetected) {
      setShowSentimentAnalysis(true);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {initialValues ? 'Edit Feedback' : 'Provide Feedback'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={formik.touched.recipientId && Boolean(formik.errors.recipientId)}
                disabled={Boolean(recipient)}
              >
                <InputLabel id="recipient-label">Recipient</InputLabel>
                <Select
                  labelId="recipient-label"
                  id="recipientId"
                  name="recipientId"
                  value={formik.values.recipientId}
                  onChange={formik.handleChange}
                  label="Recipient"
                >
                  {recipientOptions.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.recipientId && formik.errors.recipientId && (
                  <FormHelperText>{formik.errors.recipientId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={formik.touched.type && Boolean(formik.errors.type)}
              >
                <InputLabel id="type-label">Feedback Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  label="Feedback Type"
                >
                  <MenuItem value={FeedbackType.PEER}>Peer Feedback</MenuItem>
                  <MenuItem value={FeedbackType.UPWARD}>Upward Feedback</MenuItem>
                  <MenuItem value={FeedbackType.DOWNWARD}>Downward Feedback</MenuItem>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText>{formik.errors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={formik.touched.content && Boolean(formik.errors.content)}
              >
                <TextField
                  id="content"
                  name="content"
                  label="Feedback Content"
                  multiline
                  rows={6}
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.content && Boolean(formik.errors.content)}
                  helperText={formik.touched.content && formik.errors.content}
                  placeholder="Provide specific, actionable feedback..."
                />
              </FormControl>
            </Grid>

            {showSentimentAnalysis && (
              <Grid item xs={12}>
                <FeedbackSentimentAnalysis 
                  content={formik.values.content} 
                  onAnalysisComplete={handleAnalysisComplete}
                  autoAnalyze={false}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={formik.touched.context && Boolean(formik.errors.context)}
              >
                <InputLabel id="context-label">Context</InputLabel>
                <Select
                  labelId="context-label"
                  id="context"
                  name="context"
                  value={formik.values.context}
                  onChange={formik.handleChange}
                  label="Context"
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                  <MenuItem value="skill">Skill Development</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={formik.touched.visibility && Boolean(formik.errors.visibility)}
              >
                <InputLabel id="visibility-label">Visibility</InputLabel>
                <Select
                  labelId="visibility-label"
                  id="visibility"
                  name="visibility"
                  value={formik.values.visibility}
                  onChange={formik.handleChange}
                  label="Visibility"
                >
                  <MenuItem value={FeedbackVisibility.RECIPIENT_ONLY}>Recipient Only</MenuItem>
                  <MenuItem value={FeedbackVisibility.RECIPIENT_AND_MANAGER}>Recipient & Manager</MenuItem>
                  <MenuItem value={FeedbackVisibility.PUBLIC}>Public</MenuItem>
                </Select>
                {formik.touched.visibility && formik.errors.visibility && (
                  <FormHelperText>{formik.errors.visibility}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {formik.values.context === 'project' && (
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={formik.touched.projectId && Boolean(formik.errors.projectId)}
                >
                  <InputLabel id="project-label">Project</InputLabel>
                  <Select
                    labelId="project-label"
                    id="projectId"
                    name="projectId"
                    value={formik.values.projectId}
                    onChange={formik.handleChange}
                    label="Project"
                  >
                    {projectOptions.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.projectId && formik.errors.projectId && (
                    <FormHelperText>{formik.errors.projectId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
            
            {(formik.values.context === 'skill' || formik.values.context === 'general') && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="skills-label">Related Skills</InputLabel>
                  <Select
                    labelId="skills-label"
                    id="skills"
                    multiple
                    value={selectedSkills.map((skill) => skill.id)}
                    onChange={handleSkillChange}
                    renderValue={() => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedSkills.map((skill) => (
                          <Chip
                            key={skill.id}
                            label={skill.name}
                            onDelete={() => handleDeleteSkill(skill.id)}
                            onMouseDown={(event) => {
                              event.stopPropagation();
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    label="Related Skills"
                  >
                    {skillOptions.map((skill) => (
                      <MenuItem key={skill.id} value={skill.id}>
                        {skill.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowSentimentAnalysis(!showSentimentAnalysis)}
                  disabled={!formik.values.content || formik.values.content.length < 10}
                >
                  {showSentimentAnalysis ? 'Hide Analysis' : 'Analyze Sentiment'}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || !formik.isValid}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm; 