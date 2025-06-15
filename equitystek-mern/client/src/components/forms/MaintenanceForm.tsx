import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import { 
  AttachFile as AttachFileIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

interface Property {
  _id: string;
  name: string;
}

interface MaintenanceFormProps {
  isEdit?: boolean;
  propertyId?: string;
  maintenanceData?: {
    _id?: string;
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
  };
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ 
  isEdit = false, 
  propertyId: initialPropertyId, 
  maintenanceData 
}) => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  const [formData, setFormData] = useState({
    propertyId: initialPropertyId || maintenanceData?.propertyId || '',
    title: maintenanceData?.title || '',
    description: maintenanceData?.description || '',
    date: maintenanceData?.date?.split('T')[0] || today,
    cost: maintenanceData?.cost || 0,
    status: maintenanceData?.status || 'pending',
    priority: maintenanceData?.priority || 'medium',
    category: maintenanceData?.category || 'repair',
    notes: maintenanceData?.notes || '',
    receipt: null as File | null
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  
  // Fetch properties for dropdown selection if not editing
  useEffect(() => {
    if (!initialPropertyId && !isEdit) {
      const fetchProperties = async () => {
        setLoading(true);
        try {
          const response = await axios.get('/api/properties');
          setProperties(response.data);
        } catch (err: any) {
          toast.error('Failed to load properties');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProperties();
    }
  }, [initialPropertyId, isEdit]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    
    // Validate cost to ensure it's not negative
    if (name === 'cost') {
      if (value && Number(value) < 0) {
        setErrors({...errors, [name]: 'Cost cannot be negative'});
      } else {
        // Clear error if it exists
        const newErrors = {...errors};
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
    
    setFormData({
      ...formData,
      [name]: name === 'cost' ? parseFloat(value as string) || 0 : value
    });
  };
  
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        receipt: file
      });
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.propertyId) {
      newErrors.propertyId = 'Property is required';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (formData.cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
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
      
      // Append maintenance data
      for (const [key, value] of Object.entries(formData)) {
        if (key === 'receipt') {
          if (value) {
            formDataToSend.append('receipt', value);
          }
        } else {
          formDataToSend.append(key, String(value));
        }
      }
      
      let response;
      
      if (isEdit && maintenanceData?._id) {
        // Update existing maintenance record
        response = await axios.patch(
          `/api/maintenance/${maintenanceData._id}`,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success('Maintenance record updated successfully');
      } else {
        // Create new maintenance record
        response = await axios.post(
          '/api/maintenance',
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success('Maintenance record added successfully');
      }
      
      // Navigate to the maintenance details page
      navigate(`/maintenance/${response.data._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save maintenance record');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Property Selection (only show if no propertyId provided) */}
          {!initialPropertyId && (
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.propertyId}>
                <InputLabel id="property-label">Property</InputLabel>
                <Select
                  labelId="property-label"
                  id="propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  label="Property"
                  onChange={handleChange}
                  disabled={loading || isEdit}
                >
                  {properties.map((property) => (
                    <MenuItem key={property._id} value={property._id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.propertyId && (
                  <FormHelperText error>{errors.propertyId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}
          
          {/* Maintenance Details */}
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Maintenance Title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title}
              placeholder="e.g., Roof Repair, Plumbing Fix, HVAC Maintenance"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleChange}
              >
                <MenuItem value="repair">Repair</MenuItem>
                <MenuItem value="improvement">Improvement</MenuItem>
                <MenuItem value="routine">Routine Maintenance</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="inspection">Inspection</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="date"
              label="Maintenance Date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              error={!!errors.date}
              helperText={errors.date}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                name="priority"
                value={formData.priority}
                label="Priority"
                onChange={handleChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              name="cost"
              label="Cost ($)"
              type="number"
              value={formData.cost}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.cost}
              helperText={errors.cost}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              required
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Describe the maintenance work, issues found, and solutions implemented"
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
              placeholder="Any additional notes, contractor information, warranty details, etc."
            />
          </Grid>
          
          {/* Receipt Upload */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Receipt or Documentation
            </Typography>
            
            {receiptPreview ? (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={receiptPreview}
                  alt="Receipt Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    display: 'block',
                    mb: 1
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Receipt preview
                </Typography>
              </Box>
            ) : (
              maintenanceData?.receipt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Current receipt: {maintenanceData.receipt.split('/').pop()}
                  </Typography>
                </Box>
              )
            )}
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
            >
              {receiptPreview || maintenanceData?.receipt ? 'Replace Receipt' : 'Upload Receipt'}
              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
              />
            </Button>
            <FormHelperText>
              Upload receipt or documentation (image or PDF format)
            </FormHelperText>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(initialPropertyId ? `/properties/${initialPropertyId}` : '/maintenance')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{ minWidth: 150 }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : (isEdit ? 'Update Record' : 'Save Record')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default MaintenanceForm;