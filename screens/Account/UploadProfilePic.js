import {
  Image,
  ScrollView,
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
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";

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
    <Layout showBackButton={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.profileHeader}>
              <View style={styles.iconContainer}>
                <AntDesign name="upload" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Profile Picture</Text>
              <Text style={styles.headerSubtitle}>
                Change your profile image
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.avatarContainer}>
            {image ? (
              <Image
                source={{
                  uri: image?.startsWith("http")
                    ? image
                    : `https://nodejsapp-hfpl.onrender.com${image}`,
                }}
                style={styles.avatar}
              />
            ) : (
              <AntDesign
                name="user"
                size={80}
                color="#E0E0E0"
                style={styles.avatarPlaceholder}
              />
            )}
            <TouchableOpacity
              style={styles.editIconContainer}
              onPress={pickImage}
            >
              <AntDesign name="camerao" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.instructionText}>
            Tap the camera icon to select a new profile picture
          </Text>

          <TouchableOpacity
            onPress={handleUpload}
            disabled={loading}
            style={styles.buttonContainer}
          >
            <LinearGradient
              colors={["#1e3c72", "#2a5298"]}
              style={styles.btnUpdate}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <AntDesign name="upload" size={20} color="#ffffff" />
                  <Text style={styles.btnUpdateText}>Upload Picture</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("account")}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip For Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipHeader}>
            <Feather name="info" size={20} color="#3182ce" />
            <Text style={styles.tipTitle}>Profile Picture Tips</Text>
          </View>
          <Text style={styles.tipText}>• Use a clear, well-lit photo</Text>
          <Text style={styles.tipText}>• Center your face in the frame</Text>
          <Text style={styles.tipText}>• Choose a neutral background</Text>
          <Text style={styles.tipText}>• Avoid using filters</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Profile Management v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    minHeight: "100%",
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    position: "relative",
    backgroundColor: "#ffffff",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  avatarPlaceholder: {
    opacity: 0.5,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#2a5298",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    elevation: 5,
  },
  instructionText: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
  },
  btnUpdate: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    marginVertical: 10,
  },
  btnUpdateText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  skipButton: {
    marginTop: 15,
    padding: 10,
  },
  skipText: {
    color: "#718096",
    fontSize: 16,
    fontWeight: "500",
  },
  tipsCard: {
    marginHorizontal: 15,
    backgroundColor: "#ebf8ff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3182ce",
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 6,
    paddingLeft: 10,
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  footerText: {
    color: "#a0aec0",
    fontSize: 12,
  },
});

export default UploadProfilePic;
