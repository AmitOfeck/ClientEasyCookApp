import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from '@react-native-google-signin/google-signin';

import { InputField } from './InputField';
import { ActionButton } from './ActionButton';
import { SocialButton } from './SocialButton';
import { login, googleSignIn, saveTokens } from '../services/auth_service';

const { width, height } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  /* form fields */
  const [email,    setEmail] = useState('');
  const [password, setPass]  = useState('');

  /* ui state */
  const [error,  setError]  = useState<string | null>(null);
  const [busy,   setBusy]   = useState(false);

  /* ─────────────────────────  PASSWORD LOGIN  ───────────────────────── */
  const handleLogin = async () => {
    setError(null);
    setBusy(true);
    try {
      const { data } = await login({ email, password }).request;
      await saveTokens(data);
      navigation.navigate('Home');
    } catch (err: any) {
      /* Axios-style error object */
      const msg =
        err?.response?.status === 400
          ? 'Wrong email or password'
          : err?.response?.status === 404
          ? 'Server not found'
          : 'Something went wrong – please try again';
      setError(msg);
      console.error('[login] backend:', err?.response?.data ?? err);
    } finally {
      setBusy(false);
    }
  };

  /* ─────────────────────────  GOOGLE CONFIG  ───────────────────────── */
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '315425969009-va0ran4bg5km0fqnhvkianoms9d96f64.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    
    try {
      GoogleSignin.signOut();
    } catch (error) {
      // ignore error
    }
  }, []);

  /* ─────────────────────────  GOOGLE LOGIN  ───────────────────────── */
  const signInWithGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
      }
      
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const idToken = userInfo?.idToken || tokens?.idToken;

      if (!idToken) {
        setError('Google sign-in failed – no token received');
        console.error('[google] no idToken', { userInfo, tokens });
        setBusy(false);
        return;
      }

      /* hand to your backend */
      const { data } = await googleSignIn(idToken).request;
      await saveTokens(data);
      navigation.navigate('Home');
    } catch (err: any) {
      if (err.message?.includes('Sign-in in progress') || err.message?.includes('ASYNC_OP_IN_PROGRESS')) {
        try {
          await GoogleSignin.signOut();
          setTimeout(() => signInWithGoogle(), 500);
          return;
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
      }
      
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
        /* user tapped away – no banner */
      } else if (err?.code === statusCodes.IN_PROGRESS) {
        setError('Sign-in already in progress, please wait');
      } else {
        const msg =
          err?.response?.status === 500
            ? 'Server error during Google sign-in'
            : 'Google sign-in failed';
        setError(msg);
        console.error('[google] error:', err);
      }
    } finally {
      setBusy(false);
    }
  };

  /* ─────────────────────────  RENDER  ───────────────────────── */
  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {/*  basket top-right  */}
      <View style={styles.basketWrapper}>
        <Image source={require('../assets/basket.png')} style={styles.basket} resizeMode="contain" />
      </View>

      {/*  logo  */}
      <View style={styles.header}>
        <Image source={require('../assets/easycook-logo.png')} style={styles.titleImage} resizeMode="contain" />
        <Text style={styles.slogan}>Shop Smarter, Eat Better</Text>
      </View>

      {/*  illustration  */}
      <View style={styles.illustrationContainer}>
        <Image source={require('../assets/rider.png')} style={styles.illustration} resizeMode="contain" />
      </View>

      {/*  login card  */}
      <View style={styles.card}>
        <Text style={styles.loginTitle}>Welcome Back!</Text>

        {/*  indicative error banner  */}
        {error && (
          <View style={{ backgroundColor: '#FFE5E5', padding: 8, borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ color: '#B91C1C', textAlign: 'center' }}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <InputField label="Email"    value={email}    onChange={setEmail} type="email"    editable={!busy} />
          <InputField label="Password" value={password} onChange={setPass}  type="password" editable={!busy} />
        </View>

        <ActionButton label="Log In"  onPress={handleLogin}      disabled={busy} />
        <ActionButton label="Sign Up" onPress={() => navigation.navigate('SignUp')} disabled={busy} />

        <Text style={styles.socialText}>Or sign in with</Text>
        <View style={styles.socialButtonsContainer}>
          <SocialButton
            localImage={require('../assets/google-logo.png')}
            onPress={signInWithGoogle}
            disabled={busy}
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