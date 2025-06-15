import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewTemplate, { ReviewSection } from '../ReviewTemplate';

describe('ReviewTemplate', () => {
  const mockOnSave = jest.fn();
  
  const defaultSections: ReviewSection[] = [
    {
      id: 'text-section',
      sectionName: 'Text Section',
      sectionType: 'text',
      description: 'A text section description',
      isRequired: true,
      maxLength: 500,
      aiGenerationEnabled: false,
    },
    {
      id: 'rating-section',
      sectionName: 'Rating Section',
      sectionType: 'rating',
      description: 'A rating section description',
      isRequired: true,
      ratingScale: 5,
      aiGenerationEnabled: false,
    },
    {
      id: 'multiple-choice-section',
      sectionName: 'Multiple Choice Section',
      sectionType: 'multiple_choice',
      description: 'A multiple choice section description',
      isRequired: true,
      options: ['Option 1', 'Option 2', 'Option 3'],
      aiGenerationEnabled: false,
    },
    {
      id: 'ai-text-section',
      sectionName: 'AI Text Section',
      sectionType: 'text',
      description: 'An AI-generated text section',
      isRequired: true,
      aiGenerationEnabled: true,
      aiGeneratedContent: 'AI generated content',
      aiConfidenceScore: 0.85,
    },
  ];

  const defaultProps = {
    templateName: 'Test Template',
    description: 'A test template description',
    sections: defaultSections,
    onSave: mockOnSave,
    isEditable: true,
    showAISources: false,
  };

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders template name and description', () => {
    render(<ReviewTemplate {...defaultProps} />);
    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('A test template description')).toBeInTheDocument();
  });

  it('renders all sections with their descriptions', () => {
    render(<ReviewTemplate {...defaultProps} />);
    defaultSections.forEach(section => {
      expect(screen.getByText(section.sectionName)).toBeInTheDocument();
      expect(screen.getByText(section.description!)).toBeInTheDocument();
    });
  });

  it('shows required indicator for required sections', () => {
    render(<ReviewTemplate {...defaultProps} />);
    const requiredSections = defaultSections.filter(s => s.isRequired);
    expect(screen.getAllByText('*')).toHaveLength(requiredSections.length);
  });

  it('renders text input for non-AI text sections', () => {
    render(<ReviewTemplate {...defaultProps} />);
    const textSection = defaultSections.find(s => s.sectionType === 'text' && !s.aiGenerationEnabled);
    const textInput = screen.getByRole('textbox');
    expect(textInput).toBeInTheDocument();
    expect(textInput).toHaveAttribute('maxLength', textSection?.maxLength?.toString());
  });

  it('renders rating input with correct scale', () => {
    render(<ReviewTemplate {...defaultProps} />);
    const ratingSection = defaultSections.find(s => s.sectionType === 'rating');
    // Find rating inputs specifically by looking for inputs with values 1-5
    const ratingInputs = screen.getAllByRole('radio').filter(input => 
      input.getAttribute('value') && 
      !isNaN(Number(input.getAttribute('value'))) &&
      Number(input.getAttribute('value')) > 0
    );
    expect(ratingInputs).toHaveLength(ratingSection?.ratingScale || 0);
  });

  it('renders multiple choice options', () => {
    render(<ReviewTemplate {...defaultProps} />);
    const multipleChoiceSection = defaultSections.find(s => s.sectionType === 'multiple_choice');
    multipleChoiceSection?.options?.forEach(option => {
      expect(screen.getByLabelText(option)).toBeInTheDocument();
    });
  });

  it('renders AI editor for AI-enabled text sections', () => {
    render(<ReviewTemplate {...defaultProps} />);
    const aiSection = defaultSections.find(s => s.aiGenerationEnabled);
    expect(screen.getByText(aiSection?.aiGeneratedContent!)).toBeInTheDocument();
  });

  it('disables all inputs when isEditable is false', () => {
    render(<ReviewTemplate {...defaultProps} isEditable={false} />);
    const textInputs = screen.getAllByRole('textbox');
    const radioInputs = screen.getAllByRole('radio');
    
    textInputs.forEach(input => {
      expect(input).toBeDisabled();
    });
    
    radioInputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('calls onSave with all section values when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReviewTemplate {...defaultProps} />);
    
    // Fill in text section
    const textInput = screen.getByRole('textbox');
    await act(async () => {
      await user.type(textInput, 'Test text input');
    });

    // Select rating (4 stars) - find the radio input with value "4"
    await act(async () => {
      const ratingInputs = screen.getAllByRole('radio');
      const fourStarInput = ratingInputs.find(input => input.getAttribute('value') === '4');
      if (fourStarInput) {
        await user.click(fourStarInput);
      }
    });

    // Select multiple choice option
    await act(async () => {
      const option2Radio = screen.getByRole('radio', { name: /Option 2/i });
      await user.click(option2Radio);
    });

    // Submit the form
    await act(async () => {
      const saveButton = screen.getByText('Save Review');
      await user.click(saveButton);
    });

    // Check if onSave was called with correct values
    expect(mockOnSave).toHaveBeenCalledWith({
      'text-section': 'Test text input',
      'rating-section': 4,
      'multiple-choice-section': 'Option 2',
      'ai-text-section': 'AI generated content',
    });
  });

  it('shows character count for text sections with maxLength', async () => {
    const user = userEvent.setup();
    render(<ReviewTemplate {...defaultProps} />);
    const textInput = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(textInput, 'Test text');
    });
    
    const textSection = defaultSections.find(s => s.sectionType === 'text' && !s.aiGenerationEnabled);
    expect(screen.getByText(`9/${textSection?.maxLength} characters`)).toBeInTheDocument();
  });
}); 