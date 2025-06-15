import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { format, subMonths } from 'date-fns';
import { useSnackbar } from 'notistack';
import { ComplianceReportParams, ComplianceReport } from '../../types/compliance';
import { ComplianceService } from '../../services/compliance.service';
import AuditActivityReportView from './reports/AuditActivityReportView';
import DataRetentionReportView from './reports/DataRetentionReportView';
import AccessControlReportView from './reports/AccessControlReportView';
import DataPrivacyReportView from './reports/DataPrivacyReportView';

const ComplianceReportGenerator: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [reportParams, setReportParams] = useState<ComplianceReportParams>({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reportType: 'audit_activity',
  });
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { enqueueSnackbar } = useSnackbar();

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    if (date) {
      setReportParams((prev) => ({
        ...prev,
        [field]: format(date, 'yyyy-MM-dd'),
      }));
    }
  };

  const handleReportTypeChange = (event: SelectChangeEvent<string>) => {
    setReportParams((prev) => ({
      ...prev,
      reportType: event.target.value as ComplianceReportParams['reportType'],
    }));
    setReport(null);
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const generatedReport = await ComplianceService.generateComplianceReport(reportParams);
      setReport(generatedReport);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setError('Failed to generate report. Please try again.');
      enqueueSnackbar('Failed to generate report', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderReportView = () => {
    if (!report) return null;

    switch (reportParams.reportType) {
      case 'audit_activity':
        return <AuditActivityReportView data={report} />;
      case 'data_retention':
        return <DataRetentionReportView data={report} />;
      case 'access_control':
        return <AccessControlReportView data={report} />;
      case 'data_privacy':
        return <DataPrivacyReportView data={report} />;
      default:
        return <Typography>Unknown report type</Typography>;
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Compliance Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate Report
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                value={reportParams.reportType}
                onChange={handleReportTypeChange}
                label="Report Type"
              >
                <MenuItem value="audit_activity">Audit Activity</MenuItem>
                <MenuItem value="data_retention">Data Retention</MenuItem>
                <MenuItem value="access_control">Access Control</MenuItem>
                <MenuItem value="data_privacy">Data Privacy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={new Date(reportParams.startDate)}
                onChange={handleDateChange('startDate')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={new Date(reportParams.endDate)}
                onChange={handleDateChange('endDate')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateReport}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {report && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {reportParams.reportType === 'audit_activity' && 'Audit Activity Report'}
            {reportParams.reportType === 'data_retention' && 'Data Retention Report'}
            {reportParams.reportType === 'access_control' && 'Access Control Report'}
            {reportParams.reportType === 'data_privacy' && 'Data Privacy Report'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Period: {reportParams.startDate} to {reportParams.endDate}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {renderReportView()}
        </Paper>
      )}
    </Box>
  );
};

export default ComplianceReportGenerator; 