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
    this.navigationHandler = null;
    this.pendingNavigation = null;
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
      const userInfo = await AsyncStorage.getItem('userData');
      const user = userInfo ? JSON.parse(userInfo) : null;
      
      const response = await axios.post('https://nodejsapp-hfpl.onrender.com/api/v1/notification/register-token', {
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
    console.log('📬 Foreground notification:', { title, body, data });
    
    // Create a notification object
    const notificationData = {
      id: notification.request.identifier,
      title,
      body,
      data,
      timestamp: Date.now(),
      read: false,
      type: data?.type || 'general'
    };
    
    // Store notification locally
    this.storeNotificationLocally(notificationData);
    
    // Show in-app toast/alert for foreground notifications
    this.showInAppNotification(notificationData);
  }

  // Handle notification tap/response
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    console.log('📱 Handling notification tap:', data?.type);
    
    // Store navigation data for the app to handle
    this.pendingNavigation = {
      type: data?.type || 'general',
      data: data,
      timestamp: Date.now()
    };
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'order_confirmation':
      case 'order_update':
        console.log('🚀 Navigate to order:', data.orderId);
        break;
      case 'new_product':
      case 'product_recommendation':
        console.log('🚀 Navigate to product:', data.productId);
        break;
      case 'cart_abandonment':
        console.log('🚀 Navigate to cart');
        break;
      case 'price_drop':
      case 'back_in_stock':
        console.log('🚀 Navigate to product:', data.productId);
        break;
      case 'promotion':
      case 'marketing':
        console.log('🚀 Navigate to home/promotions');
        break;
      default:
        console.log('🚀 Navigate to notifications');
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
      const userInfo = await AsyncStorage.getItem('userData');
      const user = userInfo ? JSON.parse(userInfo) : null;
      
      if (user?.user?._id) {
        await axios.put('https://nodejsapp-hfpl.onrender.com/api/v1/notification/preferences', {
          userId: user.user._id,
          preferences
        });
      }
      
      console.log('✅ Notification preferences updated');
    } catch (error) {
      console.error('❌ Failed to update notification preferences:', error);
    }
  }

  // Store notification locally for in-app display
  async storeNotificationLocally(notificationData) {
    try {
      const existingNotifications = await AsyncStorage.getItem('@local_notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      
      // Add new notification to the beginning
      notifications.unshift(notificationData);
      
      // Keep only latest 100 notifications
      const limitedNotifications = notifications.slice(0, 100);
      
      await AsyncStorage.setItem('@local_notifications', JSON.stringify(limitedNotifications));
      console.log('📱 Notification stored locally');
    } catch (error) {
      console.error('❌ Error storing notification locally:', error);
    }
  }

  // Get locally stored notifications
  async getLocalNotifications() {
    try {
      const notifications = await AsyncStorage.getItem('@local_notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('❌ Error getting local notifications:', error);
      return [];
    }
  }

  // Show in-app notification (for foreground notifications)
  showInAppNotification(notificationData) {
    // This will be handled by the Toast system or custom in-app notification
    console.log('🔔 Showing in-app notification:', notificationData.title);
    
    // You can integrate with react-native-toast-message here
    // Toast.show({
    //   type: 'info',
    //   text1: notificationData.title,
    //   text2: notificationData.body,
    //   visibilityTime: 4000,
    // });
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      
      await AsyncStorage.setItem('@local_notifications', JSON.stringify(updatedNotifications));
      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  // Get unread notification count (excluding test notifications)
  async getUnreadCount() {
    try {
      const notifications = await this.getLocalNotifications();
      console.log('📱 All local notifications:', notifications.length);
      
      // Filter out test notifications and count only unread real notifications
      const realUnreadNotifications = notifications.filter(notif => {
        const isTestNotification = 
          notif.data?.test === true ||
          notif.title?.toLowerCase().includes('test') ||
          notif.body?.toLowerCase().includes('test');
        
        const isUnread = !notif.read;
        
        console.log(`📋 Local notification: "${notif.title}" - Read: ${!!notif.read}, Test: ${isTestNotification}, Unread: ${isUnread}`);
        
        return isUnread && !isTestNotification;
      });
      
      const unreadCount = realUnreadNotifications.length;
      console.log('📱 Local unread count calculated (excluding tests):', unreadCount);
      return unreadCount;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      await AsyncStorage.removeItem('@local_notifications');
      console.log('🗑️ All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  // Set navigation handler (to be called from App.js)
  setNavigationHandler(handler) {
    this.navigationHandler = handler;
    console.log('📱 Navigation handler set for notifications');
  }

  // Execute pending navigation
  executePendingNavigation() {
    if (this.pendingNavigation && this.navigationHandler) {
      const { type, data } = this.pendingNavigation;
      console.log('🚀 Executing pending navigation:', type);
      
      // Clear pending navigation
      const navData = this.pendingNavigation;
      this.pendingNavigation = null;
      
      // Execute navigation based on type
      try {
        this.navigationHandler(navData);
      } catch (error) {
        console.error('❌ Error executing navigation:', error);
      }
    }
  }

  // Get pending navigation data
  getPendingNavigation() {
    return this.pendingNavigation;
  }

  // Clear pending navigation
  clearPendingNavigation() {
    this.pendingNavigation = null;
  }

  // Cleanup listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    this.navigationHandler = null;
    this.pendingNavigation = null;
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService;
