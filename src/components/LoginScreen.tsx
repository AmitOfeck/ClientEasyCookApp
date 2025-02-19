import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { InputField } from './InputField';
import { ActionButton } from './ActionButton';
import { SocialButton } from './SocialButton';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {

    try {
      const response = await fetch("http://10.0.2.2:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email, password: password}),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Registration successful:", data);
      } else {
        console.error("Registration failed:", data);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.timeContainer}>
          <Text>16:04</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text>Login</Text>
        </View>

        <View style={styles.inputContainer}>
          <InputField
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
          />
          <InputField
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            icon="https://cdn.builder.io/api/v1/image/assets/f3ec27c98b354cc2a57aa125506b44a1/a7f010f1d11c588e2b2a6e60c03e8f48cf0d74c750e117fdfe71b60e4bf999cc?apiKey=f3ec27c98b354cc2a57aa125506b44a1&"
          />
        </View>

        <View style={styles.buttonsContainer}>
          <ActionButton label="Log In" onPress={handleLogin} />
          <ActionButton label="Sign up" onPress={() => {}} />
        </View>

        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>

          <View style={styles.socialSignUpContainer}>
            <Text style={styles.socialSignUpText}>or sign up with</Text>


            <Text style={styles.signUpText}>
              Don't have an account? Sign Up
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 112,
    marginHorizontal: 'auto',
    width: '100%',
    backgroundColor: '#F4F4F4', 
    maxWidth: 480,
    borderRadius: 40,
  },
  timeContainer: {
    flex: 1,
    paddingHorizontal: 36,
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563', 
    backgroundColor: '#F4F4F4', 
    borderRadius: 24,
  },
  titleContainer: {
    marginTop: 28,
    maxWidth: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600', 
    color: '#1E3A8A', 
    textTransform: 'capitalize',
  },
  inputContainer: {
    flexDirection: 'column',
    marginTop: 80,
    width: '100%',
    maxWidth: 357,
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 96,
    width: '100%',
    maxWidth: 357,
    minHeight: 126,
  },
  forgotPasswordContainer: {
    flexDirection: 'column',
    marginTop: 48,
    width: '100%',
    maxWidth: '100%',
    minHeight: 118,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600', 
    color: '#4B5563',
    textAlign: 'center',
  },
  socialSignUpContainer: {
    flexDirection: 'column',
    paddingHorizontal: 10,
    marginTop: 36,
    width: '100%',
    minHeight: 118,
  },
  socialSignUpText: {
    fontSize: 14,
    fontWeight: '300', 
    color: '#4B5563', 
    textAlign: 'center',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  signUpText: {
    marginTop: 24,
    fontSize: 14,
    fontWeight: '300', 
    color: '#4B5563', 
    textAlign: 'center',
  },
});
