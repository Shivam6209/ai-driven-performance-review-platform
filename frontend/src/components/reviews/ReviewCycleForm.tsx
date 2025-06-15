import React from 'react';
import { useFormik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Department } from '@/types/employee';

interface ReviewCycleFormValues {
  name: string;
  description: string;
  cycleType: 'quarterly' | 'semi_annual' | 'annual' | 'project_based';
  startDate: Date;
  endDate: Date;
  submissionDeadline: Date;
  approvalDeadline: Date;
  departmentId?: string;
}

interface ReviewCycleFormProps {
  departments: Department[];
  initialValues?: Partial<ReviewCycleFormValues>;
  onSubmit: (values: ReviewCycleFormValues) => Promise<void>;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  cycleType: Yup.string()
    .oneOf(['quarterly', 'semi_annual', 'annual', 'project_based'])
    .required('Cycle type is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  submissionDeadline: Yup.date()
    .min(Yup.ref('startDate'), 'Submission deadline must be after start date')
    .max(Yup.ref('endDate'), 'Submission deadline must be before end date')
    .required('Submission deadline is required'),
  approvalDeadline: Yup.date()
    .min(
      Yup.ref('submissionDeadline'),
      'Approval deadline must be after submission deadline'
    )
    .max(Yup.ref('endDate'), 'Approval deadline must be before end date')
    .required('Approval deadline is required'),
  departmentId: Yup.string(),
});

export const ReviewCycleForm: React.FC<ReviewCycleFormProps> = ({
  departments,
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const formik = useFormik<ReviewCycleFormValues>({
    initialValues: {
      name: '',
      description: '',
      cycleType: 'quarterly',
      startDate: new Date(),
      endDate: new Date(),
      submissionDeadline: new Date(),
      approvalDeadline: new Date(),
      departmentId: undefined,
      ...initialValues,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 600 }}>
      <TextField
        fullWidth
        id="name"
        name="name"
        label="Name"
        value={formik.values.name}
        onChange={formik.handleChange}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        id="description"
        name="description"
        label="Description"
        multiline
        rows={4}
        value={formik.values.description}
        onChange={formik.handleChange}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="cycleType-label">Cycle Type</InputLabel>
        <Select
          labelId="cycleType-label"
          id="cycleType"
          name="cycleType"
          value={formik.values.cycleType}
          onChange={formik.handleChange}
          error={formik.touched.cycleType && Boolean(formik.errors.cycleType)}
          label="Cycle Type"
        >
          <MenuItem value="quarterly">Quarterly</MenuItem>
          <MenuItem value="semi_annual">Semi-Annual</MenuItem>
          <MenuItem value="annual">Annual</MenuItem>
          <MenuItem value="project_based">Project Based</MenuItem>
        </Select>
        {formik.touched.cycleType && formik.errors.cycleType && (
          <FormHelperText error>{formik.errors.cycleType}</FormHelperText>
        )}
      </FormControl>

      <DatePicker
        label="Start Date"
        value={formik.values.startDate}
        onChange={(date) => formik.setFieldValue('startDate', date)}
        slotProps={{
          textField: {
            error: formik.touched.startDate && Boolean(formik.errors.startDate),
            helperText: formik.touched.startDate && formik.errors.startDate ? String(formik.errors.startDate) : undefined,
            fullWidth: true,
          },
        }}
        sx={{ mb: 2, width: '100%' }}
      />

      <DatePicker
        label="End Date"
        value={formik.values.endDate}
        onChange={(date) => formik.setFieldValue('endDate', date)}
        slotProps={{
          textField: {
            error: formik.touched.endDate && Boolean(formik.errors.endDate),
            helperText: formik.touched.endDate && formik.errors.endDate ? String(formik.errors.endDate) : undefined,
            fullWidth: true,
          },
        }}
        sx={{ mb: 2, width: '100%' }}
      />

      <DatePicker
        label="Submission Deadline"
        value={formik.values.submissionDeadline}
        onChange={(date) => formik.setFieldValue('submissionDeadline', date)}
        slotProps={{
          textField: {
            error: formik.touched.submissionDeadline && Boolean(formik.errors.submissionDeadline),
            helperText: formik.touched.submissionDeadline && formik.errors.submissionDeadline ? String(formik.errors.submissionDeadline) : undefined,
            fullWidth: true,
          },
        }}
        sx={{ mb: 2, width: '100%' }}
      />

      <DatePicker
        label="Approval Deadline"
        value={formik.values.approvalDeadline}
        onChange={(date) => formik.setFieldValue('approvalDeadline', date)}
        slotProps={{
          textField: {
            error: formik.touched.approvalDeadline && Boolean(formik.errors.approvalDeadline),
            helperText: formik.touched.approvalDeadline && formik.errors.approvalDeadline ? String(formik.errors.approvalDeadline) : undefined,
            fullWidth: true,
          },
        }}
        sx={{ mb: 2, width: '100%' }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="departmentId-label">Department (Optional)</InputLabel>
        <Select
          labelId="departmentId-label"
          id="departmentId"
          name="departmentId"
          value={formik.values.departmentId || ''}
          onChange={formik.handleChange}
          error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
          label="Department (Optional)"
        >
          <MenuItem value="">All Departments</MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </Select>
        {formik.touched.departmentId && formik.errors.departmentId && (
          <FormHelperText error>{formik.errors.departmentId}</FormHelperText>
        )}
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewCycleForm; 