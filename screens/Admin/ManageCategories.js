import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../redux/features/auth/categoryActions";

const ManageCategories = ({ navigation }) => {
  const dispatch = useDispatch();
  const { categories = [] } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  // Category management options with their respective details
  const categoryOptions = [
    {
      label: "Create Categories",
      icon: "plus-circle",
      description: "Add new product categories",
      screen: "createcategory",
      gradient: ["#4facfe", "#00f2fe"],
    },
    {
      label: "Update Categories",
      icon: "edit",
      description: "Modify existing categories",
      action: () => {
        if (categories && categories.length > 0) {
          navigation.navigate("updatecategory", {
            categoryId: categories[0]._id,
            categoryName: categories[0].category,
            categorySubcategories: categories[0].subcategories || [],
          });
        } else {
          alert(
            "No categories available to update. Please create a category first."
          );
        }
      },
      gradient: ["#6a11cb", "#2575fc"],
    },
    {
      label: "Delete Categories",
      icon: "delete",
      description: "Remove unwanted categories",
      screen: "deletecategory",
      gradient: ["#FF5E62", "#FF9966"],
    },
  ];

  return (
    <Layout showBackButton={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Feather name="folder" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Manage Categories</Text>
              <Text style={styles.headerSubtitle}>
                Create, update, and delete product categories
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#ebf8ff" }]}>
              <Feather name="folder-plus" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Create</Text>
              <Text style={styles.statLabel}>Add new categories</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#feebef" }]}>
              <Feather name="edit-2" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Manage</Text>
              <Text style={styles.statLabel}>Update or delete</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Category Management</Text>

        <View style={styles.sectionCard}>
          {categoryOptions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() =>
                item.action ? item.action() : navigation.navigate(item.screen)
              }
            >
              <LinearGradient
                colors={item.gradient}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AntDesign name={item.icon} size={22} color="#fff" />
              </LinearGradient>
              <View style={styles.btnTextContainer}>
                <Text style={styles.btnText}>{item.label}</Text>
                <Text style={styles.btnSubText}>{item.description}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
            </TouchableOpacity>
          ))}
        </View>

        {categories && categories.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Available Categories</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={styles.categoryCard}
                  onPress={() =>
                    navigation.navigate("updatecategory", {
                      categoryId: category._id,
                      categoryName: category.category,
                      categorySubcategories: category.subcategories || [],
                    })
                  }
                >
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.category}</Text>
                    <View style={styles.actionIcons}>
                      <TouchableOpacity
                        style={styles.editIcon}
                        onPress={() =>
                          navigation.navigate("updatecategory", {
                            categoryId: category._id,
                            categoryName: category.category,
                            categorySubcategories: category.subcategories || [],
                          })
                        }
                      >
                        <Feather name="edit-2" size={16} color="#6a11cb" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {category.subcategories &&
                    category.subcategories.length > 0 && (
                      <View style={styles.subcategoriesContainer}>
                        <Text style={styles.subcategoriesLabel}>
                          Subcategories:
                        </Text>
                        <View style={styles.chipContainer}>
                          {category.subcategories.map((subcat, idx) => (
                            <View key={idx} style={styles.chip}>
                              <Text style={styles.chipText}>{subcat}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Category Management v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    minHeight: "100%",
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
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
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 25,
    marginTop: -25,
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
  sectionCard: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconGradient: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  btnTextContainer: {
    flex: 1,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  btnSubText: {
    fontSize: 12,
    color: "#718096",
  },
  footer: {
    alignItems: "center",
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#718096",
  },
  categoryContainer: {
    paddingHorizontal: 15,
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  actionIcons: {
    flexDirection: "row",
  },
  editIcon: {
    backgroundColor: "#e9d5ff",
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  subcategoriesContainer: {
    marginTop: 8,
  },
  subcategoriesLabel: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 6,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#EFF3FE",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    margin: 2,
    borderWidth: 1,
    borderColor: "#D4D8F9",
  },
  chipText: {
    fontSize: 12,
    color: "#4A00E0",
  },
});

export default ManageCategories;
