# React Native Project Dependency Upgrade Plan

## Overview of Required Updates

Current outdated packages:
- `react`: 18.3.1 → 19.1.0 (Major version upgrade)
- `@types/react`: 18.3.20 → 19.1.2 (Major version upgrade)
- `react-native`: 0.76.9 → 0.79.1 (Minor version upgrade)
- `eslint`: 8.57.1 → 9.25.0 (Major version upgrade)
- `react-native-web`: 0.19.13 → 0.20.0 (Minor version upgrade)

## Phased Upgrade Approach

### Phase 1: Development Environment Setup

1. **Create a Git Backup Branch**
   ```bash
   git checkout -b pre-upgrade-backup
   git push origin pre-upgrade-backup
   git checkout -b dependency-upgrade
   ```

2. **Update ESLint & TypeScript Tools**
   ```bash
   # Update ESLint with the new configuration format
   npm uninstall eslint
   npm install --save-dev eslint@9.25.0
   
   # Convert .eslintrc.json to eslint.config.js
   npx eslint-migrate
   
   # Ensure TypeScript tooling is up to date
   npm install --save-dev typescript-eslint@latest
   ```

### Phase 2: Update React Native and Web Support

1. **Update React Native using Expo**
   ```bash
   # Use the Expo upgrade helper for a guided upgrade
   npx expo-doctor
   
   # Update React Native to latest version
   npx expo install react-native@0.79.1
   
   # Update web support
   npx expo install react-native-web@0.20.0 @expo/metro-runtime
   ```

2. **Update Navigation and UI Dependencies**
   ```bash
   # Update related navigation packages if used
   npx expo install @react-navigation/native @react-navigation/stack
   
   # Update other UI dependencies
   npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context
   ```

### Phase 3: React 19 Migration

1. **Update React Core**
   ```bash
   # Update React to version 19
   npx expo install react@19.1.0
   
   # Update React types
   npm install --save-dev @types/react@19.1.2
   ```

2. **Address Breaking Changes**
   - Review React 19 migration guide (see [https://react.dev/blog/2024/03/28/react-19](https://react.dev/blog/2024/03/28/react-19))
   - Update usage of deprecated APIs:
     - Replace class components with function components
     - Update event handlers for the new event system
     - Replace legacy context API with React Context API
     - Adjust any code using ReactDOM.render() to createRoot()

### Phase 4: Testing and Validation

1. **Run Basic Validation Tests**
   ```bash
   # Check if the app builds properly
   npm start
   
   # Run ESLint to check for new issues
   npx eslint src --ext .ts,.tsx
   
   # Test on different platforms
   npm run ios
   npm run android
   npm run web
   ```

2. **Add Development Scripts**
   Update package.json with helpful scripts:
   ```json
   "scripts": {
     "start": "expo start",
     "android": "expo start --android",
     "ios": "expo start --ios",
     "web": "expo start --web",
     "lint": "eslint src --ext .ts,.tsx",
     "lint:fix": "eslint src --ext .ts,.tsx --fix",
     "format": "prettier --write \"src/**/*.{ts,tsx}\"",
     "upgrade-interactive": "npm-check -u"
   }
   ```

## Potential Issues and Solutions

### React 19 Upgrade Issues
- **React Hooks Behavior Changes**: Review any custom hooks for compatibility
- **Event System Changes**: Test interactive components thoroughly
- **Concurrent Rendering**: May cause unexpected behavior in components that depend on synchronous rendering

### React Native 0.79.x Considerations
- New native architecture (Fabric) may require additional configuration
- Hermes engine is the default JavaScript engine - test performance

### ESLint 9.x Migration
- Configuration file format has changed from .eslintrc.* to eslint.config.js
- Some rules may have been deprecated or changed behavior

## Rollback Plan

If issues arise that cannot be resolved quickly:

1. Restore from Git backup:
   ```bash
   git checkout pre-upgrade-backup
   npm install
   ```

2. Selective rollback of specific packages:
   ```bash
   npx expo install react@18.3.1 react-native@0.76.9
   npm install --save-dev @types/react@18.3.20
   ```

## Post-Upgrade Tasks

1. Run a comprehensive UI test on all platforms
2. Update app documentation to reflect new dependency versions
3. Create a list of any areas that need further refactoring due to deprecated APIs
4. Set up a regular dependency update schedule to prevent future large upgrades

