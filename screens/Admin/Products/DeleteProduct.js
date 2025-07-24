import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProducts,
  deleteProduct,
} from "../../../redux/features/auth/productActions";
import Layout from "../../../components/Layout/Layout";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

const DeleteProduct = () => {
  const dispatch = useDispatch();
  const { products, loading, message } = useSelector((state) => state.product);

  const [productId, setProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(getAllProducts());
  }, []);

  // Update selected product when product ID changes
  useEffect(() => {
    if (productId) {
      const product = products.find((p) => p._id === productId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [productId, products]);

  // Show notification when message changes
  useEffect(() => {
    if (message) {
      setSuccessMessage(message);
      setShowNotification(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowNotification(false);
        });
      }, 3000);
    }
  }, [message]);

  const handleDeleteProduct = () => {
    if (!productId) return Alert.alert("Please select a product first");

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch(deleteProduct(productId));
            setProductId("");
            setSelectedProduct(null);
          },
        },
      ]
    );
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#e53e3e", "#c53030", "#9b2c2c"]}
            style={styles.headerGradient}
          >
            <Icon name="delete-forever" size={40} color="#fff" />
            <Text style={styles.headerText}>Delete Product</Text>
          </LinearGradient>
        </View>

        {showNotification && (
          <Animated.View
            style={[styles.notificationContainer, { opacity: fadeAnim }]}
          >
            <LinearGradient
              colors={["#43cea2", "#185a9d"]}
              style={styles.notificationGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="check-circle" size={24} color="#fff" />
              <Text style={styles.notificationText}>{successMessage}</Text>
              <TouchableOpacity
                onPress={() => setShowNotification(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.cardContainer}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#c53030"
              style={styles.loader}
            />
          )}

          <Text style={styles.label}>
            <Icon name="shape-outline" size={16} color="#555" /> Select Product:
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={productId}
              onValueChange={(value) => setProductId(value)}
              style={styles.picker}
              dropdownIconColor="#c53030"
            >
              <Picker.Item label="-- Select Product --" value="" />
              {products.map((p) => (
                <Picker.Item key={p._id} label={p.name} value={p._id} />
              ))}
            </Picker>
          </View>

          {selectedProduct && (
            <View style={styles.productInfoContainer}>
              <Text style={styles.productInfoTitle}>Product Information:</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{selectedProduct.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Price:</Text>
                <Text style={styles.infoValue}>${selectedProduct.price}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Category:</Text>
                <Text style={styles.infoValue}>
                  {selectedProduct.category?.category || "No category"}
                </Text>
              </View>

              {selectedProduct.subcategory && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Subcategory:</Text>
                  <Text style={styles.infoValue}>
                    {selectedProduct.subcategory}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Stock:</Text>
                <Text style={styles.infoValue}>{selectedProduct.stock}</Text>
              </View>
            </View>
          )}

          <View style={styles.warningBox}>
            <Icon name="alert" size={24} color="#c53030" />
            <Text style={styles.warningText}>
              Warning: This action cannot be undone. The product will be
              permanently deleted.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteProduct}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#e53e3e", "#c53030", "#9b2c2c"]}
              style={styles.btnGradient}
            >
              <Icon name="trash-can" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>DELETE PRODUCT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  headerGradient: {
    padding: 20,
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
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loader: {
    marginVertical: 20,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7e6",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  message: {
    color: "green",
    marginLeft: 10,
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
    fontWeight: "500",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  productInfoContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  productInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#4a5568",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontWeight: "500",
    color: "#4a5568",
  },
  infoValue: {
    flex: 1,
    color: "#2d3748",
  },
  warningBox: {
    backgroundColor: "#fff5f5",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fed7d7",
  },
  warningText: {
    color: "#c53030",
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  deleteButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 10,
  },
  btnGradient: {
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  notificationContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  notificationGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  notificationText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
});

export default DeleteProduct;
