import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import { OrderData } from "../../data/OrderData";
import OrderItem from "../../components/Form/OrderItem";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrders } from "../../redux/features/auth/orderActions";

const MyOrders = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  // console.log(OrderData);
  // console.log(orders);
  const [orderData, setOrderData] = useState(orders);

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.heading}>My Orders</Text>
        <ScrollView>
          {orderData.map((order) => (
            <OrderItem key={order._id} order={order} />
          ))}
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  heading: {
    textAlign: "center",
    color: "gray",
    fontWeight: "bold",
    fontSize: 20,
  },
});

export default MyOrders;
