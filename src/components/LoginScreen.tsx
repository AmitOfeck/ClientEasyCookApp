import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { InputField } from './InputField';
import { ActionButton } from './ActionButton';
import { SocialButton } from './SocialButton';
// import { LinearGradient } from 'expo-linear-gradient';
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
      {/* סל קניות מציץ מהפינה הימנית העליונה */}
      <Image
        source={require('../assets/basket.png')}
        style={styles.basket}
        resizeMode="contain"
      />
      
      {/* כותרת ראשית מרשימה */}
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
        <ActionButton
          label="Sign up"
          onPress={() => navigation.navigate('SignUp')}
          style={styles.signUpButton}
        />
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
    paddingVertical: 32,
    minHeight: height,
    overflow: 'visible',
  },
  basket: {
    position: 'absolute',
    top: 0,
    right: -width * 0.10,  
    width: width * 0.36,
    height: width * 0.28,
    zIndex: 10,
    opacity: 0.95,
  },
  header: {
    alignItems: 'center',
    marginTop: 38,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#2563eb',
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  slogan: {
    fontSize: 19,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: '#dbeafe',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  illustrationContainer: {
    width: width * 0.38,
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
    width: '90%',
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
    fontSize: 23,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 22,
    letterSpacing: 0.32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 18,
  },
  signUpButton: {
    backgroundColor: '#e4f0fd',
    color: '#2563eb',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    marginTop: 9,
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
  titleImage: {
    width: 300,
    height: 65,
    marginBottom: 8,
    alignSelf: 'center',
  },
});

