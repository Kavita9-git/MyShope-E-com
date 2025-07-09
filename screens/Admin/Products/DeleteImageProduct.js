import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProducts,
  deleteProductImage,
  deleteAllProductImages,
} from "../../../redux/features/auth/productActions";
import Layout from "../../../components/Layout/Layout";

const DeleteImageProduct = () => {
  const dispatch = useDispatch();
  const { products, loading, message } = useSelector((state) => state.product);

  const [productId, setProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(getAllProducts());
    // console.log(products);
  }, []);

  useEffect(() => {
    const prod = products.find((p) => p._id === productId);
    setSelectedProduct(prod || null);
  }, [productId, products]);

  const handleDeleteImage = (productId, img, color = null) => {
    console.log("img :", img);
    console.log("color :", color);
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            dispatch(deleteProductImage(productId, img, color));
          },
        },
      ]
    );
  };

  const handleDeleteAllImages = () => {
    Alert.alert(
      "Confirm Delete All",
      "Are you sure you want to delete ALL images of this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          onPress: () => {
            dispatch(deleteAllProductImages(productId));
          },
        },
      ]
    );
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Manage Product Images</Text>

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

        {selectedProduct && (
          <>
            <Text style={styles.subtitle}>General Images</Text>
            <View style={styles.imageList}>
              {selectedProduct?.images?.map((img) => (
                <View key={img._id} style={styles.imageCard}>
                  <Image
                    source={{
                      uri: `https://nodejsapp-hfpl.onrender.com${img.url}`,
                    }}
                    style={styles.image}
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteImage(productId, img.url, null)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text style={styles.subtitle}>Color Images</Text>
            {selectedProduct.colors?.map((colorItem, index) => (
              <View key={index} style={styles.colorBlock}>
                <Text style={styles.colorName}>{colorItem.color}</Text>
                <View style={styles.imageList}>
                  {colorItem.images?.map((img) => (
                    <View key={img._id} style={styles.imageCard}>
                      <Image
                        source={{
                          uri: `https://nodejsapp-hfpl.onrender.com${img}`,
                        }}
                        style={styles.image}
                      />
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          handleDeleteImage(productId, img, colorItem.colorName)
                        }
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={handleDeleteAllImages}
            >
              <Text style={styles.deleteAllButtonText}>DELETE ALL IMAGES</Text>
            </TouchableOpacity> */}
          </>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
  },
  imageList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageCard: {
    margin: 5,
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  deleteButton: {
    marginTop: 5,
    backgroundColor: "#ff4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  deleteAllButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 50,
  },
  deleteAllButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  message: {
    color: "green",
    textAlign: "center",
    marginVertical: 10,
  },
  colorBlock: {
    marginTop: 15,
  },
  colorName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default DeleteImageProduct;
