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
  Animated,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../../components/Layout/Layout';
import * as ImagePicker from 'expo-image-picker';
import InputBox from '../../../components/Form/InputBox';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import {
  clearMessage,
  getAllProducts,
  updateProduct,
  updateProductImage,
} from '../../../redux/features/auth/productActions';
import { getAllCategories } from '../../../redux/features/auth/categoryActions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// StyledInput wrapper component for consistent input styling
const StyledInput = ({
  label,
  value,
  setValue,
  placeholder,
  keyboardType = 'default',
  editable = true,
  currency,
}) => {
  return (
    <View style={styles.styledInputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapper, !editable && styles.disabledInput]}>
        {currency && <Text style={styles.currencySymbol}>₹</Text>}
        <InputBox
          value={value}
          setValue={val => {
            console.log(`Setting ${label} value to:`, val);
            setValue(val);
          }}
          placeholder={placeholder}
          keyboardType={keyboardType}
          editable={editable}
          customStyles={styles.styledInputField}
        />
      </View>
    </View>
  );
};

const availableColors = [
  { colorId: 'red', colorName: 'Red', colorCode: '#FF0000' },
  { colorId: 'blue', colorName: 'Blue', colorCode: '#0000FF' },
  { colorId: 'black', colorName: 'Black', colorCode: '#000000' },
  { colorId: 'white', colorName: 'White', colorCode: '#FFFFFF' },
  { colorId: 'green', colorName: 'Green', colorCode: '#008000' },
  { colorId: 'yellow', colorName: 'Yellow', colorCode: '#FFFF00' },
];

const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const UpdateImageProducts = ({ navigation, route }) => {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.user);
  // console.log(user);

  console.log('=== ROUTE DEBUG ===');
  console.log('Route params:', route.params);
  console.log('Route params id:', route.params?.id);

  const { categories = '' } = useSelector(state => state.category);
  const { products = '', message = '', error = '' } = useSelector(state => state.product);
  // console.log("categories :", categories);
  // console.log("products :", products);

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getAllProducts());
    // Don't fetch products immediately, wait for categories to load
    setCatData(categories);
  }, []);

  // Separate useEffect to handle product fetching after categories are loaded
  useEffect(() => {
    if (categories && categories.length > 0 && route.params && route.params.id) {
      console.log('Categories loaded, now fetching product:', route.params.id);
      fetchProducts(route.params.id);
    }
  }, [categories, route.params]);

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
      setChangedFields({});
      setChangedGeneralImage(null);
      setChangedColorImages([]);
      setGeneralImage('');
      setColorImages([]);

      // Show notification instead of alert
      setSuccessMessage(message);
      setShowNotification(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
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
    console.log('message', message);
    console.log('error', error);
  }, [message, error]);

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
  const [generalImage, setGeneralImage] = useState('');
  const [colorImages, setColorImages] = useState([]); // Holds colors with images & sizes
  const [loading, setLoading] = useState(false);
  const [changedFields, setChangedFields] = useState({});
  const [changedGeneralImage, setChangedGeneralImage] = useState(null);
  const [changedColorImages, setChangedColorImages] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColorId, setNewColorId] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [getAllProductsData, setGetAllProductsData] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // New state for multiple images (non-clothing categories)
  const [multipleImages, setMultipleImages] = useState([]);
  const [changedMultipleImages, setChangedMultipleImages] = useState([]);
  
  // Helper function to check if category is clothing
  const isClothingCategory = (categoryName) => {
    if (!categoryName) return false;
    const clothingCategories = ['clothing', 'clothes', 'apparel', 'fashion', 'garments'];
    return clothingCategories.some(cat => 
      categoryName.toLowerCase().includes(cat.toLowerCase())
    );
  };

  // Update subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find(cat => cat._id === categoryId);
      if (selectedCategory && selectedCategory.subcategories) {
        // Extract subcategory names properly
        const subcategoryNames = selectedCategory.subcategories.map(subcat => {
          // Handle different data formats
          if (typeof subcat === 'string') {
            return subcat;
          } else if (subcat && subcat.name) {
            return subcat.name;
          } else if (typeof subcat === 'object' && subcat !== null) {
            // Handle the corrupted format where strings are stored as objects with numeric keys
            const keys = Object.keys(subcat).filter(key => !isNaN(key)).sort((a, b) => Number(a) - Number(b));
            if (keys.length > 0) {
              return keys.map(key => subcat[key]).join('');
            }
          }
          return String(subcat);
        });
        setAvailableSubcategories(subcategoryNames);
      } else {
        setAvailableSubcategories([]);
      }
      // Only reset subcategory and sub-subcategory if we're not loading a product from route params
      if (!productId) {
        setSubcategory(''); // Reset subcategory when category changes
        setSubSubcategory(''); // Reset sub-subcategory when category changes
        setAvailableSubSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
      if (!productId) {
        setAvailableSubSubcategories([]);
      }
    }
  }, [categoryId, categories, productId]);

  // Update sub-subcategories when subcategory changes (but not when loading product)
  useEffect(() => {
    // Skip if we don't have the necessary data
    if (!categoryId || !categories.length) return;
    
    console.log('Subcategory effect triggered with:', subcategory, categoryId, 'productId:', productId);
    
    if (subcategory && categoryId) {
      const selectedCategory = categories.find(cat => cat._id === categoryId);
      if (selectedCategory && selectedCategory.subcategories) {
        // Find the selected subcategory object
        let selectedSubcategory = null;
        
        for (const subcat of selectedCategory.subcategories) {
          let subcatName = '';
          if (typeof subcat === 'string') {
            subcatName = subcat;
          } else if (subcat && subcat.name) {
            subcatName = subcat.name;
          } else if (typeof subcat === 'object' && subcat !== null) {
            const keys = Object.keys(subcat).filter(key => !isNaN(key)).sort((a, b) => Number(a) - Number(b));
            if (keys.length > 0) {
              subcatName = keys.map(key => subcat[key]).join('');
            }
          }
          
          if (subcatName === subcategory) {
            selectedSubcategory = subcat;
            break;
          }
        }

        if (selectedSubcategory && selectedSubcategory.subSubCategories && selectedSubcategory.subSubCategories.length > 0) {
          // Extract sub-subcategory names
          const subSubcategoryNames = selectedSubcategory.subSubCategories.map(subSubcat => {
            if (typeof subSubcat === 'string') {
              return subSubcat;
            } else if (subSubcat && subSubcat.name) {
              return subSubcat.name;
            } else if (typeof subSubcat === 'object' && subSubcat !== null) {
              const keys = Object.keys(subSubcat).filter(key => !isNaN(key)).sort((a, b) => Number(a) - Number(b));
              if (keys.length > 0) {
                return keys.map(key => subSubcat[key]).join('');
              }
            }
            return String(subSubcat);
          });
          console.log('Setting sub-subcategories from subcategory effect:', subSubcategoryNames);
          setAvailableSubSubcategories(subSubcategoryNames);
        } else {
          console.log('No sub-subcategories found, clearing');
          setAvailableSubSubcategories([]);
        }
        // Only reset sub-subcategory when manually changing subcategory (not when loading product)
        if (!productId) {
          setSubSubcategory(''); // Reset sub-subcategory when subcategory changes
        }
      } else {
        console.log('No selected category or subcategories, clearing');
        setAvailableSubSubcategories([]);
      }
    } else if (subcategory === '' && !productId) {
      // Only clear if subcategory is explicitly empty and we're not loading a product
      console.log('Subcategory is empty and no product loaded, clearing sub-subcategories');
      setAvailableSubSubcategories([]);
      setSubSubcategory('');
    }
  }, [subcategory, categoryId, categories, productId]);

  //Product Create
  const handleUploadChanges = () => {
    if (!productId) return alert('Please select a product');

    const formData = new FormData();

    // Add changed fields
    for (const [key, value] of Object.entries(changedFields)) {
      formData.append(key, value);
    }

    // Add subcategory if changed
    if (subcategory) {
      formData.append('subcategory', subcategory);
    }

    // Add sub-subcategory if changed
    if (subSubcategory) {
      formData.append('subSubcategory', subSubcategory);
    }

    // Add general image if changed
    if (changedGeneralImage) {
      const fileName = changedGeneralImage.split('/').pop();
      const fileType = fileName.split('.').pop();
      formData.append('generalImage', {
        uri: changedGeneralImage,
        name: fileName,
        type: `image/${fileType}`,
      });
    }

    colorImages.forEach(color => {
      color.images.forEach((imgUri, i) => {
        if (imgUri.startsWith('file')) {
          const ext = imgUri.split('.').pop();
          formData.append(color.colorId, {
            uri: imgUri,
            name: `${color.colorId}_${i}.${ext}`,
            type: `image/${ext}`,
          });
        }
      });
    });

    changedColorImages.forEach(color => {
      color.images.forEach((imgUri, i) => {
        if (imgUri.startsWith('file')) {
          const ext = imgUri.split('.').pop();
          formData.append(color.colorId, {
            uri: imgUri,
            name: `${color.colorId}_${i}.${ext}`,
            type: `image/${ext}`,
          });
        }
      });
    });

    // Add multiple images for non-clothing categories
    if (!isClothingCategory(category) && changedMultipleImages.length > 0) {
      changedMultipleImages.forEach((img, i) => {
        if (img.uri && img.uri.startsWith('file')) {
          const ext = img.uri.split('.').pop();
          formData.append('multipleImages', {
            uri: img.uri,
            name: img.fileName || `image_${i}.${ext}`,
            type: `image/${ext}`,
          });
        }
      });
      
      // Prepare multipleImages JSON metadata
      const multipleImagesMetadata = changedMultipleImages.map(img => ({
        fileName: img.fileName || 'image',
        fileSize: img.fileSize,
        width: img.width,
        height: img.height,
        localPath: img.localPath || img.uri,
      }));
      
      formData.append('multipleImagesMetadata', JSON.stringify(multipleImagesMetadata));
    }

    // Debug current state
    console.log(
      'Current colorImages state:',
      JSON.stringify(
        colorImages.map(c => ({
          colorId: c.colorId,
          sizes: c.sizes
            ? c.sizes.map(s => ({
                size: s.size,
                price: s.price,
                stock: s.stock,
                discountper: s.discountper,
                discountprice: s.discountprice,
              }))
            : [],
        })),
        null,
        2
      )
    );

    console.log(
      'Current changedColorImages state:',
      JSON.stringify(
        changedColorImages.map(c => ({
          colorId: c.colorId,
          sizes: c.sizes
            ? c.sizes.map(s => ({
                size: s.size,
                price: s.price,
                stock: s.stock,
                discountper: s.discountper,
                discountprice: s.discountprice,
              }))
            : [],
        })),
        null,
        2
      )
    );

    // Prepare colors JSON and attach images
    const safeColors = changedColorImages.map(c => ({
      colorId: c.colorId,
      colorName: c.colorName,
      colorCode:
        c.colorCode || availableColors.find(a => a.colorId === c.colorId)?.colorCode || '#000000', // fallback
      sizes: (c.sizes || []).map(s => ({
        size: s.size,
        price: Number(s.price),
        stock: Number(s.stock),
        discountper: s.discountper || '0',
        discountprice: Number(s.discountprice) || 0,
      })),
    }));

    formData.append('colors', JSON.stringify(safeColors));

    console.log('FormData Colors:', JSON.stringify(safeColors, null, 2));
    console.log(
      'Original Color Images with discount values:',
      JSON.stringify(
        changedColorImages.map(c => ({
          colorId: c.colorId,
          sizes: c.sizes.map(s => ({
            size: s.size,
            discountper: s.discountper,
            discountprice: s.discountprice,
          })),
        })),
        null,
        2
      )
    );
    console.log('Changed General Image:', changedGeneralImage);
    console.log('Changed Color Images:', changedColorImages);

    dispatch(updateProductImage(productId, formData));
  };

  const fetchProducts = async itemValue => {
    setProductId(itemValue);

    //Find Product Details
    const getProduct = products.find(p => {
      return p?._id === itemValue;
    });

    console.log('=== PRODUCT FETCH DEBUG ===');
    console.log('Product ID:', itemValue);
    console.log('Found Product:', getProduct);
    console.log('Product subcategory:', getProduct?.subcategory);
    console.log('Product subSubcategory:', getProduct?.subSubcategory);
    console.log('Product category:', getProduct?.category);
    console.log('Available categories:', categories.length);

    const enrichedColors = (getProduct?.colors || []).map(c => ({
      ...c,
      colorCode:
        c.colorCode || availableColors.find(a => a.colorId === c.colorId)?.colorCode || '#000000', // fallback if missing
      // Ensure sizes have all required properties
      sizes: (c.sizes || []).map(s => ({
        ...s,
        discountper: s.discountper || '0',
        discountprice: s.discountprice || 0,
      })),
    }));

    setName(getProduct?.name);
    setDescription(getProduct?.description);
    setPrice(getProduct?.price.toString());
    setStock(getProduct?.stock.toString());
    setCategory(getProduct?.category?.category);
    setCategoryId(getProduct?.category?._id);
    setSubcategory(getProduct?.subcategory || '');
    setSubSubcategory(getProduct?.subSubcategory || ''); // Set sub-subcategory from product data
    setGeneralImage(getProduct?.images[0]?.url || getProduct?.images[0] || '');
    setColorImages(enrichedColors);
    setChangedColorImages(enrichedColors);
    
    // Handle multiple images for non-clothing categories
    if (getProduct?.multipleImages && Array.isArray(getProduct.multipleImages)) {
      const loadedMultipleImages = getProduct.multipleImages.map(img => ({
        uri: img.cloudinaryUrl || img.localPath || img.url,
        fileName: img.fileName || 'image',
        fileSize: img.fileSize,
        width: img.width,
        height: img.height,
        localPath: img.localPath,
        cloudinaryUrl: img.cloudinaryUrl,
        ...img
      }));
      setMultipleImages(loadedMultipleImages);
      setChangedMultipleImages(loadedMultipleImages);
    } else {
      // Clear multiple images if none exist
      setMultipleImages([]);
      setChangedMultipleImages([]);
    }
    
    setIsVisible(true);

    console.log('Setting product states - subcategory:', getProduct?.subcategory, 'subSubcategory:', getProduct?.subSubcategory);

    // Update available subcategories based on selected category
    if (getProduct?.category?._id) {
      const selectedCategory = categories.find(cat => cat._id === getProduct.category._id);
      console.log('Selected category found:', selectedCategory);
      console.log('Selected category subcategories:', selectedCategory?.subcategories);
      
      if (selectedCategory && selectedCategory.subcategories) {
        // Extract subcategory names properly
        const subcategoryNames = selectedCategory.subcategories.map(subcat => {
          if (typeof subcat === 'string') {
            return subcat;
          } else if (subcat && subcat.name) {
            return subcat.name;
          } else if (typeof subcat === 'object' && subcat !== null) {
            const keys = Object.keys(subcat).filter(key => !isNaN(key)).sort((a, b) => Number(a) - Number(b));
            if (keys.length > 0) {
              return keys.map(key => subcat[key]).join('');
            }
          }
          return String(subcat);
        });
        
        console.log('Extracted subcategory names:', subcategoryNames);
        setAvailableSubcategories(subcategoryNames);
        
        // If product has a subcategory, find and set available sub-subcategories
        if (getProduct?.subcategory) {
          console.log('Product has subcategory:', getProduct.subcategory);
          console.log('Looking for matching subcategory in:', selectedCategory.subcategories);
          
          for (const subcat of selectedCategory.subcategories) {
            let subcatName = '';
            if (typeof subcat === 'string') {
              subcatName = subcat;
            } else if (subcat && subcat.name) {
              subcatName = subcat.name;
            } else if (typeof subcat === 'object' && subcat !== null) {
              const keys = Object.keys(subcat).filter(key => !isNaN(key)).sort((a, b) => Number(a) - Number(b));
              if (keys.length > 0) {
                subcatName = keys.map(key => subcat[key]).join('');
              }
            }
            
            console.log('Comparing subcatName:', subcatName, 'with product subcategory:', getProduct.subcategory);
            
            if (subcatName === getProduct.subcategory) {
              console.log('Found matching subcategory:', subcat);
              console.log('SubSubCategories available:', subcat.subSubCategories);
              
              if (subcat && subcat.subSubCategories && subcat.subSubCategories.length > 0) {
                const subSubcategoryNames = subcat.subSubCategories.map(subSubcat => {
                  if (typeof subSubcat === 'string') {
                    return subSubcat;
                  } else if (subSubcat && subSubcat.name) {
                    return subSubcat.name;
                  } else if (typeof subSubcat === 'object' && subSubcat !== null) {
                    const keys = Object.keys(subSubcat).filter(key => !isNaN(key)).sort((a, b) => Number(a) - Number(b));
                    if (keys.length > 0) {
                      return keys.map(key => subSubcat[key]).join('');
                    }
                  }
                  return String(subSubcat);
                });
                
                console.log('Extracted sub-subcategory names:', subSubcategoryNames);
                console.log('Setting availableSubSubcategories directly:', subSubcategoryNames);
                setAvailableSubSubcategories(subSubcategoryNames);
              } else {
                console.log('No sub-subcategories found for this subcategory');
                setAvailableSubSubcategories([]);
              }
              break;
            }
          }
        } else {
          console.log('Product has no subcategory');
          setAvailableSubSubcategories([]);
        }
      } else {
        console.log('No subcategories found in selected category');
        setAvailableSubcategories([]);
        setAvailableSubSubcategories([]);
      }
    } else {
      console.log('No category found for product');
      setAvailableSubcategories([]);
      setAvailableSubSubcategories([]);
    }

    // console.log('getProduct?.colors ', getProduct?.colors);
    // console.log('Enriched colors with discount values:', JSON.stringify(enrichedColors, null, 2));
  };

  // Pick and Replace General Image
  const pickAndReplaceGeneralImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setGeneralImage(newUri);
      setChangedGeneralImage(newUri); // Track new general image
    }
  };

  // Pick and Replace Color Image
  const replaceColorImage = async (colorIndex, imageIndex) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setColorImages(prevColors => {
        const updatedColors = prevColors.map((color, idx) => {
          if (idx === colorIndex) {
            const updatedImages = [...color.images];
            updatedImages[imageIndex] = newUri;
            return { ...color, images: updatedImages };
          }
          return color;
        });
        setChangedColorImages(updatedColors); // Track changed colors
        return updatedColors;
      });
    }
  };

  const handleFieldChange = (field, value) => {
    setChangedFields(prev => ({ ...prev, [field]: value }));

    if (field === 'categoryId') setCategoryId(value);
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: '#f8f9fa',
          paddingBottom: 20,
        }}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#1e3c72', '#2a5298']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="image-edit" size={40} color="#fff" />
            <Text style={styles.headerText}>Update Product Images</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#ebf8ff' }]}>
              <Icon name="image-multiple" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Product Gallery</Text>
              <Text style={styles.statLabel}>Update product images & variations</Text>
            </View>
          </View>
        </View>

        {showNotification && (
          <Animated.View style={[styles.notificationContainer, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['#43cea2', '#185a9d']}
              style={styles.notificationGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="check-circle" size={24} color="#fff" />
              <Text style={styles.notificationText}>{successMessage}</Text>
              <TouchableOpacity
                onPress={() => setShowNotification(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.mainContainer}>
          {loading && <ActivityIndicator style={styles.loader} size="large" color="#3b5998" />}

          <View style={styles.cardContainer}>
            <View style={styles.pickerSection}>
              <Text style={styles.sectionTitle}>
                <Icon name="shape-outline" size={16} color="#555" /> Select Product
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

            <View style={styles.pickerSection}>
              <Text style={styles.sectionTitle}>
                <Icon name="tag-multiple" size={16} color="#555" /> Select Category
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={categoryId}
                  onValueChange={itemValue => {
                    handleFieldChange('categoryId', itemValue);
                  }}
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

            {(availableSubcategories.length > 0 || categoryId || subcategory) && (
              <View style={styles.pickerSection}>
                <Text style={styles.sectionTitle}>
                  <Icon name="folder-multiple" size={16} color="#555" /> Select Subcategory
                </Text>
                {availableSubcategories.length > 0 ? (
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={subcategory}
                      onValueChange={itemValue => {
                        setSubcategory(itemValue);
                        handleFieldChange('subcategory', itemValue);
                      }}
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
                  <Text style={styles.noItemsText}>
                    No subcategories available for this category
                  </Text>
                )}
              </View>
            )}

            {(availableSubSubcategories.length > 0 || subcategory || subSubcategory) && (
              <View style={styles.pickerSection}>
                <Text style={styles.sectionTitle}>
                  <Icon name="file-tree" size={16} color="#555" /> Select Sub-subcategory
                </Text>
                {availableSubSubcategories.length > 0 ? (
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={subSubcategory}
                      onValueChange={itemValue => {
                        setSubSubcategory(itemValue);
                        handleFieldChange('subSubcategory', itemValue);
                      }}
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
              </View>
            )}

            {generalImage ? (
              <View style={styles.generalImageContainer}>
                <Text style={styles.sectionTitle}>
                  <Icon name="image" size={16} color="#555" /> General Product Image
                </Text>
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{
                      uri:
                        generalImage.startsWith('http') || generalImage.startsWith('file')
                          ? generalImage
                          : `https://nodejsapp-hfpl.onrender.com${generalImage}`,
                    }}
                    style={styles.generalImage}
                  />
                  <TouchableOpacity
                    onPress={pickAndReplaceGeneralImage}
                    style={styles.replaceBtnSmall}
                  >
                    <Icon name="image-edit" size={14} color="#fff" />
                    <Text style={styles.replaceBtnText}>Replace</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : isVisible ? (
              <View style={styles.generalImageContainer}>
                <Text style={styles.sectionTitle}>
                  <Icon name="image" size={16} color="#555" /> General Product Image
                </Text>
                <TouchableOpacity onPress={pickAndReplaceGeneralImage} style={styles.addImageBtn}>
                  <Icon name="image-plus" size={22} color="#fff" />
                  <Text style={styles.addImageBtnText}>Add General Image</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Conditional rendering based on category */}
          {isClothingCategory(category) ? (
            // Color Variants Section for Clothing
            <View style={styles.colorSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderText}>Color Variants</Text>
                <TouchableOpacity onPress={() => setShowColorPicker(true)} style={styles.addColorBtn}>
                  <Icon name="palette-swatch" size={16} color="#fff" />
                  <Text style={styles.addColorBtnText}>Add Color</Text>
                </TouchableOpacity>
              </View>

            {showColorPicker && (
              <View style={styles.colorPickerCard}>
                <Text style={styles.sectionTitle}>Select Color:</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newColorId}
                    onValueChange={itemValue => setNewColorId(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#3b5998"
                  >
                    <Picker.Item label="Select Color" value="" />
                    {availableColors.map(c => (
                      <Picker.Item key={c.colorId} label={c.colorName} value={c.colorId} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={() => {
                      if (!newColorId) return alert('Please select a color first');

                      // 🚨 Check for duplicate colorId
                      const isDuplicate = colorImages.some(c => c.colorId === newColorId);
                      if (isDuplicate) return alert('Color already added!');

                      const selectedColor = availableColors.find(c => c.colorId === newColorId);
                      if (!selectedColor) return alert('Please select a color first');
                      const newColor = {
                        colorId: selectedColor.colorId,
                        colorName: selectedColor.colorName,
                        colorCode: selectedColor.colorCode, // ✅ Add this line
                        images: [],
                        sizes: [],
                      };

                      const updatedColors = [...colorImages, newColor];
                      setColorImages(updatedColors);
                      setChangedColorImages(updatedColors);
                      setShowColorPicker(false);
                      setNewColorId('');
                    }}
                    style={styles.actionButton}
                  >
                    <LinearGradient
                      colors={['#2ecc71', '#27ae60']}
                      style={styles.btnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Icon name="check" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Confirm</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setShowColorPicker(false);
                      setNewColorId('');
                    }}
                    style={[styles.actionButton, { marginLeft: 10 }]}
                  >
                    <LinearGradient
                      colors={['#e74c3c', '#c0392b']}
                      style={styles.btnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Icon name="close" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Cancel</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {colorImages.map((color, idx) => (
              <View key={idx} style={styles.colorCard}>
                <View style={styles.colorHeaderRow}>
                  <View style={styles.colorNameContainer}>
                    <View
                      style={[styles.colorSwatch, { backgroundColor: color.colorCode || '#000' }]}
                    />
                    <Text style={styles.colorName}>{color.colorName}</Text>
                  </View>

                  {!color._id && (
                    <TouchableOpacity
                      onPress={() => {
                        const updatedColors = colorImages.filter((_, i) => i !== idx);
                        setColorImages(updatedColors);
                        setChangedColorImages(updatedColors);
                      }}
                      style={styles.removeButton}
                    >
                      <Icon name="delete" size={16} color="#fff" />
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.subSectionTitle}>Images</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagesScrollView}
                >
                  {color.images && color.images.length > 0 ? (
                    <>
                      {color.images.map((img, i) => (
                        <View key={i} style={styles.imageItem}>
                          <Image
                            source={{
                              uri:
                                img.startsWith('http') || img.startsWith('file')
                                  ? img
                                  : `https://nodejsapp-hfpl.onrender.com${img}`,
                            }}
                            style={styles.colorImage}
                          />
                          <TouchableOpacity
                            onPress={() => replaceColorImage(idx, i)}
                            style={styles.imageActionBtn}
                          >
                            <Icon name="pencil" size={12} color="#fff" />
                            <Text style={styles.imageActionBtnText}>Replace</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </>
                  ) : (
                    <Text style={styles.noImagesText}>No images added yet.</Text>
                  )}

                  <TouchableOpacity
                    onPress={async () => {
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsMultipleSelection: true,
                        quality: 1,
                      });

                      if (!result.canceled) {
                        const selectedImages = result.assets.map(asset => asset.uri);
                        const updatedColors = colorImages.map((c, i) => {
                          if (i === idx) {
                            return {
                              ...c,
                              images: [...(c.images || []), ...selectedImages],
                            };
                          }
                          return c;
                        });
                        setColorImages(updatedColors);
                        setChangedColorImages(updatedColors);
                      }
                    }}
                    style={styles.addImageCard}
                  >
                    <Icon name="image-plus" size={24} color="#3b5998" />
                    <Text style={styles.addImageCardText}>Add Image</Text>
                  </TouchableOpacity>
                </ScrollView>

                <Text style={styles.subSectionTitle}>Size Variants</Text>
                <View style={styles.sizesContainer}>
                  <View style={styles.sizeButtonsRow}>
                    {availableSizes.map(size => {
                      const existingSizeObj = color.sizes?.find(s => s.size === size);
                      const isSelected = !!existingSizeObj;

                      return (
                        <TouchableOpacity
                          key={size}
                          onPress={() => {
                            const updatedColors = colorImages.map((c, i) => {
                              if (i === idx) {
                                let newSizes;
                                if (isSelected) {
                                  newSizes = c.sizes.filter(s => s.size !== size);
                                } else {
                                  newSizes = [
                                    ...(c.sizes || []),
                                    {
                                      size,
                                      price: 0,
                                      stock: 0,
                                      discountper: '0',
                                      discountprice: 0,
                                    },
                                  ];
                                }
                                return { ...c, sizes: newSizes };
                              }
                              return c;
                            });

                            setColorImages(updatedColors);
                            setChangedColorImages(updatedColors);
                          }}
                          style={[styles.sizeButton, isSelected ? styles.selectedSizeButton : {}]}
                        >
                          <Text
                            style={{
                              color: isSelected ? '#fff' : '#333',
                              fontWeight: isSelected ? 'bold' : 'normal',
                            }}
                          >
                            {size}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {color.sizes?.map((sz, sizeIdx) => (
                    <View key={sz.size} style={styles.sizeInputRow}>
                      <View style={styles.sizeLabel}>
                        <Text style={styles.sizeLabelText}>{sz.size}</Text>
                      </View>

                      <View style={styles.sizeDetailsContainer}>
                        <View style={styles.priceStockRow}>
                          <StyledInput
                            label="Price"
                            value={sz.price?.toString()}
                            setValue={val => {
                              const updatedColors = colorImages.map((c, i) => {
                                if (i === idx) {
                                  const newSizes = c.sizes.map((s, j) =>
                                    j === sizeIdx ? { ...s, price: val } : s
                                  );
                                  return { ...c, sizes: newSizes };
                                }
                                return c;
                              });
                              setColorImages(updatedColors);
                              setChangedColorImages(updatedColors);
                            }}
                            placeholder="Price"
                            keyboardType="numeric"
                          />

                          <StyledInput
                            label="Stock"
                            value={sz.stock?.toString()}
                            setValue={val => {
                              const updatedColors = colorImages.map((c, i) => {
                                if (i === idx) {
                                  const newSizes = c.sizes.map((s, j) =>
                                    j === sizeIdx ? { ...s, stock: val } : s
                                  );
                                  return { ...c, sizes: newSizes };
                                }
                                return c;
                              });
                              setColorImages(updatedColors);
                              setChangedColorImages(updatedColors);
                            }}
                            placeholder="Stock"
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.discountRow}>
                          <StyledInput
                            label="Discount"
                            value={sz.discountper?.toString() || ''}
                            setValue={val => {
                              const updatedColors = colorImages.map((c, i) => {
                                if (i === idx) {
                                  const newSizes = c.sizes.map((s, j) => {
                                    if (j === sizeIdx) {
                                      // Calculate discounted price based on the discount
                                      let discountprice = '';
                                      const price = parseFloat(s.price);

                                      if (val && !isNaN(price)) {
                                        if (val.includes('%')) {
                                          // Percentage discount
                                          const percent = parseFloat(val);
                                          if (!isNaN(percent)) {
                                            const discount = (price * percent) / 100;
                                            discountprice = (
                                              price - Math.min(discount, price)
                                            ).toFixed(2);
                                          }
                                        } else {
                                          // Fixed amount discount
                                          const amount = parseFloat(val);
                                          if (!isNaN(amount)) {
                                            discountprice = (
                                              price - Math.min(amount, price)
                                            ).toFixed(2);
                                          }
                                        }
                                      }

                                      return {
                                        ...s,
                                        discountper: val,
                                        discountprice: discountprice,
                                      };
                                    }
                                    return s;
                                  });
                                  return { ...c, sizes: newSizes };
                                }
                                return c;
                              });
                              setColorImages(updatedColors);
                              setChangedColorImages(updatedColors);
                            }}
                            placeholder="% or value"
                            keyboardType="numeric"
                          />

                          <StyledInput
                            label="Final Price"
                            value={sz.discountprice?.toString() || ''}
                            setValue={val => {
                              const updatedColors = colorImages.map((c, i) => {
                                if (i === idx) {
                                  const newSizes = c.sizes.map((s, j) =>
                                    j === sizeIdx ? { ...s, discountprice: val } : s
                                  );
                                  return { ...c, sizes: newSizes };
                                }
                                return c;
                              });
                              setColorImages(updatedColors);
                              setChangedColorImages(updatedColors);
                            }}
                            placeholder="Discounted price"
                            keyboardType="numeric"
                            editable={false}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
          ) : (
            // Multiple Images Section for Non-Clothing Categories
            <View style={styles.multipleImagesSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderText}>Product Images</Text>
                <TouchableOpacity 
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsMultipleSelection: true,
                      quality: 1,
                    });

                    if (!result.canceled) {
                      const selectedImages = result.assets.map(asset => ({
                        uri: asset.uri,
                        fileName: asset.fileName || asset.uri.split('/').pop(),
                        fileSize: asset.fileSize,
                        width: asset.width,
                        height: asset.height,
                        localPath: asset.uri,
                      }));
                      
                      setMultipleImages([...multipleImages, ...selectedImages]);
                      setChangedMultipleImages([...changedMultipleImages, ...selectedImages]);
                    }
                  }} 
                  style={styles.addImageBtn}
                >
                  <Icon name="image-plus" size={16} color="#fff" />
                  <Text style={styles.addImageBtnText}>Add Images</Text>
                </TouchableOpacity>
              </View>

              {multipleImages.length > 0 && (
                <View style={styles.multipleImagesContainer}>
                  <Text style={styles.subSectionTitle}>Selected Images ({multipleImages.length})</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesScrollView}
                  >
                    {multipleImages.map((img, index) => (
                      <View key={index} style={styles.multipleImageItem}>
                        <Image
                          source={{
                            uri: img.uri || img.cloudinaryUrl || 
                              (typeof img === 'string' && (img.startsWith('http') || img.startsWith('file')) 
                                ? img 
                                : `https://nodejsapp-hfpl.onrender.com${img}`)
                          }}
                          style={styles.multipleImage}
                        />
                        <View style={styles.multipleImageActions}>
                          <TouchableOpacity
                            onPress={async () => {
                              const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                quality: 1,
                              });
                          
                              if (!result.canceled) {
                                const newImage = {
                                  uri: result.assets[0].uri,
                                  fileName: result.assets[0].fileName || result.assets[0].uri.split('/').pop(),
                                  fileSize: result.assets[0].fileSize,
                                  width: result.assets[0].width,
                                  height: result.assets[0].height,
                                  localPath: result.assets[0].uri,
                                };
                                
                                const updatedImages = [...multipleImages];
                                updatedImages[index] = newImage;
                                setMultipleImages(updatedImages);
                                setChangedMultipleImages(updatedImages);
                              }
                            }}
                            style={styles.replaceImageBtn}
                          >
                            <Icon name="pencil" size={10} color="#fff" />
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            onPress={() => {
                              const updatedImages = multipleImages.filter((_, i) => i !== index);
                              setMultipleImages(updatedImages);
                              setChangedMultipleImages(updatedImages);
                            }}
                            style={styles.removeImageBtn}
                          >
                            <Icon name="delete" size={10} color="#fff" />
                          </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.imageFileName} numberOfLines={1}>
                          {img.fileName || 'image'}
                        </Text>
                      </View>
                    ))}
                    
                    {/* Add more images button within the scroll view */}
                    <TouchableOpacity
                      onPress={async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: ImagePicker.MediaTypeOptions.Images,
                          allowsMultipleSelection: true,
                          quality: 1,
                        });

                        if (!result.canceled) {
                          const selectedImages = result.assets.map(asset => ({
                            uri: asset.uri,
                            fileName: asset.fileName || asset.uri.split('/').pop(),
                            fileSize: asset.fileSize,
                            width: asset.width,
                            height: asset.height,
                            localPath: asset.uri,
                          }));
                          
                          setMultipleImages([...multipleImages, ...selectedImages]);
                          setChangedMultipleImages([...changedMultipleImages, ...selectedImages]);
                        }
                      }}
                      style={styles.addMoreImageCard}
                    >
                      <Icon name="image-plus" size={24} color="#3b5998" />
                      <Text style={styles.addMoreImageText}>Add More</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}
              
              {multipleImages.length === 0 && (
                <View style={styles.emptyImagesContainer}>
                  <Icon name="image-off-outline" size={48} color="#a0aec0" />
                  <Text style={styles.emptyImagesText}>No images added yet</Text>
                  <Text style={styles.emptyImagesSubtext}>Tap "Add Images" to get started</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.btnUpdate}
            onPress={handleUploadChanges}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1e3c72', '#2a5298']}
              style={styles.updateBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="content-save-all" size={20} color="#fff" />
              <Text style={styles.btnUpdateText}>UPDATE PRODUCT IMAGES</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Image Management v1.0</Text>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    padding: 15,
  },
  scrollContainer: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
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
    marginHorizontal: 15,
    marginBottom: 15,
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
  loader: {
    marginVertical: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7e6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  successMessage: {
    color: 'green',
    marginLeft: 10,
    fontSize: 14,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pickerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
    color: '#4a5568',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  generalImageContainer: {
    alignItems: 'center',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  generalImage: {
    width: 140,
    height: 140,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  replaceBtnSmall: {
    backgroundColor: '#3b5998',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replaceBtnText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b5998',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 10,
  },
  addImageBtnText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  colorSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },
  addColorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addColorBtnText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 5,
    fontWeight: '500',
  },
  colorPickerCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    flex: 1,
  },
  btnGradient: {
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 14,
  },
  colorCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  colorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  colorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  colorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53e3e',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 3,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 10,
  },
  imagesScrollView: {
    marginBottom: 15,
  },
  imageItem: {
    marginRight: 12,
    alignItems: 'center',
  },
  colorImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  imageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3182ce',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  imageActionBtnText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 3,
  },
  noImagesText: {
    color: '#a0aec0',
    fontStyle: 'italic',
    fontSize: 12,
    alignSelf: 'center',
    marginVertical: 30,
  },
  addImageCard: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3182ce',
    backgroundColor: '#ebf8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageCardText: {
    color: '#3182ce',
    fontSize: 10,
    marginTop: 5,
  },
  sizesContainer: {
    marginBottom: 10,
  },
  sizeButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedSizeButton: {
    backgroundColor: '#3182ce',
  },
  sizeInputRow: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  sizeLabel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3182ce',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 8,
  },
  sizeLabelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sizeDetailsContainer: {
    flex: 1,
  },
  priceStockRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  discountRow: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  discountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  discountPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  discountLabel: {
    marginRight: 5,
    fontWeight: '500',
    fontSize: 13,
    color: '#555',
  },
  discountInput: {
    flex: 1,
    height: 35,
    fontSize: 12,
  },
  btnUpdate: {
    borderRadius: 25,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  updateBtnGradient: {
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
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  // Improved styles for input fields
  styledInputContainer: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 3,
  },
  inputWrapper: {
    // flexDirection: "row",
    // alignItems: "center",
    // borderWidth: 1,
    // borderColor: "#e2e8f0",
    // borderRadius: 6,
    // backgroundColor: "#fff",
    // overflow: "hidden",
    // minHeight: 38,
  },
  disabledInput: {
    backgroundColor: '#f7fafc',
    borderColor: '#edf2f7',
  },
  styledInputField: {
    flex: 1,
    height: 38,
    fontSize: 13,
  },
  currencySymbol: {
    paddingHorizontal: 8,
    color: '#4a5568',
    fontWeight: '500',
  },
  notificationContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  notificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  notificationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  // New styles for enhanced subcategory display
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
  // Styles for multiple images section (non-clothing categories)
  multipleImagesSection: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  multipleImagesContainer: {
    marginTop: 10,
  },
  multipleImageItem: {
    marginRight: 12,
    alignItems: 'center',
    position: 'relative',
  },
  multipleImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  multipleImageActions: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
  },
  replaceImageBtn: {
    backgroundColor: '#3182ce',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
  },
  removeImageBtn: {
    backgroundColor: '#e53e3e',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageFileName: {
    fontSize: 10,
    color: '#4a5568',
    marginTop: 5,
    textAlign: 'center',
    maxWidth: 90,
  },
  addMoreImageCard: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3182ce',
    backgroundColor: '#ebf8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addMoreImageText: {
    color: '#3182ce',
    fontSize: 10,
    marginTop: 5,
  },
  emptyImagesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyImagesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginTop: 15,
    textAlign: 'center',
  },
  emptyImagesSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default UpdateImageProducts;
