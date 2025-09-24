import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Categories from '../components/Layout/category/Categories';
import Banner from '../components/Banner/Banner';
import ProductsCard from '../components/Products/ProductsCard';
import { ProductsData } from '../data/ProductsData';
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
import BestDeals from '../components/BestDeals/BestDeals';
import Trendings from '../components/Trendings/Trendings';


const Home = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { item } = useSelector(state => state.cart);
  const { products, loading: productsLoading } = useSelector(state => state.product);
  const { categories } = useSelector(state => state.category);

  // Search state (just for navigation)
  const [searchText, setSearchText] = useState('');
  const [fallbackMode, setFallbackMode] = useState(false);

  // Load all data when the screen opens/mounts
  useEffect(() => {
    const loadInitialData = () => {
      dispatch(getUserData());
      dispatch(getAllOrders());
      dispatch(getAllProducts());
      dispatch(getCart());
      dispatch(getAllCategories());
    };

    // Load data immediately when component mounts
    loadInitialData();

    // Optional: Set up focus listener to refresh data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh products when screen comes back into focus
      dispatch(getAllProducts());
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, [dispatch, navigation]);

  // Use fallback data if products still not available after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!products || products.length === 0) {
        console.log('Using fallback product data');
        setFallbackMode(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [products]);

  // Handle search navigation
  const handleSearch = () => {
    if (searchText.trim()) {
      navigation.navigate('SearchResults', {
        initialSearchText: searchText.trim(),
      });
      setSearchText('');
    }
  };

  // Get products to display (real or fallback)
  const allProducts = products && products.length > 0 ? products : fallbackMode ? ProductsData : [];

  // Group products by category and limit to 4 per category
  const groupProductsByCategory = () => {
    if (!allProducts.length) return [];

    const grouped = {};

    allProducts.forEach(product => {
      let categoryName = 'Other';

      // Handle different category structures
      if (product.category) {
        if (typeof product.category === 'string') {
          categoryName = product.category;
        } else if (product.category.category) {
          categoryName = product.category.category;
        } else if (product.category._id) {
          categoryName = product.category.name || product.category._id;
        }
      }

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }

      // Only add up to 4 products per category
      if (grouped[categoryName].length < 4) {
        grouped[categoryName].push(product);
      }
    });

    // Convert to array format for rendering
    return Object.keys(grouped).map(categoryName => ({
      categoryName,
      products: grouped[categoryName]
    }));
  };

  const categorizedProducts = groupProductsByCategory();

  // Navigate to view all products in a category
  const handleViewAllCategory = (categoryName) => {
    console.log('Navigating to view all products for category:', categoryName);
    navigation.navigate('SearchResults', {
      categoryFilter: categoryName,
      categoryName: categoryName,
      initialSearchText: '',
    });
  };

  // Render category section
  const renderCategorySection = ({ categoryName, products }) => (
    <View key={categoryName} style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>
        <TouchableOpacity
          onPress={() => handleViewAllCategory(categoryName)}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#1e3c72" />
        </TouchableOpacity>
      </View>
      <View style={styles.categoryProducts}>
        <View style={styles.productsRow}>
          {products.slice(0, 2).map((product, index) => (
            <View key={product._id || index} style={styles.productCard}>
              <ProductsCard p={product} />
            </View>
          ))}
        </View>
        {products.length > 2 && (
          <View style={styles.productsRow}>
            {products.slice(2, 4).map((product, index) => (
              <View key={product._id || index + 2} style={styles.productCard}>
                <ProductsCard p={product} />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Layout>
      <Header />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        {/* <View style={styles.headerContainer}>
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
        </View> */}

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
        {/* <View style={styles.statsContainer}>
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
        </View> */}

        {/* Banner Section */}
        {/* <Text style={styles.sectionTitle}>Featured Deals</Text> */}
        <Banner />

        {/* Categories Section */}
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <Categories />

        {/* Best Deals Section */}
        <BestDeals />
        <Trendings />

        {/* Products Section - Grouped by Category */}
        {productsLoading && !allProducts.length ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : categorizedProducts.length > 0 ? (
          categorizedProducts.map(renderCategorySection)
        ) : (
          <View style={styles.noProductsContainer}>
            <Text style={styles.noProductsText}>No products available</Text>
          </View>
        )}

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
    backgroundColor: '#fff',

    minHeight: '100%',
  },
  categorySection: {
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(30, 60, 114, 0.1)',
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 9,
    color: '#1e3c72',
    fontWeight: '600',
    marginRight: 4,
  },
  categoryProducts: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  productCard: {
    width: '48%',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 10,
    color: '#1e3c72',
    fontWeight: '500',
  },
  noProductsContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
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
    backgroundColor: '#1e3c72',
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
    borderColor: '#fff',
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 25,
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#94999f24',
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
    backgroundColor: '#0075f8',
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
    fontSize: 11,
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
    fontSize: 11,
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
    fontSize: 10,
  },
});
