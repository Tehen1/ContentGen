# FixieRun Rewards Mobile

A mobile fitness tracking app that rewards users with $FIXIE tokens for running and biking activities.

## Overview

FixieRun Rewards is a mobile application built with React Native and Expo that tracks users' running and biking activities, calculates distances, and rewards them with $FIXIE tokens based on their performance. Users can also earn achievements as they improve.

### Key Features

- **Activity Tracking**: Track running and biking activities with real-time metrics
- **Token Rewards**: Earn $FIXIE tokens for completing activities
- **Achievements**: Unlock achievements based on performance and milestones
- **Location Tracking**: Uses device GPS to accurately track distance and speed
- **Persistent Storage**: Saves user data securely on the device

## Prerequisites

To work on this project, you need to have the following software installed:

- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) (version 9 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

For iOS development:
- macOS
- Xcode (latest version recommended)
- iOS Simulator

For Android development:
- Android Studio
- Android SDK
- Android Emulator

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fixie-run-rewards-mobile.git
cd fixie-run-rewards-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy the `.env.example` file to `.env` (if applicable)
- Update any necessary configuration values

## Running the App

### Development Mode

To start the Expo development server:

```bash
npm start
```

This will open the Expo Developer Tools in your browser. From there, you can run the app on:

- iOS Simulator: Press `i`
- Android Emulator: Press `a`
- Physical device: Scan the QR code using the Expo Go app

### Running on Specific Platforms

- For iOS:
```bash
npm run ios
```

- For Android:
```bash
npm run android
```

## Building for Production

### Expo EAS Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure the build:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios
```

5. Build for Android:
```bash
eas build --platform android
```

## Key Technologies

- **React Native**: Framework for building the mobile app
- **Expo**: Platform for developing and deploying React Native apps
- **TypeScript**: For type-safe JavaScript code
- **React Navigation**: For app navigation
- **React Query**: For data fetching and state management
- **Expo Location**: For GPS tracking
- **Expo SecureStore**: For secure data storage

## Project Structure

```
/src
  /components         # Reusable UI components
  /screens            # Screen components
  /navigation         # Navigation configuration
  /hooks              # Custom React hooks
  /services           # Business logic services
  /utils              # Utility functions
  /assets             # Images, fonts, etc.
  /models             # TypeScript interfaces and types
```

### Key Components

- **App.tsx**: Main app component
- **AppNavigator.tsx**: Navigation configuration
- **HomeScreen.tsx**: Main dashboard screen
- **useLocationTracking.ts**: Hook for GPS tracking
- **activityService.ts**: Business logic for activities and rewards
- **storage.ts**: Data persistence utilities

## License

This project is licensed under the MIT License - see the LICENSE file for details.

