import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import {
  Home,
  Image,
  Batch,
  Analytics,
  Memory,
  AutoFixHigh,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Accueil', icon: <Home /> },
    { path: '/generate', label: 'Générer', icon: <Image /> },
    { path: '/batch', label: 'Lot', icon: <Batch /> },
    { path: '/analyze', label: 'Analyser', icon: <Analytics /> },
    { path: '/models', label: 'Modèles', icon: <Memory /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        {/* Logo et titre */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          <AutoFixHigh fontSize="large" />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 0,
            mr: 4,
            fontWeight: 600,
            background: 'linear-gradient(45deg, #6a1b9a 30%, #00e5ff 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          Fixie UI
        </Typography>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color={isActive(item.path) ? 'secondary' : 'inherit'}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                fontWeight: isActive(item.path) ? 600 : 400,
                backgroundColor: isActive(item.path) 
                  ? 'rgba(0, 229, 255, 0.1)' 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 229, 255, 0.08)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Indicateur de statut de l'API */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
                },
                '70%': {
                  boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
                },
              },
            }}
          />
          <Typography variant="caption" color="success.main">
            API Active
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

