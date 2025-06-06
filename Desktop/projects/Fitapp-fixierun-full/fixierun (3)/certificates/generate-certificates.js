/**
 * SSL Certificate Generator for Development
 * 
 * This script generates self-signed SSL certificates for local development.
 * DO NOT USE THESE CERTIFICATES IN PRODUCTION!
 * 
 * The script creates:
 * - key.pem: The private key
 * - cert.pem: The self-signed certificate
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

// Certificate configuration
const certConfig = {
  commonName: 'localhost',
  organization: 'Development Environment',
  organizationalUnit: 'Engineering',
  locality: 'Local',
  state: 'Development',
  country: 'US',
  validityDays: 365 // Certificate valid for 1 year
};

// Paths for the certificates
const certDir = __dirname;
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

console.log('🔐 Generating self-signed SSL certificates for development...');
console.log('⚠️  WARNING: These certificates are for development only!');
console.log('⚠️  Do not use them in production environments.');
console.log('');

/**
 * Check if OpenSSL is available on the system
 * @returns {boolean} True if OpenSSL is available, false otherwise
 */
function isOpenSSLAvailable() {
  try {
    execSync('openssl version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate certificates using OpenSSL command line
 */
function generateCertificatesWithOpenSSL() {
  console.log('📝 Using OpenSSL to generate certificates...');
  
  // Create the subject string for the certificate
  const subject = `/CN=${certConfig.commonName}/O=${certConfig.organization}/OU=${certConfig.organizationalUnit}/L=${certConfig.locality}/ST=${certConfig.state}/C=${certConfig.country}`;
  
  // Build the OpenSSL command
  const opensslCommand = 'openssl';
  const args = [
    'req', '-x509',
    '-newkey', 'rsa:2048',
    '-keyout', keyPath,
    '-out', certPath,
    '-days', certConfig.validityDays.toString(),
    '-nodes',
    '-subj', subject,
    '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'
  ];
  
  // Run the command
  console.log('📝 Generating private key and certificate...');
  const result = spawnSync(opensslCommand, args, { stdio: 'pipe' });
  
  if (result.status !== 0) {
    throw new Error(`OpenSSL command failed with status ${result.status}: ${result.stderr.toString()}`);
  }
  
  // Check if files were created
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error('OpenSSL did not generate the expected certificate files');
  }
}

// Generate certificates
try {
  // Check if OpenSSL is available
  if (!isOpenSSLAvailable()) {
    throw new Error('OpenSSL is not available on this system. Please install OpenSSL or generate certificates manually.');
  }
  
  // Generate certificates using OpenSSL
  generateCertificatesWithOpenSSL();
  
  console.log('💾 Certificates saved to:', certDir);
  console.log('✅ Successfully generated SSL certificates:');
  console.log(`  - ${keyPath}`);
  console.log(`  - ${certPath}`);
  console.log('');
  console.log('📌 When using these certificates in your browser, you will see a security warning.');
  console.log('   This is normal for self-signed certificates. You can proceed by accepting the risk.');
  console.log('');
  console.log('🚀 Your development environment is now ready for HTTPS!');
} catch (error) {
  console.error('❌ Error generating certificates:');
  console.error(error.message);
  console.log('');
  console.log('💡 Manual certificate generation:');
  console.log('   You can manually generate certificates using OpenSSL with the following commands:');
  console.log('');
  console.log('   openssl req -x509 -newkey rsa:2048 -keyout certificates/key.pem \\');
  console.log('     -out certificates/cert.pem -days 365 -nodes \\');
  console.log('     -subj "/CN=localhost/O=Development Environment/OU=Engineering" \\');
  console.log('     -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"');
  console.log('');
  console.log('   If you\'re using an older version of OpenSSL, you may need to omit the -addext parameter.');
  
  process.exit(1);
}

