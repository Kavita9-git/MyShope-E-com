import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const GetPushToken = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPushToken = async () => {
    setLoading(true);
    try {
      if (!Device.isDevice) {
        Alert.alert('Error', 'Must use physical device for Push Notifications');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Failed to get push token for push notification!');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.projectId,
      });

      const pushToken = tokenData.data;
      setToken(pushToken);

      console.log('🎯 YOUR EXPO PUSH TOKEN:', pushToken);
      console.log('📋 Copy this token for API testing!');
      
      Alert.alert(
        'Push Token Retrieved!',
        `Token: ${pushToken}\n\nCheck console for easy copy-paste!`,
        [
          {
            text: 'Copy Token',
            onPress: () => {
              Clipboard.setStringAsync(pushToken);
              Alert.alert('Copied!', 'Token copied to clipboard');
            }
          },
          { text: 'OK' }
        ]
      );

    } catch (error) {
      console.error('Error getting push token:', error);
      Alert.alert('Error', 'Failed to get push token: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = async () => {
    if (token) {
      await Clipboard.setStringAsync(token);
      Alert.alert('Copied!', 'Token copied to clipboard');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Expo Push Token</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={getPushToken}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Getting Token...' : 'Get Push Token'}
        </Text>
      </TouchableOpacity>

      {token && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>Your Push Token:</Text>
          <Text style={styles.tokenText} selectable>{token}</Text>
          
          <TouchableOpacity style={styles.copyButton} onPress={copyToken}>
            <Text style={styles.copyButtonText}>Copy Token</Text>
          </TouchableOpacity>
          
          <Text style={styles.instruction}>
            Use this token in your API calls to send push notifications!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 12,
  },
  copyButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default GetPushToken;
