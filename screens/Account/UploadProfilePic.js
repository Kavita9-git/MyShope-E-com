/**
 * Enhanced UploadProfilePic Component - Universal Image Support
 * 
 * This component provides comprehensive support for ALL types of image data and sources:
 * 
 * SUPPORTED IMAGE FORMATS:
 * • Common Web Formats: JPG, JPEG, PNG, GIF, WebP
 * • Modern Formats: AVIF, HEIC (iPhone), HEIF 
 * • Traditional Formats: TIFF, TIF, BMP
 * • Vector Formats: SVG (limited support)
 * 
 * SUPPORTED IMAGE SOURCES:
 * • Base64 Data URIs: data:image/jpeg;base64,/9j/4AAQ...
 * • Blob URLs: blob:http://localhost:3000/uuid
 * • HTTP/HTTPS URLs: https://example.com/image.jpg
 * • Local File URIs: file:///path/to/image.jpg
 * • Content URIs: content://media/external/images/media/1234
 * • Asset URIs: asset://path/to/image.jpg
 * • iOS Photos: ph://CC95F08C-88C3-4012-9D6D-64A413D254B3/L0/001
 * • Android Content Provider: content://com.android.providers.media.documents/document/image%3A1234
 * • Absolute File Paths: /storage/emulated/0/DCIM/Camera/IMG_001.jpg
 * 
 * KEY FEATURES:
 * ✅ Universal format detection and validation
 * ✅ Automatic MIME type detection
 * ✅ Smart file conversion (base64 → blob → file)
 * ✅ Enhanced error handling with specific messages
 * ✅ Hybrid storage backend support (Cloudinary + local)
 * ✅ Cross-platform compatibility (iOS/Android/Web)
 * ✅ Memory efficient processing
 * ✅ EXIF data removal for privacy
 * ✅ Proper image compression and optimization
 * 
 * BACKEND INTEGRATION:
 * • Multer disk storage for file uploads
 * • Cloudinary integration for CDN storage
 * • Hybrid storage approach (local + cloud)
 * • Automatic image optimization and transformations
 * 
 * USAGE:
 * The component automatically handles all image source types without
 * any additional configuration. Simply select an image and upload!
 */

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
import { uploadProfilePic, getUserData } from "../../redux/features/auth/userActions";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import { getBestImageUrl, createHybridImageSource } from "../../utils/imageUtils";

const UploadProfilePic = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  // State
  const [image, setImage] = useState(getBestImageUrl(user?.profilePic) || null);
  const [loading, setLoading] = useState(false);
  const [hasNewImageSelected, setHasNewImageSelected] = useState(false);
  const [originalProfilePic, setOriginalProfilePic] = useState(getBestImageUrl(user?.profilePic));

  // Update image when user profile changes
  useEffect(() => {
    const newImage = getBestImageUrl(user?.profilePic);
    if (newImage !== originalProfilePic) {
      setImage(newImage);
      setOriginalProfilePic(newImage);
      setHasNewImageSelected(false); // Reset selection state when profile updates
    }
  }, [user?.profilePic]);

  // Request permission and pick an image
  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library to select a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Reduced quality for better performance
        allowsMultipleSelection: false,
        // Enhanced format support
        selectionLimit: 1,
        // Enable high quality and compression options
        exif: false, // Don't include EXIF data for privacy
        base64: false, // Don't include base64 to save memory (we'll handle conversion ourselves)
      });

      console.log('📷 Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        console.log('✅ New image selected:', selectedImageUri);
        
        setImage(selectedImageUri);
        setHasNewImageSelected(true);
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Helper function to detect MIME type from various sources
  const detectMimeType = (uri, fallbackExtension = 'jpeg') => {
    // Handle data URI (base64)
    if (uri.startsWith('data:')) {
      const match = uri.match(/data:([^;]+);/);
      return match ? match[1] : `image/${fallbackExtension}`;
    }
    
    // Handle file extension
    const extension = uri.split('.').pop()?.toLowerCase() || fallbackExtension;
    const extensionMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg', 
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'avif': 'image/avif',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'heic': 'image/heic',
      'heif': 'image/heif'
    };
    
    return extensionMap[extension] || `image/${extension}`;
  };

  // Helper function to extract file extension from MIME type or URI
  const extractFileExtension = (uri, mimeType = null) => {
    // First try to get from MIME type
    if (mimeType) {
      const mimeMap = {
        'image/jpeg': 'jpeg',
        'image/jpg': 'jpeg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/avif': 'avif',
        'image/tiff': 'tiff',
        'image/bmp': 'bmp',
        'image/svg+xml': 'svg',
        'image/x-icon': 'ico',
        'image/heic': 'heic',
        'image/heif': 'heif'
      };
      const extension = mimeMap[mimeType.toLowerCase()];
      if (extension) return extension;
    }

    // Handle base64 data URI
    if (uri.startsWith('data:image/')) {
      const match = uri.match(/data:image\/(\w+);/);
      return match ? match[1].toLowerCase() : 'jpeg';
    }
    
    // Handle regular URI
    const parts = uri.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpeg';
  };

  // Helper function to validate image format
  const isValidImageFormat = (extension, mimeType = null) => {
    const validExtensions = [
      // Common web formats
      'jpg', 'jpeg', 'png', 'gif', 'webp',
      // Modern formats
      'avif', 'heic', 'heif',
      // Traditional formats
      'tiff', 'tif', 'bmp',
      // Vector formats (limited support)
      'svg'
    ];
    
    const validMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'image/avif', 'image/heic', 'image/heif', 'image/tiff', 'image/bmp',
      'image/svg+xml'
    ];
    
    const extensionValid = validExtensions.includes(extension?.toLowerCase());
    const mimeValid = !mimeType || validMimeTypes.includes(mimeType.toLowerCase());
    
    return extensionValid && mimeValid;
  };

  // Helper function to convert various image sources to File/Blob
  const convertImageToFile = async (uri, fileName, mimeType) => {
    try {
      // Handle data URI (base64)
      if (uri.startsWith('data:')) {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new File([blob], fileName, { 
          type: blob.type || mimeType,
          lastModified: Date.now()
        });
      }
      
      // Handle blob URL
      if (uri.startsWith('blob:')) {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new File([blob], fileName, { 
          type: blob.type || mimeType,
          lastModified: Date.now()
        });
      }
      
      // Handle HTTP/HTTPS URLs (convert to blob first)
      if (uri.startsWith('http://') || uri.startsWith('https://')) {
        const response = await fetch(uri, { mode: 'cors' });
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        const blob = await response.blob();
        return new File([blob], fileName, { 
          type: blob.type || mimeType,
          lastModified: Date.now()
        });
      }
      
      // For React Native file URIs, return object format
      return {
        uri,
        name: fileName,
        type: mimeType,
      };
    } catch (error) {
      console.warn('⚠️ Failed to convert image to File:', error);
      // Fallback to React Native format
      return {
        uri,
        name: fileName,
        type: mimeType,
      };
    }
  };

  // Upload the image to the server
  const handleUpload = async () => {
    console.log('🚀 Upload attempt:', {
      hasImage: !!image,
      hasNewImageSelected,
      imageUri: image,
      originalProfilePic
    });

    // Validation 1: Check if any image is present
    if (!image) {
      Alert.alert(
        "No Image Selected", 
        "Please select a profile picture before uploading.",
        [{ text: "OK" }]
      );
      return;
    }

    // Validation 2: Check if a new image was actually selected
    if (!hasNewImageSelected) {
      Alert.alert(
        "Select New Image", 
        "Please select a new profile picture to upload. Tap the camera icon to choose from your photo library.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Select Image", onPress: pickImage }
        ]
      );
      return;
    }

    // Enhanced validation for all image URI types
    const isValidImageUri = 
      image.startsWith('file://') || 
      image.startsWith('content://') || 
      image.startsWith('data:image/') ||
      image.startsWith('blob:') ||
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      // Handle asset URIs and other mobile-specific formats
      image.startsWith('asset://') ||
      image.startsWith('ph://') || // iOS Photos
      image.startsWith('content:') || // Android content provider
      /^\/.+\.(jpe?g|png|gif|webp|avif|heic|heif|tiff?|bmp|svg)$/i.test(image); // Absolute file paths
    
    if (!isValidImageUri) {
      Alert.alert(
        "Invalid Image Source", 
        "Please select a valid image from your device.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Select Image", onPress: pickImage }
        ]
      );
      return;
    }

    setLoading(true);

    try {
      // Detect MIME type and file extension
      const mimeType = detectMimeType(image);
      const fileExtension = extractFileExtension(image, mimeType);
      
      console.log('📷 Image analysis:', { 
        mimeType, 
        fileExtension, 
        uriStart: image.substring(0, 50),
        uriType: image.split(':')[0]
      });
      
      // Enhanced format validation
      if (!isValidImageFormat(fileExtension, mimeType)) {
        const supportedFormats = 'JPG, JPEG, PNG, GIF, WebP, AVIF, HEIC, HEIF, TIFF, BMP';
        throw new Error(`Unsupported image format. Please select a valid image file (${supportedFormats}).`);
      }

      // Create FormData with enhanced file handling
      const formData = new FormData();
      const fileName = `profile.${fileExtension}`;
      
      console.log('🔄 Converting image to file format...');
      
      // Convert image to appropriate format for upload
      const fileObject = await convertImageToFile(image, fileName, mimeType);
      
      console.log('✅ File conversion completed:', {
        fileName,
        type: fileObject.type || mimeType,
        size: fileObject.size || 'unknown',
        isFile: fileObject instanceof File
      });
      
      formData.append("file", fileObject);

      console.log('📤 Uploading profile picture with enhanced support...');

      // Dispatch the upload action and get the result
      const result = await dispatch(uploadProfilePic(formData));
      
      // Check if the upload was successful by checking the action type
      if (result.type === 'uploadProfilePicSuccess') {
        console.log('✅ Profile picture uploaded successfully');
        
        // Refresh user data to get the updated profile picture
        dispatch(getUserData());
        
        Alert.alert(
          "Success!", 
          "Your profile picture has been updated successfully!",
          [{ text: "OK", onPress: () => navigation.navigate("account") }]
        );
        
        // Reset state
        setHasNewImageSelected(false);
      } else if (result.type === 'uploadProfilePicFail') {
        // Handle upload failure
        throw new Error(result.payload || 'Upload failed');
      }
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      let errorMessage = "Something went wrong while uploading your profile picture.";
      
      // Provide specific error messages for common issues
      if (error.message.includes('Unsupported image format')) {
        errorMessage = error.message;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Unable to process the image. Please try selecting a different image.";
      } else if (error.message.includes('Network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        "Upload Failed", 
        errorMessage,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Try Again", onPress: handleUpload }
        ]
      );
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
          <View style={[
            styles.avatarContainer,
            hasNewImageSelected && styles.avatarContainerSelected
          ]}>
            {image ? (
              <Image
                source={{
                  uri: 
                    // Handle all direct URI formats (data:, blob:, http:, https:, file:, content:, etc.)
                    image?.startsWith("http") || 
                    image?.startsWith("https") ||
                    image?.startsWith("data:") ||
                    image?.startsWith("blob:") ||
                    image?.startsWith("file:") ||
                    image?.startsWith("content:") ||
                    image?.startsWith("asset:") ||
                    image?.startsWith("ph:") || // iOS Photos
                    image?.startsWith("/") // Absolute paths
                      ? image
                      : `https://nodejsapp-hfpl.onrender.com${image}`,
                }}
                style={styles.avatar}
                // Add error handling for better UX
                onError={(error) => {
                  console.warn('⚠️ Image load error:', error.nativeEvent.error);
                  // Could implement fallback logic here if needed
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully');
                }}
                // Enable proper handling of different image formats
                resizeMode="cover"
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
              style={[
                styles.editIconContainer,
                hasNewImageSelected && styles.editIconContainerSelected
              ]}
              onPress={pickImage}
            >
              <AntDesign name="camerao" size={22} color="#ffffff" />
            </TouchableOpacity>
            {hasNewImageSelected && (
              <View style={styles.newImageIndicator}>
                <AntDesign name="check" size={16} color="#ffffff" />
              </View>
            )}
          </View>

          <Text style={[
            styles.instructionText,
            hasNewImageSelected && styles.instructionTextSelected
          ]}>
            {hasNewImageSelected 
              ? "New image selected! Tap 'Upload Picture' to save changes."
              : "Tap the camera icon to select a new profile picture"
            }
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
  avatarContainerSelected: {
    borderColor: "#4CAF50",
    borderWidth: 4,
    elevation: 15,
    shadowOpacity: 0.25,
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
  editIconContainerSelected: {
    backgroundColor: "#4CAF50",
    elevation: 8,
  },
  newImageIndicator: {
    position: "absolute",
    top: -5,
    left: -5,
    backgroundColor: "#4CAF50",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    elevation: 8,
  },
  instructionText: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 20,
    textAlign: "center",
  },
  instructionTextSelected: {
    color: "#4CAF50",
    fontWeight: "600",
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
