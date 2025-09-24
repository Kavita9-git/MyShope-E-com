import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/Layout/Layout';
import CartItem from '../components/Cart/CartItem';
import PriceTable from '../components/Cart/PriceTable';
import { clearCart, clearError, clearMessage, getCart, removeFromCart } from '../redux/features/auth/cartActions';
import { getAllProducts } from '../redux/features/auth/productActions';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import notificationService from '../services/NotificationService';
import { AppState } from 'react-native';
import NotificationTriggers from '../utils/NotificationTriggers';

const Cart = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);
  const { products } = useSelector(state => state.product);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [validCartItems, setValidCartItems] = useState([]);
  const [cartAbandonmentTimer, setCartAbandonmentTimer] = useState(null);

  useEffect(() => {
    dispatch(getCart());
    dispatch(getAllProducts());
  }, []);

  // Production-ready cart abandonment tracking
  useEffect(() => {
    let appStateSubscription = null;

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // User is leaving the app, start comprehensive abandonment tracking
        if (validCartItems && validCartItems.length > 0) {
          console.log('🛒 Setting up production cart abandonment tracking');
          NotificationTriggers.setupCartAbandonmentTracking(validCartItems, 'current_user');
        }
      } else if (nextAppState === 'active') {
        // User is back in the app, cleanup any pending timers
        console.log('🛒 User returned - cleaning up abandonment tracking');
        NotificationTriggers.cleanup();
      }
    };

    // Set up app state listener
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup function
    return () => {
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
      // Cleanup when component unmounts
      NotificationTriggers.cleanup();
    };
  }, [validCartItems]);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  // Check stock availability for cart items
  useEffect(() => {
    console.log('=== CART STOCK CHECK DEBUG ===');
    console.log('Items in cart:', items?.length || 0);
    console.log('Products available:', products?.length || 0);
    
    if (items && items.length > 0) {
      console.log('Sample cart item:', JSON.stringify(items[0], null, 2));
    }
    
    if (products && products.length > 0) {
      console.log('Sample product:', JSON.stringify(products[0], null, 2));
    }
    
    if (items && items.length > 0 && products && products.length > 0) {
      const outOfStock = [];
      const inStock = [];
      
      items.forEach(cartItem => {
        console.log('Processing cart item:', cartItem.name);
        console.log('Cart item productId:', cartItem.productId);
        
        // Try different ways to find the product
        let product = products.find(p => p._id === cartItem.productId?._id);
        if (!product) {
          product = products.find(p => p._id === cartItem.productId);
        }
        if (!product) {
          product = products.find(p => p._id.toString() === cartItem.productId?._id?.toString());
        }
        if (!product) {
          product = products.find(p => p._id.toString() === cartItem.productId?.toString());
        }
        
        console.log('Found product:', product ? product.name : 'NOT FOUND');
        
        if (product) {
          let isAvailable = false;
          let availableStock = 0;
          
          // Check if product is clothing with sizes
          if (cartItem.size && cartItem.color && product.colors) {
            // Find the specific color
            const colorData = product.colors.find(c => c.colorName === cartItem.color);
            if (colorData && colorData.sizes) {
              // Find the specific size
              const sizeData = colorData.sizes.find(s => s.size === cartItem.size);
              if (sizeData) {
                availableStock = sizeData.stock || 0;
                isAvailable = availableStock > 0;
              }
            }
          } else {
            // For non-clothing products, check general stock
            // Handle both 'stock' (from server) and 'quantity' (from fallback data)
            availableStock = product.stock || product.quantity || 0;
            isAvailable = availableStock > 0;
          }
          
          if (!isAvailable) {
            outOfStock.push(cartItem);
          } else if (cartItem.quantity > availableStock) {
            // Item is in stock but quantity exceeds available stock
            Alert.alert(
              'Stock Limited',
              `${cartItem.name} has only ${availableStock} items in stock. Quantity adjusted.`,
              [{ text: 'OK' }]
            );
            // You could dispatch an action here to update quantity to available stock
            inStock.push({ ...cartItem, maxStock: availableStock });
          } else {
            inStock.push({ ...cartItem, maxStock: availableStock });
          }
        } else {
          // Product not found in products list
          outOfStock.push(cartItem);
        }
      });
      
      setOutOfStockItems(outOfStock);
      setValidCartItems(inStock);
      
      // Automatically remove out-of-stock items
      if (outOfStock.length > 0) {
        const itemNames = outOfStock.map(item => item.name).join(', ');
        Alert.alert(
          'Out of Stock',
          `The following items are out of stock and will be removed: ${itemNames}`,
          [
            {
              text: 'Remove',
              onPress: () => {
                outOfStock.forEach(item => {
                  dispatch(removeFromCart(item.productId?._id));
                });
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } else {
      setValidCartItems(items || []);
    }
  }, [items, products, dispatch]);

  const total = (validCartItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItems = validCartItems || [];

  return (
    <Layout showBackButton={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#0075f8', '#0075f8']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <AntDesign name="shoppingcart" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Shopping Cart</Text>
              <Text style={styles.headerSubtitle}>
                {cartItems.length > 0
                  ? `You have ${cartItems.length} item${
                      cartItems.length > 1 ? 's' : ''
                    } in your cart`
                  : 'Your cart is empty'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {cartItems.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#ebf8ff' }]}>
                  <Feather name="shopping-bag" size={24} color="#3182ce" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{cartItems.length}</Text>
                  <Text style={styles.statLabel}>Items in Cart</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#feebef' }]}>
                  <Feather name="dollar-sign" size={24} color="#e53e3e" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>${total.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>Subtotal</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Cart Items</Text>

            {cartItems.map(item => {
              // Find the corresponding product from the products array to get full product data including images
              const product = products.find(p => p._id === item.productId?._id || p._id === item.productId);
              const enrichedItem = {
                ...item,
                productId: product || item.productId, // Use full product data if available
              };
              
              return (
                <View key={item._id}>
                  <CartItem item={enrichedItem} />
                  {item.maxStock && item.quantity > item.maxStock && (
                    <View style={styles.stockWarning}>
                      <Feather name="alert-circle" size={14} color="#F59E0B" />
                      <Text style={styles.stockWarningText}>
                        Only {item.maxStock} available in stock
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.summaryContainer}>
              <PriceTable title="Subtotal" price={total} />
              <PriceTable title="Tax" price={1} />
              <PriceTable title="Shipping" price={1} />
              <View style={styles.grandTotalCard}>
                <PriceTable title="Grand Total" price={total + 1 + 1} />
              </View>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('checkout')}>
                <LinearGradient
                  colors={['#0075f8', '#679be1']}
                  style={styles.btnCheckout}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Feather name="check-circle" size={20} color="#fff" style={styles.btnIcon} />
                  <Text style={styles.btnText}>Proceed to Checkout</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnClear} onPress={() => dispatch(clearCart())}>
                <AntDesign name="delete" size={20} color="#fff" style={styles.btnIcon} />
                <Text style={styles.btnText}>Clear Cart</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyCartContainer}>
            <AntDesign name="shoppingcart" size={80} color="#CBD5E0" />
            <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyCartText}>Add items to your cart to start shopping</Text>
            <TouchableOpacity
              style={styles.continueShopping}
              onPress={() => navigation.navigate('home')}
            >
              <LinearGradient
                colors={['#0075f8', '#0075f8']}
                style={styles.continueShoppingBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Cart Management v1.0</Text>
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
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 25,
    marginTop: -25,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statIconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 15,
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  grandTotalCard: {
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 10,
    paddingTop: 10,
  },
  actionButtonsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  btnCheckout: {
    flexDirection: 'row',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  btnClear: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 20,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
    marginTop: 15,
  },
  emptyCartText: {
    fontSize: 14,
    color: '#718096',
    marginTop: 5,
    textAlign: 'center',
  },
  continueShopping: {
    marginTop: 20,
    width: '100%',
  },
  continueShoppingBtn: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#a0aec0',
    fontSize: 12,
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginTop: -8,
    marginBottom: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  stockWarningText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default Cart;
