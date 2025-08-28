import notificationService from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Register push token with backend after user login
 * This should be called after successful authentication
 */
export const registerPushTokenAfterLogin = async (userId) => {
  try {
    console.log('🔐 Registering push token after login for user:', userId);
    
    // Get the stored push token
    const pushToken = await notificationService.getStoredToken();
    
    if (!pushToken) {
      console.log('⚠️ No push token available, trying to get one...');
      // Try to get a new token
      const newToken = await notificationService.registerForPushNotificationsAsync();
      if (newToken) {
        console.log('✅ New push token obtained and registered');
        return true;
      } else {
        console.log('❌ Could not obtain push token');
        return false;
      }
    }
    
    // Register the existing token with the backend for this user
    await notificationService.sendTokenToBackend(pushToken, userId);
    console.log('✅ Push token registered successfully after login');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to register push token after login:', error);
    return false;
  }
};

/**
 * Initialize push token registration on app start
 * This should be called when the app starts and user is already logged in
 */
export const initializePushTokenForLoggedInUser = async () => {
  try {
    // Check if user is logged in
    const authToken = await AsyncStorage.getItem('@auth');
    if (!authToken) {
      console.log('ℹ️ No auth token, skipping push token registration');
      return false;
    }
    
    console.log('🚀 Initializing push token for logged in user');
    
    // Initialize notification service if not already done
    const initialized = await notificationService.initialize();
    if (!initialized) {
      console.log('❌ Failed to initialize notification service');
      return false;
    }
    
    // The notification service will automatically try to register the token
    // with the backend using the auth token
    console.log('✅ Push token initialization completed');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize push token for logged in user:', error);
    return false;
  }
};
