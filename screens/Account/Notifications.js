import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import * as ExpoNotifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { NotificationService } from '../../services/NotificationService';

const Notifications = () => {
  const [pushToken, setPushToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPushToken = async () => {
    setLoading(true);
    try {
      // Check if we're in Expo Go
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        Alert.alert(
          'Expo Go Limitation',
          'Push notifications are limited in Expo Go since SDK 53. However, local notifications work fine!\n\nFor full push notification testing, use:\n• EAS Development Build\n• Physical device build\n• Expo.dev deployment',
          [
            { text: 'Test Local Notifications', onPress: testNotification },
            { text: 'OK' }
          ]
        );
        return;
      }
      
      if (!Device.isDevice) {
        Alert.alert('Error', 'Must use physical device for Push Notifications');
        return;
      }

      const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await ExpoNotifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Failed to get push token for push notification!');
        return;
      }

      // Enhanced error handling for token retrieval
      let tokenData;
      let token;
      
      try {
        tokenData = await ExpoNotifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.projectId,
        });
        token = tokenData.data;
      } catch (tokenError) {
        console.error('Token retrieval error:', tokenError);
        
        // Handle Firebase-related errors specifically
        if (tokenError.message.includes('FirebaseApp') || tokenError.message.includes('firebase')) {
          Alert.alert(
            'Configuration Issue',
            'There seems to be a Firebase configuration conflict. This is likely due to running in development mode.\n\nSolutions:\n1. Try restarting the app\n2. Clear app data and restart\n3. Use EAS Development Build for production-like testing',
            [
              { text: 'Try Local Notification', onPress: testNotification },
              { text: 'OK' }
            ]
          );
          return;
        }
        
        // Re-throw other errors
        throw tokenError;
      }

      setPushToken(token);

      console.log('🎯 YOUR EXPO PUSH TOKEN:', token);
      console.log('📋 Copy this token for API testing!');
      
      Alert.alert(
        'Push Token Retrieved!',
        `Token: ${token}\n\nCheck console for easy copy-paste!`,
        [
          {
            text: 'Copy Token',
            onPress: async () => {
              await Clipboard.setStringAsync(token);
              Alert.alert('Copied!', 'Token copied to clipboard');
            }
          },
          { text: 'OK' }
        ]
      );

    } catch (error) {
      console.error('Error getting push token:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to get push token: ' + error.message;
      
      if (error.message.includes('FirebaseApp')) {
        errorMessage = 'Firebase configuration issue detected. This usually happens in development mode. Try using EAS Development Build or test with local notifications instead.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const notificationService = new NotificationService();
      await notificationService.sendLocalNotification(
        'Test Notification 🔔',
        'This is a test notification from your e-commerce app!',
        { test: true }
      );
      Alert.alert('Test Sent!', 'Check your notification panel');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const copyToken = async () => {
    if (pushToken) {
      await Clipboard.setStringAsync(pushToken);
      Alert.alert('Copied!', 'Push token copied to clipboard');
    } else {
      Alert.alert('No Token', 'Please get your push token first');
    }
  };

  const shareToken = async () => {
    if (!pushToken) {
      Alert.alert('No Token', 'Please get your push token first');
      return;
    }

    try {
      // Try to share via system share sheet
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync('', {
          message: `Expo Push Token: ${pushToken}\n\nFor API testing in your e-commerce app.`,
          dialogTitle: 'Share Push Token'
        });
      } else {
        // Fallback to email if available
        const isEmailAvailable = await MailComposer.isAvailableAsync();
        if (isEmailAvailable) {
          await MailComposer.composeAsync({
            subject: 'Expo Push Token for Testing',
            body: `Here's your Expo Push Token for API testing:\n\n${pushToken}\n\nUse this token in your curl commands to test push notifications.`,
            recipients: [], // User can add their email
          });
        } else {
          // Final fallback - just copy and show alert
          await Clipboard.setStringAsync(pushToken);
          Alert.alert(
            'Token Copied!', 
            `Your push token has been copied to clipboard:\n\n${pushToken.substring(0, 50)}...\n\nPaste it somewhere to save it.`
          );
        }
      }
    } catch (error) {
      console.error('Error sharing token:', error);
      // Fallback to copy
      await Clipboard.setStringAsync(pushToken);
      Alert.alert('Token Copied!', 'Token copied to clipboard as sharing failed.');
    }
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.profileHeader}>
              <View style={styles.iconContainer}>
                <AntDesign name="bells" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                Check your latest updates
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#ebf8ff" }]}>
              <Feather name="bell" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>New Notifications</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#feebef" }]}>
              <Feather name="clock" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Past Notifications</Text>
            </View>
          </View>
        </View>

        <View style={styles.notificationsContainer}>
          <View style={styles.emptyStateContainer}>
            <AntDesign name="notification" size={60} color="#CBD5E0" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You don't have any notifications yet
            </Text>
            
            {/* Notification Testing Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                onPress={getPushToken}
                disabled={loading}
              >
                <Feather name="smartphone" size={16} color="#fff" />
                <Text style={styles.buttonText}>
                  {loading ? 'Getting Token...' : 'Get Push Token'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#34C759' }]}
                onPress={testNotification}
              >
                <Feather name="bell" size={16} color="#fff" />
                <Text style={styles.buttonText}>Test Notification</Text>
              </TouchableOpacity>
              
              {pushToken && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
                    onPress={copyToken}
                  >
                    <Feather name="copy" size={16} color="#fff" />
                    <Text style={styles.buttonText}>Copy Token</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#8E44AD' }]}
                    onPress={shareToken}
                  >
                    <Feather name="share" size={16} color="#fff" />
                    <Text style={styles.buttonText}>Share Token</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            
            {pushToken && (
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenLabel}>Your Push Token:</Text>
                <Text style={styles.tokenText} selectable>{pushToken}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Expo Go Limitation Warning */}
        {Constants.appOwnership === 'expo' && (
          <View style={[styles.infoCard, { backgroundColor: '#fff8dc' }]}>
            <View style={styles.infoHeader}>
              <Feather name="alert-triangle" size={20} color="#ff8c00" />
              <Text style={[styles.infoTitle, { color: '#ff8c00' }]}>Expo Go Limitations</Text>
            </View>
            <Text style={styles.infoText}>• Push notifications limited in Expo Go (SDK 53+)</Text>
            <Text style={styles.infoText}>• Local notifications work perfectly ✅</Text>
            <Text style={styles.infoText}>• Backend system ready for production</Text>
            <Text style={styles.infoText}>• Use EAS Dev Build for full testing</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Feather name="info" size={20} color="#3182ce" />
            <Text style={styles.infoTitle}>How Notifications Work</Text>
          </View>
          <Text style={styles.infoText}>• Get updates about your orders</Text>
          <Text style={styles.infoText}>• Receive alerts about promotions</Text>
          <Text style={styles.infoText}>
            • Stay informed about new products
          </Text>
          <Text style={styles.infoText}>• Get notified about price drops</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Notifications Management v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    minHeight: "100%",
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 25,
    marginTop: -25,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statIconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
  },
  notificationsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 5,
    textAlign: "center",
  },
  infoCard: {
    marginHorizontal: 15,
    backgroundColor: "#ebf8ff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3182ce",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 6,
    paddingLeft: 10,
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  footerText: {
    color: "#a0aec0",
    fontSize: 12,
  },
  // New styles for push notification functionality
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: 160,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  tokenContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default Notifications;
