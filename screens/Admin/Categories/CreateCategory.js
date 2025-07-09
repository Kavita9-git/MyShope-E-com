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
import { getUserData } from "../../../redux/features/auth/userActions";
import { createCategory } from "../../../redux/features/auth/categoryActions";

const CreateCategory = ({ navigation }) => {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.user);
  // console.log(user);

  const { message = "" } = useSelector((state) => state.category);
  console.log("message :", message);

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  useEffect(() => {
    if (message.includes("Created")) {
      setCategory("");
      alert(message);
    }
    console.log("message", message);
  }, [message]);

  //State
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  //Product Create
  const handleCreate = () => {
    if (!category) {
      return alert("Please fill all fields");
    }
    // const categoryData = {
    //   category: category,
    // };

    console.log(category);
    dispatch(createCategory(category));
  };

  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.imageContainer}>
            <Pressable onPress={() => alert("Profile Dialogbox")}>
              <Text style={{ color: "red" }}>Create Category</Text>
            </Pressable>
          </View>
          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
          {message?.includes("Created") && <Text>{message}</Text>}

          <InputBox
            value={category}
            setValue={setCategory}
            placeholder={"Enter Category Name"}
            autoComplete={"name"}
          />

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
            <Text style={styles.btnUpdateText}>CREATE CATEGORY</Text>
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
});

export default CreateCategory;
