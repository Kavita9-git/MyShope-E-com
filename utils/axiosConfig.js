import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { server, store } from '../redux/store';
import { logout } from '../redux/features/auth/userActions';

const axiosInstance = axios.create({
  baseURL: server,
});

// Request interceptor to add token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized - clearing session and redirecting to login');
      store.dispatch(logout());
      return Promise.reject(error);
    }

    // Handle 500 errors, specifically "Error in Auth Middleware"
    if (error.response && error.response.status === 500) {
      const errorMessage = error?.response?.data?.message || 'Internal Server Error';
      console.log(`500 Server Error: ${errorMessage}`);
      
      // Check if the error message contains "Error in Auth Middleware"
      if (errorMessage.includes('Error in Auth Middleware')) {
        console.log('Auth Middleware error detected - clearing session and redirecting to login');
        // Clear session and redirect to login silently
        store.dispatch(logout(true)); // Pass true for silent logout
        // Don't show the error message to user for auth middleware errors
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


