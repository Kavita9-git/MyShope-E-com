import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/NotificationService';

const NotificationManager = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState({
    transactional: { orderConfirmation: true, shippingUpdates: true, deliveryNotifications: true },
    marketing: { promotions: true, newProducts: false, personalizedRecommendations: true },
    engagement: { wishlistUpdates: false, cartReminders: true, reviewRequests: false },
  });

  useEffect(() => {
    initializeNotifications();
    fetchNotifications();
    loadPreferences();
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Get server notifications if user is authenticated
      let serverNotifications = [];
      const userData = await AsyncStorage.getItem('userData');
      
      if (userData) {
        try {
          const { user, token } = JSON.parse(userData);
          const response = await fetch(`https://nodejsapp-hfpl.onrender.com/api/v1/notification/user/${user._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          if (data.success) {
            serverNotifications = data.data.notifications || [];
          }
        } catch (error) {
          console.error('Error fetching server notifications:', error);
        }
      }
      
      // Get local notifications (from push notifications received while app was running)
      const localNotifications = await notificationService.getLocalNotifications();
      
      // Combine and sort notifications by timestamp (newest first)
      // Filter out test notifications
      const allNotifications = [...serverNotifications, ...localNotifications]
        .filter(notification => {
          // Exclude test notifications
          const isTestNotification = 
            notification.data?.test === true ||
            notification.title?.toLowerCase().includes('test') ||
            notification.message?.toLowerCase().includes('test') ||
            notification.body?.toLowerCase().includes('test') ||
            (notification.data?.orderId && notification.data.orderId.includes('test')) ||
            (notification.data?.productId && notification.data.productId.includes('test'));
          
          return !isTestNotification;
        })
        .sort((a, b) => {
          const timeA = new Date(a.createdAt || a.timestamp).getTime();
          const timeB = new Date(b.createdAt || b.timestamp).getTime();
          return timeB - timeA;
        });
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;
      
      const { token } = JSON.parse(userData);
      const response = await fetch('https://nodejsapp-hfpl.onrender.com/api/v1/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success && data.user.notificationPreferences) {
        setPreferences(data.user.notificationPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;
      
      const { token } = JSON.parse(userData);
      const response = await fetch('https://nodejsapp-hfpl.onrender.com/api/v1/notification/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: newPreferences }),
      });

      const data = await response.json();
      if (data.success) {
        setPreferences(newPreferences);
        Alert.alert('Success', 'Notification preferences updated');
      } else {
        Alert.alert('Error', 'Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to update preferences');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // First, try to mark server notification as read
      const userData = await AsyncStorage.getItem('userData');
      let serverMarkSuccess = false;
      
      if (userData) {
        try {
          const { token } = JSON.parse(userData);
          const response = await fetch(`https://nodejsapp-hfpl.onrender.com/api/v1/notification/read/${notificationId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          if (data.success) {
            serverMarkSuccess = true;
          }
        } catch (serverError) {
          console.log('Could not mark server notification as read:', serverError.message);
        }
      }
      
      // Also try to mark local notification as read (if it's a local notification)
      await notificationService.markNotificationAsRead(notificationId);
      
      // Update local state for both server and local notifications
      setNotifications(prev => 
        prev.map(notif => {
          // Handle both server notifications (with _id) and local notifications (with id)
          const id = notif._id || notif.id;
          return id === notificationId
            ? { ...notif, status: 'read', read: true, readAt: new Date().toISOString() }
            : notif;
        })
      );
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Check for both unread status formats (server and local notifications)
    const isUnread = notification.status !== 'read' && !notification.read;
    
    if (isUnread) {
      // Handle both server notifications (with _id) and local notifications (with id)
      const notificationId = notification._id || notification.id;
      markAsRead(notificationId);
    }

    // Enhanced navigation based on notification type and data
    const notificationType = notification.type || notification.data?.type;
    const notificationData = notification.data || {};
    
    console.log('🔔 Notification pressed:', notificationType, notificationData);

    try {
      switch (notificationType) {
        case 'order_confirmation':
        case 'order_update':
          // Navigate to order details or orders list
          if (notificationData.orderId) {
            navigation.navigate('OrderDetail', { orderId: notificationData.orderId });
          } else {
            navigation.navigate('myorders');
          }
          break;
        
        case 'cart_abandonment':
          // Navigate to cart
          navigation.navigate('cart');
          break;
        
        case 'price_drop':
        case 'back_in_stock':
        case 'new_product':
        case 'product_recommendation':
          // Navigate to product details
          if (notificationData.productId) {
            navigation.navigate('productDetails', { _id: notificationData.productId });
          } else {
            navigation.navigate('home');
          }
          break;
        
        case 'promotion':
        case 'marketing':
          // Navigate to home or specific promotion
          if (notificationData.productId) {
            navigation.navigate('productDetails', { _id: notificationData.productId });
          } else {
            navigation.navigate('home');
          }
          break;
        
        case 'wishlist_update':
          // Navigate to wishlist
          navigation.navigate('wishlist');
          break;
        
        default:
          // For general notifications or unknown types, stay in notifications
          console.log('📋 General notification, staying in notifications screen');
          break;
      }
    } catch (error) {
      console.error('❌ Error navigating from notification:', error);
    }
  };

  const testNotification = async () => {
    try {
      // Show options for different test notifications
      Alert.alert(
        'Test Notifications',
        'Choose a notification type to test:',
        [
          { text: 'Order Confirmation', onPress: () => testOrderNotification() },
          { text: 'Cart Abandonment', onPress: () => testCartNotification() },
          { text: 'Price Drop', onPress: () => testPriceDropNotification() },
          { text: 'Back in Stock', onPress: () => testStockNotification() },
          { text: 'General Test', onPress: () => testGeneralNotification() },
          { text: 'Clear All Local', onPress: () => clearAllLocalNotifications(), style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to show test options');
    }
  };

  const clearAllLocalNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
      Alert.alert('Success', 'All local notifications cleared!');
      // Refresh notifications list
      fetchNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to clear local notifications');
    }
  };

  const clearAllNotifications = async () => {
    try {
      if (notifications.length === 0) {
        Alert.alert('Info', 'No notifications to clear');
        return;
      }

      Alert.alert(
        'Clear All Notifications',
        'Are you sure you want to clear all notifications? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              try {
                // Clear local notifications
                await notificationService.clearAllNotifications();
                
                // Mark all server notifications as read (if any)
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                  const { user, token } = JSON.parse(userData);
                  const serverNotifications = notifications.filter(n => n._id); // Server notifications have _id
                  
                  if (serverNotifications.length > 0) {
                    try {
                      // Mark all server notifications as read
                      await Promise.all(
                        serverNotifications.map(notification => 
                          fetch(`https://nodejsapp-hfpl.onrender.com/api/v1/notification/read/${notification._id}`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            },
                          })
                        )
                      );
                    } catch (serverError) {
                      console.log('Could not mark all server notifications as read:', serverError.message);
                    }
                  }
                }
                
                // Refresh notifications list
                fetchNotifications();
                Alert.alert('Success', 'All notifications cleared!');
              } catch (error) {
                console.error('Error clearing all notifications:', error);
                Alert.alert('Error', 'Failed to clear all notifications');
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to show clear confirmation');
    }
  };

  const testOrderNotification = async () => {
    try {
      await notificationService.sendLocalNotification(
        'Order Confirmed! 🎉',
        'Your order #12345 for $89.99 has been placed successfully. Tap to view details.',
        { 
          type: 'order_confirmation',
          orderId: 'test-order-123',
          orderTotal: 89.99,
          itemCount: 3
        }
      );
      Alert.alert('Test Sent', 'Order confirmation notification sent! Tap it to test navigation.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send order test notification');
    }
  };

  const testCartNotification = async () => {
    try {
      await notificationService.sendLocalNotification(
        'Don\'t forget your cart! 🛒',
        'You have 2 items waiting: iPhone Case, Wireless Charger. Complete your purchase now!',
        { 
          type: 'cart_abandonment',
          cartItems: [{ name: 'iPhone Case' }, { name: 'Wireless Charger' }],
          totalValue: 45.98
        }
      );
      Alert.alert('Test Sent', 'Cart abandonment notification sent! Tap it to test navigation.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send cart test notification');
    }
  };

  const testPriceDropNotification = async () => {
    try {
      await notificationService.sendLocalNotification(
        'Price Drop Alert! 📉',
        'Wireless Headphones is now $79.99 (was $99.99). Save 20% now!',
        { 
          type: 'price_drop',
          productId: 'test-product-456',
          productName: 'Wireless Headphones',
          oldPrice: 99.99,
          newPrice: 79.99,
          discountPercent: 20
        }
      );
      Alert.alert('Test Sent', 'Price drop notification sent! Tap it to test navigation.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send price drop test notification');
    }
  };

  const testStockNotification = async () => {
    try {
      await notificationService.sendLocalNotification(
        'Back in Stock! 🎉',
        'Gaming Mouse is now available. Get it before it sells out again!',
        { 
          type: 'back_in_stock',
          productId: 'test-product-789',
          productName: 'Gaming Mouse',
          currentStock: 15
        }
      );
      Alert.alert('Test Sent', 'Back in stock notification sent! Tap it to test navigation.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send stock test notification');
    }
  };

  const testGeneralNotification = async () => {
    try {
      await notificationService.sendLocalNotification(
        'Test Notification 🔔',
        'This is a general test notification to verify the system works!',
        { 
          type: 'general',
          test: true
        }
      );
      Alert.alert('Test Sent', 'General test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send general test notification');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications().finally(() => setRefreshing(false));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'marketing': return '🎯';
      case 'engagement': return '💬';
      default: return '🔔';
    }
  };

  const renderNotification = ({ item }) => {
    // Check for both unread status formats (server and local notifications)
    const isUnread = item.status !== 'read' && !item.read;
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem, 
          isUnread && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message || item.body}</Text>
            <Text style={styles.notificationTime}>{formatTime(item.createdAt || item.timestamp)}</Text>
          </View>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPreferencesModal = () => (
    <Modal
      visible={showPreferencesModal}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Notification Preferences</Text>
          <TouchableOpacity 
            onPress={() => setShowPreferencesModal(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={[
            {
              title: 'Order Updates',
              key: 'transactional',
              items: [
                { key: 'orderConfirmation', label: 'Order Confirmation' },
                { key: 'shippingUpdates', label: 'Shipping Updates' },
                { key: 'deliveryNotifications', label: 'Delivery Notifications' },
              ]
            },
            {
              title: 'Marketing',
              key: 'marketing',
              items: [
                { key: 'promotions', label: 'Promotions & Offers' },
                { key: 'newProducts', label: 'New Products' },
                { key: 'personalizedRecommendations', label: 'Personalized Recommendations' },
              ]
            },
            {
              title: 'Engagement',
              key: 'engagement',
              items: [
                { key: 'wishlistUpdates', label: 'Wishlist Updates' },
                { key: 'cartReminders', label: 'Cart Reminders' },
                { key: 'reviewRequests', label: 'Review Requests' },
              ]
            }
          ]}
          renderItem={({ item: section }) => (
            <View style={styles.preferencesSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map(item => (
                <View key={item.key} style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>{item.label}</Text>
                  <Switch
                    value={preferences[section.key][item.key]}
                    onValueChange={(value) => {
                      const newPreferences = {
                        ...preferences,
                        [section.key]: {
                          ...preferences[section.key],
                          [item.key]: value
                        }
                      };
                      setPreferences(newPreferences);
                      updatePreferences(newPreferences);
                    }}
                    trackColor={{ false: '#767577', true: '#007AFF' }}
                    thumbColor={Platform.OS === 'android' ? '#007AFF' : '#f4f3f4'}
                  />
                </View>
              ))}
            </View>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={clearAllNotifications} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={testNotification} style={styles.testButton}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowPreferencesModal(true)}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

        <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id || item.id || String(item.timestamp)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyMessage}>
              You'll see order updates and important messages here
            </Text>
          </View>
        )}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : null}
      />

      {renderPreferencesModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    marginRight: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    marginRight: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 18,
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 8,
    marginLeft: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  preferencesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default NotificationManager;
