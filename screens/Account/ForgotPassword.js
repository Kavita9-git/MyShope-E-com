import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert, // Import Alert for better user feedback
} from "react-native";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout"; // Assuming this is your main layout component
import InputBox from "../../components/Form/InputBox"; // Assuming this is a reusable input component
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../redux/features/auth/userActions";
import { server } from "../../redux/store"; // Your backend server URL
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // For icons

const ForgotPassword = ({ navigation }) => {
  const dispatch = useDispatch();
  // Get loading and error states from Redux for better UX
  const {
    user,
    loading: reduxLoading,
    error: reduxError,
  } = useSelector((state) => state.user);

  // Component-specific states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // Added for confirmation
  const [otpRequestLoading, setOtpRequestLoading] = useState(false); // Loading for OTP request specifically

  // Set initial email from user data if available (though for forgot password, it's usually entered manually)
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Handle feedback from redux action (for actual password reset)
  useEffect(() => {
    if (reduxError) {
      Alert.alert("Error", reduxError);
    }
    if (!reduxLoading && !reduxError && otp && newPassword) {
      // Check if update was successful and inputs were not empty before dispatch
      Alert.alert(
        "Success",
        "Password reset successfully! Please login with your new password."
      );
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      // Optionally navigate to login screen after success
      navigation.navigate("login"); // Assuming you have a 'login' route
    }
  }, [reduxLoading, reduxError]); // Depend on loading and error states from Redux

  const handlePasswordUpdate = () => {
    if (!otp || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    const formData = {
      otp,
      newPassword,
    };
    dispatch(forgotPassword(formData));
  };

  const handleGetOtp = async () => {
    try {
      if (!email) {
        Alert.alert("Error", "Please enter your email address.");
        return;
      }

      // In a real "forgot password" flow, you generally wouldn't compare with `user.email`
      // because the user might be trying to recover an account they aren't currently logged into.
      // If this screen is specifically for a logged-in user who forgot their password,
      // then comparing with `user.email` makes sense. Assuming it's for anyone for now.
      // If `email != user.email` check is truly desired, ensure `user` is available and handled correctly.

      setOtpRequestLoading(true); // Start loading for OTP request
      const { data } = await axios.post(`${server}/user/request-otp`, {
        email,
      });

      if (data.success) {
        Alert.alert("Success", data.message);
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to send OTP. Please try again."
        );
      }
    } catch (err) {
      console.error("API error:", err);
      // More specific error handling if err.response exists
      if (err.response && err.response.data && err.response.data.message) {
        Alert.alert("Error", err.response.data.message);
      } else {
        Alert.alert(
          "Error",
          "An unexpected error occurred. Please try again later."
        );
      }
    } finally {
      setOtpRequestLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Icon name="lock-question" size={60} color="#FF6F00" />
            {/* Changed icon */}
            <Text style={styles.headerText}>Forgot Password?</Text>
            <Text style={styles.subHeaderText}>
              Enter your email to receive an OTP and reset your password.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <InputBox
              icon="email" // Icon for email
              value={email}
              setValue={setEmail}
              placeholder={"Enter your Email Id"}
              keyboardType={"email-address"} // Better keyboard for email
              autoComplete={"email"}
              // editable={user && user.email ? false : true} // Make editable based on user state
            />

            <TouchableOpacity
              style={[styles.btnAction, styles.getOtpButton]}
              onPress={handleGetOtp}
              disabled={otpRequestLoading} // Disable while OTP request is loading
            >
              {otpRequestLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.btnActionText}>GET OTP</Text>
              )}
            </TouchableOpacity>

            <InputBox
              icon="numeric" // Icon for OTP (numbers)
              value={otp}
              setValue={setOtp}
              placeholder={"Enter OTP"}
              keyboardType={"numeric"} // Numeric keyboard for OTP
              maxLength={6} // Common OTP length
            />

            <InputBox
              icon="lock" // Icon for new password
              value={newPassword}
              setValue={setNewPassword}
              placeholder={"Enter your new password"}
              autoComplete={"password-new"}
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
            style={[styles.btnAction, styles.updatePasswordButton]}
            onPress={handlePasswordUpdate}
            disabled={reduxLoading} // Disable while password update is loading
          >
            {reduxLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.btnActionText}>RESET PASSWORD</Text>
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
    backgroundColor: "#f8f8f8", // Very light gray background
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
  btnAction: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10, // Margin for spacing between buttons
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  getOtpButton: {
    backgroundColor: "#28a745", // A nice green for "Get OTP"
  },
  updatePasswordButton: {
    backgroundColor: "#dc3545", // A red for "Reset Password"
  },
  btnActionText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ForgotPassword;
