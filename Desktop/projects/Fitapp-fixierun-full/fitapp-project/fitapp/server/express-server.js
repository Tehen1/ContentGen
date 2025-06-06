const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// Store location data
const locationData = new Map();

// WebSocket connection handler
wss.on('connection', (ws) => {
  const clientId = generateClientId();
  clients.set(clientId, ws);

  console.log(`Client connected: ${clientId}`);

  // Send initial location data to new client
  if (locationData.size > 0) {
    const initialData = {
      type: 'initialLocations',
      data: Array.from(locationData.values()),
    };
    ws.send(JSON.stringify(initialData));
  }

  // Message handler
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'position') {
        // Store location data
        locationData.set(data.userId, {
          userId: data.userId,
          lat: data.lat,
          lng: data.lng,
          timestamp: data.timestamp,
          speed: data.speed,
          altitude: data.altitude,
          accuracy: data.accuracy,
        });

        // Broadcast location to all other clients
        broadcastLocation(data, ws);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Connection close handler
  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    clients.delete(clientId);
  });

  // Connection error handler
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
    clients.delete(clientId);
  });
});

// Generate unique client ID
function generateClientId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Broadcast location to all clients except sender
function broadcastLocation(data, sender) {
  clients.forEach((client, id) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'position',
        data: {
          userId: data.userId,
          lat: data.lat,
          lng: data.lng,
          timestamp: data.timestamp,
          speed: data.speed,
          altitude: data.altitude,
          accuracy: data.accuracy,
        },
      }));
    }
  });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Get all active locations
app.get('/api/locations', (req, res) => {
  res.json(Array.from(locationData.values()));
});

// Get specific user location
app.get('/api/locations/:userId', (req, res) => {
  const { userId } = req.params;
  const location = locationData.get(userId);
  
  if (location) {
    res.json(location);
  } else {
    res.status(404).json({ error: 'Location not found for user' });
  }
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;

