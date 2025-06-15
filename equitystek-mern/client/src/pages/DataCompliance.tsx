import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Breadcrumbs,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
  Storage as StorageIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import DataComplianceBadge from '../components/ui/data-compliance-badge';

const DataCompliance: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs */}
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
            Home
          </Link>
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ShieldIcon sx={{ mr: 0.5 }} fontSize="small" />
            Data Compliance
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <ShieldIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
        <Typography variant="h4" component="h1">Australian Data Compliance</Typography>
      </Box>
      
      {/* Hero Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          mb: 5, 
          backgroundColor: 'primary.light', 
          color: 'primary.contrastText',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Your Data Never Leaves Australia
            </Typography>
            <Typography variant="body1" paragraph>
              At Equitystek, we take Australian data compliance seriously. All your property data, 
              maintenance records, and financial information is securely stored within Australian borders, 
              ensuring compliance with local regulations and data sovereignty requirements.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="secondary"
                component={Link}
                to="/privacy-policy"
                sx={{ fontWeight: 'bold' }}
              >
                View Privacy Policy
              </Button>
              <Button 
                variant="outlined" 
                color="inherit"
                component={Link}
                to="/terms-of-service"
                sx={{ fontWeight: 'medium' }}
              >
                View Terms of Service
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <ShieldIcon sx={{ fontSize: 160, opacity: 0.8 }} />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Key Compliance Features */}
      <Typography variant="h5" gutterBottom>
        Key Compliance Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={<StorageIcon color="primary" />}
              title="Australian Data Storage"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="body2">
                All your data is stored in secure, Australian-based data centers. 
                We never transfer your information outside Australian borders, ensuring 
                compliance with Australian data sovereignty requirements.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={<LockIcon color="primary" />}
              title="Advanced Encryption"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="body2">
                We use industry-standard encryption for all data, both in transit and at rest. 
                Your sensitive information, including property details and financial records, 
                is protected with robust security measures.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={<GavelIcon color="primary" />}
              title="Regulatory Compliance"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="body2">
                Equitystek adheres to the Australian Privacy Act 1988 (Cth) and the 
                Australian Privacy Principles (APPs). We regularly conduct compliance audits 
                to ensure our platform meets these strict regulatory requirements.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Compliance Details */}
      <Paper sx={{ p: 3, mb: 5 }}>
        <Typography variant="h5" gutterBottom>
          How We Ensure Australian Data Compliance
        </Typography>
        
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Data Location and Sovereignty</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Australian-Based Infrastructure" 
                  secondary="All our servers and databases are located in secure data centers within Australia."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="No Cross-Border Data Transfers" 
                  secondary="Your data never leaves Australian borders, ensuring full compliance with domestic data protection regulations."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Local Technical Support" 
                  secondary="Our Australian-based technical team manages all data operations, ensuring compliance with local standards and requirements."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Security Measures</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="End-to-End Encryption" 
                  secondary="All data is encrypted during transmission and storage using industry-standard protocols."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Regular Security Audits" 
                  secondary="We conduct regular security audits and vulnerability assessments to identify and address potential security issues."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Access Controls" 
                  secondary="Strict access controls ensure only authorized personnel can access user data, with comprehensive audit trails."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Privacy Practices</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Privacy by Design" 
                  secondary="Our platform is designed with privacy as a fundamental principle, ensuring data protection at every level."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="User Data Control" 
                  secondary="Users have the right to access, correct, and delete their personal information at any time."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Transparent Data Practices" 
                  secondary="We clearly communicate how user data is collected, stored, and used through our comprehensive Privacy Policy."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Regulatory Adherence</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Australian Privacy Principles" 
                  secondary="We adhere to all 13 Australian Privacy Principles as outlined in the Privacy Act 1988 (Cth)."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Breach Notification" 
                  secondary="We have robust procedures in place to detect, report, and manage data breaches in accordance with Australian regulations."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Regulatory Updates" 
                  secondary="We continuously monitor changes in Australian privacy laws and update our practices accordingly."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Paper>
      
      {/* Australian Compliance Badge */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <DataComplianceBadge variant="large" showInfo={true} />
      </Box>
      
      {/* Contact Information */}
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Questions About Data Compliance?
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about our data compliance practices or your data rights,
          our dedicated compliance team is here to help.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          to="/contact"
          startIcon={<SecurityIcon />}
        >
          Contact Compliance Team
        </Button>
      </Paper>
    </Container>
  );
};

export default DataCompliance;