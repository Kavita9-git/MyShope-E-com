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
  }, []);

  // Separate useEffect to call fetchProducts after categories are loaded
  useEffect(() => {
    if (categories && categories.length > 0 && route.params.id) {
      console.log('📋 Categories loaded, now fetching product:', route.params.id);
      fetchProducts(route.params.id);
      setCatData(categories);
    }
  }, [categories, route.params.id]);

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
      setSubSubcategory('');
      setAvailableSubSubcategories([]);
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
  const [subSubcategory, setSubSubcategory] = useState('');
  const [availableSubSubcategories, setAvailableSubSubcategories] = useState([]);
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
  const [newSubSubcategory, setNewSubSubcategory] = useState('');
  const [showNewSubSubcategoryInput, setShowNewSubSubcategoryInput] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [showNewSubcategoryInput, setShowNewSubcategoryInput] = useState(false);

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
    console.log('🔍 Category changed in UpdateProducts, processing subcategories...');
    console.log('Selected categoryId:', categoryId);
    console.log('All available categories:', categories);

    if (categoryId) {
      const selectedCategory = categories.find(cat => cat._id === categoryId);
      console.log('🎯 Found selected category (Update):', selectedCategory);

      if (selectedCategory) {
        console.log('📂 Category subcategories raw (Update):', selectedCategory.subcategories);
        console.log('📂 Subcategories type (Update):', typeof selectedCategory.subcategories);
        console.log('📂 Subcategories length (Update):', selectedCategory.subcategories?.length);

        if (selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
          // Handle both old and new data formats
          const subcategoryNames = selectedCategory.subcategories
            .map(subcat => {
              console.log('Processing subcat (Update):', subcat);
              // Handle new format: {name: 'Gaming', subSubCategories: [...]}
              if (typeof subcat === 'object' && subcat.name) {
                return subcat.name;
              }
              // Handle flawed object-like string format
              else if (typeof subcat === 'object') {
                // Convert individual character keys back into a string for subcategory name
                const nameArray = Object.entries(subcat)
                  .filter(([key, _]) => !isNaN(key))
                  .sort(([a], [b]) => a - b)
                  .map(([_, value]) => value);
                return nameArray.join('');
              }
              // Handle old format: direct string values
              else if (typeof subcat === 'string') {
                return subcat;
              }
              // Fallback
              return null;
            })
            .filter(name => name && name.trim() !== '');

          console.log('✅ Extracted subcategory names (Update):', subcategoryNames);
          setAvailableSubcategories(subcategoryNames);
        } else {
          console.log(
            '❌ No subcategories found for category (Update):',
            selectedCategory.category
          );
          setAvailableSubcategories([]);
        }
      } else {
        console.log('❌ Selected category not found in categories list (Update)');
        setAvailableSubcategories([]);
      }
    } else {
      console.log('🔄 No category selected in UpdateProducts, clearing subcategories');
      setAvailableSubcategories([]);
    }
  }, [categoryId, categories]);

  // Update sub-subcategories when subcategory changes
  useEffect(() => {
    console.log('🔍 Subcategory changed in UpdateProducts, processing sub-subcategories...');
    console.log('Selected subcategory:', subcategory);
    console.log('Selected categoryId:', categoryId);

    if (subcategory && categoryId) {
      const selectedCategory = categories.find(cat => cat._id === categoryId);
      console.log('🎯 Found selected category for sub-subcategories (Update):', selectedCategory);

      if (selectedCategory && selectedCategory.subcategories) {
        // Find the selected subcategory object
        const selectedSubcategory = selectedCategory.subcategories.find(subcat => {
          // Handle different formats
          if (typeof subcat === 'object' && subcat.name) {
            return subcat.name === subcategory;
          }
          // Handle flawed object-like string format
          else if (typeof subcat === 'object') {
            const nameArray = Object.entries(subcat)
              .filter(([key, _]) => !isNaN(key))
              .sort(([a], [b]) => a - b)
              .map(([_, value]) => value);
            return nameArray.join('') === subcategory;
          }
          // Handle old format: direct string values
          else if (typeof subcat === 'string') {
            return subcat === subcategory;
          }
          return false;
        });

        console.log('🎯 Found selected subcategory object (Update):', selectedSubcategory);

        if (
          selectedSubcategory &&
          typeof selectedSubcategory === 'object' &&
          selectedSubcategory.subSubCategories
        ) {
          console.log('📂 Sub-subcategories raw (Update):', selectedSubcategory.subSubCategories);

          const subSubcategoryNames = selectedSubcategory.subSubCategories
            .map(subSubcat => {
              // Handle different formats for sub-subcategories
              if (typeof subSubcat === 'object' && subSubcat.name) {
                return subSubcat.name;
              } else if (typeof subSubcat === 'string') {
                return subSubcat;
              }
              return null;
            })
            .filter(name => name && name.trim() !== '');

          console.log('✅ Extracted sub-subcategory names (Update):', subSubcategoryNames);
          setAvailableSubSubcategories(subSubcategoryNames);
        } else {
          console.log('❌ No sub-subcategories found for subcategory (Update):', subcategory);
          setAvailableSubSubcategories([]);
        }
      } else {
        console.log('❌ Selected category not found or has no subcategories (Update)');
        setAvailableSubSubcategories([]);
      }
    } else {
      console.log('🔄 No subcategory selected in UpdateProducts, clearing sub-subcategories');
      setAvailableSubSubcategories([]);
      setSubSubcategory(''); // Clear sub-subcategory selection
    }
  }, [subcategory, categoryId, categories]);

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
      subSubcategory: subSubcategory,
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
    console.log('🔥 FETCH PRODUCTS CALLED with itemValue:', itemValue);
    console.log('🔥 Available categories:', categories?.length || 'none');
    console.log('🔥 Available products:', products?.length || 'none');
    
    setProductId(itemValue);

    //Find Product Details
    const getProduct = products.find(p => {
      return p?._id === itemValue;
    });
    
    console.log('🔥 Found product:', getProduct);
    console.log('🔥 Product subcategory:', getProduct?.subcategory);
    console.log('🔥 Product subSubcategory:', getProduct?.subSubcategory);
    console.log('🔥 Product category ID:', getProduct?.category?._id);
    
    setName(getProduct?.name);
    setDescription(getProduct?.description);
    setPrice(getProduct?.price.toString());
    setStock(getProduct?.stock.toString());
    setCategory(getProduct?.category?.category);
    setCategoryId(getProduct?.category?._id);
    setSubcategory(getProduct?.subcategory || '');
    setSubSubcategory(getProduct?.subSubcategory || '');
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
      console.log('🔥 Processing category with ID:', getProduct.category._id);
      const selectedCategory = categories.find(cat => cat._id === getProduct.category._id);
      console.log('🔥 Found selected category:', selectedCategory);
      
      if (
        selectedCategory &&
        selectedCategory.subcategories &&
        selectedCategory.subcategories.length > 0
      ) {
        console.log('🔥 Category has subcategories:', selectedCategory.subcategories);
        // Handle both old and new data formats
        const subcategoryNames = selectedCategory.subcategories
          .map(subcat => {
            // Handle new format: {name: 'Gaming', subSubCategories: [...]}
            if (typeof subcat === 'object' && subcat.name) {
              return subcat.name;
            }
            // Handle flawed object-like string format
            else if (typeof subcat === 'object') {
              // Convert individual character keys back into a string for subcategory name
              const nameArray = Object.entries(subcat)
                .filter(([key, _]) => !isNaN(key))
                .sort(([a], [b]) => a - b)
                .map(([_, value]) => value);
              return nameArray.join('');
            }
            // Handle old format: direct string values
            else if (typeof subcat === 'string') {
              return subcat;
            }
            // Fallback
            return null;
          })
          .filter(name => name && name.trim() !== '');

        console.log('🔥 Extracted subcategory names:', subcategoryNames);
        setAvailableSubcategories(subcategoryNames);

        // Update available sub-subcategories based on selected subcategory
        if (getProduct?.subcategory) {
          console.log('🔥 Product has subcategory, processing sub-subcategories for:', getProduct.subcategory);
          
          // Find the selected subcategory object
          const selectedSubcategory = selectedCategory.subcategories.find(subcat => {
            console.log('🔥 Checking subcat:', JSON.stringify(subcat), 'against product subcategory:', getProduct.subcategory);
            console.log('🔥 Subcat type:', typeof subcat);
            console.log('🔥 Subcat keys:', Object.keys(subcat || {}));
            
            // Handle different formats
            if (typeof subcat === 'object' && subcat.name) {
              const match = subcat.name === getProduct.subcategory;
              console.log('🔥 Object with name format match:', match, 'subcat.name:', subcat.name);
              return match;
            }
            // Handle flawed object-like string format (like Clothes category)
            else if (typeof subcat === 'object' && subcat !== null) {
              // Try multiple reconstruction approaches
              
              // Approach 1: Numeric keys reconstruction
              const numericEntries = Object.entries(subcat)
                .filter(([key, _]) => !isNaN(key) && key !== 'subSubCategories')
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([_, value]) => value);
              const reconstructedName1 = numericEntries.join('');
              console.log('🔥 Numeric reconstruction:', reconstructedName1);
              
              // Approach 2: All non-function, non-array values
              const allValues = Object.entries(subcat)
                .filter(([key, value]) => 
                  key !== 'subSubCategories' && 
                  typeof value === 'string' && 
                  value.length === 1
                )
                .sort(([a], [b]) => {
                  const numA = parseInt(a);
                  const numB = parseInt(b);
                  if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                  }
                  return a.localeCompare(b);
                })
                .map(([_, value]) => value);
              const reconstructedName2 = allValues.join('');
              console.log('🔥 All values reconstruction:', reconstructedName2);
              
              // Check both reconstructions
              const match1 = reconstructedName1 === getProduct.subcategory;
              const match2 = reconstructedName2 === getProduct.subcategory;
              console.log('🔥 Reconstruction matches - numeric:', match1, 'all values:', match2);
              
              if (match1 || match2) {
                return true;
              }
              
              // Approach 3: Direct property check if subcategory name exists as a property
              if (subcat[getProduct.subcategory]) {
                console.log('🔥 Direct property match found');
                return true;
              }
            }
            // Handle old format: direct string values
            else if (typeof subcat === 'string') {
              const match = subcat === getProduct.subcategory;
              console.log('🔥 String format match:', match);
              return match;
            }
            console.log('🔥 No match found for this subcat');
            return false;
          });

          console.log('🔥 Found selected subcategory object for product:', selectedSubcategory);

          if (
            selectedSubcategory &&
            typeof selectedSubcategory === 'object' &&
            selectedSubcategory.subSubCategories
          ) {
            console.log('🔥 Subcategory has sub-subcategories:', selectedSubcategory.subSubCategories);

            const subSubcategoryNames = selectedSubcategory.subSubCategories
              .map(subSubcat => {
                console.log('🔥 Processing sub-subcat:', subSubcat);
                // Handle different formats for sub-subcategories
                if (typeof subSubcat === 'object' && subSubcat.name) {
                  return subSubcat.name;
                } else if (typeof subSubcat === 'string') {
                  return subSubcat;
                }
                return null;
              })
              .filter(name => name && name.trim() !== '');

            console.log('🔥 Extracted sub-subcategory names for product:', subSubcategoryNames);
            setAvailableSubSubcategories(subSubcategoryNames);
          } else {
            console.log('🔥 No sub-subcategories found - subcategory object:', selectedSubcategory);
            setAvailableSubSubcategories([]);
          }
        } else {
          console.log('🔥 Product has no subcategory');
          setAvailableSubSubcategories([]);
        }
      } else {
        console.log('🔥 Category has no subcategories');
        setAvailableSubcategories([]);
        setAvailableSubSubcategories([]);
      }
    } else {
      console.log('🔥 Product has no category');
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

            {(availableSubcategories.length > 0 || categoryId) && (
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>
                  <Icon name="folder-multiple" size={16} color="#555" /> Select Subcategory:
                </Text>
                {availableSubcategories.length > 0 ? (
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
                ) : (
                  <View>
                    <Text style={styles.noItemsText}>
                      No subcategories available for this category
                    </Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => setShowNewSubcategoryInput(!showNewSubcategoryInput)}
                    >
                      <Icon
                        name={showNewSubcategoryInput ? 'minus' : 'plus'}
                        size={16}
                        color="#3b5998"
                      />
                      <Text style={styles.addButtonText}>
                        {showNewSubcategoryInput ? 'Cancel' : 'Add New Subcategory'}
                      </Text>
                    </TouchableOpacity>
                    {showNewSubcategoryInput && (
                      <View style={styles.newSubcategoryContainer}>
                        <Text style={styles.inputLabel}>New Subcategory Name:</Text>
                        <InputBox
                          icon="folder-plus"
                          value={newSubcategory}
                          setValue={setNewSubcategory}
                          placeholder={`Enter new subcategory`}
                        />
                        <TouchableOpacity
                          style={styles.useNewSubcategoryButton}
                          onPress={() => {
                            if (newSubcategory.trim()) {
                              setSubcategory(newSubcategory.trim());
                              setShowNewSubcategoryInput(false);
                            }
                          }}
                        >
                          <Icon name="check" size={16} color="#fff" />
                          <Text style={styles.useNewSubcategoryText}>Use This Subcategory</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {(availableSubSubcategories.length > 0 || subcategory) && (
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>
                  <Icon name="folder-open" size={16} color="#555" /> Select Sub-subcategory:
                </Text>
                {availableSubSubcategories.length > 0 ? (
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={subSubcategory}
                      onValueChange={itemValue => setSubSubcategory(itemValue)}
                      style={styles.picker}
                      dropdownIconColor="#3b5998"
                    >
                      <Picker.Item label="-- Select Sub-subcategory --" value="" />
                      {availableSubSubcategories.map((subSubcat, index) => (
                        <Picker.Item key={index} label={subSubcat} value={subSubcat} />
                      ))}
                    </Picker>
                  </View>
                ) : subcategory ? (
                  <Text style={styles.noItemsText}>
                    No sub-subcategories available for this subcategory
                  </Text>
                ) : null}

                {/* Selected Sub-subcategory Display */}
                {subSubcategory && (
                  <View style={styles.selectedSubSubcategoryContainer}>
                    <Text style={styles.selectedSubSubcategoryLabel}>
                      Selected Sub-subcategory:
                    </Text>
                    <View style={styles.selectedSubSubcategoryBox}>
                      <Icon name="folder-check" size={18} color="#28a745" />
                      <Text style={styles.selectedSubSubcategoryText}>{subSubcategory}</Text>
                      <TouchableOpacity
                        style={styles.clearSubSubcategoryButton}
                        onPress={() => setSubSubcategory('')}
                      >
                        <Icon name="close-circle" size={16} color="#dc3545" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Add New Sub-subcategory Section */}
                {subcategory && !subSubcategory && (
                  <View style={styles.addSubSubcategorySection}>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        if (!subcategory) {
                          alert('Please select or add a subcategory first!');
                          return;
                        }
                        setShowNewSubSubcategoryInput(!showNewSubSubcategoryInput);
                      }}
                    >
                      <Icon
                        name={showNewSubSubcategoryInput ? 'minus' : 'plus'}
                        size={16}
                        color="#3b5998"
                      />
                      <Text style={styles.addButtonText}>
                        {showNewSubSubcategoryInput ? 'Cancel' : 'Add New Sub-subcategory'}
                      </Text>
                    </TouchableOpacity>

                    {showNewSubSubcategoryInput && (
                      <View style={styles.newSubSubcategoryContainer}>
                        <Text style={styles.inputLabel}>New Sub-subcategory Name:</Text>
                        <InputBox
                          icon="folder-plus"
                          value={newSubSubcategory}
                          setValue={setNewSubSubcategory}
                          placeholder={`Enter new sub-subcategory for ${subcategory}`}
                        />
                        <TouchableOpacity
                          style={styles.useNewSubSubcategoryButton}
                          onPress={() => {
                            if (newSubSubcategory.trim()) {
                              setSubSubcategory(newSubSubcategory.trim());
                              setShowNewSubSubcategoryInput(false);
                            }
                          }}
                        >
                          <Icon name="check" size={16} color="#fff" />
                          <Text style={styles.useNewSubSubcategoryText}>
                            Use This Sub-subcategory
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
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
  // Styles for add buttons
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#3b5998',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  addButtonText: {
    color: '#3b5998',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  noItemsText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalInfoBold: {
    fontWeight: 'bold',
    color: '#3b5998',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  addCategoryButton: {
    backgroundColor: '#3b5998',
  },
  addButtonTextModal: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  // New Sub-subcategory styles
  addSubSubcategorySection: {
    marginTop: 10,
  },
  newSubSubcategoryContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  useNewSubSubcategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  useNewSubSubcategoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Selected Sub-subcategory Display styles
  selectedSubSubcategoryContainer: {
    marginTop: 15,
  },
  selectedSubSubcategoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedSubSubcategoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  selectedSubSubcategoryText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#155724',
    marginLeft: 8,
  },
  clearSubSubcategoryButton: {
    padding: 4,
  },
  // New Subcategory styles
  newSubcategoryContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  useNewSubcategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  useNewSubcategoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default UpdateProducts;
