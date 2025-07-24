import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import Products from "../components/Products/Products";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../redux/features/auth/productActions";
import ProductsCard from "../components/Products/ProductsCard";

const CategoryProducts = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);
  console.log("filteredProducts :", filteredProducts);
  console.log("categoryId :", categoryId);
  useEffect(() => {
    if (products && products.length > 0) {
      if (categoryId === "all") {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter(
          (product) => product.category && product.category._id === categoryId
        );
        setFilteredProducts(filtered);
      }
    }
  }, [products, categoryId]);

  return (
    <Layout showBackButton={true}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            {categoryId === "all" ? "All Products" : categoryName}
          </Text>
          <View style={styles.underline} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {filteredProducts && filteredProducts.length > 0 ? (
              <>
                <Text style={styles.resultCount}>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "product" : "products"} found
                </Text>
                <View style={styles.productGrid}>
                  {filteredProducts.map((product) => (
                    <ProductsCard p={product} key={product._id} />
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No products found in this category
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  underline: {
    height: 3,
    width: 80,
    backgroundColor: "#000",
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  resultCount: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
});

export default CategoryProducts;
