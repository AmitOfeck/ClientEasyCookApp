import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthData } from './intefaces/auth_response';
import apiClient from './api-client';
import { UserSignIn } from './intefaces/user';

const saveTokens = async (authResponse: AuthData) => {
  try {
    await AsyncStorage.setItem('accessToken', authResponse.accessToken);
    await AsyncStorage.setItem('refreshToken', authResponse.refreshToken);
    await AsyncStorage.setItem('userId', authResponse.userId);
    console.log('✅ Tokens saved successfully');
  } catch (error) {
    console.error('❌ Error saving tokens:', error);
    throw error;
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
      console.log('✅ [auth_service] Login successful');
      saveTokens(response.data);
      return response;
    })
    .catch(error => {
      console.error('❌ [auth_service] Login failed:', {
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    });
  return { request, abort: () => abortController.abort() };
};

const refresh = (refreshToken: string) => {
  console.log('🔄 [auth_service] Refreshing token...');
  const abortController = new AbortController();
  const request = apiClient
    .post<AuthData>('/auth/refresh', { refreshToken }, { signal: abortController.signal })
    .then(response => {
      console.log('✅ [auth_service] Token refreshed');
      saveTokens(response.data);
      return response;
    })
    .catch(error => {
      console.error('❌ [auth_service] Refresh failed:', error?.response?.status);
      throw error;
    });
  return { request, abort: () => abortController.abort() };
};

const googleSignIn = (credential: string) => {
  const abortController = new AbortController();
  const request = apiClient
    .post<AuthData>('/auth/google/login', 
      { token: credential },  
      { signal: abortController.signal }
    )
    .then(response => {
      saveTokens(response.data);
      return response;
    });
  return { request, abort: () => abortController.abort() };
};

export { saveTokens, register, login, refresh, googleSignIn };