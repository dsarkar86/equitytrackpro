import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Box, Typography, Breadcrumbs } from '@mui/material';
import { Home as HomeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import PropertyForm from '../components/forms/PropertyForm';

const AddProperty: React.FC = () => {
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
            style={{ 
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            Properties
          </Link>
          <Typography color="text.primary">Add Property</Typography>
        </Breadcrumbs>
      </Box>
      
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Add New Property
      </Typography>
      
      <PropertyForm />
    </Container>
  );
};

export default AddProperty;