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
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Layout from "../../../components/Layout/Layout";
// import { UserData } from "../../data/UserData";
import InputBox from "../../../components/Form/InputBox";
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../../../redux/features/auth/userActions";
import {
  clearMessage,
  createCategory,
  getAllCategories,
} from "../../../redux/features/auth/categoryActions";
import Toast from "react-native-toast-message";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const CreateCategory = ({ navigation }) => {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.user);
  // console.log(user);

  const { message = "", categories } = useSelector((state) => state.category);
  // console.log("message :", message);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animate component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    dispatch(getAllCategories());
  }, [dispatch, fadeAnim, slideAnim]);

  useEffect(() => {
    if (message?.includes("Created")) {
      setCategory("");
      setSubcategory("");
      setSubcategories([]);
      setSuccessMessage(message);
      dispatch(clearMessage());
    }
  }, [message]);

  //State
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Add subcategory
  const addSubcategory = () => {
    if (!subcategory.trim()) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error!",
        text2: "Subcategory name cannot be empty",
      });
      return;
    }

    // Check for duplicate subcategory
    if (subcategories.includes(subcategory.trim())) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error!",
        text2: "Subcategory already added",
      });
      return;
    }

    setSubcategories([...subcategories, subcategory.trim()]);
    setSubcategory("");
  };

  // Remove subcategory
  const removeSubcategory = (index) => {
    const updatedSubcategories = [...subcategories];
    updatedSubcategories.splice(index, 1);
    setSubcategories(updatedSubcategories);
  };

  //Product Create
  const handleCreate = () => {
    if (!category) {
      return alert("Please enter a category name");
    }

    //Check if category already exists
    const existingCategory = categories.find(
      (cat) => cat.category === category
    );
    if (existingCategory) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error!",
        text2: "Category already exists...",
      });
      return setCategory("");
    }
    dispatch(createCategory(category, subcategories));
  };

  const displayMessage = () => {
    if (successMessage?.includes("Created")) {
      return (
        <View style={styles.successMessage}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color="#28a745"
            style={styles.messageIcon}
          />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      );
    }
  };

  return (
    <Layout showBackButton={true}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={["#4A00E0", "#8E2DE2"]}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.iconHeaderContainer}>
                  <View style={styles.iconBackground}>
                    <FontAwesome5 name="layer-group" size={28} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.headerText}>Create Category</Text>
                    <Text style={styles.headerSubtext}>
                      Add a new product category
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              color="#4A00E0"
              style={styles.loader}
            />
          )}
          {successMessage && displayMessage()}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Category Details</Text>

            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="category"
                size={24}
                color="#4A00E0"
                style={styles.inputIcon}
              />
              <View style={styles.inputContainer}>
                <InputBox
                  value={category}
                  setValue={setCategory}
                  placeholder={"Enter Category Name"}
                  autoComplete={"name"}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Subcategories</Text>

            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="folder-special"
                size={24}
                color="#4A00E0"
                style={styles.inputIcon}
              />
              <View style={styles.inputContainer}>
                <InputBox
                  value={subcategory}
                  setValue={setSubcategory}
                  placeholder={"Enter Subcategory Name"}
                  autoComplete={"name"}
                />
              </View>
              <TouchableOpacity
                onPress={addSubcategory}
                style={styles.addButton}
              >
                <AntDesign name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {subcategories.length > 0 && (
              <View style={styles.subcategoriesContainer}>
                <Text style={styles.subcategoryLabel}>
                  Added Subcategories:
                </Text>
                <View style={styles.chipContainer}>
                  {subcategories.map((subcat, index) => (
                    <View key={index} style={styles.chip}>
                      <Text style={styles.chipText}>{subcat}</Text>
                      <TouchableOpacity
                        onPress={() => removeSubcategory(index)}
                        style={styles.chipRemove}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#6B46C1"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#5879FE"
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                Categories help organize products for easier browsing and
                searching. Add subcategories to further organize products within
                a category.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.btnUpdate}
              onPress={handleCreate}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#4A00E0", "#8E2DE2"]}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Feather
                  name="plus-circle"
                  size={22}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.btnUpdateText}>CREATE CATEGORY</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.tipContainer}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={24} color="#FFA500" />
              <Text style={styles.tipTitle}>Tips</Text>
            </View>
            <Text style={styles.tipText}>
              • Use clear, descriptive names for categories{"\n"}• Keep category
              names consistent{"\n"}• Add relevant subcategories to improve
              navigation{"\n"}• Avoid special characters or symbols
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  headerContainer: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  headerGradient: {
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  iconHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4A00E0",
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#8E2DE2",
    paddingLeft: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  inputContainer: {
    flex: 1,
  },
  inputIcon: {
    marginRight: 15,
  },
  infoBox: {
    backgroundColor: "#EFF3FE",
    borderRadius: 12,
    padding: 15,
    marginVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#5879FE",
    flex: 1,
    lineHeight: 20,
  },
  loader: {
    marginVertical: 20,
  },
  successMessage: {
    backgroundColor: "#e6f7e6",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageIcon: {
    marginRight: 12,
  },
  successText: {
    color: "#28a745",
    fontSize: 16,
    flex: 1,
  },
  btnUpdate: {
    borderRadius: 12,
    marginTop: 10,
    overflow: "hidden",
    shadowColor: "#4A00E0",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  btnGradient: {
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  buttonIcon: {
    marginRight: 12,
  },
  btnUpdateText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  tipContainer: {
    backgroundColor: "#FFFBF2",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE5B4",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipTitle: {
    fontWeight: "700",
    color: "#FFA500",
    fontSize: 16,
    marginLeft: 8,
  },
  tipText: {
    color: "#666",
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: "#4A00E0",
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  subcategoriesContainer: {
    marginBottom: 15,
  },
  subcategoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF3FE",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: "#D4D8F9",
  },
  chipText: {
    fontSize: 14,
    color: "#4A00E0",
    marginRight: 6,
  },
  chipRemove: {
    padding: 2,
  },
});

export default CreateCategory;
