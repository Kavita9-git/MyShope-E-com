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

  // ✅ Flipkart-style category images
  const categoryImages = {
    Mobiles: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/5f2ee7f883cdb774.png?q=100",
    Laptops: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/af646c36d74c4be9.png?q=100",
    Clothes: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/ff559cb9d803d424.png?q=100",
    Shoes: "https://rukminim2.flixcart.com/image/128/128/xif0q/shoe/g/8/p/6-rng-854-grey-40-bruton-grey-original-imahb2e63hhyb3hp.jpeg?q=70",
    Watches: "https://rukminim2.flixcart.com/image/128/128/xif0q/watch/h/e/s/-original-imahfspudkzsnssw.jpeg?q=70",
    Accessories: "https://rukminim2.flixcart.com/image/128/128/xif0q/sunglass/n/b/6/free-size-iron-man-tony-stark-avengers-infinity-war-being-better-original-imah5x9znxbcwv4w.jpeg?q=70",
    Smartwatch: "https://rukminim2.flixcart.com/image/612/612/xif0q/watch/u/1/g/-original-imahfsz7cuzxhcfy.jpeg?q=70",
    Food: "https://cdn-icons-png.flaticon.com/128/2674/2674067.png",
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
        <ActivityIndicator size="large" color="#2874F0" />
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
                "https://rukminim2.flixcart.com/image/612/612/xif0q/watch/u/1/g/-original-imahfsz7cuzxhcfy.jpeg?q=70"; // Default image

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
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 10,
    marginRight:10,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  catContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  catImage: {
    height: 70,
    width: 70,
    borderRadius: 35, // ✅ Circle shape
    marginBottom: 6,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#3182ce3d",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  catTitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    maxWidth: 80,
  },
  loadingContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  noCategory: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  noCategoryText: {
    fontSize: 12,
    color: "#666",
  },
});

export default Categories;
