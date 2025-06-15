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
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { login, error, clearErrors, isAuthenticated, loading } = useAuth();
  
  // Show error message if login fails
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearErrors();
    }
  }, [error, clearErrors]);
  
  const { email, password } = formData;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast.error('Please enter all fields');
      return;
    }
    
    // Login
    await login({ email, password });
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
            <LockOutlinedIcon />
          </Box>
          <Typography component="h1" variant="h5" fontWeight="bold">
            Sign in to Equitystek
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Track property maintenance, calculate real value
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
            value={password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold', color: '#1976d2' }}>
                  Register now
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mt: 4, width: '100%' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Equitystek helps you track property maintenance, calculate real property value,
            and make better investment decisions.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;