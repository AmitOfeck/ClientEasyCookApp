import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ActionButtonProps } from './types';

export const ActionButton: React.FC<ActionButtonProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
    >
      <Text style={styles.text}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    paddingHorizontal: 32,
    paddingVertical: 12,
    width: 207,
  },
  text: {
    fontSize: 20, 
    fontWeight: '600', 
    textAlign: 'center',
    color: '#3B82F6', 
    textTransform: 'capitalize',
  },
});
