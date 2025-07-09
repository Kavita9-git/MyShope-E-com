import { StyleSheet, Text, TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // <-- IMPORTANT: Import Icon here
import React from "react";

const InputBox = ({
  icon,
  value,
  setValue,
  autoComplete = "on",
  placeholder,
  secureTextEntry,
}) => {
  return (
    <View style={styles.inputContainer}>
      {icon && (
        <Icon name={icon} size={20} color="#888" style={styles.inputIcon} />
      )}
      <TextInput
        style={styles.input}
        autoComplete={autoComplete}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={(text) => setValue(text)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    // This is the key: flexDirection 'row' arranges children horizontally
    flexDirection: "row",
    alignItems: "center", // Vertically centers items within the row
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15, // Padding inside the container
    marginVertical: 10, // Margin between different input boxes
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5 /* For Android shadow */,
  },
  inputIcon: {
    marginRight: 10, // Adds space between the icon and the text input
  },
  input: {
    flex: 1, // Allows the TextInput to take up remaining space
    height: 50, // Ensures a consistent height for the input field
    fontSize: 16,
    color: "#333",
    paddingVertical: 0, // Remove default vertical padding that can affect alignment
  },
});
export default InputBox;
