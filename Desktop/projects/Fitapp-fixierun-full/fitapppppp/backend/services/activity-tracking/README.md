# FIXIE Activity Tracking Service

## Overview

This microservice is responsible for tracking and managing user fitness activities in the FIXIE application. It handles:

- Storing and retrieving activity data (running, cycling, walking)
- Calculating distance, calories, and other metrics
- Supporting GPS tracking data
- Calculating token rewards for completed activities

## API Endpoints

### Create Activity
- **POST** `/api/v1/activities`
- Creates a new activity record
- Body: `CreateActivityDto`

### Get User Activities
- **GET** `/api/v1/activities/user/:userId`
- Retrieves all activities for a specific user
- Sorted by most recent first

### Get Activity by ID
- **GET** `/api/v1/activities/:id`
- Retrieves a specific activity by its ID

### Update Activity
- **PUT** `/api/v1/activities/:id`
- Updates an existing activity
- Body: Partial `Activity`

### Delete Activity
- **DELETE** `/api/v1/activities/:id`
- Removes an activity

### Get Activities by Type
- **GET** `/api/v1/activities/user/:userId/type/:type`
- Retrieves activities filtered by type (running, cycling, walking)

### Get Activities by Date Range
- **GET** `/api/v1/activities/user/:userId/dateRange?start=<date>&end=<date>`
- Retrieves activities within a specific date range

## Token Reward Calculation

Activities generate $FIXIE tokens based on:
- Distance (1 token per km)
- Activity duration (20% bonus for activities over 30 minutes)
- Activity type (multipliers: running 1.5x, cycling 1.2x, walking 1.0x)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run in production mode
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)
