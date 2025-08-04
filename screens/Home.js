import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Categories from '../components/Layout/category/Categories';
import Banner from '../components/Banner/Banner';
import Products from '../components/Products/Products';
import Header from '../components/Layout/Header';
import { useDispatch, useSelector } from 'react-redux';
import { getUserData } from '../redux/features/auth/userActions';
import { getAllOrders } from '../redux/features/auth/orderActions';
import { getAllProducts } from '../redux/features/auth/productActions';
import { getCart } from '../redux/features/auth/cartActions';
import { getAllCategories } from '../redux/features/auth/categoryActions';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { item } = useSelector(state => state.cart);
  const { products } = useSelector(state => state.product);
  const { categories } = useSelector(state => state.category);

  // Search state (just for navigation)
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(getUserData());
    dispatch(getAllOrders());
    dispatch(getAllProducts());
    dispatch(getCart());
    dispatch(getAllCategories());
  }, []);

  useEffect(() => {
    dispatch(getUserData());
    dispatch(getAllOrders());
    dispatch(getAllProducts());
    dispatch(getCart());
    dispatch(getAllCategories());
  }, [dispatch, Products]);

  // useEffect(() => {
  //   dispatch(getAllProducts());
  // });

  // Handle search navigation
  const handleSearch = () => {
    if (searchText.trim()) {
      navigation.navigate('SearchResults', {
        initialSearchText: searchText.trim(),
      });
      setSearchText('');
    }
  };

  return (
    <Layout>
      <Header />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#1e3c72', '#2a5298']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <AntDesign name="appstore1" size={24} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Welcome to MyShop</Text>
              <Text style={styles.headerSubtitle}>Discover amazing products</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Simple Search Bar (no filtering) */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchText !== '' && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color="#999" style={styles.clearIcon} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#ebf8ff' }]}>
              <Feather name="tag" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Hot Deals</Text>
              <Text style={styles.statLabel}>Special offers</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={16}
              color="#a0aec0"
              style={styles.statArrow}
            />
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#feebef' }]}>
              <Feather name="trending-up" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Trending</Text>
              <Text style={styles.statLabel}>Popular items</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={16}
              color="#a0aec0"
              style={styles.statArrow}
            />
          </View>
        </View>

        {/* Categories Section */}
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <Categories />

        {/* Banner Section */}
        <Text style={styles.sectionTitle}>Featured Deals</Text>
        <Banner />

        {/* Products Section */}
        <Text style={styles.sectionTitle}>Popular Products</Text>
        <Products />

        <View style={styles.footer}>
          <Text style={styles.footerText}>MyShop eCommerce v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    minHeight: '100%',
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    marginLeft: 5,
  },
  filterButton: {
    backgroundColor: '#1e3c72',
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statIconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
  },
  statArrow: {
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 15,
    color: '#333',
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#a0aec0',
    fontSize: 12,
  },
});
