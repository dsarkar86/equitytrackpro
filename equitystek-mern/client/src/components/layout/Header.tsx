import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleClose();
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Properties', icon: <HomeIcon />, path: '/properties' },
    { text: 'Maintenance', icon: <BuildIcon />, path: '/maintenance' },
    { text: 'Subscription', icon: <ReceiptIcon />, path: '/subscription' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' }
  ];
  
  // Admin menu items
  const adminMenuItems = [
    { text: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin' }
  ];
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem sx={{ py: 2, bgcolor: 'primary.main', color: 'white' }}>
          <ListItemText 
            primary="Equitystek" 
            secondary={user ? `Welcome, ${user.fullName}` : 'Property Management'}
            secondaryTypographyProps={{ color: 'white' }}
          />
        </ListItem>
        
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            onClick={handleDrawerToggle}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                '&:hover': {
                  bgcolor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
            {location.pathname === item.path && (
              <ChevronRightIcon color="primary" />
            )}
          </ListItem>
        ))}
        
        {user && user.role === 'admin' && (
          <>
            <Divider sx={{ my: 1 }} />
            {adminMenuItems.map((item) => (
              <ListItem
                button
                component={Link}
                to={item.path}
                key={item.text}
                onClick={handleDrawerToggle}
                selected={location.pathname.startsWith(item.path)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {location.pathname.startsWith(item.path) && (
                  <ChevronRightIcon color="primary" />
                )}
              </ListItem>
            ))}
          </>
        )}
      </List>
      
      <Divider />
      
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {user && isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Equitystek
          </Typography>
          
          {user ? (
            <>
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {menuItems.map((item) => (
                    <Button
                      key={item.text}
                      component={Link}
                      to={item.path}
                      color="inherit"
                      sx={{ 
                        mx: 1,
                        fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                        borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                        borderRadius: 0,
                        pb: 0.5
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                  
                  {user.role === 'admin' && (
                    <Button
                      component={Link}
                      to="/admin"
                      color="inherit"
                      sx={{ 
                        mx: 1,
                        fontWeight: location.pathname.startsWith('/admin') ? 'bold' : 'normal',
                        borderBottom: location.pathname.startsWith('/admin') ? '2px solid white' : 'none',
                        borderRadius: 0,
                        pb: 0.5
                      }}
                    >
                      Admin
                    </Button>
                  )}
                </Box>
              )}
              
              <Box sx={{ ml: 2 }}>
                <IconButton
                  onClick={handleMenu}
                  color="inherit"
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem disabled sx={{ opacity: 1 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {user.fullName}
                    </Typography>
                  </MenuItem>
                  <MenuItem disabled sx={{ opacity: 0.8, fontSize: '0.875rem', pb: 1 }}>
                    {user.email}
                  </MenuItem>
                  <Divider />
                  <MenuItem component={Link} to="/profile" onClick={handleClose}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <Box>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/register"
                sx={{ ml: 1 }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;