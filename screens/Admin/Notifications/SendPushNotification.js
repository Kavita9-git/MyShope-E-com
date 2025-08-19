import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout/Layout";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SendPushNotification = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    target: "all", // all, users, admins, segment
    segment: "",
    priority: "normal", // high, normal, low
    sound: true,
    vibrate: true,
    badge: true,
    action: "default", // default, url, screen
    actionValue: "",
    imageUrl: "",
    scheduledTime: null,
    expiresAt: null,
  });

  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Pre-fill form if type is passed from route
  useEffect(() => {
    if (route?.params?.type) {
      fillTemplate(route.params.type);
    }
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const savedTemplates = await AsyncStorage.getItem("notificationTemplates");
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
    } catch (error) {
      console.log("Error loading templates:", error);
    }
  };

  const fillTemplate = (type) => {
    const templates = {
      promotional: {
        title: "🎉 Special Offer Just for You!",
        body: "Don't miss out on our limited-time deals. Shop now and save up to 50%!",
        action: "screen",
        actionValue: "promotions",
      },
      order: {
        title: "📦 Order Update",
        body: "Your order #12345 has been shipped and is on its way!",
        action: "screen",
        actionValue: "orderdetail",
      },
      cart: {
        title: "🛒 Items waiting in your cart",
        body: "Complete your purchase before these items sell out!",
        action: "screen",
        actionValue: "cart",
      },
    };

    if (templates[type]) {
      setFormData(prev => ({ ...prev, ...templates[type] }));
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a notification title");
      return false;
    }
    if (!formData.body.trim()) {
      Alert.alert("Error", "Please enter notification content");
      return false;
    }
    if (formData.action === "url" && !formData.actionValue.trim()) {
      Alert.alert("Error", "Please enter a URL for the action");
      return false;
    }
    if (formData.action === "screen" && !formData.actionValue.trim()) {
      Alert.alert("Error", "Please select a screen for the action");
      return false;
    }
    return true;
  };

  const sendNotification = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call to server
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save to history
      const notificationHistory = await AsyncStorage.getItem("notificationHistory");
      const history = notificationHistory ? JSON.parse(notificationHistory) : [];
      
      const newNotification = {
        id: Date.now().toString(),
        ...formData,
        sentAt: new Date().toISOString(),
        status: "sent",
        deliveredCount: Math.floor(Math.random() * 500) + 100,
        openedCount: Math.floor(Math.random() * 200) + 50,
      };
      
      history.unshift(newNotification);
      await AsyncStorage.setItem("notificationHistory", JSON.stringify(history.slice(0, 100))); // Keep last 100
      
      // Update stats
      const stats = await AsyncStorage.getItem("notificationStats");
      const currentStats = stats ? JSON.parse(stats) : { totalSent: 0, activeCampaigns: 0, openRate: 0, activeUsers: 0 };
      currentStats.totalSent += newNotification.deliveredCount;
      await AsyncStorage.setItem("notificationStats", JSON.stringify(currentStats));

      Alert.alert(
        "Success!",
        `Notification sent successfully to ${newNotification.deliveredCount} users!`,
        [
          { text: "Send Another", onPress: () => resetForm() },
          { text: "View History", onPress: () => navigation.navigate("notificationhistory") },
          { text: "Done", onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      body: "",
      target: "all",
      segment: "",
      priority: "normal",
      sound: true,
      vibrate: true,
      badge: true,
      action: "default",
      actionValue: "",
      imageUrl: "",
      scheduledTime: null,
      expiresAt: null,
    });
  };

  const saveAsTemplate = async () => {
    if (!validateForm()) return;

    Alert.prompt(
      "Save Template",
      "Enter a name for this template:",
      async (templateName) => {
        if (templateName) {
          try {
            const newTemplate = {
              id: Date.now().toString(),
              name: templateName,
              ...formData,
              createdAt: new Date().toISOString(),
            };

            const savedTemplates = await AsyncStorage.getItem("notificationTemplates");
            const templates = savedTemplates ? JSON.parse(savedTemplates) : [];
            templates.push(newTemplate);
            await AsyncStorage.setItem("notificationTemplates", JSON.stringify(templates));
            
            Alert.alert("Success", "Template saved successfully!");
            setTemplates(templates);
          } catch (error) {
            Alert.alert("Error", "Failed to save template");
          }
        }
      }
    );
  };

  const NotificationPreview = () => (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewTitle}>Notification Preview</Text>
        <TouchableOpacity onPress={() => setPreviewVisible(false)}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.phonePreview}>
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <MaterialIcons name="notifications" size={20} color="#667eea" />
            <Text style={styles.appName}>Your App</Text>
            <Text style={styles.timeStamp}>now</Text>
          </View>
          <Text style={styles.previewNotificationTitle}>{formData.title || "Notification Title"}</Text>
          <Text style={styles.previewNotificationBody}>{formData.body || "Notification content will appear here..."}</Text>
          {formData.imageUrl && (
            <View style={styles.previewImage}>
              <Text style={styles.previewImageText}>📷 Image will appear here</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Layout showBackButton={true}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialIcons name="send" size={32} color="#fff" />
              <Text style={styles.headerText}>Send Push Notification</Text>
            </LinearGradient>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(value) => updateFormData("title", value)}
                  placeholder="Enter notification title"
                  maxLength={50}
                />
                <Text style={styles.charCount}>{formData.title.length}/50</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Content *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.body}
                  onChangeText={(value) => updateFormData("body", value)}
                  placeholder="Enter notification content"
                  multiline={true}
                  numberOfLines={4}
                  maxLength={200}
                />
                <Text style={styles.charCount}>{formData.body.length}/200</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Image URL (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.imageUrl}
                  onChangeText={(value) => updateFormData("imageUrl", value)}
                  placeholder="https://example.com/image.jpg"
                />
              </View>
            </View>

            {/* Target Audience */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Target Audience</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.target}
                  onValueChange={(value) => updateFormData("target", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="All Users" value="all" />
                  <Picker.Item label="Regular Users Only" value="users" />
                  <Picker.Item label="Admins Only" value="admins" />
                  <Picker.Item label="User Segment" value="segment" />
                </Picker>
              </View>

              {formData.target === "segment" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Segment Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.segment}
                    onChangeText={(value) => updateFormData("segment", value)}
                    placeholder="e.g., premium-users, cart-abandoners"
                  />
                </View>
              )}
            </View>

            {/* Notification Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Settings</Text>
              
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Priority</Text>
                <Picker
                  selectedValue={formData.priority}
                  onValueChange={(value) => updateFormData("priority", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="High Priority" value="high" />
                  <Picker.Item label="Normal Priority" value="normal" />
                  <Picker.Item label="Low Priority" value="low" />
                </Picker>
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Play Sound</Text>
                  <Switch
                    value={formData.sound}
                    onValueChange={(value) => updateFormData("sound", value)}
                    trackColor={{ false: "#E2E8F0", true: "#667eea" }}
                    thumbColor={formData.sound ? "#fff" : "#f4f3f4"}
                  />
                </View>
                
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Vibrate</Text>
                  <Switch
                    value={formData.vibrate}
                    onValueChange={(value) => updateFormData("vibrate", value)}
                    trackColor={{ false: "#E2E8F0", true: "#667eea" }}
                    thumbColor={formData.vibrate ? "#fff" : "#f4f3f4"}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Show Badge</Text>
                  <Switch
                    value={formData.badge}
                    onValueChange={(value) => updateFormData("badge", value)}
                    trackColor={{ false: "#E2E8F0", true: "#667eea" }}
                    thumbColor={formData.badge ? "#fff" : "#f4f3f4"}
                  />
                </View>
              </View>
            </View>

            {/* Action Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Action on Tap</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.action}
                  onValueChange={(value) => updateFormData("action", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Default (Open App)" value="default" />
                  <Picker.Item label="Open URL" value="url" />
                  <Picker.Item label="Navigate to Screen" value="screen" />
                </Picker>
              </View>

              {formData.action === "url" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>URL</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.actionValue}
                    onChangeText={(value) => updateFormData("actionValue", value)}
                    placeholder="https://example.com"
                  />
                </View>
              )}

              {formData.action === "screen" && (
                <View style={styles.pickerContainer}>
                  <Text style={styles.label}>Screen</Text>
                  <Picker
                    selectedValue={formData.actionValue}
                    onValueChange={(value) => updateFormData("actionValue", value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Screen..." value="" />
                    <Picker.Item label="Home" value="home" />
                    <Picker.Item label="Products" value="products" />
                    <Picker.Item label="Cart" value="cart" />
                    <Picker.Item label="Profile" value="profile" />
                    <Picker.Item label="Order Detail" value="orderdetail" />
                    <Picker.Item label="Promotions" value="promotions" />
                  </Picker>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => setPreviewVisible(true)}
            >
              <Feather name="eye" size={20} color="#667eea" />
              <Text style={styles.previewButtonText}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.templateButton}
              onPress={saveAsTemplate}
            >
              <MaterialIcons name="save" size={20} color="#4ECDC4" />
              <Text style={styles.templateButtonText}>Save Template</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={sendNotification}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ["#ccc", "#ccc"] : ["#667eea", "#764ba2"]}
              style={styles.sendButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialIcons name="send" size={24} color="#fff" />
              )}
              <Text style={styles.sendButtonText}>
                {loading ? "Sending..." : "Send Notification"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Preview Modal */}
          {previewVisible && <NotificationPreview />}
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  formContainer: {
    paddingHorizontal: 15,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#718096",
    textAlign: "right",
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  switchGroup: {
    marginTop: 10,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 14,
    color: "#333",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#667eea",
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },
  previewButtonText: {
    color: "#667eea",
    fontWeight: "600",
    marginLeft: 8,
  },
  templateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4ECDC4",
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  templateButtonText: {
    color: "#4ECDC4",
    fontWeight: "600",
    marginLeft: 8,
  },
  sendButton: {
    marginHorizontal: 15,
    marginBottom: 30,
    borderRadius: 12,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  previewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: "90%",
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  phonePreview: {
    backgroundColor: "#f0f0f0",
    width: "90%",
    padding: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  timeStamp: {
    fontSize: 12,
    color: "#718096",
  },
  previewNotificationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  previewNotificationBody: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  previewImage: {
    marginTop: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    padding: 20,
    alignItems: "center",
  },
  previewImageText: {
    color: "#718096",
    fontSize: 12,
  },
});

export default SendPushNotification;
