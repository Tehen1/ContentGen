import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ActivityType } from '../services/activityService';
import { 
  colors, 
  spacing, 
  borderRadius, 
  typography 
} from '../theme';

interface ActivityModeProps {
  mode: ActivityType;
  setMode: (mode: ActivityType) => void;
  disabled: boolean;
}

const ActivityMode: React.FC<ActivityModeProps> = ({ mode, setMode, disabled }) => {
  return (
    <View style={styles.activityModeContainer}>
      <TouchableOpacity 
        style={[
          styles.modeButton, 
          mode === 'run' ? styles.activeMode : null,
          disabled ? styles.disabledButton : null
        ]} 
        onPress={() => !disabled && setMode('run')}
        disabled={disabled}
      >
        <Text style={[
          styles.modeButtonText,
          mode === 'run' ? styles.activeModeText : null
        ]}>Run</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.modeButton, 
          mode === 'bike' ? styles.activeMode : null,
          disabled ? styles.disabledButton : null
        ]} 
        onPress={() => !disabled && setMode('bike')}
        disabled={disabled}
      >
        <Text style={[
          styles.modeButtonText,
          mode === 'bike' ? styles.activeModeText : null
        ]}>Bike</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  activeMode: {
    backgroundColor: colors.primary,
  },
  activeModeText: {
    color: colors.white,
  },
  activityModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modeButton: {
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.pill,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md + spacing.sm,
    paddingVertical: spacing.sm,
  },
  modeButtonText: {
    ...typography.label,
    color: colors.gray800,
  },
});

export default ActivityMode;

