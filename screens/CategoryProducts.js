import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Products from '../components/Products/Products';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../redux/features/auth/productActions';
import { getAllCategories } from '../redux/features/auth/categoryActions';
import ProductsCard from '../components/Products/ProductsCard';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const CategoryProducts = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const dispatch = useDispatch();
  const { products, loading } = useSelector(state => state.product);
  const { categories } = useSelector(state => state.category);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subSubcategories, setSubSubcategories] = useState([]);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null);

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    const category = categories.find(cat => cat._id === categoryId);
    if (category && category.subcategories) {
      setSubcategories(category.subcategories);
    } else {
      setSubcategories([]);
    }
    // Reset selected subcategory when category changes
    setSelectedSubcategory(null);
    setSelectedSubSubcategory(null);
  }, [categories, categoryId]);

  // Update sub-subcategories when subcategory changes
  useEffect(() => {
    if (selectedSubcategory) {
      const category = categories.find(cat => cat._id === categoryId);
      if (category && category.subcategories) {
        const selectedSubcategoryObj = category.subcategories.find(subcat => {
          let subcategoryName = '';

          if (typeof subcat === 'string') {
            subcategoryName = subcat;
          } else if (subcat && typeof subcat === 'object') {
            if (subcat.name) {
              subcategoryName = subcat.name;
            } else {
              // Handle flawed object-like string format
              const keys = Object.keys(subcat)
                .filter(key => !isNaN(key))
                .sort((a, b) => parseInt(a) - parseInt(b));
              if (keys.length > 0) {
                subcategoryName = keys.map(key => subcat[key]).join('');
              }
            }
          }

          return subcategoryName === selectedSubcategory;
        });

        if (selectedSubcategoryObj && selectedSubcategoryObj.subSubCategories) {
          setSubSubcategories(selectedSubcategoryObj.subSubCategories);
        } else {
          setSubSubcategories([]);
        }
      }
    } else {
      setSubSubcategories([]);
    }
    // Reset selected sub-subcategory when subcategory changes
    setSelectedSubSubcategory(null);
  }, [selectedSubcategory, categories, categoryId]);

  useEffect(() => {
    if (products && products.length > 0) {
      const filtered = products.filter(
        product =>
          product.category &&
          product.category._id === categoryId &&
          (!selectedSubcategory || product.subcategory === selectedSubcategory) &&
          (!selectedSubSubcategory || product.subSubcategory === selectedSubSubcategory)
      );
      setFilteredProducts(filtered);
    }
  }, [products, categoryId, selectedSubcategory, selectedSubSubcategory]);

  const handleSubcategorySelect = subcat => {
    setSelectedSubcategory(subcat);
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            {categoryId === 'all' ? 'All Products' : categoryName}
          </Text>
          <View style={styles.underline} />
        </View>

        {/* Subcategory Filter */}
        {categoryId !== 'all' && subcategories.length > 0 && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filter by Subcategory:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}
              contentContainerStyle={styles.filterContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedSubcategory === null && styles.filterButtonActive,
                ]}
                onPress={() => handleSubcategorySelect(null)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedSubcategory === null && styles.filterButtonTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              {subcategories.map((subcat, index) => {
                let subcategoryName = '';

                if (typeof subcat === 'string') {
                  subcategoryName = subcat;
                } else if (subcat && typeof subcat === 'object') {
                  if (subcat.name) {
                    subcategoryName = String(subcat.name);
                  } else {
                    const keys = Object.keys(subcat)
                      .filter(key => !isNaN(key))
                      .sort((a, b) => parseInt(a) - parseInt(b));
                    if (keys.length > 0) {
                      subcategoryName = keys.map(key => subcat[key]).join('');
                    }
                  }
                }

                // Safety check: ensure subcategoryName is a string
                subcategoryName = String(subcategoryName || '');

                // Skip empty names
                if (!subcategoryName.trim()) {
                  return null;
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterButton,
                      selectedSubcategory === subcategoryName && styles.filterButtonActive,
                    ]}
                    onPress={() => handleSubcategorySelect(subcategoryName)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedSubcategory === subcategoryName && styles.filterButtonTextActive,
                      ]}
                    >
                      {subcategoryName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Sub-Subcategory Filter */}
        {selectedSubcategory && subSubcategories.length > 0 && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filter by Sub-Subcategory:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}
              contentContainerStyle={styles.filterContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedSubSubcategory === null && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedSubSubcategory(null)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedSubSubcategory === null && styles.filterButtonTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {subSubcategories.map((subSubcat, index) => {
                // Handle different sub-subcategory formats
                let subSubcatName = '';
                
                if (typeof subSubcat === 'string') {
                  subSubcatName = subSubcat;
                } else if (subSubcat && typeof subSubcat === 'object') {
                  if (subSubcat.name) {
                    subSubcatName = String(subSubcat.name);
                  } else {
                    // Handle flawed object-like string format (similar to subcategory handling)
                    const keys = Object.keys(subSubcat).filter(key => !isNaN(key)).sort((a, b) => parseInt(a) - parseInt(b));
                    if (keys.length > 0) {
                      subSubcatName = keys.map(key => subSubcat[key]).join('');
                    }
                  }
                }
                
                // Safety check: ensure subSubcatName is a string
                subSubcatName = String(subSubcatName || '');
                
                // Skip empty names
                if (!subSubcatName.trim()) {
                  return null;
                }
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterButton,
                      selectedSubSubcategory === subSubcatName && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedSubSubcategory(subSubcatName)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedSubSubcategory === subSubcatName && styles.filterButtonTextActive,
                      ]}
                    >
                      {subSubcatName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {filteredProducts && filteredProducts.length > 0 ? (
              <>
                <Text style={styles.resultCount}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}{' '}
                  found
                </Text>
                <View style={styles.productGrid}>
                  {filteredProducts.map(product => (
                    <ProductsCard p={product} key={product._id} />
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products found in this category</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  underline: {
    height: 3,
    width: 80,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  resultCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterContent: {
    paddingRight: 15,
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 60,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CategoryProducts;
