import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/Layout/Layout";
import CartItem from "../components/Cart/CartItem";
import PriceTable from "../components/Cart/PriceTable";
import { clearCart, getCart } from "../redux/features/auth/cartActions";

const Cart = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartItems = items;

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.heading}>
          {cartItems.length > 0
            ? `You have ${cartItems.length} item${
                cartItems.length > 1 ? "s" : ""
              } in your cart`
            : "Your cart is empty"}
        </Text>

        {cartItems.length > 0 && (
          <>
            <ScrollView style={styles.cartList}>
              {cartItems.map((item) => (
                <CartItem item={item} key={item._id} />
              ))}
            </ScrollView>

            <View style={styles.summaryContainer}>
              <PriceTable title="Subtotal" price={total} />
              <PriceTable title="Tax" price={1} />
              <PriceTable title="Shipping" price={1} />
              <View style={styles.grandTotalCard}>
                <PriceTable title="Grand Total" price={total + 1 + 1} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnCheckout}
              onPress={() => navigation.navigate("checkout")}
            >
              <Text style={styles.btnText}>Proceed to Checkout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnClear}
              onPress={() => dispatch(clearCart())}
            >
              <Text style={styles.btnText}>Clear Cart</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  heading: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#2c3e50",
  },
  cartList: {
    maxHeight: 500,
    marginBottom: 20,
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  grandTotalCard: {
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 10,
    paddingTop: 10,
  },
  btnCheckout: {
    backgroundColor: "#27ae60",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  btnClear: {
    backgroundColor: "#e74c3c",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Cart;
