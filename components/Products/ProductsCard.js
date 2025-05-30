import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const ProductsCard = ({ p }) => {
  const navigation = useNavigation();

  //More Details Button Handler
  const handleMoreButton = (id) => {
    navigation.navigate("productDetails", { _id: id });
    console.log("Product ID:", id);
  };

  //ADD TO CART Button Handler
  const handleAddToCart = (id) => {
    // console.log("Add to Cart ID:", id);
    alert("Product added to cart!");
    // Here you can implement the logic to add the product to the cart
  };
  return (
    <View>
      <View style={styles.card}>
        <Image style={styles.cardImage} source={{ uri: p?.imageUrl }} />
        <Text style={styles.cardTitle}>{p?.name}</Text>
        <Text style={styles.cardDesc}>
          {p?.description.substring(0, 24)} ...more
        </Text>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleMoreButton(p?._id)}
          >
            <Text style={styles.btnText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCard}
            onPress={() => handleAddToCart(p?._id)}
          >
            <Text style={styles.btnText}>ADD TO CART</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "lightgrey",
    marginVertical: 5,
    marginHorizontal: 10,
    width: "45%",
    padding: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  cardImage: {
    height: 150,
    width: "100%",
    marginBottom: 10,
    resizeMode: "contain",
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 10,
    textAlign: "left",
  },
  btnContainer: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btn: {
    backgroundColor: "#000000",
    height: 20,
    width: 75,
    borderRadius: 5,
    justifyContent: "center",
  },
  btnCard: {
    backgroundColor: "orange",
    height: 20,
    width: 75,
    borderRadius: 5,
    justifyContent: "center",
  },
  btnText: {
    color: "#ffffff",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ProductsCard;
