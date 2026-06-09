import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from './config';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token into every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('jwt_token');
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem('jwt_token', token);
};

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem('jwt_token');
};

export const getAuthToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('jwt_token');
};

export default apiClient;
