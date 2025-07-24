import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Slider from "@react-native-community/slider";
import { useDispatch, useSelector } from "react-redux";

const { width } = Dimensions.get("window");

const SearchFilter = ({ onSearch, onFilter, initialSearchText = "" }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const { products } = useSelector((state) => state.product);

  // State variables
  const [searchText, setSearchText] = useState(initialSearchText);
  const [showFilters, setShowFilters] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("relevance"); // relevance, price_asc, price_desc, newest
  const [ratings, setRatings] = useState(0);

  // Animation for filter panel
  const filterHeight = new Animated.Value(0);

  // Find min and max product prices
  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map((p) => p.price);
      const maxPrice = Math.ceil(Math.max(...prices));
      const minPrice = Math.floor(Math.min(...prices));
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products]);

  // Set initial search text from prop
  useEffect(() => {
    if (initialSearchText) {
      setSearchText(initialSearchText);
      if (onSearch) {
        onSearch(initialSearchText);
      }
    }
  }, [initialSearchText]);

  // Handle search input change
  const handleSearchChange = (text) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  // Toggle filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    Animated.timing(filterHeight, {
      toValue: showFilters ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Apply filters
  const applyFilters = () => {
    setFilterModalVisible(false);
    if (onFilter) {
      onFilter({
        searchText,
        priceRange,
        selectedCategories,
        sortOption,
        ratings,
      });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSortOption("relevance");
    setRatings(0);
    if (products && products.length > 0) {
      const prices = products.map((p) => p.price);
      setPriceRange([
        Math.floor(Math.min(...prices)),
        Math.ceil(Math.max(...prices)),
      ]);
    } else {
      setPriceRange([0, 1000]);
    }
  };

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchText}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999"
          />
          {searchText !== "" && (
            <TouchableOpacity onPress={() => handleSearchChange("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color="#999"
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterScrollView}>
              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceText}>
                    ${priceRange[0]} - ${priceRange[1]}
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={2000}
                  value={priceRange[1]}
                  minimumTrackTintColor="#1e3c72"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#2a5298"
                  onValueChange={(value) =>
                    setPriceRange([priceRange[0], Math.round(value)])
                  }
                />
              </View>

              {/* Categories Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Categories</Text>
                <View style={styles.categoriesContainer}>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <TouchableOpacity
                        key={category._id}
                        style={[
                          styles.categoryChip,
                          selectedCategories.includes(category._id) &&
                            styles.selectedCategoryChip,
                        ]}
                        onPress={() => toggleCategory(category._id)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selectedCategories.includes(category._id) &&
                              styles.selectedCategoryChipText,
                          ]}
                        >
                          {category.category}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>
                      No categories available
                    </Text>
                  )}
                </View>
              </View>

              {/* Sort By */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortOption === "relevance" && styles.selectedSortOption,
                  ]}
                  onPress={() => setSortOption("relevance")}
                >
                  <Text style={styles.sortOptionText}>Relevance</Text>
                  {sortOption === "relevance" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#1e3c72"
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortOption === "price_asc" && styles.selectedSortOption,
                  ]}
                  onPress={() => setSortOption("price_asc")}
                >
                  <Text style={styles.sortOptionText}>Price: Low to High</Text>
                  {sortOption === "price_asc" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#1e3c72"
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortOption === "price_desc" && styles.selectedSortOption,
                  ]}
                  onPress={() => setSortOption("price_desc")}
                >
                  <Text style={styles.sortOptionText}>Price: High to Low</Text>
                  {sortOption === "price_desc" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#1e3c72"
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortOption === "newest" && styles.selectedSortOption,
                  ]}
                  onPress={() => setSortOption("newest")}
                >
                  <Text style={styles.sortOptionText}>Newest First</Text>
                  {sortOption === "newest" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#1e3c72"
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* Ratings Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
                <View style={styles.ratingsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRatings(star)}
                    >
                      <FontAwesome
                        name={star <= ratings ? "star" : "star-o"}
                        size={30}
                        color={star <= ratings ? "#FFD700" : "#d3d3d3"}
                        style={styles.starIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearIcon: {
    marginLeft: 5,
  },
  filterButton: {
    backgroundColor: "#1e3c72",
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  filterScrollView: {
    maxHeight: 500,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  priceInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  priceText: {
    fontSize: 16,
    color: "#1e3c72",
    fontWeight: "bold",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryChip: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategoryChip: {
    backgroundColor: "#1e3c72",
  },
  categoryChipText: {
    color: "#333",
  },
  selectedCategoryChipText: {
    color: "#fff",
  },
  noDataText: {
    color: "#999",
    fontStyle: "italic",
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedSortOption: {
    backgroundColor: "rgba(30, 60, 114, 0.05)",
  },
  sortOptionText: {
    fontSize: 16,
    color: "#333",
  },
  ratingsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  starIcon: {
    marginHorizontal: 5,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  resetButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e3c72",
    width: "45%",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#1e3c72",
    fontSize: 16,
    fontWeight: "bold",
  },
  applyButton: {
    backgroundColor: "#1e3c72",
    padding: 15,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SearchFilter;
