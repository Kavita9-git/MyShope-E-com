import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook to handle Redux auth state and navigation
 * @param {object} navigation - React Navigation navigation object
 * @param {string} successPath - The path to navigate to on success (defaults to "home")
 * @param {boolean} skipNavigation - If true, won't perform navigation (for components that handle their own navigation)
 * @returns {boolean} loading - Returns the loading state
 */
export const useReduxStateHook = (navigation, successPath = 'home', skipNavigation = false) => {
  const { loading, error, message } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const initialRenderRef = useRef(true);

  useEffect(() => {
    // Skip effects on initial render to avoid navigation problems
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    if (error) {
      // For screens that handle their own errors, don't show alert
      if (!skipNavigation) {
        alert(error);
      }
      // Use setTimeout to avoid React scheduling conflicts
      setTimeout(() => {
        dispatch({ type: 'clearError' });
      }, 0);
    }

    if (message && !skipNavigation && navigation && typeof navigation.navigate === 'function') {
      // Use setTimeout to avoid React scheduling conflicts
      setTimeout(() => {
        dispatch({ type: 'clearMessage' });
      }, 0);

      // Make sure we're not trying to navigate to the current screen
      const currentRoute = navigation.getCurrentRoute?.()?.name;
      console.log('currentRoute :', currentRoute);
      console.log('successPath :', successPath);
      // Special handling for login navigation
      if (successPath === 'login') {
        // Instead of navigating to login, handle auth state change
        // This will trigger Main.js to show AuthStack
        (async () => {
          try {
            await AsyncStorage.setItem('@showLogin', 'true');
            await AsyncStorage.removeItem('@auth');
            // Use setTimeout to avoid React scheduling conflicts
            setTimeout(() => {
              dispatch({ type: 'logoutSuccess' });
            }, 0);
          } catch (error) {
            console.error('Error setting auth state:', error);
          }
        })();
        return;
      }

      if (currentRoute !== successPath) {
        // Check if the destination exists in the current navigator
        const canNavigate = navigation.getState().routeNames.includes(successPath);

        if (canNavigate) {
          // Wrap in setTimeout to avoid potential navigation conflicts
          setTimeout(() => {
            navigation.navigate(successPath);
          }, 100);
        } else {
          console.warn(`Cannot navigate to ${successPath}: Screen not in current navigator`);
        }
      }
    }
  }, [error, message, dispatch, navigation, successPath, skipNavigation]);

  return loading;
};
