import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { Home as HomeIcon, Build as BuildIcon } from '@mui/icons-material';
import { format } from 'date-fns';

interface PropertyCardProps {
  property: {
    _id: string;
    name: string;
    address: string;
    type: string;
    purchaseDate: string;
    purchasePrice: number;
    currentValue: number;
    image?: string;
  };
  showActions?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, showActions = true }) => {
  const placeholderImage = 'https://via.placeholder.com/300x200?text=Property';
  
  // Get property type color
  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'single_family':
      case 'residential':
        return '#4caf50'; // green
      case 'commercial':
        return '#2196f3'; // blue
      case 'multi_family':
        return '#ff9800'; // orange
      case 'condominium':
        return '#9c27b0'; // purple
      case 'townhouse':
        return '#00bcd4'; // cyan
      default:
        return '#757575'; // grey
    }
  };
  
  // Format property type display
  const formatPropertyType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate value change percentage
  const calculateValueChange = () => {
    const difference = property.currentValue - property.purchasePrice;
    const percentage = (difference / property.purchasePrice) * 100;
    return { amount: difference, percentage };
  };

  const valueChange = calculateValueChange();
  
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6
      }
    }}>
      <CardMedia
        component="img"
        height="200"
        image={property.image || placeholderImage}
        alt={property.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {property.name}
          </Typography>
          <Chip 
            label={formatPropertyType(property.type)} 
            size="small"
            sx={{ 
              backgroundColor: getPropertyTypeColor(property.type) + '20',
              color: getPropertyTypeColor(property.type),
              fontWeight: 'medium'
            }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {property.address}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Purchased on {format(new Date(property.purchaseDate), 'PP')}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Purchase Price
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ${property.purchasePrice.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" align="right">
              Current Value
            </Typography>
            <Typography variant="body2" fontWeight="medium" color="success.main" align="right">
              ${property.currentValue.toLocaleString()}
            </Typography>
          </Box>
        </Box>
        
        {/* Value Change Section */}
        <Box 
          sx={{ 
            mt: 2, 
            p: 1, 
            borderRadius: 1,
            backgroundColor: valueChange.amount >= 0 ? 'success.light' : 'error.light',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: valueChange.amount >= 0 ? 'success.dark' : 'error.dark',
              fontWeight: 'medium'
            }}
          >
            Value Change:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: valueChange.amount >= 0 ? 'success.dark' : 'error.dark',
              fontWeight: 'bold'
            }}
          >
            {valueChange.amount >= 0 ? '+' : ''}{valueChange.percentage.toFixed(1)}%
          </Typography>
        </Box>
      </CardContent>
      
      {showActions && (
        <CardActions>
          <Button 
            size="small" 
            component={Link} 
            to={`/properties/${property._id}`}
            startIcon={<HomeIcon />}
          >
            View Details
          </Button>
          <Button 
            size="small" 
            component={Link} 
            to={`/maintenance/add/${property._id}`}
            startIcon={<BuildIcon />}
          >
            Log Maintenance
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default PropertyCard;