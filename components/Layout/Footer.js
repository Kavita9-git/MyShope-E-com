import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/features/auth/userActions';
import { useReduxStateHook } from '../../hooks/customHook';
import { getAllProducts } from '../../redux/features/auth/productActions';
import { LinearGradient } from 'expo-linear-gradient';

// Define colors for a clean theme
const ACTIVE_COLOR = '#1e3c72'; // Primary blue for active states
const INACTIVE_COLOR = '#718096'; // Darker gray for inactive states
const BACKGROUND_COLOR = '#FFFFFF'; // Changed to pure white for a cleaner curve effect

const Footer = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);
  const loading = useReduxStateHook(navigation, 'login');

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(items?.length || 0);
  }, [items]);

  // Define menu items with their properties
  const menuItems = [
    {
      name: 'home',
      label: 'Home',
      icon: 'home',
      iconType: 'ant',
      gradient: ['#4facfe', '#00f2fe'],
    },
    {
      name: 'notifications',
      label: 'Notify',
      icon: 'bell',
      iconType: 'feather',
      gradient: ['#b721ff', '#21d4fd'],
    },
    {
      name: 'account',
      label: 'Account',
      icon: 'user',
      iconType: 'ant',
      gradient: ['#6a11cb', '#2575fc'],
    },
    {
      name: 'cart',
      label: 'Cart',
      icon: 'shopping-cart',
      iconType: 'feather',
      gradient: ['#ff9a9e', '#fad0c4'],
      badge: cartCount,
    },
    {
      name: 'logout',
      label: 'Logout',
      icon: 'log-out',
      iconType: 'feather',
      gradient: ['#FF416C', '#FF4B2B'],
    },
  ];

  const handleNavigation = item => {
    if (item.name === 'logout') {
      // Just dispatch logout action, Main.js will handle the navigation
      // when isAuth changes to false
      dispatch(logout());
    } else {
      navigation.navigate(item.name);
    }
  };

  const renderIcon = (item, isActive) => {
    const iconColor = isActive ? '#fff' : '#fff';
    const iconSize = 20;

    switch (item.iconType) {
      case 'feather':
        return <Feather name={item.icon} size={iconSize} color={iconColor} />;
      case 'material':
        return <MaterialIcons name={item.icon} size={iconSize} color={iconColor} />;
      default:
        return <AntDesign name={item.icon} size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={styles.footerContainer}>
      {menuItems.map((item, index) => {
        const isActive = route.name === item.name;
        return (
          <TouchableOpacity
            key={index}
            style={styles.menuContainer}
            onPress={() => handleNavigation(item)}
          >
            <View style={styles.iconOuterContainer}>
              <LinearGradient
                colors={isActive ? item.gradient : ['#a0aec0', '#718096']}
                style={[styles.iconContainer, isActive && styles.activeIconContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {renderIcon(item, isActive)}
                {item.badge > 0 && item.name === 'cart' && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </LinearGradient>
            </View>
            <Text style={[styles.iconText, isActive ? styles.activeIconText : null]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    width: '100%',
  },
  menuContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconOuterContainer: {
    padding: 3,
    borderRadius: 16,
    marginBottom: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIconContainer: {
    transform: [{ scale: 1.05 }],
  },
  iconText: {
    fontSize: 11,
    color: INACTIVE_COLOR,
    marginTop: 4,
    fontWeight: '500',
  },
  activeIconText: {
    color: ACTIVE_COLOR,
    fontWeight: '700',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    zIndex: 1,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
