import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Divider,
  CircularProgress,
  Avatar,
  Rating,
  Tabs,
  Tab,
  Badge,
  useTheme
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  Build as BuildIcon,
  Handyman as HandymanIcon,
  Plumbing as PlumbingIcon,
  Electrical as ElectricalIcon,
  HouseSiding as HouseSidingIcon,
  Hvac as HvacIcon,
  Roofing as RoofingIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { getRandomImage, tradesImages } from '../assets/stock-photos';

// Define specialized icons for each trade category
const TradeIcons: Record<string, JSX.Element> = {
  'plumbing': <PlumbingIcon />,
  'electrical': <ElectricalIcon />,
  'carpentry': <HandymanIcon />,
  'painting': <HouseSidingIcon />,
  'hvac': <HvacIcon />,
  'roofing': <RoofingIcon />,
  'general': <BuildIcon />
};

interface Tradesperson {
  _id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: string[];
  specialties: string[];
  description: string;
  hourlyRate?: number;
  callOutFee?: number;
  servicesOffered: string[];
  availability: {
    workingDays: string[];
    emergencyService: boolean;
  };
  licenses: {
    type: string;
    number: string;
    expiry: string;
  }[];
  insurance: {
    type: string;
    provider: string;
    expiryDate: string;
    coverageAmount: number;
  }[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
  rating: number;
  reviewCount: number;
  profileImage?: string;
}

interface Review {
  _id: string;
  tradespersonId: string;
  propertyId: string;
  propertyName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  jobType: string;
  jobCost?: number;
}

interface JobRequest {
  _id: string;
  propertyId: string;
  propertyName: string;
  userId: string;
  tradespersonId: string;
  tradespersonName: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'accepted' | 'scheduled' | 'completed' | 'cancelled' | 'declined';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  preferredDate?: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedDuration?: string;
  estimatedCost?: number;
  finalCost?: number;
  createdAt: string;
  photos?: string[];
}

interface Property {
  _id: string;
  name: string;
  address: string;
}

const TradesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  // Component states
  const [tradespeople, setTradespeople] = useState<Tradesperson[]>([]);
  const [favoriteTradespeople, setFavoriteTradespeople] = useState<string[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tradespeople
        const tradespeopleResponse = await axios.get('/api/tradespeople');
        setTradespeople(tradespeopleResponse.data);
        
        // Fetch properties
        const propertiesResponse = await axios.get('/api/properties');
        setProperties(propertiesResponse.data);
        
        setLoading(false);
        
        // Fetch favorite tradespeople
        setLoadingFavorites(true);
        try {
          const favoritesResponse = await axios.get('/api/user/favorite-tradespeople');
          setFavoriteTradespeople(favoritesResponse.data.map((fav: any) => fav.tradespersonId));
          setLoadingFavorites(false);
        } catch (error) {
          console.error('Error fetching favorites:', error);
          setLoadingFavorites(false);
        }
        
        // Fetch job requests
        setLoadingRequests(true);
        try {
          const requestsResponse = await axios.get('/api/job-requests');
          setJobRequests(requestsResponse.data);
          setLoadingRequests(false);
        } catch (error) {
          console.error('Error fetching job requests:', error);
          setLoadingRequests(false);
        }
      } catch (err: any) {
        console.error('Error loading trades dashboard:', err);
        setLoading(false);
        toast.error('Failed to load tradespeople');
      }
    };
    
    fetchData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Filter tradespeople by category
  const filteredTradespeople = selectedCategory
    ? tradespeople.filter(trade => trade.categories.includes(selectedCategory))
    : tradespeople;
  
  // Get favorite tradespeople
  const favoriteTradesData = tradespeople.filter(trade => 
    favoriteTradespeople.includes(trade._id)
  );
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Toggle favorite tradesperson
  const toggleFavorite = async (tradespersonId: string) => {
    try {
      const isFavorite = favoriteTradespeople.includes(tradespersonId);
      
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`/api/user/favorite-tradespeople/${tradespersonId}`);
        setFavoriteTradespeople(prev => prev.filter(id => id !== tradespersonId));
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        await axios.post('/api/user/favorite-tradespeople', { tradespersonId });
        setFavoriteTradespeople(prev => [...prev, tradespersonId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };
  
  // Navigate to create job request
  const handleCreateJobRequest = (tradespersonId?: string) => {
    navigate(tradespersonId ? `/job-request/new/${tradespersonId}` : '/job-request/new');
  };
  
  // Main loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
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
          <ConstructionIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Tradespeople Network
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Find trusted professionals for your property maintenance
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleCreateJobRequest()}
        >
          New Job Request
        </Button>
      </Box>
      
      {/* Top Categories */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Categories
        </Typography>
        <Grid container spacing={2}>
          {['plumbing', 'electrical', 'carpentry', 'painting', 'hvac', 'roofing', 'general'].map((category) => (
            <Grid item key={category}>
              <Chip
                icon={TradeIcons[category]}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                sx={{ px: 1 }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 4 }}
      >
        <Tab label="All Tradespeople" />
        <Tab 
          label={
            <Badge badgeContent={favoriteTradespeople.length} color="primary">
              Favorites
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={jobRequests.length} color="primary">
              Job Requests
            </Badge>
          } 
        />
      </Tabs>
      
      {/* All Tradespeople Tab */}
      <Box hidden={activeTab !== 0}>
        {filteredTradespeople.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Tradespeople Found
            </Typography>
            <Typography variant="body1">
              {selectedCategory 
                ? `No tradespeople found in the "${selectedCategory}" category.` 
                : 'No tradespeople are currently available.'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredTradespeople.map((tradesperson) => (
              <Grid item xs={12} md={6} key={tradesperson._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar
                        src={tradesperson.profileImage || getRandomImage(tradesImages)}
                        alt={tradesperson.name}
                        sx={{ width: 80, height: 80 }}
                      />
                      <Box>
                        <Typography variant="h6" component="div">
                          {tradesperson.name}
                        </Typography>
                        {tradesperson.companyName && (
                          <Typography variant="body2" color="text.secondary">
                            {tradesperson.companyName}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Rating value={tradesperson.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({tradesperson.reviewCount} reviews)
                          </Typography>
                        </Box>
                        
                        {tradesperson.verificationStatus === 'verified' && (
                          <Chip 
                            size="small"
                            icon={<CheckCircleIcon />}
                            label="Verified" 
                            color="success"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <BuildIcon fontSize="small" sx={{ mr: 1, mt: 0.3 }} color="action" />
                          <Box>
                            <Typography variant="body2">
                              <strong>Specialties:</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {tradesperson.specialties.join(', ')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <LocationIcon fontSize="small" sx={{ mr: 1, mt: 0.3 }} color="action" />
                          <Box>
                            <Typography variant="body2">
                              <strong>Location:</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {tradesperson.address.split(',')[0]}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      {tradesperson.hourlyRate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Hourly Rate:</strong> ${tradesperson.hourlyRate}/hr
                          </Typography>
                        </Grid>
                      )}
                      
                      {tradesperson.callOutFee && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Call Out Fee:</strong> ${tradesperson.callOutFee}
                          </Typography>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Categories:</strong>
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {tradesperson.categories.map((category) => (
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
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {tradesperson.description.length > 150
                          ? `${tradesperson.description.substring(0, 150)}...`
                          : tradesperson.description}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => toggleFavorite(tradesperson._id)}
                      startIcon={
                        favoriteTradespeople.includes(tradesperson._id) ? 
                        <StarIcon color="warning" /> : <StarIcon />
                      }
                    >
                      {favoriteTradespeople.includes(tradesperson._id) ? 'Favorited' : 'Add to Favorites'}
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleCreateJobRequest(tradesperson._id)}
                      startIcon={<AddIcon />}
                    >
                      Request Job
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Favorites Tab */}
      <Box hidden={activeTab !== 1}>
        {loadingFavorites ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : favoriteTradesData.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Favorite Tradespeople
            </Typography>
            <Typography variant="body1" paragraph>
              Add tradespeople to your favorites for quick access
            </Typography>
            <Button
              variant="contained"
              onClick={() => setActiveTab(0)}
              startIcon={<PersonAddIcon />}
            >
              Browse Tradespeople
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {favoriteTradesData.map((tradesperson) => (
              <Grid item xs={12} md={6} key={tradesperson._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar
                        src={tradesperson.profileImage || getRandomImage(tradesImages)}
                        alt={tradesperson.name}
                        sx={{ width: 80, height: 80 }}
                      />
                      <Box>
                        <Typography variant="h6" component="div">
                          {tradesperson.name}
                        </Typography>
                        {tradesperson.companyName && (
                          <Typography variant="body2" color="text.secondary">
                            {tradesperson.companyName}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Rating value={tradesperson.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({tradesperson.reviewCount} reviews)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1 }} color="action" />
                          <Typography variant="body2">{tradesperson.phone}</Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1 }} color="action" />
                          <Typography variant="body2">{tradesperson.email}</Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <LocationIcon fontSize="small" sx={{ mr: 1, mt: 0.3 }} color="action" />
                          <Typography variant="body2">{tradesperson.address}</Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Specialties:</strong> {tradesperson.specialties.join(', ')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => toggleFavorite(tradesperson._id)}
                      startIcon={<StarIcon />}
                    >
                      Remove from Favorites
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleCreateJobRequest(tradesperson._id)}
                      startIcon={<AddIcon />}
                    >
                      Request Job
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Job Requests Tab */}
      <Box hidden={activeTab !== 2}>
        {loadingRequests ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobRequests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Job Requests
            </Typography>
            <Typography variant="body1" paragraph>
              Start by creating a new job request for a tradesperson
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleCreateJobRequest()}
              startIcon={<AddIcon />}
            >
              Create Job Request
            </Button>
          </Paper>
        ) : (
          <Box>
            {/* Active Requests */}
            <Typography variant="h6" gutterBottom>
              Active Requests
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {jobRequests
                .filter(job => ['pending', 'accepted', 'scheduled'].includes(job.status))
                .map((job) => (
                  <Grid item xs={12} md={6} key={job._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6">{job.title}</Typography>
                          <Chip 
                            label={job.status.charAt(0).toUpperCase() + job.status.slice(1)} 
                            color={
                              job.status === 'pending' ? 'default' :
                              job.status === 'accepted' ? 'primary' :
                              job.status === 'scheduled' ? 'info' :
                              job.status === 'completed' ? 'success' :
                              'error'
                            }
                            size="small"
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={job.category.charAt(0).toUpperCase() + job.category.slice(1)} 
                            size="small"
                            icon={TradeIcons[job.category as keyof typeof TradeIcons] || <BuildIcon />}
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={job.priority} 
                            size="small"
                            color={
                              job.priority === 'low' ? 'default' :
                              job.priority === 'medium' ? 'primary' :
                              job.priority === 'high' ? 'warning' :
                              'error'
                            }
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {job.description.length > 150
                            ? `${job.description.substring(0, 150)}...`
                            : job.description}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Property:</strong> {job.propertyName}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Tradesperson:</strong> {job.tradespersonName}
                            </Typography>
                          </Grid>
                          
                          {job.scheduledDate && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventIcon fontSize="small" sx={{ mr: 0.5 }} color="action" />
                                <Typography variant="body2">
                                  <strong>Scheduled:</strong> {formatDate(job.scheduledDate)}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          
                          {job.estimatedCost && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Estimated Cost:</strong> ${job.estimatedCost}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          variant="outlined"
                          component={Link}
                          to={`/job-request/${job._id}`}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
            
            {/* Completed Requests */}
            <Typography variant="h6" gutterBottom>
              Completed Requests
            </Typography>
            <Grid container spacing={3}>
              {jobRequests
                .filter(job => job.status === 'completed')
                .map((job) => (
                  <Grid item xs={12} md={6} key={job._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6">{job.title}</Typography>
                          <Chip 
                            label="Completed" 
                            color="success"
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {job.description.length > 100
                            ? `${job.description.substring(0, 100)}...`
                            : job.description}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Property:</strong> {job.propertyName}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Tradesperson:</strong> {job.tradespersonName}
                            </Typography>
                          </Grid>
                          
                          {job.completedDate && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventIcon fontSize="small" sx={{ mr: 0.5 }} color="action" />
                                <Typography variant="body2">
                                  <strong>Completed:</strong> {formatDate(job.completedDate)}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          
                          {job.finalCost && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Final Cost:</strong> ${job.finalCost}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          variant="outlined"
                          component={Link}
                          to={`/job-request/${job._id}`}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TradesDashboard;