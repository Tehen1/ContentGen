import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screen components
import HomeScreen from '../screens/HomeScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Define the parameters for each route
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  NotFound: undefined;
};

// Create the navigation stack
const Stack = createStackNavigator<RootStackParamList>();

// Main app navigator component
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'FixieRun' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'Your Profile' }}
        />
        <Stack.Screen 
          name="NotFound" 
          component={NotFoundScreen} 
          options={{ title: 'Not Found' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

