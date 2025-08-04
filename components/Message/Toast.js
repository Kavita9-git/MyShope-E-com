import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const Toast = ({ 
  message, 
  type = 'success', // 'success' or 'error'
  visible = false,
  onHide = () => {},
  autoHide = true,
  duration = 3000,
  position = 'top' // 'top' or 'bottom'
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;

  useEffect(() => {
    if (visible && message) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      if (autoHide) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, message]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible || !message) {
    return null;
  }

  const isSuccess = type === 'success';
  const gradientColors = isSuccess 
    ? ['#1e3c72', '#2a5298'] // Blue gradient for success (matching your Account.js)
    : ['#ef4444', '#dc2626']; // Red gradient for error
  
  const iconName = isSuccess ? 'checkcircleo' : 'closecircleo';
  const iconColor = '#ffffff';

  return (
    <Animated.View 
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.toastContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.iconContainer}>
          <AntDesign
            name={iconName}
            size={24}
            color={iconColor}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.toastText}>{message}</Text>
        </View>
        
        <TouchableOpacity style={styles.closeContainer} onPress={hideToast}>
          <MaterialIcons
            name="close"
            size={20}
            color="rgba(255, 255, 255, 0.8)"
          />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

export default Toast;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 15,
    right: 15,
    zIndex: 1000,
    elevation: 10,
  },
  topPosition: {
    top: 50,
  },
  bottomPosition: {
    bottom: 100,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  toastText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 20,
  },
  closeContainer: {
    marginLeft: 12,
    padding: 4,
  },
});
