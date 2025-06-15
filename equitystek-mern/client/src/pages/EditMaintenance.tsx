import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  Build as BuildIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import MaintenanceForm from '../components/forms/MaintenanceForm';

interface MaintenanceRecord {
  _id: string;
  propertyId: string;
  title: string;
  description: string;
  date: string;
  cost: number;
  status: 'pending' | 'completed' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
  category: string;
  receipt?: string;
  notes?: string;
}

interface Property {
  _id: string;
  name: string;
}

const EditMaintenance: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch maintenance record
        const maintenanceResponse = await axios.get(`/api/maintenance/${id}`);
        setMaintenance(maintenanceResponse.data);
        
        // Fetch property information
        const propertyResponse = await axios.get(`/api/properties/${maintenanceResponse.data.propertyId}`);
        setProperty(propertyResponse.data);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load maintenance record');
        setLoading(false);
        toast.error('Failed to load maintenance record');
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error || !maintenance || !property) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Maintenance Record
          </Typography>
          <Typography paragraph>
            {error || 'Maintenance record not found. It may have been deleted or you do not have permission to access it.'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Link to="/maintenance" style={{ textDecoration: 'none' }}>
              Back to Maintenance Records
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
          <Link 
            to={`/properties/${property._id}`} 
            style={{ 
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            {property.name}
          </Link>
          <Link 
            to={`/maintenance/${maintenance._id}`} 
            style={{ 
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            {maintenance.title}
          </Link>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
      </Box>
      
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Edit Maintenance Record
      </Typography>
      
      <MaintenanceForm 
        isEdit={true} 
        propertyId={property._id} 
        maintenanceData={maintenance} 
      />
    </Container>
  );
};

export default EditMaintenance;