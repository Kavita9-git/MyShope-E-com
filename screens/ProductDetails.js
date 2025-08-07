import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRef } from 'react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeFromCart,
  clearCart,
  addToCart,
  decreaseQty,
  increaseQty,
} from '../redux/features/auth/cartActions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ProductsData } from '../data/ProductsData';
import Layout from '../components/Layout/Layout';
import { LinearGradient } from 'expo-linear-gradient';
import DisplayMessage from '../components/Message/DisplayMessage';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllProducts } from '../redux/features/auth/productActions';
import Toast from '../components/Message/Toast';
import useToast from '../hooks/useToast';

// Accordion component for collapsible content
const AccordionItem = ({ title, body, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.accordionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon}
          <Text style={styles.accordionTitle}>{title}</Text>
        </View>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.accordionBody}>
          <Text style={styles.accordionText}>{body}</Text>
        </View>
      )}
    </View>
  );
};

const AccordionList = ({ list }) => {
  return (
    <View>
      {list.map((item, index) => (
        <AccordionItem key={index} title={item.title} body={item.body} icon={item.icon} />
      ))}
    </View>
  );
};

//get screen width
const screenWidth = Dimensions.get('window').width;

const ProductDetails = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { products } = useSelector(state => state.product);
  const { message } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.user);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [pDetails, setPtDetails] = useState([]);
  const [qty, setQty] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const scrollRef = useRef(null);
  const pageScrollRef = useRef(null);

  // Review related states
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(false);
  const [handleincqty, setHandleincQty] = useState(false);
  const [handledecqty, setHandledecQty] = useState(false);
  const [handleaddtocart, setHandleaddToCart] = useState(false);

  const singleProductData = products;

  //Get Products Details from Route Params id
  useEffect(() => {
    console.log('handleincqty :', handleincqty);
    console.log('handledecqty :', handledecqty);
    console.log('handleaddtocart :', handleaddtocart);

    dispatch(getAllProducts());
    //Find Product Details
    const getProduct = singleProductData.find(p => {
      return p?._id === route.params?._id;
    });
    setPtDetails(getProduct);
    console.log('getProduct :', getProduct);

    // Check if product is clothing category
    const isClothing = getProduct?.category?.category?.toLowerCase() === 'clothes';
    
    // If product has colors, set the first color as selected
    if (getProduct?.colors && getProduct.colors.length > 0) {
      setSelectedColor(getProduct.colors[0]);
      
      // Handle color images based on category type
      if (isClothing && getProduct.colors[0].images?.length > 0) {
        // For clothing: color images are URL strings, need server prefix
        setCurrentImages(
          getProduct.colors[0].images.map(img => ({
            url: img.startsWith('http') ? img : `https://nodejsapp-hfpl.onrender.com${img}`,
          }))
        );
      } else {
        // For non-clothing: fallback to general images or multiple images
        const imagesToUse = getProduct.multipleImages?.length > 0 
          ? getProduct.multipleImages 
          : (getProduct.images || []);
        setCurrentImages(imagesToUse);
      }

      // Set available sizes for the selected color (only for clothing)
      if (isClothing && getProduct.colors[0].sizes && getProduct.colors[0].sizes.length > 0) {
        setAvailableSizes(getProduct.colors[0].sizes);
        setSelectedSize(getProduct.colors[0].sizes[0]);
      }
    } else {
      // If no colors, use multiple images first, then fallback to general images
      const imagesToUse = getProduct?.multipleImages?.length > 0 
        ? getProduct.multipleImages 
        : (getProduct?.images || []);
      setCurrentImages(imagesToUse);
    }

    // Set reviews
    if (getProduct?.reviews) {
      setReviews(getProduct.reviews);

      // Check if user has already reviewed
      if (user && user._id) {
        const hasReviewed = getProduct.reviews.some(review => review.user === user._id);
        setUserHasReviewed(hasReviewed);
      }
    }

    setSuccessMessage('');
  }, [route.params?._id, refreshReviews, handleincqty, handledecqty, handleaddtocart]);

  // Handle color selection
  const handleColorSelect = color => {
    console.log('Selected Color:', color);
    setSelectedColor(color);
    setQty(1);
    setSuccessMessage('');
    // Reset carousel position
    setCurrentIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: true });

    // Check if product is clothing category
    const isClothing = pDetails?.category?.category?.toLowerCase() === 'clothes';

    // Update images based on the selected color and category type
    if (isClothing && color.images && color.images.length > 0) {
      // For clothing: color images are URL strings, need server prefix
      setCurrentImages(
        color.images.map(img => ({
          url: img.startsWith('http') ? img : `https://nodejsapp-hfpl.onrender.com${img}`,
        }))
      );
    } else {
      // For non-clothing: fallback to multiple images or general images
      const imagesToUse = pDetails?.multipleImages?.length > 0 
        ? pDetails.multipleImages 
        : (pDetails?.images || []);
      setCurrentImages(imagesToUse);
    }

    // Update available sizes based on the selected color (only for clothing)
    if (isClothing && color.sizes && color.sizes.length > 0) {
      // Find the updated color data to get current stock levels
      const updatedColor = pDetails.colors?.find(c => c.colorId === color.colorId) || color;
      setAvailableSizes(updatedColor.sizes || color.sizes);
      setSelectedSize(updatedColor.sizes?.[0] || color.sizes[0]);
    } else {
      setAvailableSizes([]);
      setSelectedSize(null);
    }
  };

  // Handle size selection
  const handleSizeSelect = size => {
    console.log('Selected Size:', size);
    // Find the size with current stock level from availableSizes
    const currentSize = availableSizes.find(s => s.size === size.size) || size;
    setSelectedSize(currentSize);
    setQty(1);
    setSuccessMessage('');

    // Reset quantity if it exceeds the available stock for the selected size
    if (qty > currentSize.stock) {
      setQty(currentSize.stock > 0 ? Math.min(currentSize.stock, qty) : 1);
    }
  };

  //Handle Function For Quantity Change + -
  const handleAddQty = () => {
    console.log(
      'Add Quantity - Current Qty:',
      qty,
      'Stock:',
      selectedSize ? selectedSize.stock : pDetails?.stock
    );
    // Get the appropriate stock to check (size-specific or general product stock)
    const currentStock = selectedSize ? selectedSize.stock : pDetails?.stock;

    // Check if we've reached the stock limit
    if (qty >= currentStock) {
      // return alert(`Maximum available stock is ${currentStock}`);
      return showError(`Maximum available stock is ${currentStock}`);
    }

    // If within stock limits, increment quantity
    setQty(() => qty + 1);

    // Update stock in local state for immediate UI feedback
    if (selectedSize) {
      // Update size-specific stock
      const updatedColors = pDetails.colors.map(color => {
        if (color.colorId === selectedColor.colorId) {
          const updatedSizes = color.sizes.map(size => {
            if (size.size === selectedSize.size) {
              return { ...size, stock: size.stock - 1 };
            }
            return size;
          });
          return { ...color, sizes: updatedSizes };
        }
        return color;
      });
      setPtDetails(prev => ({ ...prev, colors: updatedColors }));

      // Update selectedSize state as well
      setSelectedSize(prev => ({ ...prev, stock: prev.stock - 1 }));

      // Update availableSizes state
      setAvailableSizes(prev =>
        prev.map(size =>
          size.size === selectedSize.size ? { ...size, stock: size.stock - 1 } : size
        )
      );
    } else {
      // Update general product stock
      setPtDetails(prev => ({ ...prev, stock: prev.stock - 1 }));
    }

    setSuccessMessage('');
    setHandleincQty(!handleincqty);
  };

  const handleRemoveQty = () => {
    console.log('Remove Quantity - Current Qty:', qty);
    if (qty <= 1) return;
    setQty(() => qty - 1);

    // Update stock in local state for immediate UI feedback
    if (selectedSize) {
      // Update size-specific stock
      const updatedColors = pDetails.colors.map(color => {
        if (color.colorId === selectedColor.colorId) {
          const updatedSizes = color.sizes.map(size => {
            if (size.size === selectedSize.size) {
              return { ...size, stock: size.stock + 1 };
            }
            return size;
          });
          return { ...color, sizes: updatedSizes };
        }
        return color;
      });
      setPtDetails(prev => ({ ...prev, colors: updatedColors }));

      // Update selectedSize state as well
      setSelectedSize(prev => ({ ...prev, stock: prev.stock + 1 }));

      // Update availableSizes state
      setAvailableSizes(prev =>
        prev.map(size =>
          size.size === selectedSize.size ? { ...size, stock: size.stock + 1 } : size
        )
      );
    } else {
      // Update general product stock
      setPtDetails(prev => ({ ...prev, stock: prev.stock + 1 }));
    }

    setSuccessMessage('');
    setHandledecQty(!handledecqty);
  };

  const handleScroll = event => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / screenWidth);
    setCurrentIndex(index);
    setSuccessMessage('');
  };

  const scrollToIndex = index => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setCurrentIndex(index);
    setSuccessMessage('');
  };

  const goToNext = () => {
    if (currentIndex < (currentImages?.length || 1) - 1) {
      scrollToIndex(currentIndex + 1);
      setSuccessMessage('');
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
      setSuccessMessage('');
    }
  };

  const handleAddToCart = async p => {
    console.log('Add to Cart - Product:', p);
    // Validation for clothing products
    if (isClothingProduct) {
      if (!selectedColor) {
        // return alert('Please select a color');
        return showError('Please select a color');
      }
      if (!selectedSize) {
        // return alert('Please select a size');
        return showError('Please select a size');
      }
    } else {
      // Validation for non-clothing products
      if (p.colors && p.colors.length > 0 && !selectedColor) {
        // return alert('Please select a color');
        return showError('Please select a color');
      }
    }

    // Check stock availability
    const currentStock = selectedSize ? selectedSize.stock : p.stock;
    if (currentStock <= 0) {
      // return alert('This product is out of stock');
      return showError('This product is out of stock');
    }

    // Check if selected quantity is available
    if (qty > currentStock) {
      // return alert(`Only ${currentStock} items available in stock`);
      return showError(`Only ${currentStock} items available in stock`);
    }

    try {
      // Dispatch add to cart action
      const result = await dispatch(
        addToCart({
          productId: p._id,
          name: p.name,
          price: selectedSize?.price || p.price,
          image: currentImages[0]?.url || p.images?.[0]?.url,
          quantity: qty,
          size: selectedSize?.size,
          color: selectedColor?.colorName,
        })
      );

      // If successfully added to cart, update local stock immediately
      if (result.type === 'addToCartSuccess') {
        if (selectedSize) {
          // Update size-specific stock
          const updatedColors = pDetails.colors.map(color => {
            if (color.colorId === selectedColor.colorId) {
              const updatedSizes = color.sizes.map(size => {
                if (size.size === selectedSize.size) {
                  return { ...size, stock: Math.max(0, size.stock - qty) };
                }
                return size;
              });
              return { ...color, sizes: updatedSizes };
            }
            return color;
          });
          setPtDetails(prev => ({ ...prev, colors: updatedColors }));

          // Update selectedSize state as well
          setSelectedSize(prev => ({ ...prev, stock: Math.max(0, prev.stock - qty) }));

          // Update availableSizes state
          setAvailableSizes(prev =>
            prev.map(size =>
              size.size === selectedSize.size
                ? { ...size, stock: Math.max(0, size.stock - qty) }
                : size
            )
          );
        } else {
          // Update general product stock
          setPtDetails(prev => ({ ...prev, stock: Math.max(0, prev.stock - qty) }));
        }

        setQty(1);
        // setSuccessMessage('Product added to cart');
        showSuccess('Product added to cart');

        // Refresh products to get updated stock from server
        dispatch(getAllProducts());
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // alert('Failed to add product to cart. Please try again.');
      showError('Failed to add product to cart. Please try again.');
    }

    setHandleaddToCart(!handleaddtocart);
  };

  // Star rating component
  const StarRating = ({ rating, size = 20, onRatingPress = null }) => {
    return (
      <View style={styles.starRatingContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => (onRatingPress ? onRatingPress(star) : null)}
            disabled={!onRatingPress}
          >
            <AntDesign
              name={star <= rating ? 'star' : 'staro'}
              size={size}
              color={star <= rating ? '#FFB800' : '#ccc'}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Handle rating change
  const handleRatingChange = value => {
    setUserRating(value);
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user || !user._id) {
      // Alert.alert('Login Required', 'Please login to submit a review');
      showError('Login Required', 'Please login to submit a review');
      return;
    }

    if (!reviewComment.trim()) {
      // setErrorMessage('Please add a comment to your review');
      showError('Please add a comment to your review');
      return;
    }

    try {
      setIsSubmittingReview(true);
      setErrorMessage('');

      // Get token from AsyncStorage if not available in the user object
      let authToken = user.token;
      if (!authToken) {
        try {
          authToken = await AsyncStorage.getItem('@auth');
          console.log('Retrieved token from AsyncStorage:', authToken ? 'Token found' : 'No token');
          if (!authToken) {
            setErrorMessage('Authentication error: Please log in again');
            setIsSubmittingReview(false);
            return;
          }
        } catch (err) {
          console.log('Error retrieving token:', err);
          setErrorMessage('Authentication error: Please log in again');
          setIsSubmittingReview(false);
          return;
        }
      }

      const reviewData = {
        rating: userRating,
        comment: reviewComment.trim(),
      };

      console.log('Submitting review for product ID:', pDetails._id);
      console.log('Review data:', reviewData);
      console.log('Using auth token:', authToken ? 'Token available' : 'No token');

      // Use PUT instead of POST to match the server route configuration
      const response = await axios.put(
        `https://nodejsapp-hfpl.onrender.com/api/v1/product/${pDetails._id}/review`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Review response:', response.data);

      if (response.data.success) {
        // setSuccessMessage('Review submitted successfully');
        showSuccess('Review submitted successfully');
        setReviewComment('');
        setShowReviewForm(false);
        setUserHasReviewed(true);

        // Update product details with the new review
        if (response.data.product) {
          const updatedProduct = response.data.product;
          setPtDetails(updatedProduct);
          setReviews(updatedProduct.reviews || []);
        } else {
          // If product not returned, refresh reviews after a short delay
          setTimeout(() => {
            setRefreshReviews(!refreshReviews);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);

      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);

        if (
          error.response.status === 401 ||
          (error.response.status === 500 &&
            error.response.data.error &&
            error.response.data.error.name === 'JsonWebTokenError')
        ) {
          // setErrorMessage('Authentication failed. Please login again.');
          showError('Authentication failed. Please login again.');
        } else if (error.response.status === 404) {
          // setErrorMessage(
          //   'Review submission failed: API endpoint not found. Please try again later.'
          // );
          showError('Review submission failed: API endpoint not found. Please try again later.');
        } else if (
          error.response.status === 400 &&
          error.response.data.message === 'Product Already Reviewed'
        ) {
          // setErrorMessage('You have already reviewed this product.');
          showError('You have already reviewed this product.');
          setUserHasReviewed(true);
          setTimeout(() => setShowReviewForm(false), 1500);
        } else if (error.response.data && error.response.data.message) {
          // setErrorMessage(error.response.data.message);
          showError(error.response.data.message);
        } else {
          // setErrorMessage(`Error (${error.response.status}): Failed to submit review`);
          showError(`Error (${error.response.status}): Failed to submit review`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log('Error request:', error.request);
        // setErrorMessage('Network error: No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        showError('Failed to submit review. Please try again later.');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Check if product is in Clothes category
  const isClothingProduct = pDetails?.category?.category === 'Clothes';

  const { params } = route;
  return (
    <Layout showBackButton={true}>
      <ScrollView
        ref={pageScrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
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
              <Text style={styles.headerTitle}>Product Details</Text>
              <Text style={styles.headerSubtitle}>
                {pDetails?.category?.category || 'Product Information'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.imageCarouselContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {currentImages?.map((img, index) => (
              <Image
                key={index}
                // source={{ uri: img.url  }}
                source={{
                  uri: img?.url.startsWith('http')
                    ? img?.url
                    : `https://nodejsapp-hfpl.onrender.com${img?.url}`,
                }}
                style={styles.imageCarousel}
              />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {currentImages?.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: currentIndex === index ? '#fff' : 'rgba(255,255,255,0.5)',
                  },
                ]}
              />
            ))}
          </View>

          {/* Prev / Next buttons */}
          <View style={styles.carouselButtons}>
            <TouchableOpacity
              onPress={goToPrev}
              disabled={currentIndex === 0}
              style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            >
              <Icon name="chevron-left" size={24} color="#2a5298" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToNext}
              disabled={currentIndex === (currentImages?.length || 1) - 1}
              style={[
                styles.navButton,
                currentIndex === (currentImages?.length || 1) - 1 && styles.navButtonDisabled,
              ]}
            >
              <Icon name="chevron-right" size={24} color="#2a5298" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#ebf8ff' }]}>
              <Feather name="tag" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>${selectedSize?.price || pDetails?.price}</Text>
              <Text style={styles.statLabel}>Price</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#feebef' }]}>
              <Feather name="package" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>
                {selectedSize ? selectedSize.stock : pDetails?.stock || 0}
              </Text>
              <Text style={styles.statLabel}>In Stock</Text>
            </View>
          </View>
        </View>

        {/* Add rating card above product info */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingHeader}>
            <View style={styles.ratingStarsContainer}>
              <StarRating rating={pDetails?.rating || 0} size={18} />
              <Text style={styles.ratingValue}>
                {pDetails?.rating ? pDetails.rating.toFixed(1) : '0.0'}
              </Text>
            </View>
            <Text style={styles.reviewsCount}>({pDetails?.numReviews || 0} reviews)</Text>
          </View>
        </View>

        <View style={styles.productInfoCard}>
          <Text style={styles.productTitle}>{pDetails?.name}</Text>
          <Text style={styles.productDescription}>{pDetails?.description}</Text>
        </View>

        {/* Return Policy and Shipping Information */}
        <View style={styles.sectionCard}>
          <AccordionList
            list={[
              {
                title: 'Return Policy',
                body: (
                  <Text>
                    'This item is eligible for return within {pDetails?.returnPolicy} of delivery.
                    Please refer to our full return policy for more details.'
                  </Text>
                ),
                icon: <Icon name="package-variant-closed" size={20} color="#333" />,
              },
              {
                title: 'Shipping Information',
                body: (
                  <Text>
                    Standard shipping takes {pDetails?.shippingInformation} business days. Express
                    shipping options are available at checkout.
                  </Text>
                ),
                icon: <MaterialIcons name="local-shipping" size={20} color="#333" />,
              },
            ]}
          />
        </View>

        {/* Color Selection */}
        {pDetails?.colors && pDetails.colors.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              <Icon name="palette" size={18} color="#333" /> Select Color
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.colorContainer}
            >
              {pDetails.colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color.colorCode },
                    selectedColor?.colorId === color.colorId && styles.selectedColorButton,
                  ]}
                  onPress={() => handleColorSelect(color)}
                >
                  {selectedColor?.colorId === color.colorId && (
                    <Icon
                      name="check"
                      size={16}
                      color={
                        color.colorCode === '#FFFFFF' || color.colorCode === '#FFF'
                          ? '#000'
                          : '#FFF'
                      }
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedColor && (
              <View style={styles.selectedItemBadge}>
                <Text style={styles.selectedItemText}>Selected: {selectedColor.colorName}</Text>
              </View>
            )}
          </View>
        )}

        {/* Size Selection - Only show for Clothes category and if sizes are available */}
        {isClothingProduct && availableSizes.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              <Icon name="ruler" size={18} color="#333" /> Select Size
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sizeContainer}
            >
              {availableSizes.map((sizeObj, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sizeButton,
                    selectedSize?.size === sizeObj.size && styles.selectedSizeButton,
                    sizeObj.stock <= 0 && styles.outOfStockSize,
                  ]}
                  onPress={() => handleSizeSelect(sizeObj)}
                  disabled={sizeObj.stock <= 0}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize?.size === sizeObj.size && styles.selectedSizeText,
                      sizeObj.stock <= 0 && styles.outOfStockSizeText,
                    ]}
                  >
                    {sizeObj.size}
                  </Text>
                  {sizeObj.price && sizeObj.price !== 0 && (
                    <Text
                      style={[
                        styles.sizePriceText,
                        selectedSize?.size === sizeObj.size && styles.selectedSizePriceText,
                        sizeObj.stock <= 0 && styles.outOfStockSizeText,
                      ]}
                    >
                      ${sizeObj.price}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedSize && (
              <View style={styles.selectedItemBadge}>
                <Text style={styles.selectedItemText}>
                  Selected: {selectedSize.size}
                  {selectedSize.price && selectedSize.price > 0 && (
                    <Text style={styles.sizePriceHighlight}> - ${selectedSize.price}</Text>
                  )}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.reviewSectionCard}>
          <View style={styles.reviewSectionHeader}>
            <Text style={styles.sectionTitle}>
              <Icon name="star-face" size={20} color="#333" /> Customer Reviews
            </Text>
            {!userHasReviewed && user && user._id && (
              <TouchableOpacity
                style={styles.addReviewButton}
                onPress={() => setShowReviewForm(!showReviewForm)}
              >
                <Text style={styles.addReviewButtonText}>
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Review Form */}
          {showReviewForm && (
            <View style={styles.reviewFormContainer}>
              <View style={styles.ratingSelectContainer}>
                <Text style={styles.ratingSelectLabel}>Your Rating:</Text>
                <StarRating rating={userRating} onRatingPress={handleRatingChange} size={24} />
              </View>

              <View style={styles.reviewInputContainer}>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write your review here..."
                  multiline
                  numberOfLines={4}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.submitReviewButton}
                onPress={handleSubmitReview}
                disabled={isSubmittingReview || !reviewComment.trim()}
              >
                <LinearGradient
                  colors={!reviewComment.trim() ? ['#ccc', '#999'] : ['#1e3c72', '#2a5298']}
                  style={styles.submitReviewButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isSubmittingReview ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.submitReviewButtonText}>Submit Review</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Reviews List */}
          <View style={styles.reviewsListContainer}>
            {reviews && reviews.length > 0 ? (
              reviews.map((review, index) => (
                <View key={index} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUser}>
                      <View style={styles.reviewUserAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                      </View>
                      <Text style={styles.reviewUserName}>{review.name}</Text>
                    </View>
                    <View style={styles.reviewRating}>
                      <StarRating rating={review.rating} size={12} />
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noReviewsContainer}>
                <Icon name="emoticon-sad-outline" size={40} color="#CBD5E0" />
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.beFirstText}>Be the first to review this product</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionCard}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => handleRemoveQty()}>
                <AntDesign name="minus" size={16} color="#2a5298" />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{qty}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => handleAddQty()}>
                <AntDesign name="plus" size={16} color="#2a5298" />
              </TouchableOpacity>
            </View>
          </View>

          <DisplayMessage successMessage={successMessage} messageType="added" />

          <TouchableOpacity
            onPress={() => handleAddToCart(pDetails)}
            disabled={(selectedSize && selectedSize.stock <= 0) || pDetails?.stock <= 0}
            style={styles.addToCartButtonContainer}
          >
            <LinearGradient
              colors={
                (selectedSize ? selectedSize.stock > 0 : pDetails?.stock > 0)
                  ? ['#1e3c72', '#2a5298']
                  : ['#999', '#777']
              }
              style={styles.addToCartButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <AntDesign name="shoppingcart" size={20} color="#fff" style={styles.cartIcon} />
              <Text style={styles.addToCartText}>
                {(selectedSize ? selectedSize.stock > 0 : pDetails?.stock > 0)
                  ? 'ADD TO CART'
                  : 'OUT OF STOCK'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Product Details v1.0</Text>
        </View>
      </ScrollView>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        duration={toast.duration}
        position={toast.position}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  imageCarouselContainer: {
    height: 400,
    marginTop: -20,
    position: 'relative',
    marginBottom: 20,
  },
  imageCarousel: {
    width: screenWidth,
    height: 400,
    resizeMode: 'cover',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 15,
    width: '100%',
    zIndex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  carouselButtons: {
    position: 'absolute',
    top: '45%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 50,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
    shadowOpacity: 0,
    elevation: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: -10,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
  },
  productInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#718096',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  colorContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  colorButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedColorButton: {
    borderWidth: 3,
    borderColor: '#1e3c72',
    transform: [{ scale: 1.0 }],
  },
  selectedItemBadge: {
    backgroundColor: '#EBF4FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  selectedItemText: {
    color: '#2C5282',
    fontWeight: '500',
    fontSize: 14,
  },
  sizeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  sizeButton: {
    minWidth: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#e0e5eb',
    paddingHorizontal: 12,
  },
  selectedSizeButton: {
    borderColor: '#1e3c72',
    borderWidth: 2,
    backgroundColor: '#EBF4FF',
  },
  outOfStockSize: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    opacity: 0.7,
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  selectedSizeText: {
    color: '#1e3c72',
    fontWeight: '700',
  },
  outOfStockSizeText: {
    color: '#aaa',
  },
  sizePriceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedSizePriceText: {
    color: '#1e3c72',
  },
  sizePriceHighlight: {
    fontWeight: '700',
    color: '#1e3c72',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 25,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButton: {
    backgroundColor: '#EDF2F7',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartButtonContainer: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  addToCartButton: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    marginRight: 10,
  },
  addToCartText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#a0aec0',
    fontSize: 12,
  },

  // Rating Card
  ratingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
  },
  reviewsCount: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },

  // Review Section
  reviewSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addReviewButton: {
    backgroundColor: '#EBF4FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addReviewButtonText: {
    color: '#2C5282',
    fontWeight: '500',
    fontSize: 14,
  },
  reviewFormContainer: {
    marginBottom: 20,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ratingSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingSelectLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginRight: 10,
  },
  reviewInputContainer: {
    marginBottom: 15,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  submitReviewButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitReviewButtonGradient: {
    flexDirection: 'row',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitReviewButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Reviews List
  reviewsListContainer: {
    marginTop: 10,
  },
  reviewItem: {
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUserAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2a5298',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  reviewDate: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 3,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5568',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
    marginTop: 10,
  },
  beFirstText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 5,
  },
  // Accordion styles
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  accordionBody: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
  },
  accordionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5568',
  },
});

export default ProductDetails;
