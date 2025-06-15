import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Container, 
  Box, 
  Typography, 
  Breadcrumbs, 
  CircularProgress, 
  Paper
} from '@mui/material';
import { 
  Home as HomeIcon, 
  NavigateNext as NavigateNextIcon 
} from '@mui/icons-material';
import PropertyForm from '../components/forms/PropertyForm';

interface Property {
  _id: string;
  name: string;
  address: string;
  type: string;
  description: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  features: string[];
  notes: string;
}

const EditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/properties/${id}`);
        setProperty(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property data');
        setLoading(false);
        toast.error('Failed to load property data');
      }
    };
    
    fetchProperty();
  }, [id]);
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error || !property) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Property
          </Typography>
          <Typography paragraph>
            {error || 'Property not found. It may have been deleted or you do not have permission to access it.'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Link to="/properties" style={{ textDecoration: 'none' }}>
              Back to Properties
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
            to="/properties" 
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Properties
          </Link>
          <Link 
            to={`/properties/${id}`} 
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {property.name}
          </Link>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
      </Box>
      
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Edit Property: {property.name}
      </Typography>
      
      <PropertyForm isEdit propertyData={property} />
    </Container>
  );
};

export default EditProperty;