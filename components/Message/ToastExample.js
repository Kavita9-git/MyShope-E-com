import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from './Toast';
import useToast from '../../hooks/useToast';

const ToastExample = () => {
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleSuccessToast = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleErrorToast = () => {
    showError('Something went wrong. Please try again.');
  };

  const handleBottomToast = () => {
    showSuccess('This toast appears at the bottom!', { position: 'bottom' });
  };

  const handleLongToast = () => {
    showError('This is a longer message that will stay for 5 seconds', { duration: 5000 });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Toast Message Examples</Text>
      
      <TouchableOpacity onPress={handleSuccessToast} style={styles.buttonContainer}>
        <LinearGradient
          colors={['#1e3c72', '#2a5298']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Show Success Toast</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleErrorToast} style={styles.buttonContainer}>
        <LinearGradient
          colors={['#ef4444', '#dc2626']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Show Error Toast</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleBottomToast} style={styles.buttonContainer}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Bottom Toast</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLongToast} style={styles.buttonContainer}>
        <LinearGradient
          colors={['#f59e0b', '#d97706']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Long Duration Toast</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Toast Component */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        duration={toast.duration}
        position={toast.position}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ToastExample;
