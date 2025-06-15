const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const maintenanceRoutes = require('./routes/maintenance');
const subscriptionRoutes = require('./routes/subscriptions');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set Australian data compliance headers
app.use((req, res, next) => {
  res.header('X-Data-Location', 'Australia');
  res.header('X-Privacy-Policy-Version', '1.0');
  next();
});

// Data access audit middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[AUS-PRIVACY-AUDIT] ${new Date().toISOString()} | User: ${req.user ? req.user.username : 'unauthenticated'} | ${req.method} ${req.path} | IP: ${req.ip}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(err);
  res.status(status).json({ message });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    
    // Initialize subscription plans if needed
    await initializeSubscriptionPlans();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Initialize subscription plans
const initializeSubscriptionPlans = async () => {
  try {
    const SubscriptionPlan = require('./models/SubscriptionPlan');
    const plans = await SubscriptionPlan.find();
    
    if (plans.length === 0) {
      console.log('Creating default subscription plans...');
      
      await SubscriptionPlan.create([
        {
          name: 'Basic',
          description: 'Basic plan for property owners',
          basePrice: 15.00,
          pricePerProperty: 5.00,
          features: ['Property Tracking', 'Maintenance Records', 'Basic Valuation']
        },
        {
          name: 'Professional',
          description: 'Advanced plan for professional property managers',
          basePrice: 30.00,
          pricePerProperty: 3.50,
          features: ['Property Tracking', 'Maintenance Records', 'Advanced Valuation', 'Document Storage', 'Priority Support']
        },
        {
          name: 'Enterprise',
          description: 'Complete solution for property portfolios',
          basePrice: 75.00,
          pricePerProperty: 2.00,
          features: ['Property Tracking', 'Maintenance Records', 'Advanced Valuation', 'Document Storage', 'Priority Support', 'API Access', 'Custom Reporting']
        }
      ]);
      
      console.log('Default subscription plans created successfully');
    } else {
      console.log('Subscription plans already exist, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing subscription plans:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});