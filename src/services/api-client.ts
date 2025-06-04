import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refresh } from './auth_service';

const apiClient = axios.create({
  baseURL: 'http://easycook.cs.colman.ac.il',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('userId');
        return Promise.reject(error);
      }
      try {
        const { data } = await refresh(refreshToken).request;
        error.config.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return apiClient(error.config);
      } catch (refreshError) {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('userId');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
