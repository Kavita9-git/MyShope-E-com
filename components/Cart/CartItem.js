import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  decreaseQty,
  increaseQty,
  clearMessage,
  clearError,
} from "../../redux/features/auth/cartActions";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.cart);
  // console.log("items :", item);
  // console.log("items.productId?._id :", item.productId?._id);

  useEffect(() => {
    if (error) {
      console.log("error under:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
      });

      dispatch(clearError());
      dispatch(clearMessage());
    }
    console.log("error :", error);
  }, [error, dispatch]);

  return (
    <View style={styles.container}>
      <Image source={{ uri: item?.image }} style={styles.image} />

      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{item?.name}</Text>
        <Text style={styles.price}>${item?.price.toFixed(2)}</Text>
        {item?.size && <Text style={styles.price}>{item?.size}</Text>}
        {item?.color && <Text style={styles.price}>{item?.color}</Text>}

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => dispatch(decreaseQty(item.productId?._id))}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => dispatch(increaseQty(item.productId?._id))}
          >
            <Text style={styles.qtyButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => dispatch(removeFromCart(item.productId?._id))}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    resizeMode: "contain",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  qtyButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  removeButton: {
    alignSelf: "flex-start",
    backgroundColor: "#e74c3c",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});

export default CartItem;
