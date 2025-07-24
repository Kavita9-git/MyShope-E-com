import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  Alert,
  TextInput,
  BackHandler,
} from "react-native";
import InputBox from "./InputBox";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSavedAddresses,
  logout,
} from "../../redux/features/auth/userActions";
import { useNavigation } from "@react-navigation/native";

const ShippingForm = ({
  name,
  setName,
  address,
  setAddress,
  city,
  setCity,
  country,
  setCountry,
  phone,
  setPhone,
}) => {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentFormComplete, setCurrentFormComplete] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, addressLoading } = useSelector((state) => state.user);
  //   console.log("user shipping form", user);
  // State for editing an address
  const [editName, setEditName] = useState("");
  const [editingAddress, setEditingAddress] = useState(null);
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [showAddressOptions, setShowAddressOptions] = useState(false);

  // Load saved addresses when component mounts
  useEffect(() => {
    loadSavedAddresses();
    loadLastUsedAddress();
  }, []);

  // Check if current form is complete
  useEffect(() => {
    setCurrentFormComplete(name && address && city && country && phone);
  }, [name, address, city, country, phone]);

  // Load saved addresses from AsyncStorage and MongoDB
  const loadSavedAddresses = async () => {
    try {
      // First try to load from AsyncStorage
      const savedAddressesJson = await AsyncStorage.getItem(
        "@savedShippingAddresses"
      );
      let addresses = [];

      if (savedAddressesJson) {
        addresses = JSON.parse(savedAddressesJson);
      }

      // If user is logged in and has saved addresses in MongoDB, merge them
      if (user && user?.savedAddresses && user?.savedAddresses?.length > 0) {
        // Combine addresses from AsyncStorage and MongoDB, removing duplicates by ID
        const combinedAddresses = [...addresses];

        user.savedAddresses.forEach((dbAddress) => {
          // Check if this address from DB already exists in local storage
          const exists = combinedAddresses.some(
            (addr) => addr.id === dbAddress.id
          );
          if (!exists) {
            combinedAddresses.push(dbAddress);
          }
        });

        addresses = combinedAddresses;

        // Update AsyncStorage with combined addresses
        await AsyncStorage.setItem(
          "@savedShippingAddresses",
          JSON.stringify(addresses)
        );
      }

      setSavedAddresses(addresses);
    } catch (error) {
      console.log("Error loading saved addresses:", error);
    }
  };

  // Load last used address and pre-fill form fields
  const loadLastUsedAddress = async () => {
    try {
      const lastUsedAddressJson = await AsyncStorage.getItem(
        "@lastUsedAddress"
      );

      // Only pre-fill if the current fields are empty
      // This ensures we don't override any values the user has already entered
      if (
        lastUsedAddressJson &&
        (!name || !address || !city || !country || !phone)
      ) {
        const lastUsedAddress = JSON.parse(lastUsedAddressJson);
        console.log("Loading last used address:", lastUsedAddress);

        // Only set values if they're not already set by user prop
        if (!name && lastUsedAddress.name) setName(lastUsedAddress.name);
        if (!address && lastUsedAddress.address)
          setAddress(lastUsedAddress.address);
        if (!city && lastUsedAddress.city) setCity(lastUsedAddress.city);
        if (!country && lastUsedAddress.country)
          setCountry(lastUsedAddress.country);
        if (!phone && lastUsedAddress.phone) setPhone(lastUsedAddress.phone);
      }
    } catch (error) {
      console.log("Error loading last used address:", error);
    }
  };

  // Store the last used address
  const saveLastUsedAddress = async () => {
    try {
      // Only save if we have complete address info
      if (name && address && city && country && phone) {
        const currentAddress = { name, address, city, country, phone };
        await AsyncStorage.setItem(
          "@lastUsedAddress",
          JSON.stringify(currentAddress)
        );
        console.log("Saved last used address:", currentAddress);
      }
    } catch (error) {
      console.log("Error saving last used address:", error);
    }
  };

  // Show notification
  const showSuccessNotification = (message = "Address saved successfully!") => {
    setShowNotification(true);
    setNotificationMessage(message);

    // Animate notification entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide notification after 2 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowNotification(false);
      });
    }, 2000);
  };

  const [notificationMessage, setNotificationMessage] = useState(
    "Address saved successfully!"
  );

  // Save current address to AsyncStorage and MongoDB
  const saveCurrentAddress = async () => {
    if (!name || !address || !city || !country || !phone) return;

    try {
      const newAddress = {
        id: Date.now().toString(),
        name,
        address,
        city,
        country,
        phone,
        label: `${address.substring(0, 15)}... (${city})`,
      };

      const updatedAddresses = [...savedAddresses, newAddress];

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        "@savedShippingAddresses",
        JSON.stringify(updatedAddresses)
      );

      // Also save as last used address
      await saveLastUsedAddress();

      setSavedAddresses(updatedAddresses);

      // If user is logged in, also save to MongoDB
      if (user && user._id) {
        dispatch(updateSavedAddresses(updatedAddresses));
        showSuccessNotification("Address saved locally and to your account");
      } else {
        // User is not logged in - ask if they want to login
        showSuccessNotification("Address saved locally");

        // Ask user if they want to save to their account
        setTimeout(() => {
          Alert.alert(
            "Save to Your Account",
            "Would you like to save this address to your account for future use on any device?",
            [
              {
                text: "No, Thanks",
                style: "cancel",
              },
              {
                text: "Login/Register",
                onPress: () => {
                  // Store the current address temporarily
                  AsyncStorage.setItem(
                    "@pendingAddress",
                    JSON.stringify(newAddress)
                  ).then(() => {
                    console.log("pending address", newAddress);

                    // DIRECT APPROACH:
                    // Instead of trying to navigate, we'll force the app to restart and show login

                    // First save the pending address and set the showLogin flag
                    AsyncStorage.setItem("@showLogin", "true").then(() => {
                      // Show a message to the user
                      showSuccessNotification("Redirecting to login...");

                      // Wait a moment to show the notification
                      setTimeout(() => {
                        // Use a more direct approach that doesn't trigger React scheduling issues
                        AsyncStorage.removeItem("@auth").then(() => {
                          // Dispatch in the next tick to avoid React scheduling conflicts
                          setTimeout(() => {
                            dispatch(logout());
                          }, 0);
                        });
                      }, 1000);
                    });
                  });
                },
              },
            ]
          );
        }, 2500); // Show after the success notification starts to fade
      }
    } catch (error) {
      console.log("Error saving address:", error);
      showSuccessNotification("Error saving address. Please try again.");
    }
  };

  // Use a saved address
  const useSavedAddress = (item) => {
    setName(item.name);
    setAddress(item.address);
    setCity(item.city);
    setCountry(item.country);
    setPhone(item.phone);

    // Save this as the last used address
    const lastUsedAddress = {
      name: item.name,
      address: item.address,
      city: item.city,
      country: item.country,
      phone: item.phone,
    };
    AsyncStorage.setItem("@lastUsedAddress", JSON.stringify(lastUsedAddress));

    setShowAddressModal(false);
  };

  // Delete a saved address from AsyncStorage and MongoDB
  const deleteAddress = async (id) => {
    try {
      const updatedAddresses = savedAddresses.filter((addr) => addr.id !== id);

      // Update AsyncStorage
      await AsyncStorage.setItem(
        "@savedShippingAddresses",
        JSON.stringify(updatedAddresses)
      );
      setSavedAddresses(updatedAddresses);

      // If user is logged in, also update MongoDB
      if (user && user._id) {
        dispatch(updateSavedAddresses(updatedAddresses));
      }
    } catch (error) {
      console.log("Error deleting address:", error);
    }
  };

  // Edit an address
  const editAddressItem = (item) => {
    setEditingAddress(item);
    setEditName(item.name);
    setEditAddress(item.address);
    setEditCity(item.city);
    setEditCountry(item.country);
    setEditPhone(item.phone);
    setShowEditModal(true);
  };

  // Save edited address
  const saveEditedAddress = async () => {
    if (!editName || !editAddress || !editCity || !editCountry || !editPhone) {
      Alert.alert("Required", "Please fill all address fields");
      return;
    }

    try {
      const updatedAddress = {
        ...editingAddress,
        name: editName,
        address: editAddress,
        city: editCity,
        country: editCountry,
        phone: editPhone,
        label: `${editAddress.substring(0, 15)}... (${editCity})`,
      };

      const updatedAddresses = savedAddresses.map((addr) =>
        addr.id === editingAddress.id ? updatedAddress : addr
      );

      // Update AsyncStorage
      await AsyncStorage.setItem(
        "@savedShippingAddresses",
        JSON.stringify(updatedAddresses)
      );
      setSavedAddresses(updatedAddresses);

      // If user is logged in, also update MongoDB
      if (user && user._id) {
        dispatch(updateSavedAddresses(updatedAddresses));
      }

      setShowEditModal(false);
      showSuccessNotification("Address updated successfully");
    } catch (error) {
      console.log("Error updating address:", error);
      showSuccessNotification("Error updating address. Please try again.");
    }
  };

  // Create new address
  const createNewAddress = () => {
    // Clear current form fields
    setName("");
    setAddress("");
    setCity("");
    setCountry("");
    setPhone("");
    showSuccessNotification("Ready to add new address");
    setShowAddressModal(false);
  };

  // Toggle address options
  const toggleAddressOptions = () => {
    setShowAddressOptions(!showAddressOptions);
  };

  // Render a saved address item
  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={styles.savedAddressItem}
      onPress={() => useSavedAddress(item)}
    >
      <View style={styles.addressInfo}>
        <Text style={styles.addressLabel}>{item.name}</Text>
        <Text style={styles.addressLabel}>{item.label}</Text>
        <Text style={styles.addressDetail}>{item.address}</Text>
        <Text style={styles.addressDetail}>
          {item.city}, {item.country}
        </Text>
        <Text style={styles.addressDetail}>{item.phone}</Text>
      </View>
      <View style={styles.addressActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editAddressItem(item)}
        >
          <Icon name="pencil-outline" size={20} color="#1e3c72" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteAddress(item?.id)}
        >
          <Icon name="delete-outline" size={20} color="#FF5A5F" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.formContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          <Icon name="truck-delivery" size={18} color="#1e3c72" /> Shipping
          Details
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.addressOptionsButton}
            onPress={toggleAddressOptions}
          >
            <Icon name="dots-horizontal" size={20} color="#1e3c72" />
          </TouchableOpacity>

          {showAddressOptions && (
            <View style={styles.addressOptionsDropdown}>
              {savedAddresses.length > 0 && (
                <TouchableOpacity
                  style={styles.addressOptionItem}
                  onPress={() => {
                    setShowAddressModal(true);
                    setShowAddressOptions(false);
                  }}
                >
                  <Icon name="format-list-bulleted" size={16} color="#1e3c72" />
                  <Text style={styles.addressOptionText}>Saved Addresses</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.addressOptionItem}
                onPress={() => {
                  createNewAddress();
                  setShowAddressOptions(false);
                }}
              >
                <Icon name="plus" size={16} color="#1e3c72" />
                <Text style={styles.addressOptionText}>New Address</Text>
              </TouchableOpacity>
              {currentFormComplete && (
                <TouchableOpacity
                  style={styles.addressOptionItem}
                  onPress={() => {
                    saveCurrentAddress();
                    setShowAddressOptions(false);
                  }}
                >
                  <Icon name="content-save-outline" size={16} color="#1e3c72" />
                  <Text style={styles.addressOptionText}>Save Current</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {savedAddresses.length > 0 && (
            <TouchableOpacity
              style={styles.addressButton}
              onPress={() => setShowAddressModal(true)}
            >
              <Icon name="format-list-bulleted" size={18} color="#1e3c72" />
              <Text style={styles.buttonText}>Saved</Text>
            </TouchableOpacity>
          )}

          {currentFormComplete && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveCurrentAddress}
            >
              <Icon name="content-save-outline" size={18} color="#1e3c72" />
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <InputBox
        placeholder="Full Name"
        value={name}
        setValue={setName}
        icon="account"
        autoComplete="name"
      />

      <InputBox
        placeholder="Street Address"
        value={address}
        setValue={setAddress}
        icon="map-marker"
        autoComplete="street-address"
      />

      <InputBox
        placeholder="City"
        value={city}
        setValue={setCity}
        icon="city"
        autoComplete="address-level2"
      />

      <InputBox
        placeholder="Country"
        value={country}
        setValue={setCountry}
        icon="earth"
        autoComplete="country"
      />

      <InputBox
        placeholder="Phone Number"
        value={phone}
        setValue={setPhone}
        icon="phone"
        autoComplete="tel"
        keyboardType="phone-pad"
      />

      {/* Saved Addresses Modal */}
      <Modal
        visible={showAddressModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saved Addresses</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddressModal(false)}
              >
                <Icon name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={savedAddresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.addressList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No saved addresses</Text>
              }
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.newAddressButton}
                onPress={() => {
                  createNewAddress();
                  setShowAddressModal(false);
                }}
              >
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="plus" size={18} color="#fff" />
                  <Text style={styles.buttonTextWhite}>New Address</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowAddressModal(false)}
              >
                <LinearGradient
                  colors={["#1e3c72", "#2a5298"]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Address</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEditModal(false)}
              >
                <Icon name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <InputBox
                placeholder="Full Name"
                value={editName}
                setValue={setEditName}
                icon="account"
                autoComplete="name"
              />

              <InputBox
                placeholder="Street Address"
                value={editAddress}
                setValue={setEditAddress}
                icon="map-marker"
                autoComplete="street-address"
              />

              <InputBox
                placeholder="City"
                value={editCity}
                setValue={setEditCity}
                icon="city"
                autoComplete="address-level2"
              />

              <InputBox
                placeholder="Country"
                value={editCountry}
                setValue={setEditCountry}
                icon="earth"
                autoComplete="country"
              />

              <InputBox
                placeholder="Phone Number"
                value={editPhone}
                setValue={setEditPhone}
                icon="phone"
                autoComplete="tel"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.saveEditButton}
              onPress={saveEditedAddress}
            >
              <LinearGradient
                colors={["#1e3c72", "#2a5298"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="content-save" size={20} color="#fff" />
                <Text style={styles.saveEditButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notification */}
      {showNotification && (
        <Animated.View style={[styles.notification, { opacity: fadeAnim }]}>
          <Text style={styles.notificationText}>{notificationMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    alignItems: "center",
    flexDirection: "row",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 12,
    color: "#1e3c72",
    fontWeight: "500",
    marginLeft: 4,
  },
  buttonTextWhite: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  addressList: {
    paddingVertical: 10,
  },
  savedAddressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  addressDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  addressActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 20,
  },
  closeModalButton: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginLeft: 10,
  },
  gradientButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  notification: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 1000,
  },
  notificationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  editForm: {
    marginBottom: 15,
  },
  saveEditButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  saveEditButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: "row",
    marginTop: 15,
  },
  newAddressButton: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 10,
  },
  addressOptionsButton: {
    padding: 8,
    marginRight: 8,
  },
  addressOptionsDropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    width: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  addressOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  addressOptionText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
});

export default ShippingForm;
