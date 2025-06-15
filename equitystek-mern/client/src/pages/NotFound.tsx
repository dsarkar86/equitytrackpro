import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '60vh',
          py: 8
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        
        <Typography variant="h2" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mb: 4 }}>
          The page you're looking for doesn't exist or has been moved. Check the URL or navigate back to the dashboard.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          startIcon={<HomeIcon />}
          size="large"
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;