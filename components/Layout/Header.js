import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
const Header = () => {
  const [searchText, setSearchText] = useState("");
  //Function for search
  const handleSearch = () => {
    // Implement search functionality here
    console.log("Searched Value", searchText);
    setSearchText(""); // Clear the search input after searching
  };
  return (
    <View
      style={{
        height: 90,
        backgroundColor: "lightgrey",
      }}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.inputBox}
          value={searchText}
          onChange={(text) => setSearchText(text)}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <FontAwesome name="search" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  inputBox: {
    borderWidth: 0.3,
    width: "100%",
    position: "abosolute",
    height: 40,
    color: "#000000",
    backgroundColor: "#ffffff",
    paddingleft: 10,
    fontSize: 16,
    borderRadius: 5,
  },
  searchBtn: {
    position: "absolute",
    left: "95%",
  },
  icon: {
    color: "#000000",
    fontSize: 18,
  },
});

export default Header;
