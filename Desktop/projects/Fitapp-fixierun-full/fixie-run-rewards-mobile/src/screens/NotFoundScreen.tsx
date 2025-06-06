import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NotFoundScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'NotFound'>;
};

const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ navigation }) => {
  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Page Not Found</Text>
        <Text style={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleGoHome}>
          <Text style={styles.buttonText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    color: '#666',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  title: {
    color: '#3B82F6',
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default NotFoundScreen;

