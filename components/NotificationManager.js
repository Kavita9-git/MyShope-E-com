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
import { NotificationService } from '../services/NotificationService';

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
      await NotificationService.initialize();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;
      
      const { user, token } = JSON.parse(userData);
      const response = await fetch(`https://nodejsapp-hfpl.onrender.com/api/v1/notification/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
      }
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
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;
      
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
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, status: 'read', readAt: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    if (notification.status !== 'read') {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.data?.orderId) {
      navigation.navigate('OrderDetails', { orderId: notification.data.orderId });
    } else if (notification.type === 'marketing' && notification.data?.productId) {
      navigation.navigate('ProductDetails', { productId: notification.data.productId });
    }
  };

  const testNotification = async () => {
    try {
      await NotificationService.sendLocalNotification(
        'Test Notification',
        'This is a test notification to verify the system works!',
        { test: true }
      );
      Alert.alert('Test Sent', 'Check your notification panel');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
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

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        item.status === 'unread' && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
        </View>
        {item.status === 'unread' && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

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
        keyExtractor={(item) => item._id}
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
