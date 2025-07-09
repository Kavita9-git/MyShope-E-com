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
// import { UserData } from "../../data/UserData";
import InputBox from "../../../components/Form/InputBox";
import { useDispatch, useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import {
  clearMessage,
  getAllProducts,
  updateProduct,
} from "../../../redux/features/auth/productActions";
import { getAllCategories } from "../../../redux/features/auth/categoryActions";

const UpdateProducts = ({ navigation }) => {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.user);
  // console.log(user);

  const { categories = "" } = useSelector((state) => state.category);
  const { products = "", message = "" } = useSelector((state) => state.product);
  console.log("categories :", categories);
  console.log("products :", products);

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
      alert(message);
      dispatch(clearMessage());
    }
    console.log("message", message);
  }, [message]);

  //State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [catData, setCatData] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);

  //Product Create
  const handleCreate = () => {
    if (!productId) {
      return alert("Please fill all fields");
    }
    const formData = {
      name: name,
      description: description,
      price: price,
      stock: stock,
      category: categoryId,
    };
    console.log("formData :", formData);
    console.log("productId :", productId);
    dispatch(updateProduct(productId, formData));
  };

  const fetchProducts = async (itemValue) => {
    setProductId(itemValue);

    //Find Product Details
    const getProduct = products.find((p) => {
      return p?._id === itemValue;
    });
    setName(getProduct?.name);
    setDescription(getProduct?.description);
    setPrice(getProduct?.price.toString());
    setStock(getProduct?.stock.toString());
    setCategory(getProduct?.category?.category);
    setCategoryId(getProduct?.category?._id);

    console.log("getProduct", getProduct);
  };

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.imageContainer}>
            <Pressable onPress={() => alert("Profile Dialogbox")}>
              <Text style={{ color: "red" }}>Update Product</Text>
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

          <InputBox
            value={name}
            setValue={setName}
            placeholder={"Enter Product Name"}
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

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Category:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={categoryId}
                onValueChange={(itemValue) => setCategoryId(itemValue)}
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

          <TouchableOpacity style={styles.btnUpdate} onPress={handleCreate}>
            <Text style={styles.btnUpdateText}>UPDATE PRODUCT</Text>
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

export default UpdateProducts;
