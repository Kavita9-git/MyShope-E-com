import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  getWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlistError,
  clearWishlistMessage,
} from "../redux/features/auth/wishlistActions";
import Layout from "../components/Layout/Layout";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { clearError, clearMessage } from "../redux/features/auth/cartActions";

const WishList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    wishlistItems = [],
    loading,
    error,
    message = "",
  } = useSelector((state) => state.wishlist || {});

  // Local state for handling UI feedback
  const [removingItemId, setRemovingItemId] = useState(null);

  // Load wishlist data from Redux and clear any previous errors
  useEffect(() => {
    // Clear any existing errors or messages when component mounts
    dispatch(clearWishlistMessage());
    dispatch(clearWishlistError());
    dispatch(clearMessage());
    dispatch(clearError());

    // Then fetch the wishlist
    dispatch(getWishlist());

    return () => {
      // Clean up when unmounting
      dispatch(clearWishlistError());
      dispatch(clearWishlistMessage());
    };
  }, [dispatch]);

  // Show success messages with toast
  useEffect(() => {
    if (message) {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: message,
        position: "bottom",
        visibilityTime: 2000,
      });

      dispatch(clearWishlistMessage());
    }
  }, [message, dispatch]);

  // Show error messages with toast (only for user actions)
  useEffect(() => {
    if (error && removingItemId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
        position: "bottom",
        visibilityTime: 2000,
      });
      dispatch(clearWishlistError());
    }
  }, [error, removingItemId, dispatch]);

  // Handle move to cart
  const handleMoveToCart = (item) => {
    dispatch(moveToCart(item))
      .then(() => {
        // Success message will be handled by the useEffect
      })
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to move item to cart",
          position: "bottom",
        });
      });
  };

  // Handle remove from wishlist
  const handleRemoveItem = (item) => {
    // Set the removing item ID to show loading state
    setRemovingItemId(item._id);

    try {
      dispatch(removeFromWishlist(item))
        .then(() => {
          // console.log("Item removal dispatched");
          // Leave the removingItemId set until we get a success/error response
        })
        .catch((err) => {
          console.error("Error in removal:", err);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to remove item from wishlist",
            position: "bottom",
          });
          setRemovingItemId(null);
        });
    } catch (err) {
      console.error("Exception in removal:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred",
        position: "bottom",
      });
      setRemovingItemId(null);
    }
  };

  // Clear removing state when wishlist items change (item was removed)
  useEffect(() => {
    setRemovingItemId(null);
  }, [wishlistItems.length]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={["#ff9a9e", "#fad0c4"]}
        style={styles.emptyIconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name="heart-off" size={40} color="#fff" />
      </LinearGradient>
      <Text style={styles.emptyText}>Your wishlist is empty</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate("home")}
      >
        <LinearGradient
          colors={["#1e3c72", "#2a5298"]}
          style={styles.shopButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View style={styles.emptyContainer}>
      <ActivityIndicator size="large" color="#1e3c72" />
      <Text style={styles.emptyText}>Loading wishlist...</Text>
    </View>
  );

  return (
    <Layout showBackButton={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <Icon name="heart" size={40} color="#fff" />
              <Text style={styles.headerTitle}>
                My Wishlist ({wishlistItems ? wishlistItems.length : 0})
              </Text>
              <Text style={styles.headerSubtitle}>
                Items you've saved for later
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#ebf8ff" }]}>
              <Feather name="heart" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{wishlistItems.length}</Text>
              <Text style={styles.statLabel}>Saved Items</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#feebef" }]}>
              <Feather name="shopping-cart" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Cart</Text>
              <Text style={styles.statLabel}>Add items to cart</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("cart")}>
              <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color="#a0aec0"
                style={styles.statArrow}
              />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          renderLoading()
        ) : !wishlistItems || wishlistItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Text style={styles.sectionTitle}>Saved Items</Text>
            <View style={styles.sectionCard}>
              {wishlistItems.map((item, index) => (
                <View key={index} style={styles.optionButton}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("productDetails", {
                        _id: item?.productId?._id,
                      })
                    }
                    style={styles.productImageContainer}
                  >
                    <Image
                      source={{
                        uri: item?.image.startsWith("http")
                          ? item?.image
                          : `https://nodejsapp-hfpl.onrender.com${item?.image}`,
                      }}
                      style={styles.productImage}
                    />
                  </TouchableOpacity>

                  <View style={styles.btnTextContainer}>
                    <Text style={styles.btnText} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.priceText}>₹{item.price}</Text>

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => handleMoveToCart(item)}
                      >
                        <LinearGradient
                          colors={["#4facfe", "#00f2fe"]}
                          style={styles.cartButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <Icon name="cart-plus" size={16} color="#fff" />
                          <Text style={styles.buttonText}>Add to Cart</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeButton}
                        disabled={removingItemId === item._id}
                        onPress={() => handleRemoveItem(item)}
                      >
                        <LinearGradient
                          colors={["#FF5E62", "#FF9966"]}
                          style={styles.removeButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {removingItemId === item._id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Icon
                              name="delete-outline"
                              size={18}
                              color="#fff"
                            />
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Wishlist v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    minHeight: "100%",
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 25,
    marginTop: -25,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statIconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
  },
  statArrow: {
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    paddingHorizontal: 15,
    color: "#333",
  },
  sectionCard: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  optionButton: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productImageContainer: {
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  btnTextContainer: {
    flex: 1,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e67e22",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  cartButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "500",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  removeButtonGradient: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  shopButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  shopButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  shopButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  footerText: {
    color: "#a0aec0",
    fontSize: 12,
  },
});

export default WishList;
