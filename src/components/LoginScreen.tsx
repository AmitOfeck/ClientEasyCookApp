import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { InputField } from './InputField';
import { ActionButton } from './ActionButton';
import { SocialButton } from './SocialButton';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { googleSignIn, login, saveTokens } from '../services/auth_service';
import { NavigationProp } from '@react-navigation/native';

export const LoginScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /* ---------- regular e-mail / password login ---------- */
  const handleLogin = async () => {
    try {
      const res = await login({ email, password }).request; // token already saved
      await new Promise(resolve => setTimeout(resolve, 50)); // 50 ms flush
      navigation.navigate('Home');
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- Google configuration (runs once) ---------- */
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '315425969009-va0ran4bg5km0fqnhvkianoms9d96f64.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 1️⃣  Interactive account picker
      await GoogleSignin.signIn();            // chooser shows, user picks an account

      // 2️⃣  Fetch fresh tokens for that account
      const { idToken /*, accessToken */ } = await GoogleSignin.getTokens();

      if (!idToken) {
        console.error('Google Sign-In produced no idToken');
        return;
      }

      // 3️⃣  Send idToken to your own back-end
      const response = await googleSignIn(idToken).request;
      saveTokens(response.data);

      navigation.navigate('Home');
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google Sign-In');
      } else {
        console.error('Google Sign-In Error:', err);
      }
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
          <ActionButton label="Sign up" onPress={() => {navigation.navigate("SignUp");}} />
        </View>

        <View style={styles.forgotPasswordContainer}>
          <View style={styles.socialSignUpContainer}>
            <Text style={styles.socialSignUpText}>or sign up with</Text>
            <View style={styles.socialButtonsContainer}>
              <SocialButton
                imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                onPress={signInWithGoogle}
              />
            </View>
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
