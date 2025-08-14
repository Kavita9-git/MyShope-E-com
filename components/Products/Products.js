import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductsCard from "./ProductsCard";
import { ProductsData } from "../../data/ProductsData";
import { getAllProducts } from "../../redux/features/auth/productActions";

const Products = ({ searchText = "", filterOptions = null }) => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  // console.log("Redux products:", products);

  // Use local state as fallback if products aren't available
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    // Fetch products when component mounts
    dispatch(getAllProducts());
  }, [dispatch]);

  // Use fallback data if products still not available after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!products || products.length === 0) {
        // console.log("Using fallback product data");
        setFallbackMode(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [products]);

  // Determine what data to display
  const allProducts =
    products && products.length > 0
      ? products
      : fallbackMode
      ? ProductsData
      : [];

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];

    let result = [...allProducts];

    // Apply search text filter
    if (searchText && searchText.trim() !== "") {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.category?.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply advanced filters if available
    if (filterOptions) {
      // Filter by price range
      if (filterOptions.priceRange) {
        result = result.filter(
          (product) =>
            product.price >= filterOptions.priceRange[0] &&
            product.price <= filterOptions.priceRange[1]
        );
      }

      // Filter by categories - Fixed to properly check both category ID structures
      if (
        filterOptions.selectedCategories &&
        filterOptions.selectedCategories.length > 0
      ) {
        result = result.filter((product) => {
          // Handle case when category is an object with _id property
          if (
            product.category &&
            typeof product.category === "object" &&
            product.category._id
          ) {
            return filterOptions.selectedCategories.includes(
              product.category._id
            );
          }
          // Handle case when category is a direct ID string
          else if (product.category) {
            return filterOptions.selectedCategories.includes(product.category);
          }
          return false;
        });
      }

      // Filter by rating
      if (filterOptions.ratings > 0) {
        result = result.filter(
          (product) => (product.rating || 0) >= filterOptions.ratings
        );
      }

      // Apply sorting
      if (filterOptions.sortOption) {
        switch (filterOptions.sortOption) {
          case "price_asc":
            result.sort((a, b) => a.price - b.price);
            break;
          case "price_desc":
            result.sort((a, b) => b.price - a.price);
            break;
          case "newest":
            result.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            break;
          // For relevance, we keep the original order or could implement more complex logic
          default:
            break;
        }
      }
    }

    return result;
  }, [allProducts, searchText, filterOptions]);

  // Show loading indicator when initially loading
  if (loading && !products) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1e3c72" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Show error message if there was an error
  if (error && !products && fallbackMode) {
    console.log("Error fetching products:", error);
  }

  return (
    <View style={styles.container}>
      {filteredProducts.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noProductsText}>
            {searchText || filterOptions
              ? "No products match your search criteria"
              : "No products available"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductsCard p={item} />}
          keyExtractor={(item, index) => item._id || index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#1e3c72",
    fontWeight: "500",
  },
  noProductsText: {
    fontSize: 18,
    color: "#555",
    fontWeight: "500",
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 0,
    paddingHorizontal: 5,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },
});

export default Products;
