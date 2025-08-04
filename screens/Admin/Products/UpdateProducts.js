import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Button,
  Modal,
  Animated,
  Switch,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../../components/Layout/Layout';
import InputBox from '../../../components/Form/InputBox';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import {
  clearMessage,
  getAllProducts,
  updateProduct,
} from '../../../redux/features/auth/productActions';
import { getAllCategories } from '../../../redux/features/auth/categoryActions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import DisplayMessage from '../../../components/Message/DisplayMessage';

const UpdateProducts = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const { categories = '' } = useSelector(state => state.category);
  const {
    products = '',
    message = '',
    loading: productLoading,
  } = useSelector(state => state.product);

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getAllProducts());
    fetchProducts(route.params.id);
    setCatData(categories);
  }, []);

  useEffect(() => {
    if (message?.includes('Updated')) {
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setProductId('');
      setCategory('');
      setCategoryId('');
      setSubcategory('');
      setAvailableSubcategories([]);
      setIsFeatured(false);
      setIsTrending(false);
      setIsPopular(false);
      setTags('');
      setBrand('');
      setShippingInformation('');
      setReturnPolicy('');
      setWarranty('');
      setIsClothing(false);
      setSku('');
      setAvailabilityStatus('');
      setMinimumOrderQuantity('1');
      setSuccessMessage(message);
      setShowNotification(true);

      // Animate notification entrance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowNotification(false);
        });
      }, 3000);

      dispatch(clearMessage());
    }
  }, [message]);

  //State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [catData, setCatData] = useState([]);
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [tags, setTags] = useState('');
  const [brand, setBrand] = useState('');
  const [shippingInformation, setShippingInformation] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [warranty, setWarranty] = useState('');
  const [isClothing, setIsClothing] = useState(false);
  const [sku, setSku] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState('1');

  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find(cat => cat._id === categoryId);
      if (selectedCategory && selectedCategory.category.toLowerCase() === 'clothing') {
        setIsClothing(true);
      } else {
        setIsClothing(false);
      }
    } else {
      setIsClothing(false);
    }
  }, [categoryId, categories]);

  // Update subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find(cat => cat._id === categoryId);
      if (selectedCategory && selectedCategory.subcategories) {
        setAvailableSubcategories(selectedCategory.subcategories);
      } else {
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [categoryId, categories]);

  //Product Update
  const handleUpdate = () => {
    if (!productId) {
      return Toast.show({
        type: 'error',
        text1: 'Error !',
        text2: 'Please select a product to update',
      });
    }
    const formData = {
      name: name,
      description: description,
      price: price,
      stock: stock,
      category: categoryId,
      subcategory: subcategory,
      isFeatured,
      isTrending,
      isPopular,
      tags,
      brand,
      shippingInformation,
      returnPolicy,
      warranty,
      sku,
      availabilityStatus,
      minimumOrderQuantity,
    };
    dispatch(updateProduct(productId, formData));
  };

  const fetchProducts = async itemValue => {
    setProductId(itemValue);

    //Find Product Details
    const getProduct = products.find(p => {
      return p?._id === itemValue;
    });
    setName(getProduct?.name);
    setDescription(getProduct?.description);
    setPrice(getProduct?.price.toString());
    setStock(getProduct?.stock.toString());
    setCategory(getProduct?.category?.category);
    setCategoryId(getProduct?.category?._id);
    setSubcategory(getProduct?.subcategory || '');
    setIsFeatured(getProduct?.isFeatured || false);
    setIsTrending(getProduct?.isTrending || false);
    setIsPopular(getProduct?.isPopular || false);
    setTags(getProduct?.tags?.join(', ') || '');
    setBrand(getProduct?.brand || '');
    setShippingInformation(getProduct?.shippingInformation || '');
    setReturnPolicy(getProduct?.returnPolicy || '');
    setWarranty(getProduct?.warranty || '');
    setSku(getProduct?.sku || '');
    setAvailabilityStatus(getProduct?.availabilityStatus || '');
    setMinimumOrderQuantity(getProduct?.minimumOrderQuantity?.toString() || '1');

    // Update available subcategories based on selected category
    if (getProduct?.category?._id) {
      const selectedCategory = categories.find(cat => cat._id === getProduct.category._id);
      if (selectedCategory && selectedCategory.subcategories) {
        setAvailableSubcategories(selectedCategory.subcategories);
      } else {
        setAvailableSubcategories([]);
      }
    }
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: '#f8f9fa' }}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={['#1e3c72', '#2a5298']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="pencil-box" size={40} color="#fff" />
              <Text style={styles.headerText}>Update Product</Text>
            </LinearGradient>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#ebf8ff' }]}>
                <Icon name="tag-text" size={24} color="#3182ce" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>Product Details</Text>
                <Text style={styles.statLabel}>Update product information</Text>
              </View>
            </View>
          </View>

          {showNotification && (
            <Animated.View
              style={[
                styles.notificationContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['#4776E6', '#8E54E9']}
                style={styles.notificationGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.notificationIconWrapper}>
                  <Icon name="check-decagram" size={28} color="#fff" />
                </View>
                <Text style={styles.notificationText}>{successMessage}</Text>
                <TouchableOpacity
                  onPress={() => {
                    Animated.timing(fadeAnim, {
                      toValue: 0,
                      duration: 300,
                      useNativeDriver: true,
                    }).start(() => setShowNotification(false));
                  }}
                  style={styles.closeButton}
                >
                  <Icon name="close-circle" size={20} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          {loading && <ActivityIndicator size="large" color="#3b5998" style={styles.loader} />}

          <View style={styles.cardContainer}>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>
                <Icon name="shape-outline" size={16} color="#555" /> Select Product:
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={productId}
                  onValueChange={itemValue => {
                    fetchProducts(itemValue);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#3b5998"
                >
                  <Picker.Item label="-- Select Product --" value="" />
                  {products &&
                    products?.map(c => <Picker.Item key={c._id} label={c.name} value={c._id} />)}
                </Picker>
              </View>
            </View>

            <InputBox
              icon="tag-text-outline"
              value={name}
              setValue={setName}
              placeholder={'Enter Product Name'}
              autoComplete={'name'}
            />

            <InputBox
              icon="text-box-outline"
              value={description}
              setValue={setDescription}
              placeholder={'Enter Product Description'}
              autoComplete={'address-line1'}
            />

            <InputBox
              icon="currency-usd"
              value={price}
              setValue={setPrice}
              placeholder={'Enter Product Price'}
              autoComplete={'tel'}
            />

            {!isClothing && (
              <InputBox
                icon="package-variant-closed"
                value={stock}
                setValue={setStock}
                placeholder={'Enter Product Stock/Quantity'}
                autoComplete={'tel'}
              />
            )}

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>
                <Icon name="tag-multiple" size={16} color="#555" /> Select Category:
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={categoryId}
                  onValueChange={itemValue => setCategoryId(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#3b5998"
                >
                  <Picker.Item label="-- Select Category --" value="" />
                  {categories &&
                    categories?.map(c => (
                      <Picker.Item key={c._id} label={c.category} value={c._id} />
                    ))}
                </Picker>
              </View>
            </View>

            {availableSubcategories.length > 0 && (
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>
                  <Icon name="folder-multiple" size={16} color="#555" /> Select Subcategory:
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={subcategory}
                    onValueChange={itemValue => setSubcategory(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#3b5998"
                  >
                    <Picker.Item label="-- Select Subcategory --" value="" />
                    {availableSubcategories.map((subcat, index) => (
                      <Picker.Item key={index} label={subcat} value={subcat} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>Additional Information</Text>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SKU</Text>
                <InputBox value={sku} setValue={setSku} placeholder="SKU" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Availability Status</Text>
                <InputBox
                  value={availabilityStatus}
                  setValue={setAvailabilityStatus}
                  placeholder="e.g., In Stock, Out of Stock"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Minimum Order Quantity</Text>
                <InputBox
                  value={minimumOrderQuantity}
                  setValue={setMinimumOrderQuantity}
                  placeholder="Minimum Order Quantity"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Brand</Text>
                <InputBox value={brand} setValue={setBrand} placeholder="Brand Name" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tags (comma-separated)</Text>
                <InputBox value={tags} setValue={setTags} placeholder="e.g., summer, new, sale" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Shipping Information</Text>
                <InputBox
                  value={shippingInformation}
                  setValue={setShippingInformation}
                  placeholder="Shipping Details"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Return Policy</Text>
                <InputBox
                  value={returnPolicy}
                  setValue={setReturnPolicy}
                  placeholder="Return Policy"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Warranty</Text>
                <InputBox
                  value={warranty}
                  setValue={setWarranty}
                  placeholder="Warranty Information"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Product Flags</Text>

            <View style={styles.formCard}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Featured Product</Text>
                <Switch value={isFeatured} onValueChange={setIsFeatured} />
              </View>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Trending Product</Text>
                <Switch value={isTrending} onValueChange={setIsTrending} />
              </View>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Popular Product</Text>
                <Switch value={isPopular} onValueChange={setIsPopular} />
              </View>
            </View>

            <TouchableOpacity style={styles.btnUpdate} onPress={handleUpdate} activeOpacity={0.8}>
              <LinearGradient
                colors={['#1e3c72', '#2a5298']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="content-save-edit" size={20} color="#fff" />
                <Text style={styles.btnUpdateText}>UPDATE PRODUCT</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Product Management v1.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7e6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  successMessage: {
    color: 'green',
    marginLeft: 10,
    fontSize: 14,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  btnUpdate: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 15,
  },
  btnGradient: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnUpdateText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    marginTop: 15,
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#a0aec0',
    textAlign: 'center',
  },
  notificationContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  notificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffffff',
  },
  notificationIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  notificationText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 15,
    color: '#333',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default UpdateProducts;
