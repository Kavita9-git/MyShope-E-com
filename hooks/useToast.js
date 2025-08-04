import { useState, useCallback } from 'react';

const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
    duration: 3000,
    position: 'top'
  });

  const showToast = useCallback((message, type = 'success', options = {}) => {
    const { duration = 3000, position = 'top' } = options;
    
    setToast({
      visible: true,
      message,
      type,
      duration,
      position
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    showToast(message, 'success', options);
  }, [showToast]);

  const showError = useCallback((message, options = {}) => {
    showToast(message, 'error', options);
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError
  };
};

export default useToast;
