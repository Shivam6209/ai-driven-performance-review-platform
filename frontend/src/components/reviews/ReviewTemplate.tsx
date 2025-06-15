import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Rating,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

export interface ReviewSection {
  id: string;
  sectionName: string;
  sectionType: 'text' | 'rating' | 'multiple_choice';
  description?: string;
  isRequired: boolean;
  maxLength?: number;
  ratingScale?: number;
  options?: string[];
  aiGenerationEnabled: boolean;
  aiGeneratedContent?: string;
  aiConfidenceScore?: number;
}

interface ReviewTemplateProps {
  templateName: string;
  description?: string;
  sections: ReviewSection[];
  onSave: (data: Record<string, string | number>) => void;
  onCancel?: () => void;
  initialData?: Record<string, string | number>;
  isEditable?: boolean;
  showAISources?: boolean;
}

const ReviewTemplate: React.FC<ReviewTemplateProps> = ({
  templateName,
  description,
  sections,
  onSave,
  onCancel,
  initialData = {},
  isEditable = true,
  showAISources = false,
}) => {
  const [formData, setFormData] = useState<Record<string, string | number>>(initialData);
  const [characterCounts, setCharacterCounts] = useState<Record<string, number>>({});

  const handleChange = (id: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Update character count for text fields
    if (typeof value === 'string') {
      setCharacterCounts((prev) => ({ ...prev, [id]: value.length }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Include AI generated content in form data
    const finalData = { ...formData };
    sections.forEach(section => {
      if (section.aiGenerationEnabled && section.aiGeneratedContent && !finalData[section.id]) {
        finalData[section.id] = section.aiGeneratedContent;
      }
    });
    
    onSave(finalData);
  };

  const renderSection = (section: ReviewSection) => {
    const value = formData[section.id] || '';

    switch (section.sectionType) {
      case 'text':
        if (section.aiGenerationEnabled && section.aiGeneratedContent) {
          return (
            <Box>
              <Typography variant="body1" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                {section.aiGeneratedContent}
              </Typography>
              {showAISources && section.aiConfidenceScore && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  AI Confidence: {Math.round(section.aiConfidenceScore * 100)}%
                </Typography>
              )}
            </Box>
          );
        }
        
        return (
          <Box>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={value}
              onChange={(e) => handleChange(section.id, e.target.value)}
              disabled={!isEditable}
              variant="outlined"
              inputProps={{
                maxLength: section.maxLength,
              }}
            />
            {section.maxLength && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {characterCounts[section.id] || 0}/{section.maxLength} characters
              </Typography>
            )}
          </Box>
        );

      case 'rating':
        return (
          <Rating
            value={Number(value) || 0}
            onChange={(_, newValue) => handleChange(section.id, newValue || 0)}
            max={section.ratingScale || 5}
            disabled={!isEditable}
            size="large"
          />
        );

      case 'multiple_choice':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={value}
              onChange={(e) => handleChange(section.id, e.target.value)}
            >
              {section.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio disabled={!isEditable} />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {templateName}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />

        <Box component="form" onSubmit={handleSubmit}>
          {sections.map((section) => (
            <Box key={section.id} sx={{ mb: 3 }}>
              <FormLabel sx={{ mb: 1, fontWeight: 'medium', display: 'block' }}>
                {section.sectionName}
                {section.isRequired && <span style={{ color: 'red' }}> *</span>}
              </FormLabel>
              {section.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {section.description}
                </Typography>
              )}
              {renderSection(section)}
            </Box>
          ))}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="contained">
              Save Review
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReviewTemplate; 