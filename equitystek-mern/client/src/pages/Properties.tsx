import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Divider,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

// Define interfaces
interface Property {
  _id: string;
  name: string;
  address: string;
  type: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  image?: string;
}

const placeholderImage = 'https://via.placeholder.com/300x200?text=Property';

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/properties');
        setProperties(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load properties');
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);
  
  // Filter properties based on search term
  const filteredProperties = properties.filter(property => 
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          My Properties
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/properties/add"
          startIcon={<AddIcon />}
        >
          Add Property
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: { xs: 1, md: 0 } }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{ mr: 1 }}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
              >
                Sort By
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: 'error.light', color: 'error.dark' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {filteredProperties.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No properties found
          </Typography>
          {searchTerm ? (
            <Typography variant="body1" color="text.secondary" paragraph>
              No properties match your search criteria. Try different keywords.
            </Typography>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't added any properties yet. Start by adding your first property.
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/properties/add"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Add Your First Property
              </Button>
            </>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
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
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/properties/${property._id}`}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/maintenance/add/${property._id}`}
                  >
                    Log Maintenance
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Properties;