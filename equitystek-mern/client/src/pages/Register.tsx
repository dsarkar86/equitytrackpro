import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HomeIcon from '@mui/icons-material/Home';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'owner', // Default role
    propertyCount: 1 // Default property count
  });
  
  const { register, error, clearErrors, loading } = useAuth();
  
  // Show error message if registration fails
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearErrors();
    }
  }, [error, clearErrors]);
  
  const { email, password, fullName, role, propertyCount } = formData;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string | number;
    
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setFormData({ ...formData, propertyCount: newValue as number });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simple validation
    if (!fullName || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    // Register user
    const userData = {
      username: email.split('@')[0] + Math.floor(Math.random() * 1000),
      email,
      password,
      fullName,
      role
    };
    
    await register(userData);
    
    // Note: After successful registration, the user will be redirected to dashboard
    // where they can add properties based on the propertyCount
  };
  
  // Calculate subscription cost - simplified example
  const calculateSubscriptionCost = () => {
    const baseCost = 19.99;
    const additionalPropertyCost = 4.99;
    
    if (propertyCount <= 1) {
      return baseCost;
    }
    
    return baseCost + (propertyCount - 1) * additionalPropertyCost;
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
            width: 40,
            height: 40,
            borderRadius: '50%',
            mb: 1
          }}>
            <PersonAddIcon />
          </Box>
          <Typography component="h1" variant="h5" fontWeight="bold">
            Join Equitystek Today
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Track properties, manage maintenance, and make smarter investment decisions
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="fullName"
            label="Full Name"
            name="fullName"
            autoFocus
            value={fullName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={handleChange}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">I am a</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={role}
              label="I am a"
              onChange={handleChange}
            >
              <MenuItem value="owner">Property Owner</MenuItem>
              <MenuItem value="investor">Property Investor</MenuItem>
              <MenuItem value="tradesperson">Tradesperson</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography id="property-slider" gutterBottom>
              How many properties do you want to manage?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon color="primary" sx={{ mr: 1 }} />
              <Slider
                value={propertyCount}
                onChange={handleSliderChange}
                aria-labelledby="property-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
              />
              <Typography sx={{ ml: 2, minWidth: '30px' }}>
                {propertyCount}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'primary.light', 
            borderRadius: 1,
            color: 'primary.contrastText'
          }}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              Your Plan:
            </Typography>
            <Typography variant="body2">
              • {propertyCount} {propertyCount === 1 ? 'Property' : 'Properties'}
            </Typography>
            <Typography variant="body2">
              • All Premium Features Included
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              ${calculateSubscriptionCost().toFixed(2)}/month
            </Typography>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
          
          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#1976d2' }}>
                  Sign in
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mt: 4, width: '100%' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            By registering, you agree to Equitystek's Terms of Service and Privacy Policy.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;