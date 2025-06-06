# FitApp API Documentation

## Overview
The FitApp API provides endpoints for retrieving and managing fitness data. It supports authentication via JWT tokens and integrates with blockchain wallets for user verification.

## Base URL
```
http://localhost:8000/api
```

## Authentication
Most endpoints require authentication. Include a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### User Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "walletAddress": "0x..."
  }
}
```

#### POST /auth/login
Log in an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "walletAddress": "0x..."
  }
}
```

### Fitness Data

#### GET /fitness/data
Get fitness data for the authenticated user.

**Query Parameters:**
- `startDate` (optional): Start date for data range (YYYY-MM-DD)
- `endDate` (optional): End date for data range (YYYY-MM-DD)
- `type` (optional): Type of fitness data ('steps', 'calories', 'distance', 'all')

**Response:**
```json
{
  "data": [
    {
      "date": "2023-01-01",
      "steps": 8000,
      "calories": 2100,
      "distance": 5.2,
      "heartMinutes": 25
    },
    {
      "date": "2023-01-02",
      "steps": 10000,
      "calories": 2300,
      "distance": 6.5,
      "heartMinutes": 32
    }
  ]
}
```

#### POST /fitness/data/import
Import fitness data from a file.

**Request Body:**
```
FormData with 'file' field containing the fitness data file
```

**Response:**
```json
{
  "success": true,
  "message": "Data imported successfully",
  "count": 30
}
```

#### GET /fitness/stats
Get aggregate statistics for fitness data.

**Query Parameters:**
- `period` (optional): Time period ('day', 'week', 'month', 'year')

**Response:**
```json
{
  "totalSteps": 250000,
  "totalCalories": 62000,
  "totalDistance": 160.5,
  "averageSteps": 8333,
  "averageCalories": 2066,
  "averageDistance": 5.35
}
```

### Web3 Integration

#### POST /web3/verify-wallet
Verify wallet ownership by signature.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "verified": true,
  "walletAddress": "0x..."
}
```

## Error Responses
All endpoints can return the following error responses:

- 400 Bad Request: Invalid request parameters
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server error

**Error Response Format:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```
