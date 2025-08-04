import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/Layout/Layout';
import CartItem from '../components/Cart/CartItem';
import PriceTable from '../components/Cart/PriceTable';
import { clearCart, clearError, clearMessage, getCart } from '../redux/features/auth/cartActions';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Cart = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);

  useEffect(() => {
    dispatch(getCart());
  }, []);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItems = items;

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

            {cartItems.map(item => (
              <CartItem item={item} key={item._id} />
            ))}

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
                  colors={['#1e3c72', '#2a5298']}
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
                colors={['#4facfe', '#00f2fe']}
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
});

export default Cart;
