import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import PriceTable from "../Cart/PriceTable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import { removeFromCart } from "../../redux/features/auth/cartActions";

const OrderSummary = ({ cartItems, subtotal, tax = 1, shipping = 1 }) => {
  const total = subtotal + tax + shipping;
  const dispatch = useDispatch();
  // Track which items are currently being removed
  const [removingItems, setRemovingItems] = useState({});

  const handleRemoveItem = (item) => {
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove ${item.name} from your order?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: async () => {
            const itemId = item._id || item.productId?._id;
            console.log("Removing item from cart:", itemId);

            // Set this item as "removing" to show the loading animation
            setRemovingItems((prev) => ({ ...prev, [itemId]: true }));

            try {
              // When removing from cart, pass the product ID and its size (if applicable)
              // This ensures stock is properly restored
              await dispatch(
                removeFromCart({
                  productId: item.productId?._id || item._id,
                  size: item.size || null,
                  quantity: item.quantity, // Pass quantity to restore correct stock amount
                })
              );
            } catch (error) {
              console.log("Error removing item:", error);
              Alert.alert("Error", "Failed to remove item. Please try again.");
            } finally {
              // Clear the removing state for this item
              setRemovingItems((prev) => ({ ...prev, [itemId]: false }));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        <Icon name="receipt" size={18} color="#1e3c72" /> Order Summary
      </Text>

      <ScrollView style={styles.itemsContainer}>
        {cartItems.map((item) => {
          const itemId = item._id || item.productId?._id;
          const isRemoving = removingItems[itemId];

          return (
            <View key={itemId} style={styles.itemRow}>
              {item.images && (
                <Image
                  source={{
                    uri: item?.images.startsWith("http")
                      ? item?.images
                      : `https://nodejsapp-hfpl.onrender.com${item?.images}`,
                  }}
                  style={styles.itemImage}
                />
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>
                  ${item.price} × {item.quantity}
                  {item.size && (
                    <Text style={styles.sizeText}> | Size: {item.size}</Text>
                  )}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveItem(item)}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <ActivityIndicator size="small" color="#FF5A5F" />
                ) : (
                  <Icon name="trash-can-outline" size={22} color="#FF5A5F" />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.summaryContainer}>
        <PriceTable title="Subtotal" price={subtotal} />
        <PriceTable title="Tax" price={tax} />
        <PriceTable title="Shipping" price={shipping} />
        <View style={styles.grandTotalCard}>
          <PriceTable title="Grand Total" price={total} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
    flexDirection: "row",
    alignItems: "center",
  },
  itemsContainer: {
    maxHeight: 200,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: "500",
    fontSize: 14,
  },
  itemMeta: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  itemTotal: {
    fontWeight: "600",
    fontSize: 14,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sizeText: {
    fontStyle: "italic",
  },
  summaryContainer: {
    marginTop: 15,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  grandTotalCard: {
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 10,
    paddingTop: 10,
  },
});

export default OrderSummary;
