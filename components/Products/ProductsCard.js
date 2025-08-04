import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearError,
  clearMessage,
} from "../../redux/features/auth/cartActions";
import {
  addToWishlist,
  clearWishlistError,
  clearWishlistMessage,
} from "../../redux/features/auth/wishlistActions";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import DisplayMessage from "../Message/DisplayMessage";
import { getAllProducts } from "../../redux/features/auth/productActions";

const { width } = Dimensions.get("window");

const ProductsCard = ({ p }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  // console.log("p :", p);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  // Get cart loading state from Redux
  const { loading: cartLoading, error: cartError } = useSelector(
    (state) => state.cart
  );
  const {
    loading: productLoading,
    error: productError,
    products,
  } = useSelector((state) => state.product);

  // console.log("p :", p);

  useEffect(() => {
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  }, [successMessage, errorMessage]);

  const handleMoreButton = (id) => {
    navigation.navigate("productDetails", { _id: id });
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      const selectedSizeData = selectedColor?.sizes?.find(
        (s) => s.size === selectedSize
      );

      const item = {
        productId: p?._id,
        name: p?.name,
        price: selectedSizeData?.price || p?.price,
        image: selectedColor?.images?.[0] || p?.images?.[0]?.url,
        quantity: 1,
        size: selectedSize || "",
        color: selectedColor?.colorName || "",
      };

      // console.log("Adding item to cart:", item);

      // Check if the selected size has stock
      if (selectedSizeData && selectedSizeData.stock <= 0) {
        setErrorMessage("Sorry, this size is out of stock");
        setIsAddingToCart(false);
        return;
      }

      const result = await dispatch(addToCart(item));

      if (result.type === "addToCartSuccess") {
        dispatch(clearMessage());
        dispatch(clearError());
        setSuccessMessage("Product added to cart");
        setModalVisible(false);
        // Reset selections for next time
        setSelectedColor(null);
        setSelectedSize(null);
      } else if (result.type === "addToCartFail") {
        setErrorMessage(result.payload || "Failed to add product to cart");
      }
    } catch (error) {
      console.log("Error adding to cart:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCartPress = async () => {
    if (p.category?.category?.toLowerCase() === "clothes") {
      setModalVisible(true);
    } else {
      try {
        setIsAddingToCart(true);

        // Check if product has stock
        if (p.stock <= 0) {
          setErrorMessage("Sorry, this item is out of stock");
          setIsAddingToCart(false);
          return;
        }
        console.log("p :", p);
        const item = {
          productId: p?._id,
          name: p?.name,
          price: p?.price,
          image: p?.images?.[0]?.url,
          quantity: 1,
          size: "",
          color: "",
        };

        console.log("Adding non-clothing item to cart:", item);

        const result = await dispatch(addToCart(item));

        if (result.type === "addToCartSuccess") {
          dispatch(clearMessage());
          dispatch(clearError());
          setSuccessMessage("Product added to cart");
        } else if (result.type === "addToCartFail") {
          setErrorMessage(result.payload || "Failed to add product to cart");
        }
      } catch (error) {
        console.log("Error adding to cart:", error);
        setErrorMessage("Something went wrong. Please try again.");
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  const handleWishlistPress = async () => {
    // For clothing products, show modal to select color and size
    if (p.category?.category?.toLowerCase() === "clothes") {
      setWishlistModalVisible(true);
    } else {
      try {
        setIsAddingToWishlist(true);
        // For non-clothing products, add directly to wishlist
        const item = {
          productId: p._id,
          name: p.name,
          price: p.price,
          image: p.images?.[0]?.url,
        };
        // console.log("item in wishlist :", item);
        await dispatch(addToWishlist(item));
        dispatch(clearWishlistMessage());
        dispatch(clearWishlistError());
        // Toast.show({
        //   type: "success",
        //   text1: "Success!",
        //   text2: "Product added to wishlist",
        //   position: "bottom",
        // });
        setSuccessMessage("Product added to wishlist");
      } catch (error) {
        console.log("Error adding to wishlist:", error);
        // Toast.show({
        //   type: "error",
        //   text1: "Error",
        //   text2: "Failed to add to wishlist",
        //   position: "bottom",
        // });
        setErrorMessage("Failed to add to wishlist");
      } finally {
        setIsAddingToWishlist(false);
      }
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setIsAddingToWishlist(true);
      const selectedSizeData = selectedColor?.sizes?.find(
        (s) => s.size === selectedSize
      );

      const item = {
        productId: p._id,
        name: p.name,
        price: selectedSizeData?.price || p.price,
        image: selectedColor?.images?.[0] || p.images?.[0]?.url,
        size: selectedSize,
        color: selectedColor?.colorName,
      };

      await dispatch(addToWishlist(item));
      setWishlistModalVisible(false);
      // Toast.show({
      //   type: "success",
      //   text1: "Success!",
      //   text2: "Product added to wishlist",
      //   position: "bottom",
      // });
      setSuccessMessage("Product added to wishlist");
      // Reset selections for next time
      setSelectedColor(null);
      setSelectedSize(null);
    } catch (error) {
      console.log("Error adding to wishlist:", error);
      // Toast.show({
      //   type: "error",
      //   text1: "Error",
      //   text2: "Failed to add to wishlist",
      //   position: "bottom",
      // });
      setErrorMessage("Failed to add to wishlist");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const availableColors = p?.colors || [];
  const availableSizes = selectedColor?.sizes || [];

  // Get category icon
  const getCategoryIcon = () => {
    const category = p?.category?.category?.toLowerCase() || "";

    if (
      category.includes("electronics") ||
      category.includes("phone") ||
      category.includes("computer")
    ) {
      return <Feather name="smartphone" size={14} color="#3182ce" />;
    } else if (
      category.includes("cloth") ||
      category.includes("fashion") ||
      category.includes("wear")
    ) {
      return <Feather name="shopping-bag" size={14} color="#805ad5" />;
    } else if (category.includes("food") || category.includes("grocery")) {
      return <Feather name="coffee" size={14} color="#dd6b20" />;
    } else if (category.includes("book")) {
      return <Feather name="book" size={14} color="#38a169" />;
    } else {
      return <Feather name="package" size={14} color="#3182ce" />;
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={() => handleMoreButton(p?._id)}
        activeOpacity={0.8}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <LinearGradient
            colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0)"]}
            style={styles.imageOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.6 }}
          />
          <Image
            // source={{
            //   uri: `https://nodejsapp-hfpl.onrender.com${p?.images[0]?.url}`,
            // }}
            source={{
              uri: p?.images[0]?.url.startsWith("http")
                ? p?.images[0]?.url
                : `https://nodejsapp-hfpl.onrender.com${p?.images[0]?.url}`,
            }}
            style={styles.cardImage}
          />

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            {getCategoryIcon()}
            <Text style={styles.categoryText}>
              {p?.category?.category || "Product"}
            </Text>
          </View>

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleWishlistPress}
            disabled={isAddingToWishlist}
          >
            <LinearGradient
              colors={["#ff416c", "#ff4b2b"]}
              style={styles.wishlistGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isAddingToWishlist ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <AntDesign name="heart" size={16} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {p?.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>₹ {p?.price}</Text>
            {p?.stock <= 5 && p?.stock > 0 ? (
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>Only {p?.stock} left</Text>
              </View>
            ) : p?.stock <= 0 ? (
              <View style={[styles.stockBadge, styles.outOfStockBadge]}>
                <Text style={styles.stockText}>Out of stock</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star, index) => (
              <AntDesign
                key={index}
                name={index < (p?.rating || 0) ? "star" : "staro"}
                size={12}
                color={index < (p?.rating || 0) ? "#FFB800" : "#ccc"}
                style={styles.starIcon}
              />
            ))}
            <Text style={styles.reviewCount}>({p?.numReviews || 0})</Text>
          </View>
          <DisplayMessage successMessage={successMessage} messageType="added" />
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => handleMoreButton(p?._id)}
            >
              <Feather name="eye" size={12} color="#333" />
              {/* <Text style={styles.btnText}></Text> */}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cartButton,
                p?.stock <= 0 && styles.disabledButton,
              ]}
              onPress={handleCartPress}
              disabled={isAddingToCart || p?.stock <= 0}
            >
              <LinearGradient
                colors={
                  p?.stock <= 0
                    ? ["#cccccc", "#999999"]
                    : ["#1e3c72", "#2a5298"]
                }
                style={styles.cartButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isAddingToCart ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather
                      name="shopping-cart"
                      size={14}
                      color="#fff"
                      style={styles.cartIcon}
                    />
                    <Text style={styles.cartBtnText}>Add to Cart</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Cart Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Header with product image and close button */}
            <View style={styles.modalHeader}>
              <Image
                source={{
                  uri: p?.images[0]?.url.startsWith("http")
                    ? p?.images[0]?.url
                    : `https://nodejsapp-hfpl.onrender.com${p?.images[0]?.url}`,
                }}
                style={styles.modalProductImage}
              />
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalProductTitle} numberOfLines={2}>
                  {p?.name}
                </Text>
                <Text style={styles.modalProductPrice}>₹ {p?.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Color Selection */}
              <View style={styles.selectionSection}>
                <Text style={styles.sectionTitle}>
                  <Icon name="palette" size={18} color="#333" /> Select Color
                </Text>
                <View style={styles.optionsContainer}>
                  {availableColors.map((color) => (
                    <TouchableOpacity
                      key={color.colorId}
                      style={[
                        styles.colorOption,
                        selectedColor?.colorId === color.colorId &&
                          styles.colorSelected,
                      ]}
                      onPress={() => {
                        setSelectedColor(color);
                        setSelectedSize(null);
                      }}
                    >
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: color.colorCode },
                        ]}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          selectedColor?.colorId === color.colorId &&
                            styles.selectedOptionText,
                        ]}
                      >
                        {color.colorName}
                      </Text>
                      {selectedColor?.colorId === color.colorId && (
                        <Icon name="check" size={16} color="#1e3c72" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Size Selection */}
              {selectedColor && availableSizes.length > 0 && (
                <View style={styles.selectionSection}>
                  <Text style={styles.sectionTitle}>
                    <Icon name="ruler" size={18} color="#333" /> Select Size
                  </Text>
                  <View style={styles.optionsContainer}>
                    {availableSizes.map((sizeObj) => (
                      <TouchableOpacity
                        key={sizeObj.size}
                        style={[
                          styles.sizeOption,
                          selectedSize === sizeObj.size && styles.sizeSelected,
                          sizeObj.stock <= 0 && styles.outOfStock,
                        ]}
                        onPress={() => setSelectedSize(sizeObj.size)}
                        disabled={sizeObj.stock <= 0}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedSize === sizeObj.size &&
                              styles.selectedOptionText,
                            sizeObj.stock <= 0 && styles.outOfStockText,
                          ]}
                        >
                          {sizeObj.size}
                        </Text>
                        {sizeObj.price && (
                          <Text
                            style={[
                              styles.sizePrice,
                              sizeObj.stock <= 0 && styles.outOfStockText,
                            ]}
                          >
                            ₹{sizeObj.price}
                          </Text>
                        )}
                        {sizeObj.stock <= 0 && (
                          <Text style={styles.outOfStockLabel}>
                            Out of stock
                          </Text>
                        )}
                        {selectedSize === sizeObj.size && sizeObj.stock > 0 && (
                          <Icon name="check" size={16} color="#1e3c72" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Add to Cart Button */}
              <TouchableOpacity
                style={[
                  styles.modalActionButton,
                  (isAddingToCart ||
                    !selectedColor ||
                    (availableSizes.length > 0 && !selectedSize)) &&
                    styles.disabledButton,
                ]}
                onPress={handleAddToCart}
                disabled={
                  isAddingToCart ||
                  !selectedColor ||
                  (availableSizes.length > 0 && !selectedSize)
                }
              >
                <LinearGradient
                  colors={
                    !selectedColor ||
                    (availableSizes.length > 0 && !selectedSize)
                      ? ["#cccccc", "#999999"]
                      : ["#1e3c72", "#2a5298"]
                  }
                  style={styles.modalActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isAddingToCart ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather
                        name="shopping-cart"
                        size={18}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.modalActionText}>Add to Cart</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {errorMessage && (
                <View style={styles.modalErrorContainer}>
                  <Text style={styles.modalErrorText}>{errorMessage}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Wishlist Modal */}
      <Modal
        transparent={true}
        visible={wishlistModalVisible}
        animationType="fade"
        onRequestClose={() => setWishlistModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Header with product image and close button */}
            <View style={styles.modalHeader}>
              <Image
                source={{
                  uri: p?.images[0]?.url.startsWith("http")
                    ? p?.images[0]?.url
                    : `https://nodejsapp-hfpl.onrender.com${p?.images[0]?.url}`,
                }}
                style={styles.modalProductImage}
              />
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalProductTitle} numberOfLines={2}>
                  {p?.name}
                </Text>
                <Text style={styles.modalProductPrice}>₹ {p?.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setWishlistModalVisible(false)}
              >
                <Icon name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Color Selection */}
              <View style={styles.selectionSection}>
                <Text style={styles.sectionTitle}>
                  <Icon name="palette" size={18} color="#333" /> Select Color
                </Text>
                <View style={styles.optionsContainer}>
                  {availableColors.map((color) => (
                    <TouchableOpacity
                      key={color.colorId}
                      style={[
                        styles.colorOption,
                        selectedColor?.colorId === color.colorId &&
                          styles.colorSelected,
                      ]}
                      onPress={() => {
                        setSelectedColor(color);
                        setSelectedSize(null);
                      }}
                    >
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: color.colorCode },
                        ]}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          selectedColor?.colorId === color.colorId &&
                            styles.selectedOptionText,
                        ]}
                      >
                        {color.colorName}
                      </Text>
                      {selectedColor?.colorId === color.colorId && (
                        <Icon name="check" size={16} color="#1e3c72" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Size Selection */}
              {selectedColor && availableSizes.length > 0 && (
                <View style={styles.selectionSection}>
                  <Text style={styles.sectionTitle}>
                    <Icon name="ruler" size={18} color="#333" /> Select Size
                  </Text>
                  <View style={styles.optionsContainer}>
                    {availableSizes.map((sizeObj) => (
                      <TouchableOpacity
                        key={sizeObj.size}
                        style={[
                          styles.sizeOption,
                          selectedSize === sizeObj.size && styles.sizeSelected,
                          sizeObj.stock <= 0 && styles.outOfStock,
                        ]}
                        onPress={() => setSelectedSize(sizeObj.size)}
                        disabled={sizeObj.stock <= 0}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedSize === sizeObj.size &&
                              styles.selectedOptionText,
                            sizeObj.stock <= 0 && styles.outOfStockText,
                          ]}
                        >
                          {sizeObj.size}
                        </Text>
                        {sizeObj.price && (
                          <Text
                            style={[
                              styles.sizePrice,
                              sizeObj.stock <= 0 && styles.outOfStockText,
                            ]}
                          >
                            ₹{sizeObj.price}
                          </Text>
                        )}
                        {selectedSize === sizeObj.size && (
                          <Icon name="check" size={16} color="#1e3c72" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Add to Wishlist Button */}
              <TouchableOpacity
                style={[
                  styles.modalActionButton,
                  (isAddingToWishlist ||
                    !selectedColor ||
                    (availableSizes.length > 0 && !selectedSize)) &&
                    styles.disabledButton,
                ]}
                onPress={handleAddToWishlist}
                disabled={
                  isAddingToWishlist ||
                  !selectedColor ||
                  (availableSizes.length > 0 && !selectedSize)
                }
              >
                <LinearGradient
                  colors={
                    !selectedColor ||
                    (availableSizes.length > 0 && !selectedSize)
                      ? ["#cccccc", "#999999"]
                      : ["#ff416c", "#ff4b2b"]
                  }
                  style={styles.modalActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isAddingToWishlist ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <AntDesign
                        name="heart"
                        size={18}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.modalActionText}>
                        Add to Wishlist
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: (width - 40) / 2,
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  imageContainer: {
    position: "relative",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
  },
  wishlistGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    height: 38,
    lineHeight: 19,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3c72",
  },
  stockBadge: {
    backgroundColor: "#feebef",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  outOfStockBadge: {
    backgroundColor: "#f0f0f0",
  },
  stockText: {
    fontSize: 10,
    color: "#e53e3e",
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  starIcon: {
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 10,
    color: "#718096",
    marginLeft: 2,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 6,
    borderRadius: 4,
    marginVertical: 5,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 10,
    textAlign: "center",
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f5f7fa",
    borderWidth: 1,
    borderColor: "#e0e5eb",
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
    flexDirection: "row",
  },
  btnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  cartButton: {
    width: "65%",
    borderRadius: 6,
    overflow: "hidden",
  },
  cartButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  cartIcon: {
    marginRight: 6,
  },
  cartBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  modalProductImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalProductTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  modalProductPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3c72",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  selectionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e5eb",
  },
  colorSelected: {
    borderColor: "#1e3c72",
    backgroundColor: "#ebf4ff",
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    marginRight: 5,
  },
  selectedOptionText: {
    fontWeight: "600",
    color: "#1e3c72",
  },
  sizeOption: {
    backgroundColor: "#f5f7fa",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e5eb",
    flexDirection: "row",
    alignItems: "center",
  },
  sizeSelected: {
    borderColor: "#1e3c72",
    backgroundColor: "#ebf4ff",
  },
  sizePrice: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  outOfStock: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
    opacity: 0.6,
  },
  outOfStockText: {
    color: "#999",
  },
  outOfStockLabel: {
    fontSize: 10,
    color: "#e53e3e",
    marginLeft: 5,
    fontStyle: "italic",
  },
  modalActionButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  modalActionGradient: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  modalActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalErrorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 6,
    marginTop: 15,
  },
  modalErrorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ProductsCard;
