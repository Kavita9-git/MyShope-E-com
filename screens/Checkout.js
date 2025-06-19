import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import Layout from "../components/Layout/Layout";

const Checkout = ({ navigation }) => {
  const handleCOD = () => {
    // Handle Cash On Delivery logic here
    alert("Cash On Delivery selected");
  };

  const handleOnline = () => {
    // Handle Online Payment logic here
    alert("You are redirected to online payment gateway");
    navigation.navigate("payment");
  };
  return (
    <Layout>
      <View style={Styles.conatiner}>
        <Text style={Styles.heading}>Payment Options</Text>
        <Text style={Styles.price}>Total Amount 101$</Text>
        <View style={Styles.paymentCard}>
          <Text style={Styles.paymentHeading}>Select Your Payment Mode</Text>
          <TouchableOpacity style={Styles.paymentBtn} onPress={handleCOD}>
            <Text style={Styles.paymentBtnText}>Cash On Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={Styles.paymentBtn} onPress={handleOnline}>
            <Text style={Styles.paymentBtnText}>
              Online (CREDIT | DEBIT CARD)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
};

const Styles = StyleSheet.create({
  conatiner: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  heading: {
    fontSize: 30,
    fontWeight: "500",
    marginVertical: 10,
  },
  price: {
    fontSize: 20,
    marginBottom: 10,
    color: "gray",
  },
  paymentCard: {
    backgroundColor: "#ffffff",
    width: "90%",
    borderRadius: 10,
    padding: 30,
    marginVertical: 10,
  },
  paymentHeading: {
    color: "gray",
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 10,
  },
  paymentBtn: {
    backgroundColor: "#000000",
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    marginVertical: 10,
  },
  paymentBtnText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
  },
});
export default Checkout;
