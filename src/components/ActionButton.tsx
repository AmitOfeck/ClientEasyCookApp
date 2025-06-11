import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ActionButtonProps } from './types';


export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      accessibilityRole="button"
    >
      <Text style={[styles.text, textStyle]}>
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
    backgroundColor: '#e4f0fd',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2563eb',
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },
});
