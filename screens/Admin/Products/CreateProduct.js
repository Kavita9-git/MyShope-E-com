import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import InputBox from "../../../components/Form/InputBox";
import Layout from "../../../components/Layout/Layout";
import { getAllCategories } from "../../../redux/features/auth/categoryActions";
import {
  clearMessage,
  createProduct,
  getAllProducts,
} from "../../../redux/features/auth/productActions";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
// Removed DisplayMessage import as we're replacing it with our custom notification

const availableColors = [
  { colorId: "red", colorName: "Red", colorCode: "#FF0000" },
  { colorId: "blue", colorName: "Blue", colorCode: "#0000FF" },
  { colorId: "black", colorName: "Black", colorCode: "#000000" },
  { colorId: "white", colorName: "White", colorCode: "#FFFFFF" },
  { colorId: "green", colorName: "Green", colorCode: "#008000" },
  { colorId: "yellow", colorName: "Yellow", colorCode: "#FFFF00" },
];

const availableSizes = ["S", "M", "L", "XL", "XXL"];

const CreateProduct = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const { message, loading } = useSelector((state) => state.product);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [generalImage, setGeneralImage] = useState("");
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (message?.includes("Created")) {
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

      resetForm();
    }
  }, [message]);

  useEffect(() => {
    const totalStock = calculateTotalStock();
    setStock(totalStock.toString());
  }, [colors]);

  // Update subcategories when category changes
  useEffect(() => {
    if (category) {
      const selectedCategory = categories.find((cat) => cat._id === category);
      if (selectedCategory && selectedCategory.subcategories) {
        setAvailableSubcategories(selectedCategory.subcategories);
        setSubcategory(""); // Reset subcategory when category changes
      } else {
        setAvailableSubcategories([]);
        setSubcategory("");
      }
    } else {
      setAvailableSubcategories([]);
      setSubcategory("");
    }
  }, [category, categories]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("");
    setSubcategory("");
    setAvailableSubcategories([]);
    setGeneralImage("");
    setColors([]);
    setSelectedColor("");
    dispatch(clearMessage());
  };

  const pickGeneralImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setGeneralImage(result.assets[0].uri);
  };

  const addColor = () => {
    if (!selectedColor) return Alert.alert("Please select a color");
    if (colors.some((c) => c.colorId === selectedColor))
      return Alert.alert("Color already added");

    const colorData = availableColors.find((c) => c.colorId === selectedColor);
    setColors([...colors, { ...colorData, images: [], sizes: [] }]); // ✅ renamed to sizes
    setSelectedColor("");
  };

  const pickColorImages = async (index, append = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const selectedUris = result.assets.map((a) => a.uri);
      const updatedColors = [...colors];
      updatedColors[index].images = append
        ? [...updatedColors[index].images, ...selectedUris]
        : selectedUris;
      setColors(updatedColors);
    }
  };

  const replaceImage = async (colorIndex, imageIndex) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const updatedColors = [...colors];
      updatedColors[colorIndex].images[imageIndex] = result.assets[0].uri;
      setColors(updatedColors);
    }
  };

  const toggleSize = (colorIndex, size) => {
    const updatedColors = [...colors];
    const currentSizes = updatedColors[colorIndex].sizes || [];
    const existing = currentSizes.find((v) => v.size === size);

    if (existing) {
      updatedColors[colorIndex].sizes = currentSizes.filter(
        (v) => v.size !== size
      );
    } else {
      updatedColors[colorIndex].sizes = [
        ...currentSizes,
        { size, price: "", stock: "", discountper: "", discountprice: "" },
      ];
    }
    setColors(updatedColors);
  };

  const updateSizeField = (colorIndex, size, field, value) => {
    const updatedColors = [...colors];

    // Special handling for discountper to calculate discountprice
    if (field === "discountper") {
      const sizeObj = updatedColors[colorIndex].sizes.find(
        (v) => v.size === size
      );
      if (sizeObj && sizeObj.price) {
        const price = parseFloat(sizeObj.price);

        // Calculate discount price based on discount percentage
        if (typeof value === "string" && value.includes("%")) {
          // It's a percentage - extract the numeric value
          const percentValue = parseFloat(value);
          if (!isNaN(percentValue) && !isNaN(price)) {
            const percentageDiscount = (price * percentValue) / 100;
            // Ensure percentage discount doesn't exceed price
            const safeDiscount = Math.min(percentageDiscount, price);
            const discountPrice = (price - safeDiscount).toFixed(2);
            // Update discount price along with discount percentage
            updatedColors[colorIndex].sizes = updatedColors[
              colorIndex
            ].sizes.map((v) =>
              v.size === size
                ? { ...v, [field]: value, discountprice: discountPrice }
                : v
            );
            setColors(updatedColors);
            return;
          }
        } else {
          // It's an absolute value
          const numericVal = parseFloat(value);
          if (!isNaN(numericVal) && !isNaN(price)) {
            // Ensure discount doesn't exceed price
            const absoluteDiscount = Math.min(Math.abs(numericVal), price);
            const discountPrice = (price - absoluteDiscount).toFixed(2);
            // Update discount price along with discount percentage
            updatedColors[colorIndex].sizes = updatedColors[
              colorIndex
            ].sizes.map((v) =>
              v.size === size
                ? { ...v, [field]: value, discountprice: discountPrice }
                : v
            );
            setColors(updatedColors);
            return;
          }
        }
      }
    }

    // For price field, recalculate discount price if discountper exists
    if (field === "price") {
      const sizeObj = updatedColors[colorIndex].sizes.find(
        (v) => v.size === size
      );
      if (sizeObj && sizeObj.discountper) {
        const price = parseFloat(value);
        const discountper = sizeObj.discountper;

        if (typeof discountper === "string" && discountper.includes("%")) {
          // Percentage discount
          const percentValue = parseFloat(discountper);
          if (!isNaN(percentValue) && !isNaN(price)) {
            const percentageDiscount = (price * percentValue) / 100;
            const safeDiscount = Math.min(percentageDiscount, price);
            const discountPrice = (price - safeDiscount).toFixed(2);

            updatedColors[colorIndex].sizes = updatedColors[
              colorIndex
            ].sizes.map((v) =>
              v.size === size
                ? { ...v, [field]: value, discountprice: discountPrice }
                : v
            );
            setColors(updatedColors);
            return;
          }
        } else {
          // Absolute discount
          const numericVal = parseFloat(discountper);
          if (!isNaN(numericVal) && !isNaN(price)) {
            const absoluteDiscount = Math.min(Math.abs(numericVal), price);
            const discountPrice = (price - absoluteDiscount).toFixed(2);

            updatedColors[colorIndex].sizes = updatedColors[
              colorIndex
            ].sizes.map((v) =>
              v.size === size
                ? { ...v, [field]: value, discountprice: discountPrice }
                : v
            );
            setColors(updatedColors);
            return;
          }
        }
      }
    }

    // Default handling for other fields
    updatedColors[colorIndex].sizes = updatedColors[colorIndex].sizes.map((v) =>
      v.size === size ? { ...v, [field]: value } : v
    );
    setColors(updatedColors);
  };

  const calculateTotalStock = () => {
    let total = 0;
    colors.forEach((color) => {
      color.sizes.forEach((size) => {
        const stockVal = parseInt(size.stock);
        if (!isNaN(stockVal)) {
          total += stockVal;
        }
      });
    });
    return total;
  };

  const handleSubmit = () => {
    if (!name || !description || !price || !stock || !category || !generalImage)
      return Alert.alert("Please fill all fields");

    const totalStock = calculateTotalStock();
    if (totalStock < 1) return Alert.alert("Total stock must be at least 1");
    setStock(totalStock.toString()); // Ensure latest total

    const formData = new FormData();

    const generalName = generalImage.split("/").pop();
    const generalExt = generalName.split(".").pop();
    formData.append("generalImage", {
      uri: generalImage,
      name: generalName,
      type: `image/${generalExt}`,
    });

    colors.forEach((color) => {
      color.images.forEach((imgUri, idx) => {
        const ext = imgUri.split(".").pop();
        formData.append(color.colorId, {
          uri: imgUri,
          name: `${color.colorId}_${idx}.${ext}`,
          type: `image/${ext}`,
        });
      });
    });

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", totalStock); // ✅ use the calculated stock
    formData.append("category", category);
    formData.append("subcategory", subcategory);
    formData.append("colors", JSON.stringify(colors));

    dispatch(createProduct(formData));
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <AntDesign name="pluscircleo" size={30} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Create Product</Text>
              <Text style={styles.headerSubtitle}>
                Add a new product to your store
              </Text>
            </View>
          </LinearGradient>
        </View>

        {showNotification && (
          <Animated.View
            style={[styles.notificationContainer, { opacity: fadeAnim }]}
          >
            <LinearGradient
              colors={["#43cea2", "#185a9d"]}
              style={styles.notificationGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <AntDesign name="checkcircle" size={24} color="#fff" />
              <Text style={styles.notificationText}>{successMessage}</Text>
              <TouchableOpacity
                onPress={() => setShowNotification(false)}
                style={styles.closeButton}
              >
                <AntDesign name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#ebf8ff" }]}>
              <Feather name="package" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>New Product</Text>
              <Text style={styles.statLabel}>Enter product details</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#feebef" }]}>
              <MaterialIcons name="inventory" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stock || "0"}</Text>
              <Text style={styles.statLabel}>Total Stock</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name</Text>
            <View style={styles.inputWithIcon}>
              <Feather
                name="package"
                size={22}
                color="#666"
                style={styles.inputIcon}
              />
              <View style={styles.inputContainer}>
                <InputBox
                  value={name}
                  setValue={setName}
                  placeholder="Product Name"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <View style={styles.inputWithIcon}>
              <Feather
                name="file-text"
                size={22}
                color="#666"
                style={styles.inputIcon}
              />
              <View style={styles.inputContainer}>
                <InputBox
                  value={description}
                  setValue={setDescription}
                  placeholder="Description"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price</Text>
            <View style={styles.inputWithIcon}>
              <Feather
                name="dollar-sign"
                size={22}
                color="#666"
                style={styles.inputIcon}
              />
              <View style={styles.inputContainer}>
                <InputBox
                  value={price}
                  setValue={setPrice}
                  placeholder="Price"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.pickerContainer}>
              <View style={styles.inputWithIcon}>
                <MaterialIcons
                  name="category"
                  size={22}
                  color="#666"
                  style={styles.inputIcon}
                />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={category}
                    onValueChange={setCategory}
                    style={styles.picker}
                    dropdownIconColor="#666"
                  >
                    <Picker.Item label="Select Category" value="" />
                    {categories?.map((c) => (
                      <Picker.Item
                        key={c._id}
                        label={c.category}
                        value={c._id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {category && availableSubcategories.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subcategory</Text>
              <View style={styles.pickerContainer}>
                <View style={styles.inputWithIcon}>
                  <MaterialIcons
                    name="folder-special"
                    size={22}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={subcategory}
                      onValueChange={setSubcategory}
                      style={styles.picker}
                      dropdownIconColor="#666"
                    >
                      <Picker.Item label="Select Subcategory" value="" />
                      {availableSubcategories.map((subcat, index) => (
                        <Picker.Item
                          key={index}
                          label={subcat}
                          value={subcat}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Product Images</Text>

        <View style={styles.formCard}>
          <TouchableOpacity
            style={styles.imagePickButton}
            onPress={pickGeneralImage}
          >
            <LinearGradient
              colors={["#1e3c72", "#2a5298"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Feather
                name="image"
                size={20}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.imagePickButtonText}>Pick General Image</Text>
            </LinearGradient>
          </TouchableOpacity>

          {generalImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: generalImage }} style={styles.cardImage} />
              <TouchableOpacity
                onPress={() => setGeneralImage("")}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Feather name="image" size={40} color="#ccc" />
              <Text style={styles.noImageText}>No image selected</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Color Variants</Text>

        <View style={styles.formCard}>
          <View style={styles.colorSelectorContainer}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedColor}
                onValueChange={setSelectedColor}
                style={styles.picker}
                dropdownIconColor="#666"
              >
                <Picker.Item label="Select Color" value="" />
                {availableColors.map((c) => (
                  <Picker.Item
                    key={c.colorId}
                    label={c.colorName}
                    value={c.colorId}
                  />
                ))}
              </Picker>
            </View>

            <TouchableOpacity style={styles.addColorButton} onPress={addColor}>
              <LinearGradient
                colors={["#1e3c72", "#2a5298"]}
                style={styles.addColorGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <AntDesign name="plus" size={20} color="#fff" />
                <Text style={styles.addColorButtonText}>Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {colors.map((color, idx) => (
            <View key={idx} style={styles.colorContainer}>
              <View style={styles.colorHeaderContainer}>
                <LinearGradient
                  colors={["#1e3c72", "#2a5298"]}
                  style={styles.colorHeaderGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color.colorCode },
                    ]}
                  />
                  <Text style={styles.colorName}>{color.colorName}</Text>
                </LinearGradient>
              </View>

              <Text style={styles.subSectionTitle}>Images</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesContainer}
              >
                {color.images.map((img, i) => (
                  <View key={i} style={styles.imageWrapper}>
                    <Image source={{ uri: img }} style={styles.cardImage} />
                    <TouchableOpacity
                      onPress={() => replaceImage(idx, i)}
                      style={styles.replaceButton}
                    >
                      <Text style={styles.replaceButtonText}>Replace</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => pickColorImages(idx, true)}
                  style={styles.addImageButton}
                >
                  <Feather name="plus" size={24} color="#666" />
                  <Text style={styles.addImageButtonText}>Add Image</Text>
                </TouchableOpacity>
              </ScrollView>

              <Text style={styles.subSectionTitle}>Sizes</Text>
              <View style={styles.sizesContainer}>
                {availableSizes.map((size) => {
                  const isSelected = color.sizes.some((v) => v.size === size);
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => toggleSize(idx, size)}
                      style={[
                        styles.sizeButton,
                        isSelected && styles.sizeButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          isSelected && styles.sizeTextSelected,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {color.sizes.length > 0 && (
                <>
                  <Text style={styles.subSectionTitle}>Size Details</Text>
                  {color.sizes.map((variant, i) => (
                    <View key={i} style={styles.variantRow}>
                      <View style={styles.sizeLabel}>
                        <Text style={styles.sizeBadge}>{variant.size}</Text>
                      </View>
                      <View style={styles.sizeInputsContainer}>
                        <View style={styles.sizeInputs}>
                          <View style={styles.sizeInputContainer}>
                            <Text style={styles.sizeInputLabel}>Price:</Text>
                            <InputBox
                              value={variant.price}
                              setValue={(val) =>
                                updateSizeField(idx, variant.size, "price", val)
                              }
                              placeholder="Price"
                              keyboardType="numeric"
                            />
                          </View>
                          <View style={styles.sizeInputContainer}>
                            <Text style={styles.sizeInputLabel}>Stock:</Text>
                            <InputBox
                              value={variant.stock}
                              setValue={(val) =>
                                updateSizeField(idx, variant.size, "stock", val)
                              }
                              placeholder="Stock"
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                        <View style={styles.sizeInputs}>
                          <View style={styles.sizeInputContainer}>
                            <Text style={styles.sizeInputLabel}>
                              Discount % or Value:
                            </Text>
                            <InputBox
                              value={variant.discountper}
                              setValue={(val) =>
                                updateSizeField(
                                  idx,
                                  variant.size,
                                  "discountper",
                                  val
                                )
                              }
                              placeholder="e.g., 10%"
                            />
                          </View>
                          <View style={styles.sizeInputContainer}>
                            <Text style={styles.sizeInputLabel}>
                              Discount Price:
                            </Text>
                            <InputBox
                              value={variant.discountprice}
                              setValue={(val) =>
                                updateSizeField(
                                  idx,
                                  variant.size,
                                  "discountprice",
                                  val
                                )
                              }
                              placeholder="Discount Price"
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={loading}
        >
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather
                  name="save"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.submitButtonText}>Create Product</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Product Management v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 25,
    marginTop: -15,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statIconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    paddingHorizontal: 15,
    color: "#333",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 25,
    shadowColor: "#000",
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
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginHorizontal: 10,
  },
  inputContainer: {
    flex: 1,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
  },
  imagePickButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  imagePickButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  noImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  noImageText: {
    color: "#999",
    marginTop: 10,
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: "#dc2626",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  colorSelectorContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  addColorButton: {
    marginLeft: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  addColorGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addColorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  colorContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  colorHeaderContainer: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  colorHeaderGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  colorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
    color: "#444",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    paddingBottom: 8,
  },
  imagesContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  imageWrapper: {
    alignItems: "center",
    marginRight: 15,
  },
  replaceButton: {
    marginTop: 10,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  replaceButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  addImageButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  addImageButtonText: {
    fontSize: 14,
    marginTop: 5,
    color: "#666",
  },
  sizesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  sizeButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 5,
    minWidth: 50,
    alignItems: "center",
  },
  sizeButtonSelected: {
    backgroundColor: "#1e3c72",
    borderColor: "#1e3c72",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sizeTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 10,
  },
  sizeLabel: {
    marginRight: 15,
  },
  sizeBadge: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#1e3c72",
    color: "#fff",
    width: 40,
    height: 40,
    textAlign: "center",
    lineHeight: 40,
    borderRadius: 20,
  },
  sizeInputsContainer: {
    flex: 1,
    flexDirection: "column",
  },
  sizeInputs: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sizeInputContainer: {
    width: "48%",
  },
  sizeInputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    fontWeight: "500",
  },
  submitButton: {
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  submitButtonGradient: {
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  footerText: {
    color: "#a0aec0",
    fontSize: 12,
  },
  notificationContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  notificationGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  notificationText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
});

export default CreateProduct;
