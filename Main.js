import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; //Its a Hook
import Home from './screens/Home';
import About from './screens/About';
import ProductDetails from './screens/ProductDetails';
import Cart from './screens/Cart';
import Checkout from './screens/Checkout';
import Payment from './screens/Payment';
import Login from './screens/auth/Login';
import Register from './screens/auth/Register';
import Account from './screens/Account/Account';
import Notifications from './screens/Account/Notifications';
import Profile from './screens/Account/Profile';
import MyOrders from './screens/Account/MyOrders';
import OrderDetail from './screens/Account/OrderDetail';
import Dashboard from './screens/Admin/Dashboard';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditPassword from './screens/Account/EditPassword';
import ForgotPassword from './screens/Account/ForgotPassword';
import UploadProfilePic from './screens/Account/UploadProfilePic';
import ManageProducts from './screens/Admin/ManageProducts';
import CreateProduct from './screens/Admin/Products/CreateProduct';
import ManageCategories from './screens/Admin/ManageCategories';
import CreateCategory from './screens/Admin/Categories/CreateCategory';
import UpdateCategory from './screens/Admin/Categories/UpdateCategory';
import DeleteCategory from './screens/Admin/Categories/DeleteCategory';
import UpdateProducts from './screens/Admin/Products/UpdateProducts';
import UpdateImageProducts from './screens/Admin/Products/UpdateImageProducts';
import DeleteImageProduct from './screens/Admin/Products/DeleteImageProduct';
import DeleteProduct from './screens/Admin/Products/DeleteProduct';
import CreateProductReviewsComments from './screens/Admin/Products/CreateProductReviewsComments';
import ManageOrders from './screens/Admin/ManageOrders';
import UpdatedeleteOrders from './screens/Admin/Orders/UpdatedeleteOrders';
import WishList from './screens/WishList';
import SearchResults from './screens/SearchResults';
import { useDispatch, useSelector } from 'react-redux';
import { getUserData } from './redux/features/auth/userActions';
import { ActivityIndicator, View } from 'react-native';
import axios from 'axios';
import CategoryProducts from './screens/CategoryProducts';
import ManageUsers from './screens/Admin/ManageUsers';
import notificationService from './services/NotificationService';

//routes
const Stack = createNativeStackNavigator();

// Auth screens stack - screens accessible without login
const AuthStack = () => (
  <Stack.Navigator initialRouteName="login" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="login" component={Login} />
    <Stack.Screen name="register" component={Register} />
    <Stack.Screen name="forgotPassword" component={ForgotPassword} />
  </Stack.Navigator>
);

// App screens stack - protected screens requiring authentication
const AppStack = () => (
  <Stack.Navigator initialRouteName="home" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="home" component={Home} />
    <Stack.Screen name="productDetails" component={ProductDetails} />
    <Stack.Screen name="about" component={About} />
    <Stack.Screen name="cart" component={Cart} />
    <Stack.Screen name="checkout" component={Checkout} />
    <Stack.Screen name="payment" component={Payment} />
    <Stack.Screen name="account" component={Account} />
    <Stack.Screen name="myorders" component={MyOrders} />
    <Stack.Screen name="profile" component={Profile} />
    <Stack.Screen name="editpassword" component={EditPassword} />
    <Stack.Screen name="notifications" component={Notifications} />
    <Stack.Screen name="wishlist" component={WishList} />
    <Stack.Screen name="uploadprofilepic" component={UploadProfilePic} />
    <Stack.Screen name="CategoryProducts" component={CategoryProducts} />
    <Stack.Screen name="SearchResults" component={SearchResults} />
    <Stack.Screen name="OrderDetail" component={OrderDetail} />

    {/* Admin Routes */}
    <Stack.Screen name="adminpanel" component={Dashboard} />
    <Stack.Screen name="createproduct" component={CreateProduct} />
    <Stack.Screen name="manageproducts" component={ManageProducts} />
    <Stack.Screen name="updateproduct" component={UpdateProducts} />
    <Stack.Screen name="deleteproduct" component={DeleteProduct} />
    <Stack.Screen name="createproductrev" component={CreateProductReviewsComments} />
    <Stack.Screen name="manageorders" component={ManageOrders} />
    <Stack.Screen name="updatedeleteorder" component={UpdatedeleteOrders} />
    <Stack.Screen name="createcategory" component={CreateCategory} />
    <Stack.Screen name="managecategories" component={ManageCategories} />
    <Stack.Screen name="updatecategory" component={UpdateCategory} />
    <Stack.Screen name="deletecategory" component={DeleteCategory} />
    <Stack.Screen name="deleteimageproduct" component={DeleteImageProduct} />
    <Stack.Screen name="updateimageproducts" component={UpdateImageProducts} />
    <Stack.Screen name="manageusers" component={ManageUsers} />
  </Stack.Navigator>
);

export default function Main() {
  const [loading, setLoading] = useState(true);
  const [forceAuthStack, setForceAuthStack] = useState(false);
  const dispatch = useDispatch();
  const { isAuth } = useSelector(state => state.user);

  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      console.log('🔔 Initializing notifications...');
      try {
        await notificationService.initialize();
        console.log('✅ NotificationService initialized successfully');
      } catch (error) {
        console.log('❌ NotificationService initialization failed:', error);
      }
    };
    
    initializeNotifications();
  }, []);

  // Check authentication status and set up Bearer token on app load
  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Check if we should show login screen (from ShippingForm redirect)
        const showLogin = await AsyncStorage.getItem('@showLogin');
        if (showLogin === 'true') {
          // Clear the flag so it doesn't persist
          await AsyncStorage.removeItem('@showLogin');
          // Clear auth token to force login screen
          await AsyncStorage.removeItem('@auth');
          // Make sure isAuth is false to show AuthStack
          // Use setTimeout to avoid React scheduling conflicts
          setTimeout(() => {
            dispatch({ type: 'logoutSuccess' });
          }, 0);
          // Force the AuthStack to be shown
          setForceAuthStack(true);
          setLoading(false);
          return;
        }

        // const token = await AsyncStorage.getItem('@auth');

        // if (token) {
        //   // Set default auth header for axios instances
        //   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        //   // Attempt to get user data to validate token
        //   dispatch(getUserData());
        // }
      } catch (error) {
        console.error('Auth setup error:', error);
      } finally {
        setLoading(false);
      }
    };

    setupAuth();
  }, [dispatch]);

  // Reset forceAuthStack when user is authenticated
  useEffect(() => {
    console.log('[Main] Auth state changed, isAuth:', isAuth, 'forceAuthStack:', forceAuthStack);

    // When user becomes authenticated, reset forceAuthStack
    if (isAuth && forceAuthStack) {
      console.log('[Main] User authenticated, resetting forceAuthStack');
      setForceAuthStack(false);
    }
  }, [isAuth]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If forceAuthStack is true, show the AuthStack regardless of isAuth state
  // This helps handle the login navigation issue
  return (
    <NavigationContainer>
      {isAuth && !forceAuthStack ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

