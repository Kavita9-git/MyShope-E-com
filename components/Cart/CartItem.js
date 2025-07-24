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
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";

const CartItem = ({ item }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { error, message, loading } = useSelector((state) => state.cart);
  const [isRemoving, setIsRemoving] = useState(false);

  // Track last action timestamp to prevent rapid clicking
  const [lastActionTime, setLastActionTime] = useState(0);

  // Debounce period in milliseconds
  const DEBOUNCE_PERIOD = 500;

  useEffect(() => {
    dispatch(clearMessage());
    dispatch(clearError());
  }, []);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
      });
    }
    if (message?.includes("added")) {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: message,
      });
    }
    dispatch(clearMessage());
    dispatch(clearError());
  }, [error, message]);

  // Handle remove with debounce protection
  const handleRemove = () => {
    const currentTime = Date.now();

    // Check if we're within the debounce period
    if (currentTime - lastActionTime < DEBOUNCE_PERIOD) {
      return;
    }

    // If already removing or cart is in loading state, don't try again
    if (isRemoving || loading) {
      return;
    }

    setIsRemoving(true);
    setLastActionTime(currentTime);

    // Dispatch the action
    dispatch(removeFromCart(item.productId?._id)).finally(() => {
      // Reset removing state after a short delay
      setTimeout(() => {
        setIsRemoving(false);
      }, DEBOUNCE_PERIOD);
    });
  };

  // Handle quantity changes with debounce
  const handleQuantityChange = (action) => {
    const currentTime = Date.now();

    // Check if we're within the debounce period
    if (currentTime - lastActionTime < DEBOUNCE_PERIOD) {
      return;
    }

    setLastActionTime(currentTime);

    if (action === "increase") {
      dispatch(increaseQty(item.productId?._id));
    } else {
      dispatch(decreaseQty(item.productId?._id));
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("productDetails", { _id: item?.productId?._id })
        }
        style={styles.imageContainer}
      >
        <Image
          // source={{ uri: item?.image }}
          source={{
            uri: item?.image.startsWith("http")
              ? item?.image
              : `https://nodejsapp-hfpl.onrender.com${item?.image}`,
          }}
          style={styles.image}
        />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text
            style={styles.productName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.name}
          </Text>
          <Text style={styles.priceText}>${item?.price.toFixed(2)}</Text>
        </View>

        <View style={styles.detailsContainer}>
          {item?.size && (
            <View style={styles.detailRow}>
              <Feather name="maximize-2" size={12} color="#718096" />
              <Text style={styles.detailText}>Size: {item?.size}</Text>
            </View>
          )}

          {item?.color && (
            <View style={styles.detailRow}>
              <Feather name="circle" size={12} color="#718096" />
              <Text style={styles.detailText}>Color: {item?.color}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Feather name="package" size={12} color="#718096" />
            <Text style={styles.detailText}>
              Subtotal: ${(item?.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.qtyButton, loading && styles.disabledButton]}
              onPress={() => handleQuantityChange("decrease")}
              disabled={loading}
            >
              <AntDesign name="minus" size={14} color="#333" />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={[styles.qtyButton, loading && styles.disabledButton]}
              onPress={() => handleQuantityChange("increase")}
              disabled={loading}
            >
              <AntDesign name="plus" size={14} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleRemove}
            disabled={isRemoving || loading}
          >
            <LinearGradient
              colors={["#FF5E62", "#FF9966"]}
              style={[
                styles.removeButton,
                (isRemoving || loading) && styles.disabledRemoveButton,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <AntDesign
                name="delete"
                size={14}
                color="#fff"
                style={styles.removeIcon}
              />
              <Text style={styles.removeButtonText}>
                {isRemoving ? "Removing..." : "Remove"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    marginVertical: 8,
    marginHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    flex: 1,
    marginRight: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3C72",
  },
  detailsContainer: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: "#718096",
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  qtyButton: {
    backgroundColor: "#EDF2F7",
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#e0e0e0",
    opacity: 0.7,
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3748",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  disabledRemoveButton: {
    opacity: 0.7,
  },
  removeIcon: {
    marginRight: 4,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});

export default CartItem;
