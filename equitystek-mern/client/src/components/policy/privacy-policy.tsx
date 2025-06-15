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
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Policy as PolicyIcon
} from '@mui/icons-material';
import DataComplianceBadge from '../ui/data-compliance-badge';

const PrivacyPolicy: React.FC = () => {
  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <PolicyIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
        <Typography variant="h4" component="h1">Privacy Policy</Typography>
      </Box>
      
      <Typography variant="subtitle1" paragraph>
        Last Updated: May 18, 2025
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <DataComplianceBadge variant="large" showInfo={true} />
      </Box>
      
      <Typography variant="body1" paragraph>
        At Equitystek, we take your privacy and data protection seriously. This Privacy Policy explains 
        how we collect, use, disclose, and safeguard your information when you use our platform.
        We adhere to the Australian Privacy Principles (APPs) contained in the Privacy Act 1988 (Cth).
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StorageIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6">Information We Collect</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            We collect the following types of information:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Personal Information" 
                secondary="Name, email address, phone number, and billing information necessary for account creation and subscription services."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Property Information" 
                secondary="Property addresses, details, valuation data, and maintenance records that you add to the platform."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Usage Information" 
                secondary="Information about how you use the Equitystek platform, including log data, device information, and IP address."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Financial Information" 
                secondary="Payment method details and transaction history, securely processed and stored in compliance with Australian financial regulations."
              />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary">
            All sensitive information is encrypted both in transit and at rest.
          </Typography>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6">How We Use Your Information</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            We use the collected information for the following purposes:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Provide Services" 
                secondary="To provide, maintain, and improve the Equitystek platform and deliver the services you request."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Process Transactions" 
                secondary="To process payments, subscriptions, and send related information including confirmations and receipts."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Communication" 
                secondary="To respond to your inquiries, comments, or questions, and to send technical notices, updates, and support messages."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Security and Fraud Prevention" 
                secondary="To protect against, identify, and prevent fraud and other illegal activity, security issues, and claims."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShieldIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6">Australian Data Compliance</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            All data collected through the Equitystek platform is stored securely within Australia in compliance with Australian data protection laws:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Australian-Based Data Centers" 
                secondary="All your personal and property information is stored in secure, Australian-based data centers, ensuring that your data never leaves Australian borders."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Privacy Act Compliance" 
                secondary="Our data handling practices comply with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs)."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Data Access Audit Trails" 
                secondary="We maintain comprehensive audit logs of all data access to ensure compliance and security monitoring."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Regular Compliance Audits" 
                secondary="Our systems undergo regular security and compliance audits to ensure we meet the strict requirements of Australian regulations."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6">Data Security</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            We implement robust security measures to protect your personal and property information from unauthorized access and maintain data accuracy:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Encryption" 
                secondary="All sensitive data is encrypted using industry-standard methods both during transmission and at rest."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Secure Hosting" 
                secondary="Our platform is hosted in secure facilities with advanced physical security controls."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Access Controls" 
                secondary="We limit access to personal information to authorized employees and contractors who need access for specific business purposes."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Regular Security Assessments" 
                secondary="We regularly review our information collection, storage, and processing practices to guard against unauthorized access."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          By using Equitystek, you consent to the data practices described in this Privacy Policy. 
          If you have questions or concerns about our privacy practices, please contact us at privacy@equitystek.com.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PrivacyPolicy;