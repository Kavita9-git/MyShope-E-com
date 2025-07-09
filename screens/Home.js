import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useEffect } from "react";
import Layout from "../components/Layout/Layout";
import Categories from "../components/Layout/category/Categories";
import Banner from "../components/Banner/Banner";
import Products from "../components/Products/Products";
import Header from "../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../redux/features/auth/userActions";
import { getAllOrders } from "../redux/features/auth/orderActions";
import { getAllProducts } from "../redux/features/auth/productActions";
import { getCart } from "../redux/features/auth/cartActions";

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  // console.log(user);

  const { item } = useSelector((state) => state.cart);
  // console.log(item);

  const { products } = useSelector((state) => state.product);
  // console.log(products);

  useEffect(() => {
    dispatch(getUserData());
    dispatch(getAllOrders());
    dispatch(getAllProducts());
    dispatch(getCart());
  }, [dispatch]);
  return (
    <Layout>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Header />
        <Categories />
        <Banner />
        <Products />
      </ScrollView>
    </Layout>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
