import React from 'react';
import { View, Text, TextInput, Image, StyleSheet } from 'react-native';
import { InputFieldProps } from './types';

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  icon,
  error, // תמיכה בהצגת שגיאות
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={type === 'password'}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          style={styles.input}
          accessibilityLabel={label}
        />
        {icon && (
          <Image
            source={{ uri: icon }}
            style={styles.icon}
          />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563', 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 10,
    width: '100%',
    backgroundColor: '#BFDBFE', 
    borderRadius: 24,
    minHeight: 41,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: '#1F2937', 
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 2,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
