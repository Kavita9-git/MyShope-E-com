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
import * as ImagePicker from "expo-image-picker";
import Layout from "../../../components/Layout/Layout";
// import { UserData } from "../../data/UserData";
import InputBox from "../../../components/Form/InputBox";
import { useDispatch, useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";

import {
  getUserData,
  updateProfile,
} from "../../../redux/features/auth/userActions";
import {
  clearMessage,
  createProduct,
} from "../../../redux/features/auth/productActions";
import { getAllCategories } from "../../../redux/features/auth/categoryActions";

const availableColors = [
  { id: "Red", colorId: "red", colorName: "Red", colorCode: "#FF0000" },
  { id: "Blue", colorId: "blue", colorName: "Blue", colorCode: "#0000FF" },
  { id: "Black", colorId: "black", colorName: "Black", colorCode: "#000000" },
  { id: "White", colorId: "white", colorName: "White", colorCode: "#FFFFFF" },
  { id: "Green", colorId: "green", colorName: "Green", colorCode: "#008000" },
  {
    id: "Yellow",
    colorId: "yellow",
    colorName: "Yellow",
    colorCode: "#FFFF00",
  },
];

const CreateProduct = ({ navigation }) => {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.user);
  // console.log(user);

  const { categories = "" } = useSelector((state) => state.category);
  const { message = "" } = useSelector((state) => state.product);
  console.log("categories :", categories);
  useEffect(() => {
    dispatch(getAllCategories());
  }, []);

  useEffect(() => {
    if (message == "Product Created Successfully") {
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");
      setImages([]);
      alert(message);
    }
  }, [message]);

  //State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(false);

  // Pick an image
  const pickGeneralImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  //ADD COLOR
  const addColor = () => {
    if (!selectedColor) return alert("Please select a color");
    // Check if the color is already selected at any position in the current colors array
    const isAlreadyAdded = colors.some((c) => c.id === selectedColor);
    console.log("isAlreadyAdded :", isAlreadyAdded);
    if (isAlreadyAdded) {
      return alert("Color already added!");
    }
    const colorData = availableColors.find((c) => c.id === selectedColor);
    if (colorData) {
      setColors((prev) => [...prev, { ...colorData, images: [] }]);
      setSelectedColor("");
    }
  };

  const pickColorImages = async (index) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri);
      const updatedColors = [...colors];
      if (selectedImages.length > 5) return alert("Max 5 images allowed");
      updatedColors[index].images = selectedImages;
      setColors(updatedColors);
    }
  };

  // Replace a specific image in a color's images
  const replaceColorImage = async (colorIndex, imageIndex) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const updatedColors = [...colors];
      updatedColors[colorIndex].images[imageIndex] = result.assets[0].uri;
      setColors(updatedColors);
    }
  };

  // Delete a specific image from a color's images
  const deleteColorImage = (colorIndex, imageIndex) => {
    const updatedColors = [...colors];
    updatedColors[colorIndex].images.splice(imageIndex, 1);
    setColors(updatedColors);
  };

  // Clear all images for a specific color
  const clearColorImages = (colorIndex) => {
    const updatedColors = [...colors];
    updatedColors[colorIndex].images = [];
    setColors(updatedColors);
  };

  // Remove entire color (including its images)
  const removeColor = (colorIndex) => {
    const updatedColors = [...colors];
    updatedColors.splice(colorIndex, 1);
    setColors(updatedColors);
  };

  //Product Create
  const handleCreate = () => {
    if (!name || !description || !price || !category || !stock) {
      return alert("Please fill all fields");
    }

    if (images.length === 0) return alert("Please select at least one image");

    const formData = new FormData();

    // Add general images
    images.forEach((imgUri, index) => {
      const ext = imgUri.split(".").pop();
      formData.append("files", {
        uri: imgUri,
        name: `general_${index}.${ext}`,
        type: `image/${ext}`,
      });
    });

    // Append images with correct names
    colors.forEach((color) => {
      color.images.forEach((imageUri, index) => {
        const ext = imageUri.split(".").pop();
        formData.append("files", {
          uri: imageUri,
          type: "image/jpeg",
          name: `${color.colorId.toLowerCase()}_${index}.${ext}`, // ✅ important: lowercase and index included
        });
      });
    });

    // Append other fields
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("stock", stock);
    formData.append("colors", JSON.stringify(colors));

    console.log("formData :", formData);
    dispatch(createProduct(formData));
  };

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.imageContainer}>
            <Pressable onPress={() => alert("Profile Dialogbox")}>
              <Text style={{ color: "red" }}>Create New Products</Text>
            </Pressable>
          </View>
          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
          {message == "Product Created Successfully" && <Text>{message}</Text>}

          <InputBox
            value={name}
            setValue={setName}
            placeholder={"Enter your Name"}
            autoComplete={"name"}
          />

          <InputBox
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
          />

          <InputBox
            value={stock}
            setValue={setStock}
            placeholder={"Enter Product Stock/Quantity"}
            autoComplete={"tel"}
          />

          {/* <InputBox
            value={password}
            setValue={setPassword}
            placeholder={"Enter your Password"}
            autoComplete={"password"}
            secureTextEntry={true}
          /> */}

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Category:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
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

          <View style={styles.pickerContainer}>
            <Button title="Pick Main Image" onPress={pickGeneralImage} />
          </View>

          <View style={styles.imagePreview}>
            {images?.map((img, idx) => (
              <Image
                key={idx}
                source={{
                  uri: img?.startsWith("http")
                    ? img
                    : `https://nodejsapp-hfpl.onrender.com${img}`,
                }}
                style={styles.imageBox}
              />
            ))}
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Color to Add:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedColor}
                onValueChange={setSelectedColor}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Color --" value="" />
                {availableColors?.map((c) => (
                  <Picker.Item key={c.id} label={c.colorName} value={c.id} />
                ))}
              </Picker>
            </View>
            <Button title="Add Color" onPress={addColor} />
          </View>

          {colors?.map((color, idx) => (
            <View
              key={idx}
              style={{
                marginVertical: 10,
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderColor: "#ccc",
                paddingBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  {color.colorName}
                </Text>
                <TouchableOpacity
                  onPress={() => removeColor(idx)}
                  style={{
                    backgroundColor: "#e74c3c",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 12 }}>
                    Remove Color
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Pick Images for Color"
                onPress={() => pickColorImages(idx)}
              />

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: 10,
                }}
              >
                {color?.images.map((img, i) => (
                  <View key={i} style={{ margin: 5, alignItems: "center" }}>
                    <Image
                      source={{
                        uri: img?.startsWith("http")
                          ? img
                          : `https://nodejsapp-hfpl.onrender.com${img}`,
                      }}
                      style={{ width: 70, height: 70, borderRadius: 8 }}
                    />
                    <TouchableOpacity
                      onPress={() => replaceColorImage(idx, i)}
                      style={{
                        marginTop: 4,
                        backgroundColor: "#007bff",
                        paddingHorizontal: 5,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10 }}>
                        Replace
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteColorImage(idx, i)}
                      style={{
                        marginTop: 2,
                        backgroundColor: "#dc3545",
                        paddingHorizontal: 5,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10 }}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {color?.images.length > 0 && (
                <TouchableOpacity
                  onPress={() => clearColorImages(idx)}
                  style={{
                    marginTop: 10,
                    backgroundColor: "#f39c12",
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ textAlign: "center", color: "#fff" }}>
                    Clear All Images
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.btnUpdate} onPress={handleCreate}>
            <Text style={styles.btnUpdateText}>CREATE PRODUCT</Text>
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
    position: "absolute",
    bottom: 50, // adjust to sit above your footer height
    left: 20,
    right: 20,
    backgroundColor: "#000000",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
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

export default CreateProduct;
