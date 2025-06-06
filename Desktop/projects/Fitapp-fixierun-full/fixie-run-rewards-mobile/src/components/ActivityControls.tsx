import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  colors, 
  spacing, 
  typography,
  createButtonStyle
} from '../theme';

interface ActivityControlsProps {
  isTracking: boolean;
  onStart: () => void;
  onFinish: () => void;
}

const ActivityControls: React.FC<ActivityControlsProps> = ({ 
  isTracking, 
  onStart, 
  onFinish 
}) => {
  return (
    <View style={styles.activityControls}>
      {!isTracking ? (
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.buttonText}>Start Activity</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activityControls: {
    marginBottom: spacing.md,
  },
  buttonText: {
    ...typography.buttonText,
    color: colors.white,
  },
  finishButton: {
    ...createButtonStyle('danger'),
  },
  startButton: {
    ...createButtonStyle('primary'),
  },
});

export default ActivityControls;

