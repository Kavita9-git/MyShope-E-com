import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/auth/cartActions";
import Toast from "react-native-toast-message";

const ProductsCard = ({ p }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const handleMoreButton = (id) => {
    navigation.navigate("productDetails", { _id: id });
  };

  const handleAddToCart = async () => {
    const selectedSizeData = selectedColor?.sizes?.find(
      (s) => s.size === selectedSize
    );

    const item = {
      productId: p._id,
      name: p.name,
      price: selectedSizeData?.price || p.price,
      image: selectedColor?.images?.[0] || p.images?.[0]?.url,
      quantity: 1,
      size: selectedSize,
      color: selectedColor?.colorName,
    };
    await dispatch(addToCart(item));
    setModalVisible(false);
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: "Product added to cart",
      position: "bottom",
    });
    // alert("Product added to cart");
  };

  const handleCartPress = () => {
    if (p.category?.category?.toLowerCase() === "clothes") {
      setModalVisible(true);
    } else {
      const item = {
        productId: p._id,
        name: p.name,
        price: p.price,
        image: p.images?.[0]?.url,
        quantity: 1,
      };
      dispatch(addToCart(item));
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Product added to cart",
        position: "bottom",
      });
      // alert("Product added to cart");
    }
  };

  const availableColors = p?.colors || [];
  const availableSizes = selectedColor?.sizes || [];

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={() => handleMoreButton(p?._id)}
        activeOpacity={0.8}
        style={styles.card}
      >
        <Image source={{ uri: p?.images[0]?.url }} style={styles.cardImage} />
        <Text style={styles.cardTitle} numberOfLines={2}>
          {p?.name}
        </Text>
        <Text style={styles.cardPrice}>₹ {p?.price}</Text>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleMoreButton(p?._id)}
          >
            <Text style={styles.btnText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
            <Text style={styles.btnText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Color</Text>
            <FlatList
              horizontal
              data={availableColors}
              keyExtractor={(item) => item.colorId}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.optionButton,
                    selectedColor?.colorId === item.colorId &&
                      styles.optionSelected,
                  ]}
                  onPress={() => {
                    setSelectedColor(item);
                    setSelectedSize(null);
                  }}
                >
                  <Text style={styles.optionText}>{item.colorName}</Text>
                </Pressable>
              )}
            />

            {selectedColor && (
              <>
                <Text style={styles.modalTitle}>Select Size</Text>
                <FlatList
                  horizontal
                  data={availableSizes}
                  keyExtractor={(item) => item.size}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.optionButton,
                        selectedSize === item.size && styles.optionSelected,
                      ]}
                      onPress={() => setSelectedSize(item.size)}
                    >
                      <Text style={styles.optionText}>{item.size}</Text>
                    </Pressable>
                  )}
                />
              </>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedColor || !selectedSize) && {
                  backgroundColor: "#ccc",
                },
              ]}
              onPress={handleAddToCart}
              disabled={!selectedColor || !selectedSize}
            >
              <Text style={styles.confirmButtonText}>Confirm Selection</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "48%",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 130,
    borderRadius: 8,
    resizeMode: "cover",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    color: "#333",
  },
  cardPrice: {
    fontSize: 13,
    color: "#666",
    marginVertical: 5,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  detailsButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cartButton: {
    backgroundColor: "#e67e22",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    margin: 5,
  },
  optionSelected: {
    backgroundColor: "#333",
    borderColor: "#333",
  },
  optionText: {
    color: "#333",
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "green",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 25,
  },
  confirmButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelText: {
    marginTop: 15,
    textAlign: "center",
    color: "red",
    fontWeight: "500",
    fontSize: 14,
  },
});

export default ProductsCard;
