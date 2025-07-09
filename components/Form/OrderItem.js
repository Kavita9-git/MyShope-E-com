import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const OrderItem = ({ order }) => {
  // Helper function to get icon and color based on order status
  const getStatusDisplay = (status) => {
    switch (status) {
      case "Processing":
        return {
          icon: "clock-alert-outline",
          color: "#FF9800",
          text: "Processing",
        }; // Orange for pending
      case "Shipped":
        return {
          icon: "truck-delivery-outline",
          color: "#2196F3",
          text: "Shipped",
        }; // Blue for shipped
      case "Delivered":
        return {
          icon: "check-decagram-outline",
          color: "#4CAF50",
          text: "Delivered",
        }; // Green for delivered
      case "Cancelled":
        return { icon: "cancel", color: "#F44336", text: "Cancelled" }; // Red for cancelled
      default:
        return {
          icon: "information-outline",
          color: "#9E9E9E",
          text: "Unknown Status",
        }; // Gray for unknown
    }
  };

  const statusInfo = getStatusDisplay(order.orderStatus);

  // Function to format date nicely
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options); // Using 'en-US' for consistent format
  };

  return (
    <View style={styles.card}>
      {/* Order Summary Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderIdLabel}>ORDER ID:</Text>
          <Text style={styles.orderIdValue}>
            #{order._id.substring(order._id.length - 8).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Icon
            name={statusInfo.icon}
            size={20}
            color={statusInfo.color}
            style={styles.statusIcon}
          />
          <Text style={[styles.orderStatusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      <View style={styles.dateInfo}>
        <Icon
          name="calendar-range"
          size={16}
          color="#757575"
          style={styles.dateIcon}
        />
        <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
      </View>

      {/* Ordered Items Section */}
      <View style={styles.itemsSection}>
        <Text style={styles.itemsHeader}>Items Purchased:</Text>
        {order.orderItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Icon
              name="package-variant"
              size={18}
              color="#616161"
              style={styles.itemRowIcon}
            />
            <Text
              style={styles.itemName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Total Amount Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.totalAmountContainer}>
          <Icon
            name="cash-multiple"
            size={24}
            color="#333"
            style={styles.totalIcon}
          />
          <Text style={styles.totalAmountLabel}>Total Paid:</Text>
          <Text style={styles.totalAmountValue}>
            ${order.totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12, // More pronounced rounded corners
    elevation: 6, // Stronger shadow for a lifted look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: "hidden", // Ensures shadow is clean
    borderWidth: 1, // Subtle border
    borderColor: "#E0E0E0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F9F9F9", // Slightly off-white header background
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: {
    flexDirection: "column",
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  orderIdValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20, // Pill-shaped status badge
    backgroundColor: "#EFEFEF", // Light background for status
  },
  statusIcon: {
    marginRight: 6,
  },
  orderStatusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  itemsSection: {
    padding: 15,
  },
  itemsHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#FDFDFD", // Slightly different background for item rows
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  itemRowIcon: {
    marginRight: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: "#424242",
    fontWeight: "500",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 10,
    fontWeight: "normal",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  cardFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#F9F9F9", // Matching header background
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  totalAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align to the right
  },
  totalIcon: {
    marginRight: 8,
  },
  totalAmountLabel: {
    fontSize: 16,
    color: "#555",
    fontWeight: "600",
    marginRight: 5,
  },
  totalAmountValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});

export default OrderItem;
