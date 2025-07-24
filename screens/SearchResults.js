import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import Products from "../components/Products/Products";
import SearchFilter from "../components/Search/SearchFilter";
import BackButton from "../components/Layout/BackButton";
import { useDispatch } from "react-redux";
import { getAllProducts } from "../redux/features/auth/productActions";

const SearchResults = ({ route, navigation }) => {
  const dispatch = useDispatch();
  // Get initial search text passed from Home screen
  const { initialSearchText } = route.params || { initialSearchText: "" };

  // Local state for search and filters
  const [searchText, setSearchText] = useState(initialSearchText);
  const [filterOptions, setFilterOptions] = useState(null);

  useEffect(() => {
    // Fetch products when component mounts
    dispatch(getAllProducts());
  }, [dispatch]);

  // Handle search functionality
  const handleSearch = (text) => {
    setSearchText(text);
  };

  // Handle filter functionality
  const handleFilter = (options) => {
    setFilterOptions(options);
  };

  return (
    <Layout>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Search Results</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Filter Component */}
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          initialSearchText={initialSearchText}
        />

        {/* Results Section */}
        <Text style={styles.sectionTitle}>
          {searchText ? `Results for "${searchText}"` : "All Products"}
        </Text>

        {/* Products List */}
        <Products searchText={searchText} filterOptions={filterOptions} />
      </ScrollView>
    </Layout>
  );
};

export default SearchResults;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    minHeight: "100%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    paddingHorizontal: 15,
    color: "#333",
  },
});
