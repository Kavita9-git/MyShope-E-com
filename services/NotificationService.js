import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
    this.token = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      // Check if we're in Expo Go (which has limitations)
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        console.log('⚠️ Running in Expo Go - Push notifications limited, local notifications available');
        // Still try to get permissions for local notifications
        await this.setupLocalNotifications();
      } else {
        // Full functionality in development builds or production
        await this.registerForPushNotificationsAsync();
      }
      
      // Set up listeners
      this.setupNotificationListeners();
      
      console.log('✅ Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
      return false;
    }
  }

  // Setup local notifications (works in Expo Go)
  async setupLocalNotifications() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Notification permissions not granted');
        return false;
      }
      
      console.log('✅ Local notification permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error setting up local notifications:', error);
      return false;
    }
  }

  // Register for push notifications and get token
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Push notification permissions not granted');
        return null;
      }
      
      try {
        // Get the token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.projectId;
        
        if (!projectId) {
          console.log('⚠️ No project ID found, cannot get push token');
          return null;
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })).data;
        
        console.log('📱 Push token obtained successfully');
        
        // Store token locally
        await AsyncStorage.setItem('@push_token', token);
        this.token = token;
        
        // Send token to backend
        await this.sendTokenToBackend(token);
        
      } catch (error) {
        console.log('⚠️ Could not get push token:', error.message);
        if (error.message.includes('Firebase')) {
          console.log('ℹ️ Firebase is not configured for this development build. Push notifications will be limited to local notifications only.');
        }
        return null;
      }
      
    } else {
      console.log('⚠️ Push notifications require a physical device');
    }

    return token;
  }

  // Send push token to backend server
  async sendTokenToBackend(token) {
    try {
      // Get user info from AsyncStorage
      const userInfo = await AsyncStorage.getItem('@auth');
      const user = userInfo ? JSON.parse(userInfo) : null;
      
      const response = await axios.post('http://192.168.1.100:8080/api/v1/notifications/register-token', {
        pushToken: token,
        userId: user?.user?._id || null,
        deviceInfo: {
          platform: Platform.OS,
          deviceName: Device.deviceName,
          deviceType: Device.deviceType,
        }
      });
      
      console.log('✅ Token registered with backend:', response.data);
    } catch (error) {
      console.error('❌ Failed to register token with backend:', error.response?.data || error.message);
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
      // Handle notification received in foreground
      this.handleForegroundNotification(notification);
    });

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      // Handle notification tap
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received in foreground
  handleForegroundNotification(notification) {
    const { title, body, data } = notification.request.content;
    
    // Show custom in-app notification or update UI
    console.log('Foreground notification:', { title, body, data });
    
    // You can dispatch Redux actions here to update UI
    // store.dispatch(addNotification({ title, body, data, timestamp: Date.now() }));
  }

  // Handle notification tap/response
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'order_update':
        // Navigate to order details
        console.log('Navigate to order:', data.orderId);
        break;
      case 'new_product':
        // Navigate to product details
        console.log('Navigate to product:', data.productId);
        break;
      case 'cart_abandonment':
        // Navigate to cart
        console.log('Navigate to cart');
        break;
      default:
        // Navigate to home or notifications list
        console.log('Navigate to home');
        break;
    }
  }

  // Send local notification (for testing)
  async sendLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: { seconds: 1 },
    });
  }

  // Get stored push token
  async getStoredToken() {
    try {
      const token = await AsyncStorage.getItem('@push_token');
      return token;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  // Update user notification preferences
  async updateNotificationPreferences(preferences) {
    try {
      await AsyncStorage.setItem('@notification_preferences', JSON.stringify(preferences));
      
      // Send to backend
      const userInfo = await AsyncStorage.getItem('@auth');
      const user = userInfo ? JSON.parse(userInfo) : null;
      
      if (user?.user?._id) {
        await axios.put('http://192.168.1.100:8080/api/v1/notifications/preferences', {
          userId: user.user._id,
          preferences
        });
      }
      
      console.log('✅ Notification preferences updated');
    } catch (error) {
      console.error('❌ Failed to update notification preferences:', error);
    }
  }

  // Cleanup listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService;
