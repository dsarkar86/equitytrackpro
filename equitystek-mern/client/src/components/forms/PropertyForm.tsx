import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Divider,
  FormHelperText
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

interface PropertyFormProps {
  isEdit?: boolean;
  propertyData?: {
    _id?: string;
    name: string;
    address: string;
    type: string;
    description: string;
    purchaseDate: string;
    purchasePrice: number;
    currentValue: number;
    features: string[];
    notes: string;
  };
}

const PropertyForm: React.FC<PropertyFormProps> = ({ isEdit = false, propertyData }) => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  const [formData, setFormData] = useState({
    name: propertyData?.name || '',
    address: propertyData?.address || '',
    type: propertyData?.type || 'single_family',
    description: propertyData?.description || '',
    purchaseDate: propertyData?.purchaseDate?.split('T')[0] || today,
    purchasePrice: propertyData?.purchasePrice || 0,
    currentValue: propertyData?.currentValue || 0,
    features: propertyData?.features || [],
    notes: propertyData?.notes || '',
    image: null as File | null
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate numbers for price fields
    if (name === 'purchasePrice' || name === 'currentValue') {
      if (value && Number(value) < 0) {
        setErrors({...errors, [name]: 'Value cannot be negative'});
      } else {
        // Clear error if it exists
        const newErrors = {...errors};
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
    
    setFormData({
      ...formData,
      [name]: name === 'purchasePrice' || name === 'currentValue' ? 
        parseFloat(value) || 0 : value
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file
      });
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }
    
    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }
    
    if (formData.currentValue <= 0) {
      newErrors.currentValue = 'Current value must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload if needed
      const formDataToSend = new FormData();
      
      // Append property data
      for (const [key, value] of Object.entries(formData)) {
        if (key === 'image') {
          if (value) {
            formDataToSend.append('propertyImage', value);
          }
        } else if (key === 'features') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      }
      
      let response;
      
      if (isEdit && propertyData?._id) {
        // Update existing property
        response = await axios.patch(
          `/api/properties/${propertyData._id}`,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success('Property updated successfully');
      } else {
        // Create new property
        response = await axios.post(
          '/api/properties',
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success('Property added successfully');
      }
      
      // Navigate to the property details page
      navigate(`/properties/${response.data._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Edit Property' : 'Add New Property'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Property Image Upload */}
          <Grid item xs={12} md={12}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {previewUrl ? (
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Property Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    mb: 2
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No image selected
                  </Typography>
                </Box>
              )}
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
              >
                Upload Property Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              <FormHelperText>
                Upload a clear image of your property. Recommended dimensions: 1200x800 pixels.
              </FormHelperText>
            </Box>
          </Grid>
          
          {/* Basic Property Information */}
          <Grid item xs={12} md={6}>
            <TextField
              name="name"
              label="Property Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="type"
              select
              label="Property Type"
              value={formData.type}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="single_family">Single Family</MenuItem>
              <MenuItem value="condominium">Condominium</MenuItem>
              <MenuItem value="townhouse">Townhouse</MenuItem>
              <MenuItem value="multi_family">Multi-Family</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="address"
              label="Property Address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.address}
              helperText={errors.address}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              name="purchaseDate"
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              error={!!errors.purchaseDate}
              helperText={errors.purchaseDate}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              name="purchasePrice"
              label="Purchase Price ($)"
              type="number"
              value={formData.purchasePrice}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.purchasePrice}
              helperText={errors.purchasePrice}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              name="currentValue"
              label="Current Value ($)"
              type="number"
              value={formData.currentValue}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.currentValue}
              helperText={errors.currentValue}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Property Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your property's features, size, number of bedrooms, etc."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Additional Notes"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Any additional notes or important information about the property"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/properties')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : (isEdit ? 'Update Property' : 'Add Property')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default PropertyForm;