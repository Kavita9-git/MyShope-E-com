import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { getCart, clearCart, clearMessage } from '../redux/features/auth/cartActions';
import {
  clearMessages,
  clearSuccess,
  createOrder,
  processPayment,
} from '../redux/features/auth/orderActions';
import ShippingForm from '../components/Form/ShippingForm';
import OrderSummary from '../components/Checkout/OrderSummary';
import PaymentSelector from '../components/Checkout/PaymentSelector';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Checkout = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items = [] } = useSelector(state => state.cart);
  const { loading, success } = useSelector(state => state.order);
  const { user } = useSelector(state => state.user);

  // State for form
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showNotification, setShowNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Order placed successfully!');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = 1;
  const shipping = 1;
  const total = subtotal + tax + shipping;

  useEffect(() => {
    dispatch(clearSuccess());
    dispatch(getCart());
    loadLastUsedShippingInfo();
  }, [dispatch]);

  // Load last used shipping info from AsyncStorage
  const loadLastUsedShippingInfo = async () => {
    try {
      const lastUsedAddress = await AsyncStorage.getItem('@lastUsedAddress');

      if (lastUsedAddress) {
        console.log('Found last used address in checkout');
        // We'll let ShippingForm handle loading this data
      } else if (user) {
        // If no last used address but user is logged in, use user profile info
        console.log('Using user profile data for shipping info');
        setName(user?.name || '');
        setAddress(user?.address || '');
        setCity(user?.city || '');
        setCountry(user?.country || '');
        setPhone(user?.phone || '');
      }
    } catch (error) {
      console.log('Error loading shipping info:', error);
    }
  };

  // Set user profile info if available and we don't have values already
  useEffect(() => {
    if (user && (!name || !address || !city || !country || !phone)) {
      // Only set these fields if they're not already set (either from lastUsedAddress or manually)
      if (!name && user.name) setName(user.name);
      if (!address && user.address) setAddress(user.address);
      if (!city && user.city) setCity(user.city);
      if (!country && user.country) setCountry(user.country);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Handle success
  useEffect(() => {
    if (success) {
      setShowNotification(true);

      // Save the current shipping details as the last used address
      saveCurrentAddressAsLastUsed();
      dispatch(clearSuccess());
      // Animate notification entrance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowNotification(false);
          // Handle successful order placement without direct navigation
          dispatch(clearCart());
          // Navigate back - this avoids the cross-stack navigation issue
          navigation.goBack();
        });
      }, 3000);
    }
  }, [success]);

  // Save the current address as the last used one
  const saveCurrentAddressAsLastUsed = async () => {
    try {
      if (name && address && city && country && phone) {
        const currentAddress = { name, address, city, country, phone };
        await AsyncStorage.setItem('@lastUsedAddress', JSON.stringify(currentAddress));
        console.log('Saved shipping details as last used address from checkout');
      }
    } catch (error) {
      console.log('Error saving last used address in checkout:', error);
    }
  };

  const handlePlaceOrder = async () => {
    // Validate form
    if (!name || !address || !city || !country || !phone) {
      //return Alert.alert("Required", "Please fill all shipping details");
      return showError('Please fill all shipping details');
    }

    if (items.length === 0) {
      //return Alert.alert("Empty Cart", "Your cart is empty");
      return showError('Your cart is empty');
    }

    // Create order data
    const orderData = {
      shippingInfo: {
        name,
        address,
        city,
        country,
        phone,
      },
      orderItems: items.map(item => {
        // Ensure we have a valid image path
        let imagePath = '';
        if (item?.image) {
          imagePath = item.image;
        } else if (item?.images) {
          imagePath = item.images;
        } else if (
          item?.productId &&
          item?.productId?.images &&
          item?.productId?.images?.length > 0
        ) {
          imagePath = item?.productId?.images[0];
        } else {
          // Fallback image
          imagePath = 'https://via.placeholder.com/150';
        }

        return {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          images: imagePath,
          product: item.productId?._id || item._id,
        };
      }),
      paymentMethod,
      itemPrice: subtotal,
      tax,
      shippingCharges: shipping,
      totalAmount: total,
    };

    // Save the current shipping details as the last used address
    await saveCurrentAddressAsLastUsed();

    // Handle payment method
    if (paymentMethod === 'COD') {
      try {
        // Log the order data for debugging
        console.log('Sending order data:', JSON.stringify(orderData, null, 2));

        const result = await dispatch(createOrder(orderData));
        if (result.type === 'createOrderFail') {
          // Alert.alert('Order Failed', 'Failed to place your order. Please try again.');
          return showError('Failed to place your order. Please try again.');
        }
      } catch (err) {
        console.log('Order placement error:', err);
        // Alert.alert('Error', 'Something went wrong while placing your order. Please try again.');
        return showError('Something went wrong while placing your order. Please try again.');
      }
    } else {
      // For online payment
      try {
        const result = await dispatch(processPayment({ totalAmount: total }));
        if (result?.payload?.clientSecret) {
          // Navigate to payment screen
          navigation.navigate('payment', {
            clientSecret: result.payload.clientSecret,
            paymentIntentId: result.payload.paymentIntentId,
            orderData,
          });
        } else if (result.type === 'processPaymentFail') {
          // Alert.alert('Payment Failed', 'Failed to process payment. Please try again.');
          return showError('Failed to process payment. Please try again.');
        } else {
          // Alert.alert('Payment Failed', 'Failed to process payment. Please try again.');
          return showError('Failed to process payment. Please try again.');
        }
      } catch (err) {
        console.log('Payment processing error:', err);
        // Alert.alert('Error', 'Something went wrong with payment processing. Please try again.');
        return showError('Something went wrong with payment processing. Please try again.');
      }
    }
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#1e3c72', '#2a5298']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Icon name="clipboard-check" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Checkout</Text>
              <Text style={styles.headerSubtitle}>Complete your order</Text>
            </View>
          </LinearGradient>
        </View>

        {showNotification && (
          <Animated.View
            style={[
              styles.notificationContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#4776E6', '#8E54E9']}
              style={styles.notificationGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.notificationIconWrapper}>
                <Icon name="check-decagram" size={28} color="#fff" />
              </View>
              <Text style={styles.notificationText}>{successMessage}</Text>
              <TouchableOpacity
                onPress={() => {
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start(() => setShowNotification(false));
                }}
                style={styles.closeButton}
              >
                <Icon name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.contentContainer}>
          <View style={styles.formSection}>
            <ShippingForm
              name={name}
              setName={setName}
              address={address}
              setAddress={setAddress}
              city={city}
              setCity={setCity}
              country={country}
              setCountry={setCountry}
              phone={phone}
              setPhone={setPhone}
            />

            <PaymentSelector selectedMethod={paymentMethod} setSelectedMethod={setPaymentMethod} />

            <OrderSummary cartItems={items} subtotal={subtotal} tax={tax} shipping={shipping} />
          </View>

          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={loading}
            style={styles.placeOrderButton}
          >
            <LinearGradient
              colors={['#1e3c72', '#2a5298']}
              style={styles.placeOrderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="check-circle" size={22} color="#fff" style={styles.btnIcon} />
                  <Text style={styles.placeOrderText}>
                    {paymentMethod === 'COD'
                      ? 'Place Order (Cash on Delivery)'
                      : 'Continue to Payment'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Checkout v1.0</Text>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  placeOrderButton: {
    marginVertical: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  placeOrderGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 10,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#a0aec0',
    fontSize: 12,
  },
  notificationContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginHorizontal: 15,
  },
  notificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffffff',
  },
  notificationIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  notificationText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 6,
  },
});

export default Checkout;
