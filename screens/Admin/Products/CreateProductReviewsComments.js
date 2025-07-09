import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMessage,
  getAllProducts,
  reviewProduct,
} from "../../../redux/features/auth/productActions";
import Layout from "../../../components/Layout/Layout";

const CreateProductReviewsComments = () => {
  const dispatch = useDispatch();
  const { products, loading, message } = useSelector((state) => state.product);

  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(clearMessage());
  }, []);

  useEffect(() => {
    if (message?.includes("Reviewed")) {
      Alert.alert(message);
      dispatch(clearMessage());
    }
    dispatch(clearMessage());
  }, [message]);

  const handleReviewSubmit = () => {
    if (!productId || !rating || !comment.trim()) {
      Alert.alert("All fields are required");
      return;
    }

    dispatch(reviewProduct(productId, { rating, comment }));
    setRating("5");
    setComment("");
    setProductId("");
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Submit Product Review</Text>

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

        <Text style={styles.label}>Rating</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={rating}
            onValueChange={(value) => setRating(value)}
          >
            <Picker.Item label="1 - Poor" value="1" />
            <Picker.Item label="2 - Fair" value="2" />
            <Picker.Item label="3 - Good" value="3" />
            <Picker.Item label="4 - Very Good" value="4" />
            <Picker.Item label="5 - Excellent" value="5" />
          </Picker>
        </View>

        <Text style={styles.label}>Comment</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          placeholder="Write your review..."
        />

        {loading && (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        )}
        {message && <Text style={styles.message}>{message}</Text>}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleReviewSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { margin: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  label: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
  },
  message: { color: "green", textAlign: "center", marginVertical: 10 },
  submitButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default CreateProductReviewsComments;
