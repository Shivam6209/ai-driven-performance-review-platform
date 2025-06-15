import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  RadioGroup,
  Radio,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Assessment as ReportIcon,
  DataObject as JsonIcon,
  TableChart as CsvIcon,
} from '@mui/icons-material';

interface ExportOptions {
  format: 'pdf' | 'docx' | 'html';
  includeFeedback: boolean;
  includeGoals: boolean;
  includeAttachments: boolean;
  timeRange: 'all' | 'last_quarter' | 'last_year';
}

interface ReviewExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  isExporting?: boolean;
  reviewCycleName?: string;
}

/**
 * ReviewExportDialog Component
 * 
 * Dialog for configuring and initiating review data export
 */
export const ReviewExportDialog: React.FC<ReviewExportDialogProps> = ({
  open,
  onClose,
  onExport,
  isExporting = false,
  reviewCycleName,
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeFeedback: true,
    includeGoals: true,
    includeAttachments: false,
    timeRange: 'all',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (field: keyof ExportOptions, value: ExportOptions[keyof ExportOptions]) => {
    setOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      await onExport(options);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export review data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Export Review Data
        {reviewCycleName && (
          <Typography variant="subtitle2" color="text.secondary">
            {reviewCycleName}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Export Format
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={options.format}
              onChange={(e: SelectChangeEvent) =>
                handleOptionChange('format', e.target.value as ExportOptions['format'])
              }
              label="Format"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="docx">Word Document</MenuItem>
              <MenuItem value="html">HTML</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Date Range
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={options.timeRange}
              onChange={(e: SelectChangeEvent) =>
                handleOptionChange('timeRange', e.target.value as ExportOptions['timeRange'])
              }
              label="Time Range"
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="last_quarter">Last Quarter</MenuItem>
              <MenuItem value="last_year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Include Data
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeFeedback}
                  onChange={(e) =>
                    handleOptionChange('includeFeedback', e.target.checked)
                  }
                />
              }
              label="Include Feedback"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeGoals}
                  onChange={(e) =>
                    handleOptionChange('includeGoals', e.target.checked)
                  }
                />
              }
              label="Include Goals"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeAttachments}
                  onChange={(e) =>
                    handleOptionChange('includeAttachments', e.target.checked)
                  }
                />
              }
              label="Include Attachments"
            />
          </FormGroup>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewExportDialog; 