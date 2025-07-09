import {
  Image,
  ScrollView, // Changed from View to ScrollView
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import Layout from "../../components/Layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { uploadProfilePic } from "../../redux/features/auth/userActions";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const UploadProfilePic = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  // State
  const [image, setImage] = useState(user?.profilePic?.url || null);
  const [loading, setLoading] = useState(false);

  // Request permission and pick an image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  // Upload the image to the server
  const handleUpload = async () => {
    if (!image) {
      Alert.alert("Please select an image first.");
      return;
    }
    setLoading(true);
    const uriParts = image.split(".");
    const fileType = uriParts[uriParts.length - 1];
    const formData = new FormData();
    formData.append("file", {
      uri: image,
      name: `profile.${fileType}`,
      type: `image/${fileType}`,
    });

    try {
      await dispatch(uploadProfilePic(formData)).unwrap();
      Alert.alert("Success", "Profile picture uploaded successfully!");
      navigation.navigate("account");
    } catch (error) {
      Alert.alert("Upload Failed", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Use ScrollView to prevent content from overlapping the header */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>Update Profile Picture</Text>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <Icon
              name="account-circle"
              size={150}
              color="#E0E0E0"
              style={styles.avatar}
            />
          )}
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={pickImage}
          >
            <Icon name="camera-plus" size={25} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={styles.btnUpdate}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Icon name="upload" size={22} color="#ffffff" />
              <Text style={styles.btnUpdateText}>Upload Picture</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity onPress={() => navigation.navigate("account")}>
          <Text style={styles.skipText}>Skip For Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    // Use flexGrow to allow the container to expand and center content correctly
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20, // Added vertical padding
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 40,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
    backgroundColor: "#ffffff",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007BFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    elevation: 5,
  },
  btnUpdate: {
    backgroundColor: "#007BFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: 50,
    borderRadius: 25,
    marginVertical: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnUpdateText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  skipText: {
    marginTop: 20,
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default UploadProfilePic;
