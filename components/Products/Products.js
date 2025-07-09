import { View, Text, FlatList, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductsCard from "./ProductsCard";
import { ProductsData } from "../../data/ProductsData";

const Products = () => {
  const { products } = useSelector((state) => state.product);
  // console.log(products);

  // const prodData = products;
  const [productData, setProductData] = useState([]);
  useEffect(() => {
    setProductData(products);
  }, [products]);
  return (
    <View style={styles.container}>
      {/* {ProductsData.map((p) => (
        <ProductsCard key={p._id} p={p} />
      ))} */}

      <FlatList
        data={productData}
        renderItem={({ item }) => <ProductsCard p={item} />}
        keyExtractor={(item, index) => item._id || index.toString()}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 0,
        }}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});

export default Products;
