import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Layout from "../../components/Layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import axiosInstance from "../../utils/axiosConfig";

const OrderDetail = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch single order details
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/order/my-orders/${orderId}`);
        if (data.success) {
          setOrder(data.order);
        } else {
          setError("Failed to load order details");
        }
      } catch (err) {
        console.log(err);
        setError("Error loading order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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

  if (loading) {
    return (
      <Layout showBackButton={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3c72" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout showBackButton={true}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color="#F56565" />
          <Text style={styles.errorText}>{error || "Order not found"}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  // Format dates
  const orderDate = moment(order.createdAt).format("MMM DD, YYYY [at] h:mm A");
  const estimatedDelivery = order.estimatedDeliveryDate
    ? moment(order.estimatedDeliveryDate).format("MMM DD, YYYY")
    : "Not available";

  return (
    <Layout showBackButton={true}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#0075f8", "#0075f8"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Icon name="clipboard-text" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Order Details</Text>
              <Text style={styles.headerSubtitle}>
                Order #{order._id.substring(order._id.length - 8)}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.contentContainer}>
          {/* Order Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <LinearGradient
              colors={getStatusColor(order.orderStatus)}
              style={styles.statusBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon
                name={
                  order.orderStatus === "processing"
                    ? "clock-outline"
                    : order.orderStatus === "shipped"
                    ? "truck-delivery"
                    : order.orderStatus === "delivered"
                    ? "check-circle"
                    : "alert-circle"
                }
                size={20}
                color="#fff"
              />
              <Text style={styles.statusText}>
                {order.orderStatus.charAt(0).toUpperCase() +
                  order.orderStatus.slice(1)}
              </Text>
            </LinearGradient>
          </View>

          {/* Order Info */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Date:</Text>
              <Text style={styles.infoValue}>{orderDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Method:</Text>
              <Text style={styles.infoValue}>
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </Text>
            </View>
            {order.paymentInfo && order.paymentInfo.id && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment ID:</Text>
                <Text style={styles.infoValue}>{order.paymentInfo.id}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Delivery:</Text>
              <Text style={styles.infoValue}>{estimatedDelivery}</Text>
            </View>
          </View>

          {/* Shipping Info */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{order.shippingInfo.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City:</Text>
              <Text style={styles.infoValue}>{order.shippingInfo.city}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Country:</Text>
              <Text style={styles.infoValue}>{order.shippingInfo.country}</Text>
            </View>
            {order.shippingInfo.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{order.shippingInfo.phone}</Text>
              </View>
            )}
          </View>

          {/* Order Items */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.orderItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                {item.images && (
                  <Image
                    // source={{ uri: item.images }}
                    source={{
                      uri: item?.images.startsWith("http")
                        ? item?.images
                        : `https://nodejsapp-hfpl.onrender.com${item?.images}`,
                    }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productMeta}>
                    ${item.price} × {item.quantity}
                  </Text>
                </View>
                <Text style={styles.productTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Price Summary */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Price Details</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Items Total:</Text>
              <Text style={styles.priceValue}>
                ${order.itemPrice.toFixed(2)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax:</Text>
              <Text style={styles.priceValue}>${order.tax.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Shipping:</Text>
              <Text style={styles.priceValue}>
                ${order.shippingCharges.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total:</Text>
              <Text style={styles.totalValue}>
                ${order.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Notes if available */}
          {order.notes && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Order Details v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#4A5568",
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#1e3c72",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  statusContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    width: "40%",
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    width: "60%",
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
    color: "#666",
  },
  productTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e3c72",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3c72",
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  footer: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: "center",
  },
  footerText: {
    color: "#a0aec0",
    fontSize: 12,
  },
});

export default OrderDetail;
