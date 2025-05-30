import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { ProductsData } from "../data/ProductsData";
import Layout from "../components/Layout/Layout";

const ProductDetails = ({ route }) => {
  const [pDetails, setPtDetails] = useState({});
  const [qty, setQty] = useState(1);
  // console.log("ProductDetails Route:", route);

  //Get Products Details from Route Params id
  useEffect(() => {
    //Find Product Details
    const getProduct = ProductsData.find((p) => {
      return p?._id === params?._id;
    });
    setPtDetails(getProduct);
  }, [params?._id]);

  //Handle Function For Quantity Change + -
  const handleAddQty = () => {
    if (qty === 10) return alert("Max quantity allowed is 10");
    setQty((prev) => prev + 1);
  };

  const handleRemoveQty = () => {
    if (qty <= 1) return;
    setQty((prev) => prev - 1);
  };

  const { params } = route;
  return (
    <Layout>
      <Image source={{ uri: pDetails?.imageUrl }} style={styles.image} />
      <View styles={styles.container}>
        <Text style={styles.title}>{pDetails?.name}</Text>
        <Text style={styles.title}>Price : {pDetails?.price} $</Text>
        <Text style={styles.desc}>Desc : {pDetails?.description}</Text>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btnCart}
            onPress={() => alert("Product added to cart!")}
            disabled={pDetails?.quantity <= 0 ? true : false}
          >
            <Text style={styles.btnCartText}>
              {pDetails?.quantity > 0 ? "ADD TO CART" : "OUT OF STOCK"}
            </Text>
          </TouchableOpacity>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.btnQty} onPress={handleRemoveQty}>
              <Text styles={styles.btnQtyText}>-</Text>
            </TouchableOpacity>
            <Text>{qty}</Text>
            <TouchableOpacity style={styles.btnQty} onPress={handleAddQty}>
              <Text styles={styles.btnQtyText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  image: {
    height: 350,
    width: "100%",
  },
  container: {
    marginVertical: 15,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "left",
  },
  desc: {
    fontSize: 12,
    textTransform: "capitalize",
    textAlign: "justify",
    marginVertical: 10,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 10,
  },
  btnCart: {
    width: 180,
    backgroundColor: "#000000",
    // marginVertical: 10,
    borderRadius: 5,
    height: 40,
    justifyContent: "center",
  },
  btnCartText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  btnQty: {
    backgroundColor: "lightgray",
    width: 40,
    alignItems: "center",
    marginHorizontal: 10,
  },
  btnQtyText: {
    fontSize: 20,
  },
});
export default ProductDetails;
