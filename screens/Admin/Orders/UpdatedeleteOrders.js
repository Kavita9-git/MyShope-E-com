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
    <Layout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>All Orders</Text>

        {loading && <ActivityIndicator size="large" />}

        {orders && orders.length === 0 && !loading && (
          <Text style={styles.noOrders}>No orders found</Text>
        )}

        {orders?.map((order) => (
          <View key={order._id} style={styles.orderCard}>
            <Image
              source={{
                uri: `${order?.orderItems[0]?.images}`,
              }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 10,
              }}
            />
            <Text style={styles.orderText}>Order ID: {order._id}</Text>
            <Text style={styles.orderText}>
              Product Name: {order?.orderItems[0]?.name}
            </Text>
            <Text style={styles.orderText}>
              Items: {order.orderItems.length}
            </Text>
            <Text style={styles.orderText}>
              Total: ₹{order.totalAmount?.toFixed(2)}
            </Text>
            <Text style={styles.orderText}>
              Shipping Charges: ₹{order.shippingCharges?.toFixed(2)}
            </Text>
            <Text style={styles.orderText}>
              Payment Method: {order.paymentMethod}
            </Text>
            <Text style={styles.orderText}>Status: {order.orderStatus}</Text>
            <Text style={styles.orderText}>
              Placed By:{" "}
              {users?.find((user) => user._id == order?.user)?.name || "Guest"}
            </Text>

            {renderProgress(order.orderStatus)}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={() => handleAutoNextStatus(order._id)}
              >
                <Text style={styles.buttonText}>Next Step</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => {
                  setSelectedOrderId(order._id);
                  setSelectedStatus(order.orderStatus);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => handleDeleteOrder(order._id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Processing" value="processing" />
                <Picker.Item label="Shipped" value="shipped" />
                <Picker.Item label="Delivered" value="delivered" />
              </Picker>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.updateButton]}
                  onPress={handleManualStatusUpdate}
                >
                  <Text style={styles.modalButtonText}>Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
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
  container: { margin: 10 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  orderText: { fontSize: 14, marginBottom: 5 },
  noOrders: { textAlign: "center", color: "#555", marginTop: 20 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButton: { backgroundColor: "#007bff" },
  editButton: { backgroundColor: "#ffa500" },
  deleteButton: { backgroundColor: "#dc3545" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  progressStep: { alignItems: "center", flexDirection: "row" },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: "#555",
    marginTop: 4,
    width: 60,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  picker: { marginBottom: 20 },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButton: { backgroundColor: "#28a745" },
  cancelButton: { backgroundColor: "#dc3545" },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
});

export default UpdatedeleteOrders;
