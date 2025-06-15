import React from 'react';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import { OKR } from '@/types/okr';
import { getProgressColor } from '../okr/utils';

interface OKRHierarchyProps {
  okrs: OKR[];
  onEdit?: (okr: OKR) => void;
}

interface OKRWithChildren extends OKR {
  children?: OKRWithChildren[];
}

const buildHierarchy = (okrs: OKR[]): OKRWithChildren[] => {
  const okrMap = new Map<string, OKRWithChildren>();
  const rootOKRs: OKRWithChildren[] = [];

  // First pass: create map of all OKRs
  okrs.forEach((okr) => {
    okrMap.set(okr.id, { ...okr, children: [] });
  });

  // Second pass: build hierarchy
  okrs.forEach((okr) => {
    const okrWithChildren = okrMap.get(okr.id)!;
    if (okr.parent_okr) {
      const parent = okrMap.get(okr.parent_okr.id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(okrWithChildren);
      }
    } else {
      rootOKRs.push(okrWithChildren);
    }
  });

  return rootOKRs;
};

const OKRNode: React.FC<{
  okr: OKRWithChildren;
  onEdit?: (okr: OKR) => void;
}> = ({ okr, onEdit }) => {
  const progressColor = getProgressColor(okr.progress);

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        mb: 1,
        '&:last-child': { mb: 0 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              {okr.title}
            </Typography>
            {onEdit && (
              <IconButton
                size="small"
                onClick={() => onEdit(okr)}
                sx={{ ml: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {okr.description}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Progress:
          </Typography>
          <Typography variant="body2" sx={{ mr: 1 }}>
            {okr.progress}%
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress
              variant="determinate"
              value={okr.progress}
              color={progressColor}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={okr.level}
            color="primary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={okr.status}
            color={progressColor}
            variant="outlined"
          />
          <Chip
            size="small"
            label={`${okr.current_value}/${okr.target_value} ${okr.unit_of_measure}`}
            variant="outlined"
          />
        </Box>
      </Box>

      {okr.children && okr.children.length > 0 && (
        <Box sx={{ pl: 2 }}>
          {okr.children.map((child) => (
            <OKRNode key={child.id} okr={child} onEdit={onEdit} />
          ))}
        </Box>
      )}
    </Card>
  );
};

export const OKRHierarchy: React.FC<OKRHierarchyProps> = ({ okrs, onEdit }) => {
  const hierarchy = buildHierarchy(okrs);

  return (
    <Box>
      {hierarchy.map((okr) => (
        <OKRNode key={okr.id} okr={okr} onEdit={onEdit} />
      ))}
    </Box>
  );
};

export default OKRHierarchy; 