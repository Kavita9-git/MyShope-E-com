import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, clearMessages } from '../redux/features/auth/orderActions';
import { clearCart } from '../redux/features/auth/cartActions';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InputBox from '../components/Form/InputBox';
import Toast from '../components/Message/Toast';
import useToast from '../hooks/useToast';
import notificationService from '../services/NotificationService';
import NotificationTriggers from '../utils/NotificationTriggers';

const Payment = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { loading, success, error, message } = useSelector(state => state.order);
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [processing, setProcessing] = useState(false);

  // Get order data from route params
  const { clientSecret, orderData } = route.params || {};

  useEffect(() => {
    // Clear any previous messages
    dispatch(clearMessages());
  }, [dispatch]);

  // Handle success message and send order confirmation notification
  useEffect(() => {
    if (success && message) {
      // Send comprehensive order confirmation notifications
      const sendOrderConfirmation = async () => {
        try {
          // Use the production-ready notification trigger
          await NotificationTriggers.handleOrderCreated({
            _id: orderData?._id || `order_${Date.now()}`,
            orderNumber: orderData?.orderNumber || `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            totalAmount: orderData?.totalAmount || 0,
            orderItems: orderData?.orderItems || [],
            userId: orderData?.userId || 'current_user'
          });
          
          console.log('📦 Production order confirmation notifications sent');
        } catch (error) {
          console.error('Error sending order confirmation notification:', error);
        }
      };

      sendOrderConfirmation();

      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: () => {
            dispatch(clearCart());
            navigation.navigate('myorders');
          },
        },
      ]);
    }
  }, [success, message, orderData]);

  // Handle error
  useEffect(() => {
    if (error) {
      //Alert.alert('Error', error);
      showError(error);
    }
  }, [error]);

  const handlePayment = async () => {
    // Validate form
    if (!cardNumber || !expiryDate || !cvc || !nameOnCard) {
      //return Alert.alert('Required', 'Please fill all payment details');
      return showError('Please fill all payment details');
    }

    // Basic validation
    if (cardNumber.length < 16) {
      //return Alert.alert('Invalid', 'Please enter a valid card number');
      return showError('Please enter a valid card number');
    }

    if (cvc.length < 3) {
      //return Alert.alert('Invalid', 'Please enter a valid CVC');
      return showError('Please enter a valid CVC');
    }

    try {
      setProcessing(true);

      // In a real app, this is where you'd use a library like react-native-stripe-sdk
      // to handle the payment with the clientSecret

      // Simulate payment processing
      setTimeout(() => {
        // After payment is processed, create the order
        const orderWithPayment = {
          ...orderData,
          paymentInfo: {
            id: route.params?.paymentIntentId || 'mock-payment-' + Date.now(),
            status: 'completed',
          },
          paidAt: new Date(),
        };

        dispatch(createOrder(orderWithPayment));
        setProcessing(false);
      }, 2000);
    } catch (err) {
      setProcessing(false);
      //Alert.alert('Payment Failed', err.message);
      return showError(err.message);
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
                <Icon name="credit-card" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Payment</Text>
              <Text style={styles.headerSubtitle}>Complete your purchase</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              <Icon name="credit-card" size={18} color="#1e3c72" /> Payment Details
            </Text>

            <View style={styles.paymentAmount}>
              <Text style={styles.amountLabel}>Amount to Pay:</Text>
              <Text style={styles.amountValue}>${orderData?.totalAmount?.toFixed(2)}</Text>
            </View>

            <InputBox
              placeholder="Card Number"
              value={cardNumber}
              setValue={setCardNumber}
              icon="credit-card-outline"
              keyboardType="numeric"
              maxLength={16}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <InputBox
                  placeholder="MM/YY"
                  value={expiryDate}
                  setValue={setExpiryDate}
                  icon="calendar"
                  maxLength={5}
                />
              </View>

              <View style={styles.halfInput}>
                <InputBox
                  placeholder="CVC"
                  value={cvc}
                  setValue={setCvc}
                  icon="credit-card-lock"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <InputBox
              placeholder="Name on Card"
              value={nameOnCard}
              setValue={setNameOnCard}
              icon="account"
            />

            <View style={styles.secureInfo}>
              <Icon name="shield-check" size={16} color="#4CAF50" />
              <Text style={styles.secureText}>
                Your payment information is secure and encrypted
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handlePayment}
            disabled={processing || loading}
            style={styles.payButton}
          >
            <LinearGradient
              colors={['#1e3c72', '#2a5298']}
              style={styles.payButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {processing || loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="lock" size={22} color="#fff" style={styles.btnIcon} />
                  <Text style={styles.payButtonText}>
                    Pay ${orderData?.totalAmount?.toFixed(2)}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Payment v1.0</Text>
          </View>
        </View>
      </ScrollView>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        duration={toast.duration}
        position={toast.position}
      />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#333',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3c72',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  secureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  secureText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  payButton: {
    marginVertical: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  payButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 10,
  },
  payButtonText: {
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
});

export default Payment;
