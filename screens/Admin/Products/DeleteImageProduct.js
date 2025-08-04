import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllProducts,
  deleteProductImage,
  deleteAllProductImages,
} from '../../../redux/features/auth/productActions';
import Layout from '../../../components/Layout/Layout';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DeleteImageProduct = ({ route }) => {
  const dispatch = useDispatch();
  const { products, loading, message } = useSelector(state => state.product);

  const [productId, setProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    dispatch(getAllProducts());
    setProductId(route.params.id);
  }, []);

  useEffect(() => {
    const prod = products.find(p => p._id === productId);
    setSelectedProduct(prod || null);
    setSelectedColor(null); // Reset selected color when product changes
  }, [productId, products]);

  const handleDeleteImage = (productId, img, color = null) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          dispatch(deleteProductImage(productId, img, color));
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDeleteAllImages = () => {
    Alert.alert(
      'Delete All Images',
      'Are you sure you want to delete ALL images of this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          onPress: () => {
            dispatch(deleteAllProductImages(productId));
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: '#f8f9fa',
          paddingBottom: 20,
          minHeight: '100%',
        }}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#1e3c72', '#2a5298']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="image-remove" size={40} color="#fff" />
            <Text style={styles.headerText}>Delete Product Images</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#feebef' }]}>
              <Icon name="delete-sweep" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Image Management</Text>
              <Text style={styles.statLabel}>Delete unwanted product images</Text>
            </View>
          </View>
        </View>

        <View style={styles.mainContainer}>
          {loading && <ActivityIndicator style={styles.loader} size="large" color="#3b5998" />}

          {message?.includes('deleted') && message && (
            <View style={styles.messageContainer}>
              <Icon name="check-circle" size={20} color="green" />
              <Text style={styles.successMessage}>{message}</Text>
            </View>
          )}

          <View style={styles.cardContainer}>
            <Text style={styles.sectionTitle}>
              <Icon name="shape-outline" size={16} color="#555" /> Select Product
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={productId}
                onValueChange={value => setProductId(value)}
                style={styles.picker}
                dropdownIconColor="#3b5998"
              >
                <Picker.Item label="-- Select Product --" value="" />
                {products.map(p => (
                  <Picker.Item key={p._id} label={p.name} value={p._id} />
                ))}
              </Picker>
            </View>
          </View>

          {selectedProduct && (
            <>
              {/* Product Info Card */}
              <View style={styles.cardContainer}>
                <Text style={styles.sectionTitle}>
                  <Icon name="information-outline" size={16} color="#555" /> Product Details
                </Text>

                <View style={styles.productInfoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.name}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Category:</Text>
                    <Text style={styles.infoValue}>
                      {selectedProduct.category?.category || 'No category'}
                    </Text>
                  </View>

                  {selectedProduct.subcategory && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Subcategory:</Text>
                      <Text style={styles.infoValue}>{selectedProduct.subcategory}</Text>
                    </View>
                  )}

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Stock:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.stock}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardContainer}>
                <Text style={styles.sectionTitle}>
                  <Icon name="image" size={16} color="#555" /> General Images
                </Text>
                <View style={styles.imageList}>
                  {selectedProduct?.images?.length > 0 ? (
                    selectedProduct.images.map((img, index) => (
                      <View key={index} style={styles.imageCard}>
                        <Image
                          source={{
                            uri: img.url?.startsWith('http')
                              ? img.url
                              : `https://nodejsapp-hfpl.onrender.com${img.url}`,
                          }}
                          style={styles.image}
                        />
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteImage(productId, img.url, null)}
                        >
                          <LinearGradient
                            colors={['#ff4757', '#ff6b81']}
                            style={styles.deleteButtonGradient}
                          >
                            <Icon name="trash-can-outline" size={16} color="#fff" />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noImagesText}>No general images available</Text>
                  )}
                </View>
              </View>

              <View style={styles.cardContainer}>
                <Text style={styles.sectionTitle}>
                  <Icon name="palette-swatch" size={16} color="#555" /> Color Variants
                </Text>

                {selectedProduct.colors?.length > 0 ? (
                  <View style={styles.colorSelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedProduct.colors.map((colorItem, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.colorChip,
                            selectedColor === colorItem.colorId && styles.selectedColorChip,
                          ]}
                          onPress={() => setSelectedColor(colorItem.colorId)}
                        >
                          <View
                            style={[
                              styles.colorDot,
                              {
                                backgroundColor: colorItem.colorCode || '#000',
                              },
                            ]}
                          />
                          <Text style={styles.colorChipText}>{colorItem.colorName}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  <Text style={styles.noImagesText}>No color variants available</Text>
                )}

                {selectedColor && (
                  <View style={styles.selectedColorContainer}>
                    {selectedProduct.colors.find(c => c.colorId === selectedColor)?.images?.length >
                    0 ? (
                      <View style={styles.imageGrid}>
                        {selectedProduct.colors
                          .find(c => c.colorId === selectedColor)
                          .images.map((img, index) => (
                            <View key={index} style={styles.imageCard}>
                              <Image
                                source={{
                                  uri: img.startsWith('http')
                                    ? img
                                    : `https://nodejsapp-hfpl.onrender.com${img}`,
                                }}
                                style={styles.image}
                              />
                              <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() =>
                                  handleDeleteImage(
                                    productId,
                                    img,
                                    selectedProduct.colors.find(c => c.colorId === selectedColor)
                                      .colorName
                                  )
                                }
                              >
                                <LinearGradient
                                  colors={['#ff4757', '#ff6b81']}
                                  style={styles.deleteButtonGradient}
                                >
                                  <Icon name="trash-can-outline" size={16} color="#fff" />
                                  <Text style={styles.deleteButtonText}>Delete</Text>
                                </LinearGradient>
                              </TouchableOpacity>
                            </View>
                          ))}
                      </View>
                    ) : (
                      <Text style={styles.noImagesText}>No images for this color variant</Text>
                    )}
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.deleteAllButton} onPress={handleDeleteAllImages}>
                <LinearGradient
                  colors={['#d32f2f', '#b71c1c']}
                  style={styles.deleteAllGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="delete-forever" size={20} color="#fff" />
                  <Text style={styles.deleteAllButtonText}>DELETE ALL IMAGES</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Image Management v1.0</Text>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
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
  mainContainer: {
    padding: 15,
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
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
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
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  imageCard: {
    margin: 8,
    alignItems: 'center',
    width: 120,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deleteButton: {
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    width: '80%',
  },
  deleteButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '600',
  },
  noImagesText: {
    color: '#a0aec0',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  colorSelector: {
    marginBottom: 15,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedColorChip: {
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#3182ce',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  colorChipText: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '500',
  },
  selectedColorContainer: {
    marginTop: 10,
  },
  deleteAllButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  deleteAllGradient: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAllButtonText: {
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
  footerText: {
    color: '#a0aec0',
    fontSize: 12,
  },
  productInfoGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%', // Two items per row
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
  },
});

export default DeleteImageProduct;
