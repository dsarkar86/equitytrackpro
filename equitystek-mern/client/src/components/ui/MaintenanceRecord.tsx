import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Grid
} from '@mui/material';
import { 
  Build as BuildIcon, 
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowForwardIcon 
} from '@mui/icons-material';
import { format } from 'date-fns';

interface MaintenanceRecordProps {
  record: {
    _id: string;
    propertyId: string;
    title: string;
    description: string;
    date: string;
    cost: number;
    status: 'pending' | 'completed' | 'scheduled';
    priority: 'low' | 'medium' | 'high';
    propertyName?: string;
  };
  showProperty?: boolean;
}

const MaintenanceRecord: React.FC<MaintenanceRecordProps> = ({ 
  record, 
  showProperty = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'success';
    }
  };

  return (
    <Card sx={{ 
      width: '100%',
      mb: 2,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: 3
      }
    }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BuildIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" component="div">
                {record.title}
              </Typography>
            </Box>

            {showProperty && record.propertyName && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Property: {record.propertyName}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={record.status} 
                size="small"
                color={getStatusColor(record.status) as "success" | "info" | "warning" | "error" | "default"}
              />
              <Chip 
                label={`${record.priority} priority`} 
                size="small"
                color={getPriorityColor(record.priority) as "success" | "info" | "warning" | "error" | "default"}
              />
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
              {record.description}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon sx={{ fontSize: 'small', mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(record.date), 'PPP')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ fontSize: 'small', mr: 0.5, color: 'primary.main' }} />
                <Typography variant="h6" color="primary.main">
                  ${record.cost.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Button
                  component={Link}
                  to={`/maintenance/${record._id}`}
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ mt: { xs: 1, sm: 0 } }}
                >
                  View Details
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MaintenanceRecord;