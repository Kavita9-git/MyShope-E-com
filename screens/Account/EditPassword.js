import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert, // Import Alert for better user feedback
} from "react-native";
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout"; // Assuming this is your main layout component
import InputBox from "../../components/Form/InputBox"; // Assuming this is a reusable input component
import { useDispatch, useSelector } from "react-redux";
import { updatePassword } from "../../redux/features/auth/userActions"; // Corrected import based on usage
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // For icons

const EditPassword = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user); // Get loading and error states for better UX

  // State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // Added for confirmation

  // Handle Password Update
  const handleUpdate = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (newPassword === oldPassword) {
      Alert.alert(
        "Error",
        "New password cannot be the same as the old password."
      );
      return;
    }

    // Dispatch action
    const formData = {
      oldPassword,
      newPassword,
    };
    dispatch(updatePassword(formData));
  };

  // Handle feedback from redux action
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
    if (!loading && !error && oldPassword && newPassword) {
      // Check if update was successful (and inputs were not empty before dispatch)
      Alert.alert("Success", "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      // Optionally navigate back after success
      // navigation.goBack();
    }
  }, [loading, error]); // Depend on loading and error states

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Icon name="lock-reset" size={60} color="#007AFF" />
            <Text style={styles.headerText}>Update Your Password</Text>
            <Text style={styles.subHeaderText}>
              Enter your current and new password to make changes.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <InputBox
              icon="lock-outline" // Icon for old password
              value={oldPassword}
              setValue={setOldPassword}
              placeholder={"Enter your old password"}
              autoComplete={"password"}
              secureTextEntry={true}
              keyboardType="default"
            />

            <InputBox
              icon="lock" // Icon for new password
              value={newPassword}
              setValue={setNewPassword}
              placeholder={"Enter your new password"}
              autoComplete={"password-new"} // Use password-new for better autofill
              secureTextEntry={true}
              keyboardType="default"
            />

            <InputBox
              icon="lock-check" // Icon for confirm new password
              value={confirmNewPassword}
              setValue={setConfirmNewPassword}
              placeholder={"Confirm your new password"}
              autoComplete={"password-new"}
              secureTextEntry={true}
              keyboardType="default"
            />
          </View>

          <TouchableOpacity
            style={styles.btnUpdate}
            onPress={handleUpdate}
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <Text style={styles.btnUpdateText}>UPDATING...</Text>
            ) : (
              <Text style={styles.btnUpdateText}>UPDATE PASSWORD</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#f2f2f2", // Light background for the screen
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
  },
  subHeaderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "100%",
    marginBottom: 30,
  },
  btnUpdate: {
    backgroundColor: "#007AFF", // A pleasant blue
    height: 50, // Slightly taller button
    borderRadius: 25, // More rounded corners
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000", // Add shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8, // For Android shadow
  },
  btnUpdateText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditPassword;
