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
} from "react-native";
import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout/Layout";
import * as ImagePicker from "expo-image-picker";
// import { UserData } from "../../data/UserData";
import InputBox from "../../../components/Form/InputBox";
import { useDispatch, useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import {
  clearMessage,
  getAllProducts,
  updateProduct,
  updateProductImage,
} from "../../../redux/features/auth/productActions";
import { getAllCategories } from "../../../redux/features/auth/categoryActions";

const availableColors = [
  { colorId: "red", colorName: "Red", colorCode: "#FF0000" },
  { colorId: "blue", colorName: "Blue", colorCode: "#0000FF" },
  { colorId: "black", colorName: "Black", colorCode: "#000000" },
  { colorId: "white", colorName: "White", colorCode: "#FFFFFF" },
  { colorId: "green", colorName: "Green", colorCode: "#008000" },
  { colorId: "yellow", colorName: "Yellow", colorCode: "#FFFF00" },
];

const availableSizes = ["S", "M", "L", "XL", "XXL"];
const UpdateImageProducts = ({ navigation }) => {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.user);
  // console.log(user);

  const { categories = "" } = useSelector((state) => state.category);
  const {
    products = "",
    message = "",
    error = "",
  } = useSelector((state) => state.product);
  // console.log("categories :", categories);
  // console.log("products :", products);

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getAllProducts());
    setCatData(categories);
  }, []);

  useEffect(() => {
    if (message?.includes("Updated")) {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setProductId("");
      setCategory("");
      setCategoryId("");
      setChangedFields({});
      setChangedGeneralImage(null);
      setChangedColorImages([]);
      setGeneralImage("");
      setColorImages([]);
      alert(message);
      dispatch(clearMessage());
    }
    console.log("message", message);
    console.log("error", error);
  }, [message, error]);

  //State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [catData, setCatData] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [generalImage, setGeneralImage] = useState("");
  const [colorImages, setColorImages] = useState([]); // Holds colors with images & sizes
  const [loading, setLoading] = useState(false);
  const [changedFields, setChangedFields] = useState({});
  const [changedGeneralImage, setChangedGeneralImage] = useState(null);
  const [changedColorImages, setChangedColorImages] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColorId, setNewColorId] = useState("");

  //Product Create
  const handleUploadChanges = () => {
    if (!productId) return alert("Please select a product");

    const formData = new FormData();

    // Add changed fields
    for (const [key, value] of Object.entries(changedFields)) {
      formData.append(key, value);
    }

    // Add general image if changed
    if (changedGeneralImage) {
      const fileName = changedGeneralImage.split("/").pop();
      const fileType = fileName.split(".").pop();
      formData.append("generalImage", {
        uri: changedGeneralImage,
        name: fileName,
        type: `image/${fileType}`,
      });
    }

    colorImages.forEach((color) => {
      color.images.forEach((imgUri, i) => {
        if (imgUri.startsWith("file")) {
          const ext = imgUri.split(".").pop();
          formData.append(color.colorId, {
            uri: imgUri,
            name: `${color.colorId}_${i}.${ext}`,
            type: `image/${ext}`,
          });
        }
      });
    });

    changedColorImages.forEach((color) => {
      color.images.forEach((imgUri, i) => {
        if (imgUri.startsWith("file")) {
          const ext = imgUri.split(".").pop();
          formData.append(color.colorId, {
            uri: imgUri,
            name: `${color.colorId}_${i}.${ext}`,
            type: `image/${ext}`,
          });
        }
      });
    });

    // Prepare colors JSON and attach images
    const safeColors = changedColorImages.map((c) => ({
      colorId: c.colorId,
      colorName: c.colorName,
      colorCode:
        c.colorCode ||
        availableColors.find((a) => a.colorId === c.colorId)?.colorCode ||
        "#000000", // fallback
      sizes: (c.sizes || []).map((s) => ({
        size: s.size,
        price: Number(s.price),
        stock: Number(s.stock),
      })),
    }));

    formData.append("colors", JSON.stringify(safeColors));

    console.log("FormData Colors:", JSON.stringify(safeColors, null, 2));
    console.log("Changed General Image:", changedGeneralImage);
    console.log("Changed Color Images:", changedColorImages);

    dispatch(updateProductImage(productId, formData));
  };

  const fetchProducts = async (itemValue) => {
    setProductId(itemValue);

    //Find Product Details
    const getProduct = products.find((p) => {
      return p?._id === itemValue;
    });

    const enrichedColors = (getProduct?.colors || []).map((c) => ({
      ...c,
      colorCode:
        c.colorCode ||
        availableColors.find((a) => a.colorId === c.colorId)?.colorCode ||
        "#000000", // fallback if missing
    }));

    setName(getProduct?.name);
    setDescription(getProduct?.description);
    setPrice(getProduct?.price.toString());
    setStock(getProduct?.stock.toString());
    setCategory(getProduct?.category?.category);
    setCategoryId(getProduct?.category?._id);
    setGeneralImage(getProduct?.images[0]?.url || getProduct?.images[0] || "");
    setColorImages(enrichedColors);
    setChangedColorImages(enrichedColors);
    setIsVisible(true);

    console.log("getProduct?.colors ", getProduct?.colors);
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
      setColorImages((prevColors) => {
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
    setChangedFields((prev) => ({ ...prev, [field]: value }));

    if (field === "categoryId") setCategoryId(value);
  };

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.imageContainer}>
            <Pressable onPress={() => alert("Profile Dialogbox")}>
              <Text style={{ color: "red" }}>Update Image Product</Text>
            </Pressable>
          </View>
          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
          {message?.includes("Updated") && <Text>{message}</Text>}

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Product:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={productId}
                onValueChange={(itemValue) => {
                  fetchProducts(itemValue);
                }}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Product --" value="" />
                {products &&
                  products?.map((c) => (
                    <Picker.Item key={c._id} label={c.name} value={c._id} />
                  ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Category:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={categoryId}
                onValueChange={(itemValue) => {
                  handleFieldChange("categoryId", itemValue);
                }}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Category --" value="" />
                {categories &&
                  categories?.map((c) => (
                    <Picker.Item key={c._id} label={c.category} value={c._id} />
                  ))}
              </Picker>
            </View>
          </View>

          {generalImage ? (
            <View style={{ alignItems: "center", marginVertical: 10 }}>
              <Image
                source={{
                  uri:
                    generalImage.startsWith("http") ||
                    generalImage.startsWith("file")
                      ? generalImage
                      : `https://nodejsapp-hfpl.onrender.com${generalImage}`,
                }}
                style={{ width: 120, height: 120, borderRadius: 10 }}
              />
              <TouchableOpacity
                onPress={pickAndReplaceGeneralImage}
                style={{
                  backgroundColor: "#007bff",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 6,
                  marginTop: 8,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12 }}>
                  Replace General Image
                </Text>
              </TouchableOpacity>
            </View>
          ) : isVisible ? (
            <TouchableOpacity
              onPress={pickAndReplaceGeneralImage}
              style={{
                backgroundColor: "#007bff",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                marginTop: 8,
                alignSelf: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>
                Add General Image
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => setShowColorPicker(true)}
            style={{
              backgroundColor: "#6c5ce7",
              padding: 10,
              borderRadius: 8,
              marginBottom: 15,
              marginHorizontal: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              + Add Color
            </Text>
          </TouchableOpacity>

          {showColorPicker && (
            <View
              style={{
                marginHorizontal: 10,
                marginBottom: 15,
                padding: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                Select Color:
              </Text>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  marginBottom: 10,
                }}
              >
                <Picker
                  selectedValue={newColorId}
                  onValueChange={(itemValue) => setNewColorId(itemValue)}
                  style={{ height: 50, width: "100%" }}
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

              <TouchableOpacity
                onPress={() => {
                  if (!newColorId) return alert("Please select a color first");

                  // 🚨 Check for duplicate colorId
                  const isDuplicate = colorImages.some(
                    (c) => c.colorId === newColorId
                  );
                  if (isDuplicate) return alert("Color already added!");

                  const selectedColor = availableColors.find(
                    (c) => c.colorId === newColorId
                  );
                  if (!selectedColor)
                    return alert("Please select a color first");
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
                  setNewColorId("");
                }}
                style={{
                  backgroundColor: "#28a745",
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Confirm & Add Color
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowColorPicker(false);
                  setNewColorId("");
                }}
                style={{
                  backgroundColor: "#e74c3c",
                  padding: 10,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {colorImages.map((color, idx) => (
            <View key={idx} style={{ marginBottom: 20, paddingHorizontal: 10 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                {color.colorName}
              </Text>

              {/* ✅ Only show Remove if color has NO _id (newly added) */}
              {!color._id && (
                <TouchableOpacity
                  onPress={() => {
                    const updatedColors = colorImages.filter(
                      (_, i) => i !== idx
                    );
                    setColorImages(updatedColors);
                    setChangedColorImages(updatedColors);
                  }}
                  style={{
                    backgroundColor: "#e74c3c",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 6,
                    marginBottom: 10,
                    alignSelf: "flex-end",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}
                  >
                    Remove Color
                  </Text>
                </TouchableOpacity>
              )}

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {color.images && color.images.length > 0 ? (
                  <>
                    {color.images.map((img, i) => (
                      <View
                        key={i}
                        style={{ marginRight: 10, alignItems: "center" }}
                      >
                        <Image
                          source={{
                            uri:
                              img.startsWith("http") || img.startsWith("file")
                                ? img
                                : `https://nodejsapp-hfpl.onrender.com${img}`,
                          }}
                          style={{ width: 80, height: 80, borderRadius: 6 }}
                        />
                        <TouchableOpacity
                          onPress={() => replaceColorImage(idx, i)}
                          style={{
                            backgroundColor: "#007bff",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                            marginTop: 5,
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 10 }}>
                            Replace
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                ) : (
                  <Text style={{ color: "#666", fontSize: 12 }}>
                    No images added yet.
                  </Text>
                )}

                {/* Always show Add More button */}
                <TouchableOpacity
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsMultipleSelection: true, // ✅ Enable multiple selection
                      quality: 1,
                    });

                    if (!result.canceled) {
                      const selectedImages = result.assets.map(
                        (asset) => asset.uri
                      );
                      const updatedColors = colorImages.map((c, i) => {
                        if (i === idx) {
                          return {
                            ...c,
                            images: [...(c.images || []), ...selectedImages], // ✅ Spread multiple images
                          };
                        }
                        return c;
                      });
                      setColorImages(updatedColors);
                      setChangedColorImages(updatedColors);
                    }
                  }}
                  style={{
                    backgroundColor: "#28a745",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                    height: 80,
                    width: 100,
                    marginRight: 10,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 12, textAlign: "center" }}
                  >
                    Add Image
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 12, color: "#333", marginBottom: 5 }}>
                  Select Sizes for {color.colorName}:
                </Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {availableSizes.map((size) => {
                    const existingSizeObj = color.sizes?.find(
                      (s) => s.size === size
                    );
                    const isSelected = !!existingSizeObj;

                    return (
                      <TouchableOpacity
                        key={size}
                        onPress={() => {
                          const updatedColors = colorImages.map((c, i) => {
                            if (i === idx) {
                              let newSizes;
                              if (isSelected) {
                                newSizes = c.sizes.filter(
                                  (s) => s.size !== size
                                );
                              } else {
                                newSizes = [
                                  ...(c.sizes || []),
                                  { size, price: 0, stock: 0 },
                                ];
                              }
                              return { ...c, sizes: newSizes };
                            }
                            return c;
                          });

                          setColorImages(updatedColors);
                          setChangedColorImages(updatedColors);
                        }}
                        style={{
                          backgroundColor: isSelected ? "#007bff" : "#ddd",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 6,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ color: isSelected ? "#fff" : "#000" }}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Price & Stock inputs for selected sizes */}
                {color.sizes?.map((sz, sizeIdx) => (
                  <View
                    key={sz.size}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                      marginTop: 4,
                    }}
                  >
                    <Text
                      style={{
                        width: 40,
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {sz.size}
                    </Text>

                    <Text style={{ marginLeft: 10 }}>₹</Text>
                    <View style={{ width: "40%" }}>
                      <InputBox
                        value={sz.price?.toString()}
                        setValue={(val) => {
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
                        customStyles={{ width: 70, marginHorizontal: 5 }}
                      />
                    </View>

                    <Text style={{ marginLeft: 10 }}>Qty</Text>
                    <View style={{ width: "40%" }}>
                      <InputBox
                        value={sz.stock?.toString()}
                        setValue={(val) => {
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
                        customStyles={{ width: 70, marginHorizontal: 5 }}
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 12, color: "#333", marginBottom: 5 }}>
                  Select Size for {color.colorName}:
                </Text>
                <Picker
                  selectedValue={color.sizes?.[0] || ""}
                  onValueChange={(itemValue) => {
                    setColorImages((prevColors) => {
                      const updated = prevColors.map((c, i) =>
                        i === idx ? { ...c, sizes: [itemValue] } : c
                      );
                      setChangedColorImages(updated);
                      return updated;
                    });
                  }}
                  style={{
                    height: 40,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 6,
                  }}
                >
                  <Picker.Item label="Select Size" value="" />
                  {availableSizes.map((size) => (
                    <Picker.Item key={size} label={size} value={size} />
                  ))}
                </Picker>
              </View> */}
            </View>
          ))}

          {/* <InputBox
            value={description}
            setValue={setDescription}
            placeholder={"Enter Product Description"}
            autoComplete={"address-line1"}
          />

          <InputBox
            value={price}
            setValue={setPrice}
            placeholder={"Enter Product Price"}
            autoComplete={"tel"}
          /> */}

          {/* <InputBox
            value={password}
            setValue={setPassword}
            placeholder={"Enter your Password"}
            autoComplete={"password"}
            secureTextEntry={true}
          /> */}

          {/* <InputBox
            value={category}
            setValue={setCategory}
            placeholder={"Enter Product Category"}
            autoComplete={"address-line1"}
          />

          <InputBox
            value={stock}
            setValue={setStock}
            placeholder={"Enter Product Stock/Quantity"}
            autoComplete={"tel"}
          />

          <Button title="Pick Image" onPress={pickImage} />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginVertical: 10,
            }}
          >
            {images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={{ width: 100, height: 100, margin: 5, borderRadius: 10 }}
              />
            ))}
          </View> */}

          <TouchableOpacity
            style={styles.btnUpdate}
            onPress={handleUploadChanges}
          >
            <Text style={styles.btnUpdateText}>UPDATE IMAGE PRODUCT</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 100,
    width: "100%",
    resizeMode: "contain",
  },
  btnUpdate: {
    backgroundColor: "#000000",
    height: 40,
    borderRadius: 20,
    marginHorizontal: 30,
    justifyContent: "center",
    marginTop: 10,
  },
  btnUpdateText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
  },
  pickerContainer: {
    marginHorizontal: 30,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },

  picker: {
    height: 50,
    width: "100%",
  },
});

export default UpdateImageProducts;
