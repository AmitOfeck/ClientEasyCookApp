import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
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
      activeOpacity={0.85}
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
    width: '100%',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: '#e8f2ff',      // תכלת בהיר (כמו הדוגמה)
    borderWidth: 2,
    borderColor: '#2186eb',          // כחול דק מסביב
    shadowColor: '#2563eb33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2186eb',                // טקסט כחול
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0.1,
  },
});
