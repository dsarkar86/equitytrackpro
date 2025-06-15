import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Stack,
  IconButton
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Equitystek
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Advanced property maintenance tracking and valuation management platform designed for property owners, investors, and tradespeople.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton size="small" color="primary">
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <LinkedInIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <InstagramIcon />
              </IconButton>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">
                  Home
                </Typography>
              </Link>
              <Link to="/properties" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">
                  Properties
                </Typography>
              </Link>
              <Link to="/maintenance" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">
                  Maintenance
                </Typography>
              </Link>
              <Link to="/subscription" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">
                  Subscription
                </Typography>
              </Link>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Legal
            </Typography>
            <Stack spacing={1}>
              <Link to="/privacy-policy" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">
                  Privacy Policy
                </Typography>
              </Link>
              <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">
                  Terms of Service
                </Typography>
              </Link>
              <Link to="/data-protection" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">
                  Australian Data Protection
                </Typography>
              </Link>
            </Stack>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Equitystek. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src="/aus-data-compliance.png"
              alt="Australian Data Compliance"
              sx={{ height: 40, mr: 1, display: { xs: 'none', sm: 'block' } }}
            />
            <Typography variant="body2" color="text.secondary">
              Australian Data Protection Compliant
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;