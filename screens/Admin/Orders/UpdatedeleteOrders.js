import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrders } from "../../../redux/features/auth/orderActions";
import Layout from "../../../components/Layout/Layout";
import axios from "axios";
import { server } from "../../../redux/store";
import { Picker } from "@react-native-picker/picker";
import { AntDesign } from "@expo/vector-icons";
import { getAllUserData } from "../../../redux/features/auth/userActions";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";

const statusSteps = ["processing", "shipped", "delivered"];

const UpdatedeleteOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const { users } = useSelector((state) => state.user);
  // console.log("users :", users);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("processing");

  useEffect(() => {
    dispatch(getAllOrders());
    dispatch(getAllUserData());
  }, []);

  const handleAutoNextStatus = async (orderId) => {
    try {
      await axios.put(`${server}/order/admin/${orderId}`);
      dispatch(getAllOrders());
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to change status");
    }
  };

  const handleManualStatusUpdate = async () => {
    try {
      await axios.put(
        `${server}/order/admin/update-status/${selectedOrderId}`,
        {
          orderStatus: selectedStatus,
        }
      );
      setModalVisible(false);
      dispatch(getAllOrders());
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${server}/order/admin/${orderId}`);
      dispatch(getAllOrders());
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to delete order");
    }
  };

  const renderProgress = (status) => {
    const currentIndex = statusSteps.indexOf(status);

    return (
      <View style={styles.progressContainer}>
        {statusSteps.map((step, index) => {
          const isCompletedOrCurrent = index <= currentIndex;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <View key={index} style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  isCompletedOrCurrent && { backgroundColor: "#28a745" },
                ]}
              >
                {isCompletedOrCurrent ? (
                  <AntDesign name="check" size={16} color="#fff" />
                ) : (
                  <Text style={{ color: "#aaa", fontWeight: "bold" }}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.progressLabel,
                  isCompletedOrCurrent && {
                    color: "#28a745",
                    fontWeight: "600",
                  },
                ]}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </Text>
              {index < statusSteps.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    isCompletedOrCurrent && { backgroundColor: "#28a745" },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: "#f8f9fa",
          paddingBottom: 20,
        }}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="package" size={40} color="#fff" />
            <Text style={styles.headerText}>Order Management</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#ebf8ff" }]}>
              <Feather name="list" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Orders List</Text>
              <Text style={styles.statLabel}>
                Update order status and information
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.mainContainer}>
          {loading && (
            <ActivityIndicator
              style={styles.loader}
              size="large"
              color="#3b5998"
            />
          )}

          {orders && orders.length === 0 && !loading && (
            <View style={styles.emptyStateContainer}>
              <Feather name="inbox" size={60} color="#cbd5e0" />
              <Text style={styles.emptyStateText}>No orders found</Text>
            </View>
          )}

          {orders?.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
                <View
                  style={[
                    styles.orderStatusBadge,
                    order.orderStatus === "processing" &&
                      styles.processingBadge,
                    order.orderStatus === "shipped" && styles.shippedBadge,
                    order.orderStatus === "delivered" && styles.deliveredBadge,
                  ]}
                >
                  <Text style={styles.orderStatusText}>
                    {order.orderStatus}
                  </Text>
                </View>
              </View>

              <View style={styles.orderContent}>
                <Image
                  source={{
                    uri: order?.orderItems[0]?.images?.startsWith("http")
                      ? order?.orderItems[0]?.images
                      : `https://nodejsapp-hfpl.onrender.com${order?.orderItems[0]?.images}`,
                  }}
                  style={styles.productImage}
                />

                <View style={styles.orderDetails}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {order?.orderItems[0]?.name}
                  </Text>
                  <Text style={styles.orderInfo}>
                    Items: {order.orderItems.length}
                  </Text>
                  <Text style={styles.orderInfo}>
                    Total: ₹{order.totalAmount?.toFixed(2)}
                  </Text>
                  <Text style={styles.orderInfo}>
                    Shipping: ₹{order.shippingCharges?.toFixed(2)}
                  </Text>
                  <Text style={styles.orderInfo}>
                    Payment: {order.paymentMethod}
                  </Text>
                  <Text style={styles.orderInfo}>
                    Customer:{" "}
                    {users?.find((user) => user._id == order?.user)?.name ||
                      "Guest"}
                  </Text>
                </View>
              </View>

              {renderProgress(order.orderStatus)}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAutoNextStatus(order._id)}
                >
                  <LinearGradient
                    colors={["#4facfe", "#00f2fe"]}
                    style={styles.actionButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <AntDesign name="stepforward" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Next Step</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedOrderId(order._id);
                    setSelectedStatus(order.orderStatus);
                    setModalVisible(true);
                  }}
                >
                  <LinearGradient
                    colors={["#f2994a", "#f2c94c"]}
                    style={styles.actionButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <AntDesign name="edit" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteOrder(order._id)}
                >
                  <LinearGradient
                    colors={["#ff4757", "#ff6b81"]}
                    style={styles.actionButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <AntDesign name="delete" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Order Management v1.0</Text>
        </View>

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Order Status</Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#3b5998"
                >
                  <Picker.Item label="Processing" value="processing" />
                  <Picker.Item label="Shipped" value="shipped" />
                  <Picker.Item label="Delivered" value="delivered" />
                </Picker>
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleManualStatusUpdate}
                >
                  <LinearGradient
                    colors={["#2ecc71", "#27ae60"]}
                    style={styles.modalButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalButtonText}>Update</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <LinearGradient
                    colors={["#e74c3c", "#c0392b"]}
                    style={styles.modalButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  headerGradient: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },
  statsContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#718096",
  },
  mainContainer: {
    padding: 15,
  },
  loader: {
    marginVertical: 20,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: "#718096",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderId: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2d3748",
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  processingBadge: {
    backgroundColor: "#FEF3C7",
  },
  shippedBadge: {
    backgroundColor: "#DBEAFE",
  },
  deliveredBadge: {
    backgroundColor: "#DCFCE7",
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4a5568",
    textTransform: "capitalize",
  },
  orderContent: {
    padding: 12,
    flexDirection: "row",
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 15,
  },
  orderDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 6,
  },
  orderInfo: {
    fontSize: 13,
    color: "#718096",
    marginBottom: 3,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#f9f9f9",
  },
  progressStep: {
    alignItems: "center",
    flexDirection: "row",
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: "#555",
    marginTop: 4,
    width: 60,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    padding: 12,
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 25,
    overflow: "hidden",
  },
  actionButtonGradient: {
    height: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 5,
  },
  footer: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 10,
  },
  footerText: {
    color: "#a0aec0",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2d3748",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 25,
    overflow: "hidden",
  },
  modalButtonGradient: {
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default UpdatedeleteOrders;
