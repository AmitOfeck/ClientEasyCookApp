import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, Platform } from 'react-native';
import { InputField } from './InputField';
import { ActionButton } from './ActionButton';
import { SocialButton } from './SocialButton';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { googleSignIn, login, saveTokens } from '../services/auth_service';
import { NavigationProp } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await login({ email, password }).request;
      await new Promise(resolve => setTimeout(resolve, 50));
      navigation.navigate('Home');
    } catch (err) {
      console.error(err);
    }
  };

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
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        console.error('Google Sign-In produced no idToken');
        return;
      }
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
      {/* סל קניות  */}
      <View style={styles.basketWrapper}>
        <Image
          source={require('../assets/basket.png')}
          style={styles.basket}
          resizeMode="contain"
        />
      </View>
      
      {/* כותרת ראשית ולוגו */}
      <View style={styles.header}>
        <Image
          source={require('../assets/easycook-logo.png')}
          style={styles.titleImage}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>Shop Smarter, Eat Better</Text>
      </View>
      
      {/* שליח */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('../assets/rider.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* כרטיס לוגין */}
      <View style={styles.card}>
        <Text style={styles.loginTitle}>Welcome Back!</Text>
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
          />
        </View>
        <ActionButton label="Log In" onPress={handleLogin} />
        <ActionButton label="Sign Up" onPress={() => navigation.navigate('SignUp')} />
        <Text style={styles.socialText}>Or sign in with</Text>
        <View style={styles.socialButtonsContainer}>
          <SocialButton
            imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
            onPress={signInWithGoogle}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: "#e4f0fd",
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 40 : 32,
    minHeight: height,
  },
  basketWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 0 : 0,
    right: 0,
    width: width,
    alignItems: 'flex-end',
    zIndex: 10,
    pointerEvents: 'none', 
  },
  basket: {
    width: width * 0.35,
    height: width * 0.26,
    marginRight: -width * 0.09,
    marginTop: 0,
    opacity: 0.97,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 4,
  },
  titleImage: {
    width: width * 0.72,
    height: width * 0.16,
    marginBottom: 8,
    alignSelf: 'center',
  },
  slogan: {
    fontSize: width < 370 ? 15 : 19,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: '#dbeafe',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  illustrationContainer: {
    width: width * 0.39,
    height: width * 0.31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -24,
    marginTop: -8,
  },
  illustration: {
    width: '98%',
    height: '100%',
  },
  card: {
    width: width * 0.92,
    maxWidth: 410,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 36,
    padding: 30,
    paddingTop: 40,
    marginVertical: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 34,
    elevation: 10,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#4b5d78',      
    marginBottom: 15,
    letterSpacing: 0.15,
    textAlign: 'center',
    opacity: 0.82,    
  },
  inputContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 18,
  },
  socialText: {
    marginTop: 18,
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '600',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 18,
  },
});

export default LoginScreen;
