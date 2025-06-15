import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  useTheme
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  BusinessCenter as BusinessIcon,
  Home as HomeIcon,
  PriorityHigh as PriorityHighIcon,
  CalendarToday as CalendarIcon,
  Upload as UploadIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { getRandomImage, tradesImages } from '../assets/stock-photos';

interface Tradesperson {
  _id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  categories: string[];
  specialties: string[];
  hourlyRate?: number;
  callOutFee?: number;
  rating: number;
  reviewCount: number;
  profileImage?: string;
}

interface Property {
  _id: string;
  name: string;
  address: string;
}

const JobRequestForm: React.FC = () => {
  const { tradespersonId } = useParams<{ tradespersonId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    propertyId: '',
    tradespersonId: tradespersonId || '',
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    preferredDate: '',
  });
  
  // Validation errors
  const [errors, setErrors] = useState<{
    propertyId?: string;
    tradespersonId?: string;
    title?: string;
    description?: string;
    category?: string;
  }>({});
  
  // Component states
  const [properties, setProperties] = useState<Property[]>([]);
  const [tradespeople, setTradespeople] = useState<Tradesperson[]>([]);
  const [selectedTradesperson, setSelectedTradesperson] = useState<Tradesperson | null>(null);
  const [categories, setCategories] = useState<string[]>([
    'plumbing', 'electrical', 'carpentry', 'painting', 'hvac', 'roofing', 'general'
  ]);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch properties
        const propertiesResponse = await axios.get('/api/properties');
        setProperties(propertiesResponse.data);
        
        // Fetch tradespeople
        const tradespeopleResponse = await axios.get('/api/tradespeople');
        setTradespeople(tradespeopleResponse.data);
        
        // If tradespersonId is provided, set it in form data and fetch details
        if (tradespersonId) {
          setFormData(prev => ({
            ...prev,
            tradespersonId
          }));
          
          try {
            const tradespersonResponse = await axios.get(`/api/tradespeople/${tradespersonId}`);
            setSelectedTradesperson(tradespersonResponse.data);
            
            // If tradesperson has categories, set the first one as default
            if (tradespersonResponse.data.categories && tradespersonResponse.data.categories.length > 0) {
              setFormData(prev => ({
                ...prev,
                category: tradespersonResponse.data.categories[0]
              }));
            }
          } catch (error) {
            console.error('Error fetching tradesperson details:', error);
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading form data:', err);
        setLoading(false);
        toast.error('Failed to load form data');
      }
    };
    
    fetchData();
  }, [tradespersonId]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for the field
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for the field
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    
    // If tradesperson is selected, update selectedTradesperson and possibly category
    if (name === 'tradespersonId' && value) {
      const selected = tradespeople.find(t => t._id === value);
      setSelectedTradesperson(selected || null);
      
      // If tradesperson has categories, set the first one as default
      if (selected && selected.categories && selected.categories.length > 0) {
        setFormData(prev => ({
          ...prev,
          category: selected.categories[0]
        }));
      }
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedPhotos(prev => [...prev, ...filesArray]);
      
      // Create preview URLs
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  // Remove photo
  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {
      propertyId?: string;
      tradespersonId?: string;
      title?: string;
      description?: string;
      category?: string;
    } = {};
    
    if (!formData.propertyId) {
      newErrors.propertyId = 'Please select a property';
    }
    
    if (!formData.tradespersonId) {
      newErrors.tradespersonId = 'Please select a tradesperson';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a title';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create form data for file upload
      const jobRequestFormData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          jobRequestFormData.append(key, value);
        }
      });
      
      // Add photos
      uploadedPhotos.forEach(photo => {
        jobRequestFormData.append('photos', photo);
      });
      
      // Send request
      const response = await axios.post('/api/job-requests', jobRequestFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Job request submitted successfully');
      navigate(`/job-request/${response.data._id}`);
    } catch (err: any) {
      console.error('Error submitting job request:', err);
      toast.error(err.response?.data?.message || 'Failed to submit job request');
      setSubmitting(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              New Job Request
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Request maintenance or repairs for your property
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/trades"
        >
          Back to Tradespeople
        </Button>
      </Box>
      
      {/* Form content */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Property selection */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.propertyId}>
                <InputLabel id="property-select-label">Select Property</InputLabel>
                <Select
                  labelId="property-select-label"
                  id="propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleSelectChange}
                  label="Select Property"
                  startAdornment={<HomeIcon sx={{ mr: 1, ml: -0.5 }} />}
                >
                  {properties.map(property => (
                    <MenuItem key={property._id} value={property._id}>
                      {property.name} - {property.address}
                    </MenuItem>
                  ))}
                </Select>
                {errors.propertyId && (
                  <FormHelperText>{errors.propertyId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Tradesperson selection */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.tradespersonId}>
                <InputLabel id="tradesperson-select-label">Select Tradesperson</InputLabel>
                <Select
                  labelId="tradesperson-select-label"
                  id="tradespersonId"
                  name="tradespersonId"
                  value={formData.tradespersonId}
                  onChange={handleSelectChange}
                  label="Select Tradesperson"
                  startAdornment={<BusinessIcon sx={{ mr: 1, ml: -0.5 }} />}
                  disabled={!!tradespersonId} // Disable if tradesperson is pre-selected
                >
                  {tradespeople.map(tradesperson => (
                    <MenuItem key={tradesperson._id} value={tradesperson._id}>
                      {tradesperson.name} {tradesperson.companyName ? `(${tradesperson.companyName})` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tradespersonId && (
                  <FormHelperText>{errors.tradespersonId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Selected tradesperson details */}
            {selectedTradesperson && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        src={selectedTradesperson.profileImage || getRandomImage(tradesImages)}
                        alt={selectedTradesperson.name}
                        sx={{ width: 60, height: 60 }}
                      />
                      <Box>
                        <Typography variant="h6">
                          {selectedTradesperson.name}
                        </Typography>
                        {selectedTradesperson.companyName && (
                          <Typography variant="body2" color="text.secondary">
                            {selectedTradesperson.companyName}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Rating value={selectedTradesperson.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({selectedTradesperson.reviewCount} reviews)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Specialties:</strong> {selectedTradesperson.specialties.join(', ')}
                        </Typography>
                      </Grid>
                      
                      {selectedTradesperson.hourlyRate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Hourly Rate:</strong> ${selectedTradesperson.hourlyRate}/hr
                          </Typography>
                        </Grid>
                      )}
                      
                      {selectedTradesperson.callOutFee && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Call Out Fee:</strong> ${selectedTradesperson.callOutFee}
                          </Typography>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Categories:</strong>
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {selectedTradesperson.categories.map((category) => (
                            <Chip
                              key={category}
                              label={category.charAt(0).toUpperCase() + category.slice(1)}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {/* Job details */}
            <Grid item xs={12} sx={{ mb: 1 }}>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
            </Grid>
            
            {/* Job title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Leaking Bathroom Faucet"
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            {/* Job description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Provide details about the job..."
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            
            {/* Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  label="Category"
                  startAdornment={<ConstructionIcon sx={{ mr: 1, ml: -0.5 }} />}
                >
                  {categories.map(category => (
                    <MenuItem 
                      key={category} 
                      value={category}
                      disabled={selectedTradesperson && !selectedTradesperson.categories.includes(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Priority */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-select-label">Priority</InputLabel>
                <Select
                  labelId="priority-select-label"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleSelectChange}
                  label="Priority"
                  startAdornment={<PriorityHighIcon sx={{ mr: 1, ml: -0.5 }} />}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Preferred date */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Preferred Date (Optional)"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            
            {/* Photos */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Photos (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload photos to help the tradesperson understand the job
              </Typography>
              
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              
              <Button
                variant="outlined"
                onClick={handlePhotoUpload}
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
              >
                Upload Photos
              </Button>
              
              {photoPreviewUrls.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {photoPreviewUrls.map((url, index) => (
                    <Grid item xs={4} sm={3} md={2} key={index}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '100%', // 1:1 aspect ratio
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box
                          component="img"
                          src={url}
                          alt={`Preview ${index}`}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            minWidth: 'auto',
                            width: 24,
                            height: 24,
                            p: 0,
                          }}
                          onClick={() => handleRemovePhoto(index)}
                        >
                          &times;
                        </Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
            
            {/* Submit button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={submitting}
                fullWidth
              >
                {submitting ? 'Submitting...' : 'Submit Job Request'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default JobRequestForm;