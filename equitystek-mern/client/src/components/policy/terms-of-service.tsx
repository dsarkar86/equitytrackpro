import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import DataComplianceBadge from '../ui/data-compliance-badge';

const TermsOfService: React.FC = () => {
  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <GavelIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
        <Typography variant="h4" component="h1">Terms of Service</Typography>
      </Box>
      
      <Typography variant="subtitle1" paragraph>
        Last Updated: May 18, 2025
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <DataComplianceBadge variant="large" showInfo={true} />
      </Box>
      
      <Typography variant="body1" paragraph>
        These Terms of Service ("Terms") govern your access to and use of the Equitystek platform.
        By accessing or using Equitystek, you agree to be bound by these Terms and our Privacy Policy.
        These Terms are subject to Australian law, and all services are provided in accordance with
        Australian regulations.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6">Service Description</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            Equitystek provides a property management and valuation platform that enables property owners, investors, 
            and trade professionals to track maintenance records, property valuations, and manage property-related documents.
            Our service includes:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Property Management" 
                secondary="Tools to add, edit, and track property information."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Maintenance Tracking" 
                secondary="Tools to record, schedule, and monitor property maintenance activities."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Valuation Tools" 
                secondary="Tools to track property valuations and access valuation history."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Document Storage" 
                secondary="Secure storage for property-related documents with Australian data compliance."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6">Subscription and Payments</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            Equitystek offers subscription-based access to our platform:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CreditCardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Subscription Plans" 
                secondary="Access to Equitystek requires a valid subscription. Various plans are available based on your needs."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CreditCardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Payment Processing" 
                secondary="All payments are processed securely through Stripe. Your payment information is handled according to their security standards and our Privacy Policy."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CreditCardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Subscription Changes" 
                secondary="You may upgrade, downgrade, or cancel your subscription at any time through your account settings. Changes to your subscription will take effect at the end of your current billing cycle."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CreditCardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Refund Policy" 
                secondary="Subscriptions are generally non-refundable. However, in exceptional circumstances, refunds may be considered at our discretion. Please contact our customer support for assistance."
              />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary">
            All prices are in Australian Dollars (AUD) and include applicable taxes.
          </Typography>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6">Australian Data Compliance</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            As an Australian service, Equitystek adheres to Australian data protection standards:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Data Location" 
                secondary="All user data is stored exclusively within Australian borders in compliance with Australian data sovereignty requirements."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Legal Compliance" 
                secondary="Our services comply with the Australian Privacy Act 1988 (Cth), the Australian Privacy Principles (APPs), and other relevant Australian regulations."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Data Security" 
                secondary="We implement robust security measures to protect your information, including encryption, access controls, and regular security audits."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Data Access" 
                secondary="You have the right to access, correct, and delete your personal information as outlined in our Privacy Policy and in accordance with Australian law."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BlockIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6">Prohibited Activities</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            When using Equitystek, you agree not to:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <BlockIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Violate Laws" 
                secondary="Use our services for any unlawful purpose or in violation of any Australian laws or regulations."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <BlockIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Unauthorized Access" 
                secondary="Attempt to gain unauthorized access to any portion of the platform or any systems or networks connected to the service."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <BlockIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Interfere with Operation" 
                secondary="Interfere with or disrupt the service or servers or networks connected to the service."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <BlockIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Share Account" 
                secondary="Share your account credentials or allow multiple users to access the service through a single account."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <BlockIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Infringe Rights" 
                secondary="Infringe upon or violate the intellectual property rights or any other rights of anyone else."
              />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary">
            Violation of these prohibitions may result in termination of your account and access to the platform.
          </Typography>
        </AccordionDetails>
      </Accordion>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          By using Equitystek, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          If you do not agree with any part of these terms, you may not use our services.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          For questions about these Terms, please contact us at legal@equitystek.com.
        </Typography>
      </Box>
    </Paper>
  );
};

export default TermsOfService;