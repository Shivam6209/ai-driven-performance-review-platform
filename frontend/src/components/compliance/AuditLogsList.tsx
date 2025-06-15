import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { AuditLog, AuditLogSearchParams } from '../../types/compliance';
import { ComplianceService } from '../../services/compliance.service';
import { useSnackbar } from 'notistack';
import { SelectChangeEvent } from '@mui/material';

const AuditLogsList: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchParams, setSearchParams] = useState<AuditLogSearchParams>({
    page: 0,
    limit: 10,
    sortBy: 'created_at',
    sortDirection: 'DESC',
  });
  
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ComplianceService.searchAuditLogs(searchParams);
      setAuditLogs(result.data);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      enqueueSnackbar('Failed to load audit logs', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [searchParams, enqueueSnackbar]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handlePageChange = (_event: unknown, newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      limit: parseInt(event.target.value, 10),
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => ({ ...prev, page: 0 }));
    fetchAuditLogs();
  };

  const handleRefresh = () => {
    fetchAuditLogs();
  };

  const handleViewDetails = (id: string) => {
    router.push(`/admin/compliance/audit-logs/${id}`);
  };

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    if (date) {
      setSearchParams((prev) => ({
        ...prev,
        [field]: format(date, 'yyyy-MM-dd'),
      }));
    } else {
      setSearchParams((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusChip = (status?: string) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'success':
        return <Chip label="Success" color="success" size="small" />;
      case 'failure':
        return <Chip label="Failure" color="error" size="small" />;
      case 'warning':
        return <Chip label="Warning" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Audit Logs
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={searchParams.startDate ? new Date(searchParams.startDate) : null}
                  onChange={handleDateChange('startDate')}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={searchParams.endDate ? new Date(searchParams.endDate) : null}
                  onChange={handleDateChange('endDate')}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                name="eventType"
                label="Event Type"
                value={searchParams.eventType || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                name="resourceType"
                label="Resource Type"
                value={searchParams.resourceType || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                name="resourceId"
                label="Resource ID"
                value={searchParams.resourceId || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                name="actorId"
                label="Actor ID"
                value={searchParams.actorId || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={searchParams.status || ''}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="failure">Failure</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  disabled={loading}
                >
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : auditLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip label={log.event_type} size="small" />
                  </TableCell>
                  <TableCell>
                    {log.resource_type}
                    {log.resource_id && <Typography variant="caption" display="block">{log.resource_id}</Typography>}
                  </TableCell>
                  <TableCell>
                    {log.actor_id || '-'}
                    {log.actor_type && <Typography variant="caption" display="block">{log.actor_type}</Typography>}
                  </TableCell>
                  <TableCell>{getStatusChip(log.status)}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewDetails(log.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={searchParams.page || 0}
          onPageChange={handlePageChange}
          rowsPerPage={searchParams.limit || 10}
          onRowsPerPageChange={handleLimitChange}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </TableContainer>
    </Box>
  );
};

export default AuditLogsList; 