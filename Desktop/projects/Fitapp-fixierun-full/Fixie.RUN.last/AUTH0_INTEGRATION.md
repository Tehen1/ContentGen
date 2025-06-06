# Auth0 Integration with Web3Auth

This document explains how to integrate Auth0 with Web3Auth in your Fixie.RUN application.

## Overview

The integration enables users to authenticate with Auth0 and then use that authentication to access Web3Auth services. This is accomplished through:

1. Auth0 for primary authentication (OAuth, email/password, social logins)
2. Custom JWT generation for Web3Auth's Custom Authentication feature
3. JWKS endpoint for token verification

## Prerequisites

- Auth0 account and tenant (dev-4lwtoibsqqo846z0.eu.auth0.com)
- Web3Auth account with Custom Authentication enabled
- PEM certificate file (CpaoQ40lSXLgz8luyf9uZ.pem)

## Setup Instructions

### 1. Configure the Environment

Create a `.env.local` file with the following variables (update paths and values accordingly):

```
# JWT and Auth0 Configuration
JWT_PRIVATE_KEY_PATH=/Users/devtehen/Downloads/CpaoQ40lSXLgz8luyf9uZ.pem
JWT_PUBLIC_KEY_PATH=/path/to/publicKey.pem
JWT_KEY_ID=CpaoQ40lSXLgz8luyf9uZ
JWT_AUDIENCE=urn:auth0-authz-api
JWT_ISSUER=https://dev-4lwtoibsqqo846z0.eu.auth0.com/

# Web3Auth Configuration (already set)
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BCu3l6IQvMbnIlvRVQdSEodleOAfYRNqHhaGC9XLbUBkTb0FXcF6TYvLsEj_26UbDpBvQtfPUDTXBYwWhQCAXcs

# JWKS Endpoint (must be publicly accessible)
JWKS_URL=https://your-api.example.com/.well-known/jwks.json

# Auth0 Configuration
AUTH0_DOMAIN=dev-4lwtoibsqqo846z0.eu.auth0.com
AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET=YOUR_AUTH0_CLIENT_SECRET
AUTH0_AUDIENCE=https://dev-4lwtoibsqqo846z0.eu.auth0.com/api/v2/
```

### 2. Generate Public Key from PEM Certificate

If you only have the certificate file (`CpaoQ40lSXLgz8luyf9uZ.pem`), you can extract the public key with:

```bash
openssl x509 -in /Users/devtehen/Downloads/CpaoQ40lSXLgz8luyf9uZ.pem -pubkey -noout > publicKey.pem
```

### 3. Install Required Packages

```bash
npm install jsonwebtoken @auth0/auth0-react
```

### 4. Set Up JWKS Endpoint

You need to host a JWKS endpoint that returns the JWK (JSON Web Key) representation of your public key. There are two approaches:

#### Option A: Create a Next.js API Route

Create a file at `app/api/jwks/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { jwtHelper } from '@/lib/auth/jwt-helper';

export async function GET() {
  try {
    const jwks = jwtHelper.generateJWKS();
    return NextResponse.json(jwks);
  } catch (error) {
    console.error('Error generating JWKS:', error);
    return NextResponse.json(
      { error: 'Failed to generate JWKS' },
      { status: 500 }
    );
  }
}
```

#### Option B: Use an External Service

Deploy a simple server (Express, Vercel, etc.) that serves the JWKS JSON.

### 5. Configure Auth0

1. Log in to your Auth0 dashboard
2. Create a new application (if needed)
3. Configure your application's allowed callbacks, origins, and logout URLs
4. Note your Auth0 Client ID and Client Secret

### 6. Configure Web3Auth Custom Authentication

1. Log in to the Web3Auth Dashboard
2. Go to "Verifiers" and create a new Custom Authentication Verifier
3. Set the JWKS URL to your hosted JWKS endpoint
4. Configure the JWT fields to match your implementation:
   - Set "JWT field for Verifier ID" to "sub"
   - Set "JWT field for Audience" to "aud"
   - Set "JWT field for Issuer" to "iss"
   - Set the expected values for audience and issuer

### 7. Integrate Auth0 with your Frontend

Create a file at `components/auth0-provider.tsx`:

```tsx
'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export const Auth0ProviderWithNavigate = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '';
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '';
  const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';

  const onRedirectCallback = (appState: any) => {
    router.push(appState?.returnTo || '/');
  };

  if (!(domain && clientId && redirectUri)) {
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
```

### 8. Create Login Button Component

Create a file at `components/auth0-login-button.tsx`:

```tsx
'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { Button } from './ui/button';
import { useWeb3Auth } from './web3auth-provider';
import { useState } from 'react';

export const Auth0LoginButton = () => {
  const { loginWithRedirect, logout, isAuthenticated, user, getIdTokenClaims } = useAuth0();
  const { login: web3AuthLogin } = useWeb3Auth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isAuthenticated) {
      // User is already authenticated with Auth0
      // In a real implementation, you would:
      // 1. Get the ID token from Auth0
      // 2. Send it to your backend to convert to a Web3Auth token
      // 3. Use that token with Web3Auth
      
      // For now, we'll just use the existing Web3Auth login
      setIsLoading(true);
      try {
        await web3AuthLogin();
      } catch (error) {
        console.error('Error logging in with Web3Auth:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // User is not authenticated with Auth0
      await loginWithRedirect();
    }
  };

  const handleLogout = async () => {
    // Logout from Auth0
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <Button
      onClick={isAuthenticated ? handleLogout : handleLogin}
      disabled={isLoading}
      className="auth0-button"
    >
      {isLoading ? 'Loading...' : isAuthenticated ? `Logout ${user?.name}` : 'Login with Auth0'}
    </Button>
  );
};
```

### 9. Server-Side Integration (API Route)

Create a file at `app/api/auth/web3auth-token/route.ts` for converting Auth0 tokens to Web3Auth tokens:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Auth0Web3AuthVerifier } from '@/lib/auth/auth0-web3auth-verifier';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'Auth0 ID token is required' },
        { status: 400 }
      );
    }
    
    const web3AuthToken = await Auth0Web3AuthVerifier.convertAuth0TokenToWeb3Auth({
      authToken: idToken
    });
    
    return NextResponse.json({ token: web3AuthToken });
  } catch (error) {
    console.error('Error generating Web3Auth token:', error);
    return NextResponse.json(
      { error: 'Failed to generate Web3Auth token' },
      { status: 500 }
    );
  }
}
```

## Usage Flow

1. User clicks "Login with Auth0" button
2. User authenticates with Auth0 (email/password, social login, etc.)
3. On successful Auth0 login, your application gets an ID token
4. Your application sends the ID token to your backend
5. Backend verifies the Auth0 token and generates a new JWT for Web3Auth
6. Frontend receives the Web3Auth JWT and uses it to authenticate with Web3Auth
7. User is now authenticated with both Auth0 and Web3Auth

## Important Notes

1. **Security**: Ensure your private key is securely stored and never exposed to the client
2. **JWKS Endpoint**: This must be publicly accessible for Web3Auth to verify tokens
3. **Token Expiration**: Set appropriate expiration times for your tokens
4. **Error Handling**: Implement proper error handling for authentication failures

## Next Steps

1. Complete the implementation of the JWKS endpoint
2. Set up the Auth0 application and rules
3. Test the authentication flow end-to-end
4. Monitor for any authentication issues

## Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Web3Auth Custom Authentication](https://web3auth.io/docs/auth-provider-setup/custom-authentication)
- [JSON Web Key Sets (JWKS)](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets)
- [JWT.io](https://jwt.io/) - Useful for debugging JWTs
