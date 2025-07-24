import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView, // Added for scrollability
  ActivityIndicator, // For loading spinner
  Alert, // For better user feedback
} from "react-native";
import React, { useState, useEffect } from "react"; // Import useEffect
import InputBox from "../../components/Form/InputBox"; // Your custom InputBox component
import { useDispatch, useSelector } from "react-redux"; // Import useSelector
import { register } from "../../redux/features/auth/userActions";
// Assuming useReduxStateHook is for navigation/state management related to navigation
// We'll directly use useSelector for loading/error/message from the user slice for clarity
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // For icons
import AsyncStorage from "@react-native-async-storage/async-storage";

const Register = ({ navigation }) => {
  const dispatch = useDispatch();
  // Get loading, error, and message from Redux for better UX
  const { loading, error, message, isAuth } = useSelector(
    (state) => state.user
  );

  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Added for confirmation
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [answer, setAnswer] = useState(""); // Security question answer
  const [country, setCountry] = useState("India"); // Default country

  // The base64 image string (ensure it's valid and not too large for performance)
  const registerImage =
    "data:image/jpeg;base64,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";

  // Handle Register Function
  const handleRegister = () => {
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword || // Check confirm password
      !phone ||
      !address ||
      !city ||
      !answer
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const formData = {
      name,
      email,
      password,
      phone,
      address,
      city,
      answer,
      country, // Include country in formData
    };
    dispatch(register(formData));
  };

  // Life cycle for Redux state changes
  useEffect(() => {
    if (error) {
      Alert.alert("Registration Error", error);
      // Optional: dispatch({ type: "clearError" }); if your reducer has it
    }

    if (message) {
      Alert.alert("Registration Success", message);
      // Optional: dispatch({ type: "clearMessage" });
    }

    if (isAuth) {
      // If registration is successful and user is authenticated, navigate to login
      // Instead of direct navigation which causes errors, we'll use the same approach as in customHook.js
      // This will trigger Main.js to show the AuthStack with login screen
      AsyncStorage.removeItem("@auth").then(() => {
        // Use setTimeout to avoid React scheduling conflicts
        setTimeout(() => {
          dispatch({ type: "logoutSuccess" });
        }, 0);
      });
    }
  }, [error, message, isAuth, dispatch, navigation]); // Added navigation to dependencies

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            {/* <Image source={{ uri: registerImage }} style={styles.image} /> */}

            {/* BIG ICON ADDED HERE  */}
            <Icon
              name="account-plus"
              size={80}
              color="#28a745"
              style={styles.icon}
            />

            <Text style={styles.headerText}>Create Your Account</Text>
            <Text style={styles.subHeaderText}>
              Join us and start exploring!
            </Text>
          </View>

          <View style={styles.formContainer}>
            <InputBox
              icon="account" // Icon for name
              placeholder="Enter Name"
              value={name}
              setValue={setName}
              autoComplete={"name"}
            />
            <InputBox
              icon="email" // Icon for email
              placeholder="Enter Email"
              value={email}
              setValue={setEmail}
              autoComplete={"email"}
              keyboardType={"email-address"}
            />
            <InputBox
              icon="lock" // Icon for password
              value={password}
              setValue={setPassword}
              placeholder="Enter Password"
              secureTextEntry={true}
              autoComplete={"password-new"}
            />
            <InputBox
              icon="lock-check" // Icon for confirm password
              value={confirmPassword}
              setValue={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry={true}
              autoComplete={"password-new"}
            />
            <InputBox
              icon="phone" // Icon for phone
              placeholder="Enter Contact"
              value={phone}
              setValue={setPhone}
              autoComplete={"tel"}
              keyboardType={"phone-pad"} // Use phone-pad keyboard
            />
            <InputBox
              icon="map-marker-outline" // Icon for address
              placeholder="Enter Address"
              value={address}
              setValue={setAddress}
              autoComplete={"street-address"} // More specific autocomplete
            />
            <InputBox
              icon="city" // Icon for city
              placeholder="Enter City"
              value={city}
              setValue={setCity}
              autoComplete={"address-level2"} // More specific autocomplete
            />
            {/* Country is set as default "India", if user needs to change, it'd be a dropdown/picker */}
            {/* <InputBox
              icon="earth" // Icon for country
              placeholder="Country"
              value={country}
              setValue={setCountry}
              editable={false} // Often non-editable if default
            /> */}
            <InputBox
              icon="help-circle-outline" // Icon for security answer
              placeholder="Enter Security Answer"
              value={answer}
              setValue={setAnswer}
              autoComplete={"off"} // No specific autocomplete for security answer
            />
          </View>

          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerBtnText}>Register</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.loginText}>
              Already a User?{" "}
              <Text
                onPress={() => {
                  // Instead of direct navigation to login, we'll use the same approach
                  // that works with the app's navigator structure
                  AsyncStorage.removeItem("@auth").then(() => {
                    // Use setTimeout to avoid React scheduling conflicts
                    setTimeout(() => {
                      dispatch({ type: "logoutSuccess" });
                    }, 0);
                  });
                }}
                style={styles.link}
              >
                Login Now!
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8", // Light background for the whole screen
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },
  container: {
    flex: 1,
    alignItems: "center", // Center content horizontally
    paddingHorizontal: 25, // Add horizontal padding
  },
  // image: {
  //   height: 180,
  //   width: "100%",
  //   resizeMode: "contain",
  //   marginBottom: 20,
  // },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  /* STYLE FOR THE NEW ICON */
  icon: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
  },
  subHeaderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  btnContainer: {
    width: "100%",
    alignItems: "center",
  },
  registerBtn: {
    backgroundColor: "#28a745", // A nice green for registration
    width: "90%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  registerBtnText: {
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 18,
  },
  loginText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  link: {
    color: "#007AFF", // Use the blue from login for consistency
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default Register;
