import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { server } from "../redux/store";

const axiosInstance = axios.create({
  baseURL: server,
});

// Request interceptor to add token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("@auth");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error setting auth token:", error);
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
      // Token expired or invalid
      try {
        // Clear token but don't redirect here to avoid navigation conflicts
        await AsyncStorage.removeItem("@auth");
        await AsyncStorage.removeItem("@showLogin");
        // Navigate to login screen
        navigation.navigate("login");
      } catch (err) {
        console.error("Error removing auth token:", err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
