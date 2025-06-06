import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

/**
 * JWT Helper for Auth0 integration with Web3Auth
 * This utility provides methods for generating and verifying JWTs
 * for use with Auth0 and Web3Auth custom authentication
 */

interface JWTPayload {
  sub: string;        // Subject (user ID)
  name?: string;      // User's name
  email?: string;     // User's email
  wallet_address?: string; // User's blockchain wallet address
  aud: string;        // Audience
  iss: string;        // Issuer
  iat: number;        // Issued at (timestamp)
  exp: number;        // Expiration time (timestamp)
  [key: string]: any; // Allow additional custom claims
}

export class JWTHelper {
  private privateKeyPath: string;
  private publicKeyPath: string;
  private keyId: string;
  
  /**
   * Initialize the JWT Helper
   * @param privateKeyPath Path to the private key file
   * @param publicKeyPath Path to the public key file
   * @param keyId Key ID from Auth0 (used in the JWT header)
   */
  constructor(
    privateKeyPath: string = process.env.JWT_PRIVATE_KEY_PATH || '',
    publicKeyPath: string = process.env.JWT_PUBLIC_KEY_PATH || '',
    keyId: string = process.env.JWT_KEY_ID || 'CpaoQ40lSXLgz8luyf9uZ'
  ) {
    this.privateKeyPath = privateKeyPath;
    this.publicKeyPath = publicKeyPath;
    this.keyId = keyId;
  }
  
  /**
   * Generate a JWT token for a user
   * @param userId Unique user identifier
   * @param userData Additional user data to include in the token
   * @param expiresIn Token expiration time in seconds (default: 1 hour)
   * @returns JWT token string
   */
  generateToken(
    userId: string,
    userData: {
      name?: string;
      email?: string;
      wallet_address?: string;
      [key: string]: any;
    },
    expiresIn: number = 3600
  ): string {
    try {
      // Read private key
      const privateKey = fs.readFileSync(this.privateKeyPath);
      
      // Prepare payload
      const payload: JWTPayload = {
        sub: userId,
        name: userData.name,
        email: userData.email,
        wallet_address: userData.wallet_address,
        // Use Auth0 settings provided in the query
        aud: process.env.JWT_AUDIENCE || 'urn:auth0-authz-api',
        iss: process.env.JWT_ISSUER || 'https://dev-4lwtoibsqqo846z0.eu.auth0.com/',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        // Add any additional claims
        ...Object.entries(userData)
          .filter(([key]) => !['name', 'email', 'wallet_address'].includes(key))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
      };
      
      // Sign the token
      const token = jwt.sign(
        payload,
        privateKey,
        {
          algorithm: 'RS256',
          keyid: this.keyId
        }
      );
      
      return token;
    } catch (error) {
      console.error('Error generating JWT:', error);
      throw new Error('Failed to generate JWT token');
    }
  }
  
  /**
   * Verify a JWT token
   * @param token JWT token to verify
   * @returns Decoded token payload if valid
   */
  verifyToken(token: string): JWTPayload {
    try {
      // Read public key
      const publicKey = fs.readFileSync(this.publicKeyPath);
      
      // Verify the token
      const decoded = jwt.verify(token, publicKey, {
        algorithms: ['RS256']
      });
      
      return decoded as JWTPayload;
    } catch (error) {
      console.error('Error verifying JWT:', error);
      throw new Error('Invalid JWT token');
    }
  }
  
  /**
   * Generate a JWKS (JSON Web Key Set) from the public key
   * Note: For production use, consider using a more robust JWKS library
   * This is a simplified implementation for demonstration purposes
   */
  generateJWKS(): { keys: any[] } {
    try {
      // In a real implementation, you would use a library to convert PEM to JWK
      // This is a placeholder to indicate the concept
      
      // For actual implementation, use the pem-jwk library or similar
      // const pemJwk = require('pem-jwk');
      // const publicKey = fs.readFileSync(this.publicKeyPath, 'utf8');
      // const jwk = pemJwk.pem2jwk(publicKey);
      
      // For now, return a mock structure
      return {
        keys: [
          {
            kty: "RSA",
            use: "sig",
            kid: this.keyId,
            alg: "RS256",
            // In a real implementation, these values would be derived from the public key
            n: "public-key-modulus-base64url-encoded",
            e: "AQAB" // Public exponent, typically "AQAB" for RSA keys
          }
        ]
      };
    } catch (error) {
      console.error('Error generating JWKS:', error);
      throw new Error('Failed to generate JWKS');
    }
  }
}

/**
 * Create a singleton instance for use throughout the application
 */
export const jwtHelper = new JWTHelper();

/**
 * Example usage:
 * 
 * // Generate a token
 * const token = jwtHelper.generateToken('user-123', {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   wallet_address: '0x1234567890abcdef'
 * });
 * 
 * // Verify a token
 * try {
 *   const payload = jwtHelper.verifyToken(token);
 *   console.log('Valid token:', payload);
 * } catch (error) {
 *   console.error('Invalid token');
 * }
 */

