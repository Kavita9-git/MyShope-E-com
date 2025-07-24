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
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Layout from "../../../components/Layout/Layout";
// import { UserData } from "../../data/UserData";
import InputBox from "../../../components/Form/InputBox";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../../../redux/features/auth/userActions";
import {
  clearMessage,
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../../../redux/features/auth/categoryActions";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";

const DeleteCategory = ({ navigation }) => {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.user);
  // console.log(user);

  const { categories = "", message = "" } = useSelector(
    (state) => state.category
  );

  const [successMessage, setSuccessMessage] = useState("");

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
  }, []);

  useEffect(() => {
    if (message?.includes("Deleted") || message?.includes("Updated")) {
      setCategoryId("");
      setSelectedSubcategory("");
      setSelectedSubcategories([]);
      setDeleteOption("category");
      setSuccessMessage(message);
      dispatch(getAllCategories());
      dispatch(clearMessage());
    }
    console.log("message", message);
  }, [message]);

  //State
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteOption, setDeleteOption] = useState("category"); // 'category', 'all_subcategories', 'specific_subcategory'
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Handle category selection
  const handleCategoryChange = (itemValue) => {
    setCategoryId(itemValue);
    setSelectedSubcategory("");
    setSelectedSubcategories([]);

    if (itemValue) {
      const category = categories.find((c) => c._id === itemValue);
      if (category) {
        setCurrentCategory(category);
      } else {
        setCurrentCategory(null);
      }
    } else {
      setCurrentCategory(null);
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    // Check if already selected
    if (selectedSubcategories.includes(subcategory)) {
      setSelectedSubcategories(
        selectedSubcategories.filter((s) => s !== subcategory)
      );
    } else {
      setSelectedSubcategories([...selectedSubcategories, subcategory]);
    }
  };

  //Delete Create
  const handleDelete = () => {
    if (!categoryId) {
      return alert("Please select a category");
    }

    if (deleteOption === "category") {
      Alert.alert(
        "Delete Category",
        "Are you sure you want to delete this category? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => {
              console.log("categoryId :", categoryId);
              dispatch(deleteCategory(categoryId));
            },
            style: "destructive",
          },
        ]
      );
    } else if (deleteOption === "all_subcategories") {
      Alert.alert(
        "Delete All Subcategories",
        "Are you sure you want to delete all subcategories from this category?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete All",
            onPress: () => {
              const formData = {
                subcategories: [],
              };
              dispatch(updateCategory(categoryId, formData));
            },
            style: "destructive",
          },
        ]
      );
    } else if (deleteOption === "specific_subcategory") {
      if (selectedSubcategories.length === 0) {
        return alert("Please select at least one subcategory to delete");
      }

      Alert.alert(
        "Delete Selected Subcategories",
        `Are you sure you want to delete ${selectedSubcategories.length} selected subcategories?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete Selected",
            onPress: () => {
              if (currentCategory && currentCategory.subcategories) {
                const remainingSubcategories =
                  currentCategory.subcategories.filter(
                    (sub) => !selectedSubcategories.includes(sub)
                  );

                const formData = {
                  subcategories: remainingSubcategories,
                };

                dispatch(updateCategory(categoryId, formData));
              }
            },
            style: "destructive",
          },
        ]
      );
    }
  };

  const displayMessage = () => {
    if (
      successMessage?.includes("Deleted") ||
      successMessage?.includes("Updated")
    ) {
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
              colors={["#FF416C", "#FF4B2B"]}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.iconHeaderContainer}>
                  <View style={styles.iconBackground}>
                    <FontAwesome5 name="trash-alt" size={28} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.headerText}>Delete Category</Text>
                    <Text style={styles.headerSubtext}>
                      Remove categories or subcategories
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              color="#FF416C"
              style={styles.loader}
            />
          )}

          {successMessage && displayMessage()}

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Delete Options</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.labelContainer}>
                <MaterialIcons
                  name="category"
                  size={24}
                  color="#FF416C"
                  style={styles.inputIcon}
                />
                <Text style={styles.label}>Choose Category:</Text>
              </View>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={categoryId}
                  onValueChange={handleCategoryChange}
                  style={styles.picker}
                  dropdownIconColor="#FF416C"
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

            <View style={styles.deleteOptionsContainer}>
              <Text style={styles.sectionTitle}>
                What do you want to delete?
              </Text>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  deleteOption === "category" && styles.optionButtonSelected,
                ]}
                onPress={() => setDeleteOption("category")}
              >
                <FontAwesome5
                  name="trash-alt"
                  size={20}
                  color={deleteOption === "category" ? "#fff" : "#FF416C"}
                />
                <Text
                  style={[
                    styles.optionButtonText,
                    deleteOption === "category" &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  Delete entire category
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  categoryId ? null : styles.optionButtonDisabled,
                  deleteOption === "all_subcategories" &&
                    styles.optionButtonSelected,
                ]}
                onPress={() =>
                  categoryId && setDeleteOption("all_subcategories")
                }
                disabled={!categoryId}
              >
                <MaterialIcons
                  name="delete-sweep"
                  size={20}
                  color={
                    !categoryId
                      ? "#ccc"
                      : deleteOption === "all_subcategories"
                      ? "#fff"
                      : "#FF416C"
                  }
                />
                <Text
                  style={[
                    styles.optionButtonText,
                    !categoryId && styles.optionButtonTextDisabled,
                    deleteOption === "all_subcategories" &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  Delete all subcategories
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  !categoryId || !currentCategory?.subcategories?.length
                    ? styles.optionButtonDisabled
                    : null,
                  deleteOption === "specific_subcategory" &&
                    styles.optionButtonSelected,
                ]}
                onPress={() =>
                  categoryId &&
                  currentCategory?.subcategories?.length > 0 &&
                  setDeleteOption("specific_subcategory")
                }
                disabled={
                  !categoryId || !currentCategory?.subcategories?.length
                }
              >
                <Feather
                  name="check-square"
                  size={20}
                  color={
                    !categoryId || !currentCategory?.subcategories?.length
                      ? "#ccc"
                      : deleteOption === "specific_subcategory"
                      ? "#fff"
                      : "#FF416C"
                  }
                />
                <Text
                  style={[
                    styles.optionButtonText,
                    (!categoryId || !currentCategory?.subcategories?.length) &&
                      styles.optionButtonTextDisabled,
                    deleteOption === "specific_subcategory" &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  Delete specific subcategories
                </Text>
              </TouchableOpacity>
            </View>

            {deleteOption === "specific_subcategory" &&
              currentCategory?.subcategories?.length > 0 && (
                <View style={styles.subcategoriesContainer}>
                  <Text style={styles.subcategoryLabel}>
                    Select subcategories to delete:
                  </Text>
                  <View style={styles.chipContainer}>
                    {currentCategory.subcategories.map((subcat, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.chip,
                          selectedSubcategories.includes(subcat) &&
                            styles.chipSelected,
                        ]}
                        onPress={() => handleSubcategorySelect(subcat)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedSubcategories.includes(subcat) &&
                              styles.chipTextSelected,
                          ]}
                        >
                          {subcat}
                        </Text>
                        {selectedSubcategories.includes(subcat) && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#fff"
                            style={styles.chipIcon}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                  {selectedSubcategories.length > 0 && (
                    <Text style={styles.selectedCount}>
                      {selectedSubcategories.length} subcategories selected
                    </Text>
                  )}
                </View>
              )}

            <View style={styles.warningBox}>
              <Ionicons
                name="warning-outline"
                size={24}
                color="#e67e22"
                style={styles.warningIcon}
              />
              <Text style={styles.warningText}>
                {deleteOption === "category"
                  ? "Warning: Deleting a category will remove it from all associated products. This action cannot be undone."
                  : deleteOption === "all_subcategories"
                  ? "Warning: Deleting all subcategories will remove them from this category. This action cannot be undone."
                  : "Warning: Deleting subcategories may affect product filtering and organization. This action cannot be undone."}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.btnDelete}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF416C", "#FF4B2B"]}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons
                  name="delete-forever"
                  size={22}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.btnDeleteText}>
                  {deleteOption === "category"
                    ? "DELETE CATEGORY"
                    : deleteOption === "all_subcategories"
                    ? "DELETE ALL SUBCATEGORIES"
                    : "DELETE SELECTED SUBCATEGORIES"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.tipContainer}>
            <View style={styles.tipHeader}>
              <Ionicons name="information-circle" size={24} color="#3498db" />
              <Text style={styles.tipTitle}>Before Deleting</Text>
            </View>
            <Text style={styles.tipText}>
              • Make sure no products are using this category{"\n"}• Consider
              reassigning products to other categories{"\n"}• Check if merging
              categories would be a better option{"\n"}• Removing subcategories
              may impact product filtering
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
    borderLeftColor: "#FF416C",
    paddingLeft: 10,
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
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 10,
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
  deleteOptionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#FF4B2B",
    paddingLeft: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 65, 108, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 65, 108, 0.2)",
  },
  optionButtonSelected: {
    backgroundColor: "#FF416C",
  },
  optionButtonDisabled: {
    backgroundColor: "#f8f8f8",
    borderColor: "#e0e0e0",
  },
  optionButtonText: {
    color: "#FF416C",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
  },
  optionButtonTextSelected: {
    color: "#fff",
  },
  optionButtonTextDisabled: {
    color: "#bbb",
  },
  subcategoriesContainer: {
    marginBottom: 20,
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
    backgroundColor: "rgba(255, 65, 108, 0.1)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 65, 108, 0.2)",
  },
  chipSelected: {
    backgroundColor: "#FF416C",
  },
  chipText: {
    fontSize: 14,
    color: "#FF416C",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
  },
  chipIcon: {
    marginLeft: 6,
  },
  selectedCount: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  warningBox: {
    backgroundColor: "#FEF5E7",
    borderRadius: 12,
    padding: 15,
    marginVertical: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#FAD7A0",
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  warningText: {
    fontSize: 14,
    color: "#e67e22",
    flex: 1,
    lineHeight: 20,
  },
  btnDelete: {
    borderRadius: 12,
    marginTop: 10,
    overflow: "hidden",
    shadowColor: "#FF416C",
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
  btnDeleteText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  tipContainer: {
    backgroundColor: "#EBF5FB",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#AED6F1",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipTitle: {
    fontWeight: "700",
    color: "#3498db",
    fontSize: 16,
    marginLeft: 8,
  },
  tipText: {
    color: "#2C3E50",
    lineHeight: 22,
  },
});

export default DeleteCategory;
