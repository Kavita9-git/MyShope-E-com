import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../../redux/features/auth/categoryActions";

const Categories = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const [loading, setLoading] = useState(true);

  // ✅ Category-wise Images (Flipkart Style)
  const categoryImages = {
    Mobiles: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/5f2ee7f883cdb774.png?q=100",
    Laptops: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/af646c36d74c4be9.png?q=100",
    Clothes: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/ff559cb9d803d424.png?q=100",
    Shoes: "https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/g/8/p/6-rng-854-grey-40-bruton-grey-original-imahb2e63hhyb3hp.jpeg?q=70",
    Watches: "https://rukminim2.flixcart.com/image/832/832/xif0q/watch/h/e/s/-original-imahfspudkzsnssw.jpeg?q=70",
    Accessories: "https://rukminim2.flixcart.com/image/612/612/xif0q/sunglass/n/b/6/free-size-iron-man-tony-stark-avengers-infinity-war-being-better-original-imah5x9znxbcwv4w.jpeg?q=70",
    Smartwatch: "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/0492397449e17ed3.jpg?q=60",
    Food: "https://rukminim2.flixcart.com/image/312/312/xif0q/food-processor/h/v/i/-original-imahfe6kzsvmvk8a.jpeg?q=70",
    Appliances: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/7f37937d6041e9d3.png?q=100",
    Electronics: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/6a3f1d3e2ec3f4dc.png?q=100",
    Beauty: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/83ea0f8e481ef770.png?q=100",
    Furniture: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/c7c9daff4dc7a6f0.png?q=100",
    Grocery: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/06b9e0d22e3fef84.png?q=100",
  };

  useEffect(() => {
    dispatch(getAllCategories());
    setLoading(false);
  }, []);

  const navigateToProducts = (categoryId, categoryName) => {
    navigation.navigate("CategoryProducts", {
      categoryId,
      categoryName,
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.container}>
          {categories && categories.length > 0 ? (
            categories.map((item) => {
              const imageUrl =
                categoryImages[item.category?.trim()] ||
                "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/0492397449e17ed3.jpg?q=60"; // Default image

              return (
                <View key={item._id}>
                  <TouchableOpacity
                    style={styles.catContainer}
                    onPress={() => navigateToProducts(item._id, item.category)}
                  >
                    <Image source={{ uri: imageUrl }} style={styles.catImage} />
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
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },
  container: {
    padding: 1,
    flexDirection: "row",
    borderRadius: 10,
  },
  catContainer: {
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    minWidth: 50,
  },
  catImage: {
    height: 50,
    width: 50,
    borderRadius: 0,
    marginBottom: 10,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "transparent",
  },
  catTitle: {
    fontSize: 9,
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
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  noCategoryText: {
    fontSize: 9,
    color: "#666",
  },
});

export default Categories;
