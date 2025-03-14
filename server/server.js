const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
// Add this near the top of your file
const path = require('path');
const { queryGameServerInfo } = require('steam-server-query');
const net = require('net');
const { promisify } = require('util');
const ping = require('ping');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://thegabenzone.github.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TrueQuickplay API is running' });
});

// Routes
// Add a simple in-memory cache to reduce unnecessary API calls
let serverCache = {
  data: null,
  timestamp: 0,
  isMockData: false
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Add this near the top of your file, after the middleware setup
let requestCounter = 0;

// Then modify your /api/servers route
app.get('/api/servers', async (req, res) => {
  const requestId = ++requestCounter;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  console.log(`[${requestId}] Server request from ${clientIp} - ${new Date().toISOString()}`);
  console.log(`[${requestId}] User-Agent: ${userAgent}`);
  
  try {
    const forceRefresh = req.query.refresh === 'true';
    const now = Date.now();
    
    // Use cached data if available and not expired
    if (!forceRefresh && serverCache.data && (now - serverCache.timestamp < CACHE_EXPIRATION)) {
      console.log(`[${requestId}] Returning cached server data (age: ${Math.round((now - serverCache.timestamp) / 1000)}s)`);
      return res.status(200).json({ 
        servers: serverCache.data, 
        isMockData: serverCache.isMockData,
        fromCache: true,
        cacheAge: Math.round((now - serverCache.timestamp) / 1000) + ' seconds',
        requestId: requestId
      });
    }
    
    // Get the list of TF2 servers from Steam Master Server
    const steamApiKey = process.env.STEAM_API_KEY;
    const appId = 440; // TF2 App ID
    
    // Query the Steam Master Server API for servers with the tag
    const response = await axios.get('https://api.steampowered.com/IGameServersService/GetServerList/v1/', {
      params: {
        key: steamApiKey,
        filter: `\\appid\\${appId}\\gametagsand\\truequickplay`,
        limit: 100
      }
    });

    console.log('API Response Status:', response.status);
    
    // Check if we have servers
    if (!response.data || !response.data.response || !response.data.response.servers || response.data.response.servers.length === 0) {
      console.log('No servers found with the truequickplay tag. Using mock data for development.');
      
      // Provide mock data for development/testing purposes
      const mockServers = [
        { 
          id: 'mock1',
          name: 'TrueQuickplay Test Server',
          map: 'cp_dustbowl',
          gamemode: 'Control Points',
          players: '12/24',
          region: 'North America East',
          address: '127.0.0.1:27015'
        },
        {
          id: 'mock2',
          name: 'Community Server #1',
          map: 'pl_upward',
          gamemode: 'Payload',
          players: '18/24',
          region: 'Europe',
          address: '127.0.0.1:27016'
        },
        {
          id: 'mock3',
          name: '2Fort 24/7',
          map: 'ctf_2fort',
          gamemode: 'Capture the Flag',
          players: '22/24',
          region: 'Asia Pacific',
          address: '127.0.0.1:27017'
        }
      ];
      
      // Update cache
      serverCache.data = mockServers;
      serverCache.timestamp = now;
      serverCache.isMockData = true;
      
      return res.status(200).json({ 
        servers: mockServers, 
        isMockData: true,
        fromCache: false
      });
    }
    
    const servers = response.data.response.servers;
    
    // Get detailed info for each server
    const serverDetailsPromises = servers.map(async (server) => {
      try {
        // Make sure we have a valid address
        if (!server.addr || !server.addr.includes(':')) {
          console.log(`Invalid server address: ${server.addr}`);
          return null;
        }
    
        const address = server.addr.split(':');
        const ip = address[0];
        
        // Determine gamemode from map prefix
        let gamemode = 'Unknown';
        if (server.map) {
          const mapPrefix = server.map.split('_')[0];
          switch (mapPrefix) {
            case 'cp':
              gamemode = 'Control Points';
              break;
            case 'pl':
              gamemode = 'Payload';
              break;
            case 'plr':
              gamemode = 'Payload Race';
              break;
            case 'ctf':
              gamemode = 'Capture the Flag';
              break;
            case 'koth':
              gamemode = 'King of the Hill';
              break;
            case 'arena':
              gamemode = 'Arena';
              break;
            case 'mvm':
              gamemode = 'Mann vs Machine';
              break;
            case 'sd':
              gamemode = 'Special Delivery';
              break;
            case 'tc':
              gamemode = 'Territorial Control';
              break;
            case 'tr':
              gamemode = 'Training';
              break;
            case 'pd':
              gamemode = 'Player Destruction';
              break;
            case 'pass':
              gamemode = 'PASS Time';
              break;
            case 'rd':
              gamemode = 'Robot Destruction';
              break;
            case 'mge':
              gamemode = 'MGE';
              break;
            case 'jump':
              gamemode = 'Jump';
              break;
            case 'trade':
              gamemode = 'Trade';
              break;
            default:
              gamemode = 'Other';
          }
        }
        
        // Use the data from the Steam API response
        return {
          id: server.addr,
          name: server.name || 'Unknown Server',
          map: server.map || 'Unknown Map',
          gamemode: gamemode,
          players: `${server.players}/${server.max_players}`,
          region: getRegionFromIP(ip),
          address: server.addr
        };
      } catch (error) {
        console.error(`Error processing server ${server.addr}:`, error);
        return null;
      }
    });
    
    const serverDetails = (await Promise.all(serverDetailsPromises)).filter(server => server !== null);
    
    // Update cache
    serverCache.data = serverDetails;
    serverCache.timestamp = now;
    serverCache.isMockData = false;
    
    res.status(200).json({ 
      servers: serverDetails,
      fromCache: false
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    
    // If we have cached data, return it as a fallback
    if (serverCache.data) {
      console.log('Returning cached data as fallback after error');
      return res.status(200).json({ 
        servers: serverCache.data, 
        isMockData: serverCache.isMockData,
        fromCache: true,
        isErrorFallback: true
      });
    }
    
    res.status(500).json({ message: 'Error fetching servers', error: error.message });
  }
});

// Helper function to determine region from IP (simplified)
function getRegionFromIP(ip) {
  // This is a simplified approach based on IP ranges
  const octets = ip.split('.').map(Number);
  const firstOctet = octets[0];
  const secondOctet = octets[1];
  
  // North America
  if (firstOctet === 24 || firstOctet === 76 || firstOctet === 99 || 
      (firstOctet === 68 && secondOctet >= 128 && secondOctet <= 191) ||
      (firstOctet === 72 && secondOctet >= 0 && secondOctet <= 31) ||
      (firstOctet === 75 && secondOctet >= 0 && secondOctet <= 63)) {
    return 'North America West';
  }
  
  if (firstOctet === 23 || firstOctet === 64 || firstOctet === 65 || 
      (firstOctet === 66 && secondOctet >= 0 && secondOctet <= 127) ||
      (firstOctet === 71 && secondOctet >= 0 && secondOctet <= 255) ||
      (firstOctet === 74 && secondOctet >= 0 && secondOctet <= 255)) {
    return 'North America East';
  }
  
  if (firstOctet === 67 || firstOctet === 70 || firstOctet === 72 || 
      (firstOctet === 76 && secondOctet >= 16 && secondOctet <= 31)) {
    return 'North America Central';
  }
  
  // Europe
  if (firstOctet === 146 || firstOctet === 178 || firstOctet === 185 || 
      firstOctet === 188 || firstOctet === 193 || firstOctet === 194 || 
      firstOctet === 195) {
    return 'Europe';
  }
  
  if (firstOctet === 155 || firstOctet === 176 || firstOctet === 177 || 
      firstOctet === 179 || firstOctet === 181 || firstOctet === 192) {
    return 'Europe';
  }
  
  if (firstOctet === 151 || firstOctet === 160 || firstOctet === 171 || 
      firstOctet === 175 || firstOctet === 186 || firstOctet === 187) {
    return 'Europe';
  }
  
  if (firstOctet === 149 || firstOctet === 156 || firstOctet === 161 || 
      firstOctet === 164 || firstOctet === 165 || firstOctet === 169) {
    return 'Europe';
  }
  
  // Asia
  if (firstOctet === 103 || firstOctet === 106 || firstOctet === 111 || 
      firstOctet === 112 || firstOctet === 113 || firstOctet === 114) {
    return 'Asia East';
  }
  
  if (firstOctet === 101 || firstOctet === 115 || firstOctet === 116 || 
      firstOctet === 117 || firstOctet === 118 || firstOctet === 119) {
    return 'Asia Southeast';
  }
  
  if (firstOctet === 121 || firstOctet === 122 || firstOctet === 123 || 
      firstOctet === 124 || firstOctet === 125 || firstOctet === 126) {
    return 'Asia Pacific';
  }
  
  // Oceania
  if (firstOctet === 27 || firstOctet === 43 || firstOctet === 49 || 
      firstOctet === 58 || firstOctet === 59 || firstOctet === 60) {
    return 'Australia';
  }
  
  if (firstOctet === 49 || firstOctet === 103 || firstOctet === 110 || 
      firstOctet === 111 || firstOctet === 114 || firstOctet === 118) {
    return 'New Zealand';
  }
  
  // South America
  if (firstOctet === 177 || firstOctet === 179 || firstOctet === 181 || 
      firstOctet === 186 || firstOctet === 187 || firstOctet === 189 || 
      firstOctet === 190 || firstOctet === 191 || firstOctet === 200 || 
      firstOctet === 201) {
    return 'South America';
  }
  
  // Fallback to general regions based on IP classes
  if (firstOctet >= 1 && firstOctet <= 127) return 'North America';
  if (firstOctet >= 128 && firstOctet <= 191) return 'Europe';
  if (firstOctet >= 192 && firstOctet <= 223) return 'Asia/Pacific';
  
  return 'Unknown';
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
// Add this after your other routes
app.get('/api/debug/requests', (req, res) => {
  res.json({
    totalRequests: requestCounter,
    currentTime: new Date().toISOString(),
    cacheStatus: {
      exists: !!serverCache.data,
      age: serverCache.data ? Math.round((Date.now() - serverCache.timestamp) / 1000) + ' seconds' : null,
      serverCount: serverCache.data ? serverCache.data.length : 0
    }
  });
});
app.get('/api/debug/cache', (req, res) => {
  res.json({
    cacheExists: !!serverCache.data,
    cacheAge: serverCache.data ? Math.round((Date.now() - serverCache.timestamp) / 1000) + ' seconds' : null,
    isMockData: serverCache.isMockData,
    serverCount: serverCache.data ? serverCache.data.length : 0,
    timestamp: new Date(serverCache.timestamp).toISOString()
  });
});

app.delete('/api/debug/cache', (req, res) => {
  serverCache = {
    data: null,
    timestamp: 0,
    isMockData: false
  };
  res.json({ message: 'Cache cleared successfully' });
});
app.get('/api/join/:address', (req, res) => {
  try {
    const serverAddress = req.params.address;
    // TF2's app ID is 440
    const joinUrl = `steam://connect/${serverAddress}/?appid=440`;
    
    res.json({ joinUrl });
  } catch (error) {
    console.error('Error generating join URL:', error);
    res.status(500).json({ message: 'Error generating join URL', error: error.message });
  }
});