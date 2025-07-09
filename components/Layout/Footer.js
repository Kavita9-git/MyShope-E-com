import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/auth/userActions";
import { useReduxStateHook } from "../../hooks/customHook";

// Define colors for a clean theme
const ACTIVE_COLOR = "#007BFF"; // Primary blue for active states
const INACTIVE_COLOR = "#616161"; // Darker gray for inactive states
const BACKGROUND_COLOR = "#FFFFFF"; // Changed to pure white for a cleaner curve effect
const Footer = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const loading = useReduxStateHook(navigation, "login");

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(items?.length || 0);
  }, [items]);

  return (
    <View style={styles.footerContainer}>
      {/* Home */}
      <TouchableOpacity
        style={styles.menuContainer}
        onPress={() => navigation.navigate("home")}
      >
        <AntDesign
          name="home"
          style={[
            styles.icon,
            route.name === "home"
              ? { color: ACTIVE_COLOR }
              : { color: INACTIVE_COLOR },
          ]}
        />
        <Text
          style={[
            styles.iconText,
            route.name === "home"
              ? { color: ACTIVE_COLOR }
              : { color: INACTIVE_COLOR },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Notifications */}
      <TouchableOpacity
        style={styles.menuContainer}
        onPress={() => navigation.navigate("notifications")}
      >
        <AntDesign
          name="bells"
          style={[
            styles.icon,
            route.name === "notifications"
              ? { color: ACTIVE_COLOR }
              : { color: INACTIVE_COLOR },
          ]}
        />
        <Text
          style={[
            styles.iconText,
            route.name === "notifications"
              ? { color: ACTIVE_COLOR }
              : { color: INACTIVE_COLOR },
          ]}
        >
          Notify
        </Text>
      </TouchableOpacity>

      {/* Account */}
      <TouchableOpacity
        style={styles.menuContainer}
        onPress={() => navigation.navigate("account")}
      >
        <AntDesign
          name="user"
          style={[
            styles.icon,
            route.name === "account"
              ? { color: ACTIVE_COLOR }
              : { color: INACTIVE_COLOR },
          ]}
        />
        <Text
          style={[
            styles.iconText,
            route.name === "account"
              ? { color: ACTIVE_COLOR }
              : { color: INACTIVE_COLOR },
          ]}
        >
          Account
        </Text>
      </TouchableOpacity>

      {/* Cart */}
      <TouchableOpacity
        style={styles.menuContainer}
        onPress={() => navigation.navigate("cart")}
      >
        <View style={styles.cartIconWrapper}>
          <AntDesign
            name="shoppingcart"
            style={[
              styles.icon,
              route.name === "cart"
                ? { color: ACTIVE_COLOR }
                : { color: INACTIVE_COLOR },
            ]}
          />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.iconText,
            route.name === "cart"
              ? { color: ACTIVE_COLOR }
              : { color: INACTIVE_COLOR },
          ]}
        >
          Cart
        </Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.menuContainer}
        onPress={async () => {
          await dispatch(logout());
          navigation.reset({
            index: 0,
            routes: [{ name: "login" }],
          });
        }}
      >
        <AntDesign name="poweroff" style={styles.icon} />
        <Text style={styles.iconText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR, // Pure white for better curve visibility
    paddingVertical: 6,
    elevation: 8, // Increased elevation for a floating effect
    shadowColor: "#000",
    shadowOpacity: 0.15, // Slightly more visible shadow
    shadowOffset: { width: 0, height: -4 }, // More pronounced upwards shadow
    shadowRadius: 8,
    // Key properties for curved shape:
    borderTopLeftRadius: 25, // Adjust this value for desired curve
    borderTopRightRadius: 25, // Adjust this value for desired curve
    overflow: "hidden", // Essential to clip content and shadow correctly with border radius
    // No top border needed if we have a strong radius and shadow
    // borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor: "#E0E0E0",
  },
  menuContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 2,
  },
  icon: {
    fontSize: 22,
  },
  iconText: {
    fontSize: 9,
    color: INACTIVE_COLOR,
    marginTop: 2,
    fontWeight: "500",
  },
  cartIconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    paddingHorizontal: 4,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
});
