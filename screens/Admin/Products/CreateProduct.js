import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
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
  const { message } = useSelector((state) => state.product);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [generalImage, setGeneralImage] = useState("");
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (message && message === "Product Created Successfully") {
      Alert.alert("Success", message);
      resetForm();
    }
  }, [message]);

  useEffect(() => {
    const totalStock = calculateTotalStock();
    setStock(totalStock.toString());
  }, [colors]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("");
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
        { size, price: "", stock: "" },
      ];
    }
    setColors(updatedColors);
  };

  const updateSizeField = (colorIndex, size, field, value) => {
    const updatedColors = [...colors];
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
    formData.append("colors", JSON.stringify(colors));

    dispatch(createProduct(formData));
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <InputBox value={name} setValue={setName} placeholder="Product Name" />
        <InputBox
          value={description}
          setValue={setDescription}
          placeholder="Description"
        />
        <InputBox value={price} setValue={setPrice} placeholder="Price" />
        {/* <InputBox value={stock} setValue={setStock} placeholder="Stock" /> */}
        <InputBox
          value={stock.toString()}
          placeholder="Total Stock"
          editable={false}
        />

        <Picker selectedValue={category} onValueChange={setCategory}>
          <Picker.Item label="Select Category" value="" />
          {categories?.map((c) => (
            <Picker.Item key={c._id} label={c.category} value={c._id} />
          ))}
        </Picker>

        <Button
          title="Pick General Image"
          onPress={pickGeneralImage}
          color="#1e40af"
        />

        {generalImage && (
          <View style={{ alignItems: "center", marginVertical: 10 }}>
            <Image source={{ uri: generalImage }} style={styles.cardImage} />
            <TouchableOpacity
              onPress={() => setGeneralImage("")}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        <Picker selectedValue={selectedColor} onValueChange={setSelectedColor}>
          <Picker.Item label="Select Color" value="" />
          {availableColors.map((c) => (
            <Picker.Item
              key={c.colorId}
              label={c.colorName}
              value={c.colorId}
            />
          ))}
        </Picker>

        <Button title="Add Color" onPress={addColor} color="#1e40af" />

        {colors.map((color, idx) => (
          <View key={idx} style={styles.colorContainer}>
            <Text style={styles.colorName}>{color.colorName}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                <Text style={styles.addImageButtonText}>+ Add Image</Text>
              </TouchableOpacity>
            </ScrollView>

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

            {color.sizes.map((variant, i) => (
              <View key={i} style={styles.variantRow}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  {variant.size}
                </Text>
                <View style={{ width: "45%" }}>
                  <InputBox
                    value={variant.price}
                    setValue={(val) =>
                      updateSizeField(idx, variant.size, "price", val)
                    }
                    placeholder="Price"
                  />
                </View>
                <View style={{ width: "45%" }}>
                  <InputBox
                    value={variant.stock}
                    setValue={(val) =>
                      updateSizeField(idx, variant.size, "stock", val)
                    }
                    placeholder="Stock"
                  />
                </View>
              </View>
            ))}
          </View>
        ))}

        <Button title="Create Product" onPress={handleSubmit} />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  cardImage: { width: 100, height: 100, borderRadius: 10, marginRight: 8 },
  removeButton: {
    marginTop: 5,
    backgroundColor: "#dc2626",
    padding: 6,
    borderRadius: 6,
  },
  removeButtonText: { color: "#fff", fontSize: 12 },
  colorContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  colorName: { fontWeight: "bold", marginBottom: 8 },
  imageWrapper: { alignItems: "center", marginRight: 10 },
  replaceButton: {
    marginTop: 5,
    backgroundColor: "#1e40af",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  replaceButtonText: { color: "#fff", fontSize: 10 },
  addImageButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 6,
  },
  addImageButtonText: { fontSize: 12 },
  sizeButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 4,
  },
  sizeButtonSelected: { backgroundColor: "#1e40af", borderColor: "#1e40af" },
  sizeText: { fontSize: 12 },
  sizeTextSelected: { color: "#fff" },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
});

export default CreateProduct;
