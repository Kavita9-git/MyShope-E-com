import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

/**
 * A custom hook to protect routes that require authentication
 * @param {boolean} isAdminRequired - Set to true if the route requires admin privileges
 * @returns {Object} - Contains isAuth and user from the Redux store
 */
export const useProtectedRoute = (isAdminRequired = false) => {
  const { isAuth, user } = useSelector((state) => state.user);
  const navigation = useNavigation();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuth) {
      navigation.replace("login");
      return;
    }

    // Redirect to home if admin access is required but user is not admin
    if (isAdminRequired && user?.role !== "admin") {
      navigation.replace("home");
    }
  }, [isAuth, user, navigation, isAdminRequired]);

  return { isAuth, user };
};

export default useProtectedRoute;
