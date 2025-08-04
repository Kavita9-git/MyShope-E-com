import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProducts } from '../../redux/features/auth/productActions';
import { getAllCategories } from '../../redux/features/auth/categoryActions';
import { Picker } from '@react-native-picker/picker';
import withBackButton from '../../components/Layout/withBackButton';

const ManageProducts = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { products, loading } = useSelector(state => state.product);
  const { categories } = useSelector(state => state.category);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // console.log("products id :", products.id);

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (products && products.length > 0) {
      if (selectedCategoryId === 'all') {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter(
          product => product.category && product.category._id === selectedCategoryId
        );
        setFilteredProducts(filtered);
      }
    } else {
      setFilteredProducts([]);
    }
  }, [selectedCategoryId, products]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(getAllProducts());
    dispatch(getAllCategories());
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Manage Products</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('createproduct')}
        >
          <AntDesign name="plus" size={20} color="#fff" />
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.imageManageButton}
          onPress={() => navigation.navigate('deleteimageproduct')}
        >
          <AntDesign name="picture" size={20} color="#fff" />
          <Text style={styles.buttonText}>Manage Images</Text>
        </TouchableOpacity> */}
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterIconContainer}>
          <MaterialIcons name="filter-list" size={22} color="#666" />
          <Text style={styles.filterLabel}>Filter by Category:</Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategoryId}
            onValueChange={itemValue => setSelectedCategoryId(itemValue)}
            style={styles.picker}
            dropdownIconColor="#333"
          >
            <Picker.Item label="All Products" value="all" />
            {categories &&
              categories.map(category => (
                <Picker.Item key={category._id} label={category.category} value={category._id} />
              ))}
          </Picker>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        style={styles.scrollView}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading products...</Text>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <View key={product._id} style={styles.productCard}>
              <Image
                source={{
                  uri: product?.images[0]?.url?.startsWith('http')
                    ? product?.images[0]?.url
                    : `https://nodejsapp-hfpl.onrender.com${product?.images[0]?.url}`,
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                <Text
                  style={[
                    styles.stockStatus,
                    product.stock > 0 ? styles.inStock : styles.outOfStock,
                  ]}
                >
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => navigation.navigate('updateproduct', { id: product._id })}
                >
                  <AntDesign name="edit" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.imageButton]}
                  onPress={() =>
                    navigation.navigate('updateimageproducts', {
                      id: product._id,
                    })
                  }
                >
                  <AntDesign name="picture" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => navigation.navigate('deleteproduct', { id: product._id })}
                >
                  <AntDesign name="delete" size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => navigation.navigate('deleteimageproduct', { id: product._id })}
                >
                  <AntDesign name="picture" size={20} color="#fff" />
                  {/* <Text style={styles.buttonText}>Manage Images</Text> */}
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noProductsText}>No products found.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  imageManageButton: {
    flexDirection: 'row',
    backgroundColor: '#9b59b6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-around',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#2c3e50',
    marginVertical: 5,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  inStock: {
    color: '#27ae60',
  },
  outOfStock: {
    color: '#e74c3c',
  },
  actionButtons: {
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  imageButton: {
    backgroundColor: '#9b59b6',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
});

// Export the component wrapped with the withBackButton HOC
export default withBackButton(ManageProducts);
