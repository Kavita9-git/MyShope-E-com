import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProducts,
  deleteProduct,
} from "../../../redux/features/auth/productActions";
import Layout from "../../../components/Layout/Layout";

const DeleteProduct = () => {
  const dispatch = useDispatch();
  const { products, loading, message } = useSelector((state) => state.product);

  const [productId, setProductId] = useState("");

  useEffect(() => {
    dispatch(getAllProducts());
  }, []);

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
          },
        },
      ]
    );
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Delete Product</Text>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={productId}
            onValueChange={(value) => setProductId(value)}
          >
            <Picker.Item label="-- Select Product --" value="" />
            {products.map((p) => (
              <Picker.Item key={p._id} label={p.name} value={p._id} />
            ))}
          </Picker>
        </View>

        {loading && (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        )}
        {message && <Text style={styles.message}>{message}</Text>}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteProduct}
        >
          <Text style={styles.deleteButtonText}>DELETE PRODUCT</Text>
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { margin: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  message: {
    color: "green",
    textAlign: "center",
    marginVertical: 10,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default DeleteProduct;
