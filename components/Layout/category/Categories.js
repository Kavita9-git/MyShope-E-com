import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../../redux/features/auth/categoryActions";
import { LinearGradient } from "expo-linear-gradient";

const Categories = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(getAllCategories());
    setLoading(false);
  }, []);

  // Enhanced icon mapping with icon type and name
  const getIconForCategory = (categoryName) => {
    const iconMap = {
      electronics: {
        type: "material",
        name: "laptop",
        color1: "#4A00E0",
        color2: "#8E2DE2",
      },
      phone: {
        type: "material",
        name: "cellphone",
        color1: "#4776E6",
        color2: "#8E54E9",
      },
      computer: {
        type: "material",
        name: "desktop-mac",
        color1: "#0082c8",
        color2: "#667db6",
      },
      camera: {
        type: "material",
        name: "camera",
        color1: "#114357",
        color2: "#F29492",
      },

      clothing: {
        type: "material",
        name: "tshirt-crew",
        color1: "#2193b0",
        color2: "#6dd5ed",
      },
      fashion: {
        type: "material",
        name: "hanger",
        color1: "#2193b0",
        color2: "#6dd5ed",
      },
      shoes: {
        type: "fontawesome",
        name: "shoe-prints",
        color1: "#834d9b",
        color2: "#d04ed6",
      },
      accessories: {
        type: "material",
        name: "glasses",
        color1: "#4568DC",
        color2: "#B06AB3",
      },

      books: {
        type: "ionicons",
        name: "book",
        color1: "#FF8008",
        color2: "#FFC837",
      },
      furniture: {
        type: "material",
        name: "sofa",
        color1: "#A83279",
        color2: "#D38312",
      },
      food: {
        type: "material",
        name: "food-fork-drink",
        color1: "#F09819",
        color2: "#EDDE5D",
      },
      grocery: {
        type: "material",
        name: "cart",
        color1: "#F09819",
        color2: "#EDDE5D",
      },

      sports: {
        type: "material",
        name: "bike",
        color1: "#00B4DB",
        color2: "#0083B0",
      },
      beauty: {
        type: "material",
        name: "spray",
        color1: "#FF416C",
        color2: "#FF4B2B",
      },
      toys: {
        type: "material",
        name: "teddy-bear",
        color1: "#FFAFBD",
        color2: "#ffc3a0",
      },
      health: {
        type: "fontawesome",
        name: "heartbeat",
        color1: "#FF5F6D",
        color2: "#FFC371",
      },

      automotive: {
        type: "material",
        name: "car",
        color1: "#3a7bd5",
        color2: "#3a6073",
      },
      jewelry: {
        type: "material",
        name: "diamond",
        color1: "#1D976C",
        color2: "#93F9B9",
      },
      garden: {
        type: "material",
        name: "flower",
        color1: "#56ab2f",
        color2: "#a8e063",
      },
      music: {
        type: "material",
        name: "music",
        color1: "#7b4397",
        color2: "#dc2430",
      },

      travel: {
        type: "material",
        name: "airplane",
        color1: "#1c92d2",
        color2: "#f2fcfe",
      },
      pets: {
        type: "material",
        name: "dog",
        color1: "#fc4a1a",
        color2: "#f7b733",
      },
      art: {
        type: "ionicons",
        name: "color-palette",
        color1: "#11998e",
        color2: "#38ef7d",
      },
      baby: {
        type: "material",
        name: "baby-bottle",
        color1: "#FF61D2",
        color2: "#FE9090",
      },

      games: {
        type: "ionicons",
        name: "game-controller",
        color1: "#4568DC",
        color2: "#B06AB3",
      },
      office: {
        type: "material",
        name: "office-building",
        color1: "#2C3E50",
        color2: "#4CA1AF",
      },
      watches: {
        type: "material",
        name: "watch",
        color1: "#0F2027",
        color2: "#78ffd6",
      },
      home: {
        type: "material",
        name: "home-variant",
        color1: "#3a7bd5",
        color2: "#00d2ff",
      },
    };

    // Try to match category name with icon name
    const lowercaseName = categoryName?.toLowerCase();
    for (const key in iconMap) {
      if (lowercaseName?.includes(key)) {
        return iconMap[key];
      }
    }

    // Default icon if no match found
    return {
      type: "material",
      name: "shape",
      color1: "#536976",
      color2: "#292E49",
    };
  };

  // Function to render the correct icon based on type
  const renderIcon = (iconInfo, size = 24) => {
    switch (iconInfo.type) {
      case "material":
        return (
          <MaterialCommunityIcons
            name={iconInfo.name}
            size={size}
            color="#fff"
          />
        );
      case "fontawesome":
        return <FontAwesome5 name={iconInfo.name} size={size} color="#fff" />;
      case "ionicons":
        return <Ionicons name={iconInfo.name} size={size} color="#fff" />;
      default:
        return <AntDesign name="appstore-o" size={size} color="#fff" />;
    }
  };

  const navigateToProducts = (categoryId, categoryName) => {
    navigation.navigate("CategoryProducts", {
      categoryId: categoryId,
      categoryName: categoryName,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3c72" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={styles.container}>
          {categories && categories.length > 0 ? (
            categories.map((item) => {
              const iconInfo = getIconForCategory(item.category);
              return (
                <View key={item._id}>
                  <TouchableOpacity
                    style={styles.catContainer}
                    onPress={() => navigateToProducts(item._id, item.category)}
                  >
                    <LinearGradient
                      colors={[iconInfo.color1, iconInfo.color2]}
                      style={styles.iconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {renderIcon(iconInfo, 26)}
                    </LinearGradient>
                    <Text style={styles.catTitle} numberOfLines={1}>
                      {item.category}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.noCategory}>
              <Text style={styles.noCategoryText}>No categories available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: 15,
    flexDirection: "row",
    borderRadius: 10,
  },
  catContainer: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    minWidth: 80,
  },
  iconContainer: {
    height: 64,
    width: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  catIcon: {
    fontSize: 24,
    color: "#ffffff",
  },
  catTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 4,
    textAlign: "center",
    maxWidth: 80,
  },
  loadingContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  noCategory: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  noCategoryText: {
    fontSize: 16,
    color: "#666",
  },
});

export default Categories;
