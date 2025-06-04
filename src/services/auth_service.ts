import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthData } from './intefaces/auth_response';
import apiClient from './api-client';
import { UserSignIn } from './intefaces/user';

const saveTokens = async (authResponse: AuthData) => {
  try {
    await AsyncStorage.setItem('accessToken', authResponse.accessToken);
    await AsyncStorage.setItem('refreshToken', authResponse.refreshToken);
    await AsyncStorage.setItem('userId', authResponse.userId);
  } catch (error) {
    console.error('Error saving tokens', error);
  }
};

const register = (user: FormData) => {
  const abortController = new AbortController();
  const request = apiClient.post<AuthData>(
    '/user/register',
    user,
    {
      signal: abortController.signal,
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  return { request, abort: () => abortController.abort() };
};

const login = (user: Partial<UserSignIn>) => {
  const abortController = new AbortController();
  const request = apiClient
    .post<AuthData>('/auth/login', user, { signal: abortController.signal })
    .then(response => {
      // as soon as login succeeds, persist tokens
      saveTokens(response.data);
      return response;
    });
  return { request, abort: () => abortController.abort() };
};

const refresh = (refreshToken: string) => {
  const abortController = new AbortController();
  const request = apiClient
    .post<AuthData>('/auth/refresh', { refreshToken }, { signal: abortController.signal })
    .then(response => {
      // on refresh, overwrite stored tokens
      saveTokens(response.data);
      return response;
    });
  return { request, abort: () => abortController.abort() };
};

const googleSignIn = (credential: string) => {
  const abortController = new AbortController();
  const request = apiClient
    .post<AuthData>('/auth/google/login', { credential }, { signal: abortController.signal })
    .then(response => {
      saveTokens(response.data);
      return response;
    });
  return { request, abort: () => abortController.abort() };
};

export { saveTokens, register, login, refresh, googleSignIn };
