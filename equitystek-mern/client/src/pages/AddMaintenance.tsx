import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Build as BuildIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import MaintenanceForm from '../components/forms/MaintenanceForm';

interface Property {
  _id: string;
  name: string;
}

const AddMaintenance: React.FC = () => {
  const { propertyId } = useParams<{ propertyId?: string }>();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // If propertyId is provided, fetch property details
    if (propertyId) {
      const fetchProperty = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/properties/${propertyId}`);
          setProperty(response.data);
          setLoading(false);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to load property data');
          setLoading(false);
        }
      };
      
      fetchProperty();
    }
  }, [propertyId]);
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (propertyId && error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Property
          </Typography>
          <Typography paragraph>
            {error}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Link to="/maintenance" style={{ textDecoration: 'none' }}>
              Back to Maintenance
            </Link>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
        >
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </Link>
          <Link 
            to="/maintenance" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            <BuildIcon sx={{ mr: 0.5 }} fontSize="small" />
            Maintenance
          </Link>
          {property && (
            <Link 
              to={`/properties/${property._id}`} 
              style={{ 
                color: 'inherit', 
                textDecoration: 'none' 
              }}
            >
              {property.name}
            </Link>
          )}
          <Typography color="text.primary">Add Record</Typography>
        </Breadcrumbs>
      </Box>
      
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        {property 
          ? `Add Maintenance for ${property.name}`
          : "Add Maintenance Record"
        }
      </Typography>
      
      <MaintenanceForm propertyId={propertyId} />
    </Container>
  );
};

export default AddMaintenance;