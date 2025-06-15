import React from 'react';
import { Box, Chip, Typography, Paper, Tooltip } from '@mui/material';
import { Shield as ShieldIcon, Info as InfoIcon } from '@mui/icons-material';

interface DataComplianceBadgeProps {
  variant?: 'small' | 'medium' | 'large';
  showInfo?: boolean;
}

const DataComplianceBadge: React.FC<DataComplianceBadgeProps> = ({ 
  variant = 'small',
  showInfo = false 
}) => {
  // Size and content based on variant
  const getSize = () => {
    switch (variant) {
      case 'large':
        return { 
          fontSize: '1rem',
          iconSize: 'medium',
          padding: '12px 16px',
          height: 'auto'
        };
      case 'medium':
        return { 
          fontSize: '0.875rem',
          iconSize: 'small',
          padding: '8px 12px',
          height: 'auto'
        };
      case 'small':
      default:
        return { 
          fontSize: '0.75rem',
          iconSize: 'small',
          padding: '4px 8px',
          height: 24
        };
    }
  };
  
  const size = getSize();
  
  if (variant === 'large' || showInfo) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          bgcolor: 'rgba(25, 118, 210, 0.08)', 
          border: '1px solid rgba(25, 118, 210, 0.2)',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon color="primary" fontSize={size.iconSize} />
          <Typography variant="subtitle2" color="primary" fontWeight="medium">
            Australian Data Compliance Certified
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          All data in this application is stored and processed in accordance with Australian Privacy Principles (APPs).
          Your information is securely stored within Australian borders and protected by advanced encryption.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Tooltip title="Data stored in compliance with Australian Privacy Principles (APPs)">
      <Chip
        icon={<ShieldIcon fontSize="small" />}
        label="Australian Data Compliant"
        color="primary"
        size="small"
        variant="outlined"
        sx={{ 
          fontSize: size.fontSize,
          padding: size.padding,
          height: size.height,
          '& .MuiChip-icon': {
            fontSize: '16px' 
          }
        }}
      />
    </Tooltip>
  );
};

export default DataComplianceBadge;