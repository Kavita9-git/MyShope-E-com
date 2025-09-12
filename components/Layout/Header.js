// Add wishlist button to header next to the cart button

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import React from "react";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from "../../services/NotificationService";

const Header = () => {
  const navigation = useNavigation();
  const { items } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.user);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  //state
  const userImage = user?.profilePic?.url;
  // console.log("userImage :", userImage);
  const cartItemsCount = items?.length || 0;
  const wishlistItemsCount = wishlistItems?.length || 0;

  // Get unread notifications count (both server and local)
  useEffect(() => {
    const getUnreadCount = async () => {
      try {
        let totalUnread = 0;
        
        // Get local notifications count
        const localCount = await notificationService.getUnreadCount();
        console.log('📱 Local unread notifications count:', localCount);
        totalUnread += localCount;
        
        // Get server notifications count if user is authenticated
        try {
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const { user, token } = JSON.parse(userData);
            const response = await fetch(`https://nodejsapp-hfpl.onrender.com/api/v1/notification/user/${user._id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data.notifications) {
                console.log('🔔 Total server notifications:', data.data.notifications.length);
                
                // Filter out test notifications and count unread ones
                const unreadServerNotifications = data.data.notifications.filter(notification => {
                  const isTestNotification = 
                    notification.data?.test === true ||
                    notification.title?.toLowerCase().includes('test') ||
                    notification.message?.toLowerCase().includes('test') ||
                    notification.body?.toLowerCase().includes('test') ||
                    (notification.data?.orderId && notification.data.orderId.includes('test')) ||
                    (notification.data?.productId && notification.data.productId.includes('test'));
                  
                  const isUnread = notification.status === 'unread';
                  console.log(`📋 Notification "${notification.title}" - Status: ${notification.status}, IsTest: ${isTestNotification}, IsUnread: ${isUnread}`);
                  
                  return !isTestNotification && isUnread;
                });
                
                console.log('✅ Server unread notifications count:', unreadServerNotifications.length);
                totalUnread += unreadServerNotifications.length;
              }
            }
          }
        } catch (serverError) {
          console.log('Could not fetch server notifications for count:', serverError.message);
        }
        
        console.log('🔢 Total unread notifications:', totalUnread);
        setUnreadNotifications(totalUnread);
      } catch (error) {
        console.error('Error getting unread notifications count:', error);
        setUnreadNotifications(0);
      }
    };

    getUnreadCount();
    
    // Update count every 30 seconds
    const interval = setInterval(getUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <StatusBar backgroundColor="#1e3c72" barStyle="light-content" />
      <LinearGradient
        colors={["#1e3c72", "#2a5298"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.innerContainer}>
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => navigation.navigate("home")}
          >
            {/* <View style={styles.logoIconContainer}>
              <AntDesign name="appstore1" size={20} color="#fff" />
            </View> */}
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>My</Text>
              <Text style={styles.logoSubTitle}>Shop</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.navContainer}>
            {/* Account */}
            <TouchableOpacity
              onPress={() => navigation.navigate("account")}
              style={styles.navButtonContainer}
            >
              <View style={styles.navIconCircle}>
                {userImage ? (
                  <Image
                    source={{
                      uri: userImage?.startsWith("http")
                        ? userImage
                        : `https://nodejsapp-hfpl.onrender.com${userImage}`,
                    }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                ) : (
                  <FontAwesome5 name="user-circle" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.navText}>Account</Text>
            </TouchableOpacity>

            {/* Wishlist */}
            <TouchableOpacity
              onPress={() => navigation.navigate("wishlist")}
              style={styles.navButtonContainer}
            >
              <View style={styles.iconContainer}>
                <View
                  style={[styles.navIconCircle, { backgroundColor: "#ff416c" }]}
                >
                  <AntDesign name="heart" size={16} color="#fff" />
                </View>
                {wishlistItemsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{wishlistItemsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.navText}>Wishlist</Text>
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity
              onPress={() => navigation.navigate("notifications")}
              style={styles.navButtonContainer}
            >
              <View style={styles.iconContainer}>
                <View
                  style={[styles.navIconCircle, { backgroundColor: "#7c3aed" }]}
                >
                  <AntDesign name="bells" size={16} color="#fff" />
                </View>
                {unreadNotifications > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadNotifications}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.navText}>Notifications</Text>
            </TouchableOpacity>

            {/* Cart */}
            <TouchableOpacity
              onPress={() => navigation.navigate("cart")}
              style={styles.navButtonContainer}
            >
              <View style={styles.iconContainer}>
                <View
                  style={[styles.navIconCircle, { backgroundColor: "#4facfe" }]}
                >
                  <Feather name="shopping-cart" size={16} color="#fff" />
                </View>
                {cartItemsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItemsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.navText}>Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 5,
    paddingBottom: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logoTextContainer: {
    flexDirection: "row",
  },
  logoTitle: {
    fontSize: 20,
    color: "#4cb5f9",
    fontWeight: "bold",
  },
  logoSubTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
  },
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButtonContainer: {
    alignItems: "center",
    marginLeft: 15,
  },
  navIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  navText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "#e47911",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default Header;
