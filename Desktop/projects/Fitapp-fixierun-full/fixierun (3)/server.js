/**
 * Custom HTTPS Server for Next.js
 * 
 * This server creates an HTTPS server using self-signed certificates
 * and integrates with Next.js to serve the application over HTTPS.
 */

const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Determine environment
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Log environment info
console.log(`Environment: ${dev ? 'development' : 'production'}`);

// Function to check if certificates exist and create them if needed in development
async function ensureCertificatesExist() {
  const keyPath = path.join(__dirname, 'certificates', 'key.pem');
  const certPath = path.join(__dirname, 'certificates', 'cert.pem');
  
  // Check if certificates exist
  const keyExists = fs.existsSync(keyPath);
  const certExists = fs.existsSync(certPath);

  if (!keyExists || !certExists) {
    console.log('SSL certificates not found.');
    
    if (dev) {
      console.log('Attempting to generate self-signed certificates for development...');
      try {
        // Try to run the certificate generation script
        const generateScript = path.join(__dirname, 'certificates', 'generate-certificates.js');
        if (fs.existsSync(generateScript)) {
          console.log('Running certificate generation script...');
          require(generateScript);
          
          // Verify certificates were created
          if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            console.log('Successfully generated certificates.');
            return true;
          } else {
            throw new Error('Certificate files not found after generation attempt');
          }
        } else {
          throw new Error('Certificate generation script not found');
        }
      } catch (error) {
        console.error('Failed to generate certificates automatically:', error.message);
        console.log('\nPlease create SSL certificates manually:');
        console.log('1. Navigate to the project root');
        console.log('2. Run: node certificates/generate-certificates.js');
        console.log('   or use OpenSSL directly (see certificates/README.md)\n');
        return false;
      }
    } else {
      console.error('SSL certificates are required for production.');
      console.error('Please provide valid SSL certificates in the certificates directory.');
      return false;
    }
  }
  
  return true;
}

// Main function to start the server
async function startServer() {
  try {
    // Check for certificates
    const certificatesExist = await ensureCertificatesExist();
    if (!certificatesExist) {
      process.exit(1);
    }

    // Load SSL certificates
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, 'certificates', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certificates', 'cert.pem'))
    };

    // Prepare Next.js
    await app.prepare();
    
    // Create HTTPS server
    const server = createServer(httpsOptions, (req, res) => {
      try {
        // Parse URL
        const parsedUrl = parse(req.url, true);
        
        // Let Next.js handle the request
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Error handling for the server
    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please use a different port.`);
      }
      process.exit(1);
    });

    // Start listening
    server.listen(port, (err) => {
      if (err) throw err;
      
      const localUrl = `https://${hostname}:${port}`;
      
      console.log(`
┌─────────────────────────────────────────────────┐
│                                                 │
│   🔒 HTTPS Server Running                       │
│                                                 │
│   - Local:    ${localUrl.padEnd(32)}│
│   - Mode:     ${dev ? 'Development' : 'Production'.padEnd(32)}│
│                                                 │
│   ${dev ? '⚠️  Using self-signed certificate (dev only)' : '✅ Using production certificate'.padEnd(44)}│
│                                                 │
└─────────────────────────────────────────────────┘
      `);
    });
    
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server
startServer();

