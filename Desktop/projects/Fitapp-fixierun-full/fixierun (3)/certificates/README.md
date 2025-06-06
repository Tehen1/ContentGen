# SSL Certificates for Development

This directory contains SSL certificates for local development of your Next.js application over HTTPS.

## ⚠️ Important Warning

**These certificates are for development purposes only!**

Self-signed certificates should never be used in production environments. They are intended only for local development and testing.

## Generating Certificates

### Option 1: Using the Node.js Script (Recommended)

We've provided a script that generates self-signed certificates using Node.js crypto module:

```bash
# From the project root directory
node certificates/generate-certificates.js
```

This script will:
- Generate a 2048-bit RSA private key (`key.pem`)
- Create a self-signed certificate (`cert.pem`) valid for 365 days
- Set appropriate attributes including localhost domain names

### Option 2: Using OpenSSL Directly

If you prefer to use OpenSSL directly or if the Node.js script doesn't work for you:

```bash
# From the project root directory
openssl req -x509 -newkey rsa:2048 -keyout certificates/key.pem \
  -out certificates/cert.pem -days 365 -nodes \
  -subj "/CN=localhost/O=Development Environment/OU=Engineering"
```

## Browser Security Warnings

When accessing your application over HTTPS with these self-signed certificates, browsers will display security warnings:

- Chrome: "Your connection is not private" warning
- Firefox: "Warning: Potential Security Risk Ahead"
- Safari: "This Connection Is Not Private"

This is normal and expected for self-signed certificates. During development, you can:

1. Click "Advanced" or similar option
2. Select "Proceed to localhost (unsafe)" or equivalent
3. Continue to your application

Some browsers may remember this choice for future sessions.

## Certificate Details

The generated certificates:
- Are valid for localhost and 127.0.0.1
- Have a validity period of 365 days
- Use RSA 2048-bit encryption
- Include proper extensions for web server authentication

## Production Recommendations

For production environments, never use self-signed certificates. Instead:

1. **Use a trusted Certificate Authority (CA)** - Options include:
   - [Let's Encrypt](https://letsencrypt.org/) (free)
   - [Cloudflare SSL](https://www.cloudflare.com/ssl/)
   - Commercial CAs (DigiCert, Comodo, etc.)

2. **Use proper key management**:
   - Store private keys securely
   - Set up automatic renewal
   - Use environment variables for sensitive paths

3. **Consider using a reverse proxy**:
   - Nginx or Apache can handle SSL termination
   - Cloud providers offer managed SSL services

4. **Enable HTTP/2 for better performance**:
   - Modern TLS certificates support HTTP/2
   - Provides multiplexing and other performance benefits

