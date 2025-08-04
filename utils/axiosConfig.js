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
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, dispatch logout action
      store.dispatch(logout());
    }

    if (error.response && error.response.status === 500) {
      try {
        console.log(`${error?.response?.data?.message || 'Internal Server Error'}`);
      } catch (err) {
        console.error('Error!:', err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


