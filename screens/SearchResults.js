import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import Products from "../components/Products/Products";
import SearchFilter from "../components/Search/SearchFilter";
import BackButton from "../components/Layout/BackButton";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../redux/features/auth/productActions";

const SearchResults = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.category);
  
  // Get parameters passed from Home screen
  const { 
    initialSearchText = "", 
    categoryFilter = null,
    categoryName = null 
  } = route.params || {};

  // Local state for search and filters
  const [searchText, setSearchText] = useState(initialSearchText);
  const [filterOptions, setFilterOptions] = useState(null);

  useEffect(() => {
    // Fetch products when component mounts
    dispatch(getAllProducts());
  }, [dispatch]);

  // Set up initial category filter if provided
  useEffect(() => {
    if (categoryFilter && categories && categories.length > 0) {
      // Find the category ID based on category name
      const categoryObj = categories.find(cat => {
        const catName = cat.category || cat.name;
        return catName?.toLowerCase() === categoryFilter.toLowerCase();
      });
      
      if (categoryObj) {
        console.log('Setting up category filter for:', categoryFilter, 'with ID:', categoryObj._id);
        const initialFilter = {
          searchText: initialSearchText,
          priceRange: [0, 50000], // Use a very high upper limit to show all products
          selectedCategories: [categoryObj._id],
          sortOption: 'relevance',
          ratings: 0,
        };
        setFilterOptions(initialFilter);
      }
    }
  }, [categoryFilter, categories, initialSearchText]);

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

      <View style={styles.container}>
        {/* Search Filter Component */}
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          initialSearchText={initialSearchText}
          initialCategoryFilter={categoryFilter}
        />

        {/* Results Section */}
        <Text style={styles.sectionTitle}>
          {categoryName ? `${categoryName} Products` :
           searchText ? `Results for "${searchText}"` : "All Products"}
        </Text>

        {/* Products List */}
        <Products searchText={searchText} filterOptions={filterOptions} />
      </View>
    </Layout>
  );
};

export default SearchResults;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    flex: 1,
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
