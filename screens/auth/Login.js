import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import InputBox from "../../components/Form/InputBox";
import {
  login,
  clearMessage,
  updateSavedAddresses,
} from "../../redux/features/auth/userActions";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Do not use the custom hook for Login - we'll handle auth directly
// import { useReduxStateHook } from "../../hooks/customHook";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const initialRenderRef = useRef(true);

  const dispatch = useDispatch();
  const { error, message, isAuth, loading } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    dispatch(clearMessage());
  }, []);

  const handleLogin = () => {
    // Clear previous error messages
    setErrorMessage("");

    // Input validation
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    dispatch(login(email, password));
  };

  useEffect(() => {
    // Skip on first render to avoid navigation issues
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    // Handle loading state from Redux
    if (loading !== undefined) {
      setIsLoading(loading);
    }

    // console.log("Redux error state:", error);

    if (error) {
      setIsLoading(false);
      setErrorMessage(error);

      // Clear the Redux error after displaying it
      setTimeout(() => {
        dispatch(clearMessage());
      }, 100);
    }

    if (message) {
      // Successful login message
      setErrorMessage("");
    }

    // Only check for pending addresses if we're authenticated
    if (isAuth) {
      setIsLoading(false);
      setErrorMessage("");

      // Check for pending addresses
      checkPendingAddresses();

      // Don't try to navigate here - let Main.js handle the stack switching
      // based on isAuth state that we've updated through Redux
    }
  }, [error, message, isAuth, loading, dispatch]);

  // Check for pending addresses and sync them with the user account
  const checkPendingAddresses = async () => {
    try {
      // Check if there's a pending address to save
      const pendingAddressJson = await AsyncStorage.getItem("@pendingAddress");

      if (pendingAddressJson) {
        const pendingAddress = JSON.parse(pendingAddressJson);

        // Get existing saved addresses
        const savedAddressesJson = await AsyncStorage.getItem(
          "@savedShippingAddresses"
        );
        let savedAddresses = [];

        if (savedAddressesJson) {
          savedAddresses = JSON.parse(savedAddressesJson);
        }

        // Check if this address is already saved
        const addressExists = savedAddresses.some(
          (addr) =>
            addr.address === pendingAddress.address &&
            addr.city === pendingAddress.city &&
            addr.country === pendingAddress.country
        );

        if (!addressExists) {
          // Add the pending address to saved addresses
          const updatedAddresses = [...savedAddresses, pendingAddress];

          // Update local storage
          await AsyncStorage.setItem(
            "@savedShippingAddresses",
            JSON.stringify(updatedAddresses)
          );

          // Update server
          dispatch(updateSavedAddresses(updatedAddresses));
        }

        // Clear the pending address
        await AsyncStorage.removeItem("@pendingAddress");
      }
    } catch (error) {
      console.log("Error handling pending address:", error);
    }
  };

  const loginImage =
    "data:image/jpeg;base64,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";

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            {/* The image remains at the top */}
            <Image source={{ uri: loginImage }} style={styles.image} />

            {/* Moved the Icon to be just above the headerText */}
            <Icon
              name="login"
              size={80}
              color="#007AFF"
              style={styles.mainIcon}
            />

            <Text style={styles.headerText}>Welcome Back!</Text>
            <Text style={styles.subHeaderText}>
              Login to continue your shopping experience.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <InputBox
              icon="email"
              placeholder="Enter Email"
              value={email}
              setValue={setEmail}
              autoComplete={"on"}
              keyboardType={"email-address"}
            />
            <InputBox
              icon="lock"
              value={password}
              setValue={setPassword}
              placeholder="Enter Password"
              secureTextEntry={true}
              autoComplete={"password"}
            />

            {/* Display error message if any */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>

          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.registerText}>
              Don't have an account?{" "}
              <Text
                onPress={() => navigation.navigate("register")}
                style={styles.link}
              >
                Register Now!
              </Text>
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("forgotPassword")}
            >
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 25,
  },
  mainIcon: {
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    height: 180,
    width: "100%",
    resizeMode: "contain",
    marginBottom: 0,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
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
  loginBtn: {
    backgroundColor: "#007AFF",
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
  loginBtnText: {
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 18,
  },
  registerText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  link: {
    color: "#007AFF",
    fontWeight: "bold",
    marginLeft: 5,
  },
  forgotPasswordLink: {
    color: "#007AFF",
    fontSize: 14,
    marginTop: 15,
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#ff3b30",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Login;
