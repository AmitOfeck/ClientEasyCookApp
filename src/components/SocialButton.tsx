import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SocialButtonProps } from './types';

export const SocialButton: React.FC<SocialButtonProps> = ({ imageUrl, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'contain',
    width: 26,
    aspectRatio: 0.96,
    marginVertical: 'auto',
  },
});
