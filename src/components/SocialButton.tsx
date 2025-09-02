import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SocialButtonProps } from './types';

export const SocialButton: React.FC<SocialButtonProps> = ({ 
  imageUrl, 
  localImage,
  onPress,
  disabled 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled]}
      accessibilityRole="button"
      disabled={disabled}
    >
      <Image
        source={localImage ? localImage : { uri: imageUrl }}
        style={styles.image}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dadce0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  image: {
    resizeMode: 'contain',
    width: 24,
    height: 24,
  },
});