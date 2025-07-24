import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";

const OrderCard = ({ order, onPress }) => {
  // Get the first item image for display
  const firstItemImage =
    order.orderItems.length > 0 ? order.orderItems[0].images : null;

  // Format date
  const orderDate = moment(order.createdAt).format("MMM DD, YYYY");

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return ["#FF9800", "#F57C00"];
      case "shipped":
        return ["#2196F3", "#1976D2"];
      case "delivered":
        return ["#4CAF50", "#388E3C"];
      case "cancelled":
        return ["#F44336", "#D32F2F"];
      default:
        return ["#9E9E9E", "#757575"];
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(order._id)}
      activeOpacity={0.9}
    >
      <View style={styles.innerContainer}>
        <View style={styles.headerRow}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order ID:</Text>
            <Text style={styles.orderId}>
              #{order._id.substring(order._id.length - 8)}
            </Text>
          </View>

          <LinearGradient
            colors={getStatusColor(order.orderStatus)}
            style={styles.statusBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.statusText}>
              {order.orderStatus.charAt(0).toUpperCase() +
                order.orderStatus.slice(1)}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.contentRow}>
          {firstItemImage && (
            <Image
              source={{
                uri: firstItemImage?.startsWith("http")
                  ? firstItemImage
                  : `https://nodejsapp-hfpl.onrender.com${firstItemImage}`,
              }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.orderInfo}>
            <Text style={styles.itemsText}>{order?.orderItems[0].name}</Text>
            <Text style={styles.itemsText}>
              {order.orderItems.length}{" "}
              {order.orderItems.length === 1 ? "item" : "items"}
            </Text>
            <Text style={styles.totalText}>
              ${order.totalAmount.toFixed(2)}
            </Text>
            <View style={styles.dateContainer}>
              <Icon name="calendar" size={14} color="#666" />
              <Text style={styles.dateText}>{orderDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.paymentMethod}>
            <Icon
              name={order.paymentMethod === "COD" ? "cash" : "credit-card"}
              size={14}
              color="#666"
            />
            <Text style={styles.paymentMethodText}>
              {order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : "Online Payment"}
            </Text>
          </View>

          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="chevron-right" size={16} color="#1e3c72" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },
  innerContainer: {
    padding: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },
  orderId: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  contentRow: {
    flexDirection: "row",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  orderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  itemsText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3c72",
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  viewDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 13,
    color: "#1e3c72",
    fontWeight: "600",
    marginRight: 2,
  },
});

export default OrderCard;
