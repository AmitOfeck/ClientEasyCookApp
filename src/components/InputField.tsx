import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet } from 'react-native';
import { InputFieldProps } from './types';

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  icon,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error && styles.inputWrapperError
      ]}>
        {icon && (
          <Image
            source={{ uri: icon }}
            style={styles.icon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={type === 'password'}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          style={styles.input}
          placeholder={label}
          placeholderTextColor="#b1c9e9"
          accessibilityLabel={label}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    width: '100%',
  },
  label: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 5,
    marginLeft: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f6fd',
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: '#bcd7f8',
    paddingHorizontal: 16,
    paddingVertical: 7,
    minHeight: 46,
    shadowColor: '#2563eb80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 0,
  },
  inputWrapperFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#e9f2fe',
    shadowOpacity: 0.18,
  },
  inputWrapperError: {
    borderColor: '#f87171',
    backgroundColor: '#fdf2f8',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#1e293b',
    fontWeight: '500',
    paddingVertical: 2,
    paddingHorizontal: 8,
    textAlign: 'left',  // סטנדרט לאינפוט לוגין
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginRight: 10,
    opacity: 0.82,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13.5,
    marginTop: 3,
    marginLeft: 8,
    fontWeight: '600',
    textAlign: 'left',
  },
});
