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
import { Picker } from "@react-native-picker/picker";
import {
  clearMessage,
  createCategory,
  getAllCategories,
  updateCategory,
} from "../../../redux/features/auth/categoryActions";
import Toast from "react-native-toast-message";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

const UpdateCategory = () => {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.user);
  // console.log(user);

  const { categories = "", message = "" } = useSelector(
    (state) => state.category
  );
  // console.log("categories :", categories);

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

    dispatch(clearMessage());
    dispatch(getAllCategories());
  }, []);

  useEffect(() => {
    if (message?.includes("Updated")) {
      setCategoryId("");
      setCategory("");
      setSubcategory("");
      setSubcategories([]);
      setSuccessMessage(message);
      dispatch(clearMessage());
      dispatch(getAllCategories());
    }
  }, [message]);

  //State
  const [category, setCategory] = useState("");
  const [categoryId, setCategoryId] = useState("");
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

  // Set subcategories when a category is selected
  const handleCategoryChange = (itemValue) => {
    setCategoryId(itemValue);
    if (itemValue) {
      const selectedCategory = categories.find((cat) => cat._id === itemValue);
      if (selectedCategory && selectedCategory.subcategories) {
        setSubcategories([...selectedCategory.subcategories]);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  };

  //Product Create
  const handleCreate = () => {
    if (!categoryId) {
      return alert("Please select a category to update");
    }

    const formData = {};

    // Only add category name if it's provided
    if (category.trim()) {
      formData.updateCategory = category.trim();
    }

    // Always send subcategories
    formData.subcategories = subcategories;

    console.log("formData :", formData);

    // Only check for duplicate if we're changing the name
    if (category.trim()) {
      //Check if category already exists with this name
      const existingCategory = categories.find(
        (cat) => cat.category === category && cat._id !== categoryId
      );

      if (existingCategory) {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Error !",
          text2: "Category name already exists...",
        });
        return;
      }
    }

    dispatch(updateCategory(categoryId, formData));
  };

  const displayMessage = () => {
    if (successMessage?.includes("Updated")) {
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
              colors={["#2193b0", "#6dd5ed"]}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.iconHeaderContainer}>
                  <View style={styles.iconBackground}>
                    <MaterialCommunityIcons
                      name="square-edit-outline"
                      size={28}
                      color="#fff"
                    />
                  </View>
                  <View>
                    <Text style={styles.headerText}>Update Category</Text>
                    <Text style={styles.headerSubtext}>
                      Modify existing categories and subcategories
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              color="#2193b0"
              style={styles.loader}
            />
          )}

          {successMessage && displayMessage()}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Category Details</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.labelContainer}>
                <MaterialIcons
                  name="category"
                  size={24}
                  color="#2193b0"
                  style={styles.inputIcon}
                />
                <Text style={styles.label}>Select Category:</Text>
              </View>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={categoryId}
                  onValueChange={handleCategoryChange}
                  style={styles.picker}
                  dropdownIconColor="#2193b0"
                >
                  <Picker.Item
                    label="-- Select Category --"
                    value=""
                    style={styles.placeholderText}
                  />
                  {categories &&
                    categories?.map((c) => (
                      <Picker.Item
                        key={c._id}
                        label={c.category}
                        value={c._id}
                        style={styles.pickerItem}
                      />
                    ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Feather
                  name="edit-2"
                  size={24}
                  color="#2193b0"
                  style={styles.inputIcon}
                />
                <Text style={styles.label}>New Name (Optional):</Text>
              </View>
              <InputBox
                value={category}
                setValue={setCategory}
                placeholder={"Enter New Category Name"}
                autoComplete={"name"}
                customStyle={styles.customInputBox}
              />
            </View>

            <Text style={styles.sectionTitle}>Manage Subcategories</Text>

            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="folder-special"
                size={24}
                color="#2193b0"
                style={styles.inputIcon}
              />
              <View style={styles.subcategoryInputContainer}>
                <InputBox
                  value={subcategory}
                  setValue={setSubcategory}
                  placeholder={"Enter Subcategory Name"}
                  autoComplete={"name"}
                  customStyle={styles.customInputBox}
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
                  Current Subcategories:
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
                          color="#2193b0"
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
                color="#2193b0"
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                Update the category name and manage subcategories to better
                organize your products. Leave the name field empty if you only
                want to update subcategories.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.btnUpdate}
              onPress={handleCreate}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#2193b0", "#6dd5ed"]}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Feather
                  name="save"
                  size={22}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.btnUpdateText}>UPDATE CATEGORY</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.tipContainer}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={24} color="#e67e22" />
              <Text style={styles.tipTitle}>Tips for Updating</Text>
            </View>
            <Text style={styles.tipText}>
              • Ensure the new name is clear and descriptive{"\n"}• Maintain
              consistent naming conventions{"\n"}• Consider how the change may
              affect users browsing products{"\n"}• Organize subcategories
              logically within each category
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
    borderLeftColor: "#2193b0",
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#6dd5ed",
    paddingLeft: 10,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  customInputBox: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
  pickerContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
  },
  pickerItem: {
    fontSize: 16,
    color: "#333",
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
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
    color: "#2193b0",
    flex: 1,
    lineHeight: 20,
  },
  btnUpdate: {
    borderRadius: 12,
    marginTop: 10,
    overflow: "hidden",
    shadowColor: "#2193b0",
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
    backgroundColor: "#FEF5E7",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FAD7A0",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipTitle: {
    fontWeight: "700",
    color: "#e67e22",
    fontSize: 16,
    marginLeft: 8,
  },
  tipText: {
    color: "#666",
    lineHeight: 22,
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
  addButton: {
    backgroundColor: "#2193b0",
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
    backgroundColor: "#e3f2fd",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: "#c1e0f7",
  },
  chipText: {
    fontSize: 14,
    color: "#2193b0",
    marginRight: 6,
  },
  chipRemove: {
    padding: 2,
  },
  subcategoryInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
});

export default UpdateCategory;
