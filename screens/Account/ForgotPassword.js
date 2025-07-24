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
import Toast from "react-native-toast-message";
import BackButton from "../../components/Layout/BackButton";

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
  const [resetPasswordRequestLoading, setResetPasswordRequestLoading] =
    useState(false);
  const [disableEmail, setDisableEmail] = useState(true);
  // Set initial email from user data if available (though for forgot password, it's usually entered manually)
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handlePasswordUpdate = async () => {
    if (!otp || !newPassword || !confirmNewPassword || !email) {
      Toast.show({
        type: "error",
        text1: "Error !",
        text1: "Please fill in all fields.",
        position: "top",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Toast.show({
        type: "error",
        text1: "Error !",
        text1: "New passwords do not match.",
        position: "top",
      });
      return;
    }

    const formData = {
      otp,
      newPassword,
      email,
    };
    try {
      setResetPasswordRequestLoading(true);
      const { data } = await axios.post(`${server}/user/verify-otp`, formData);
      if (data?.success) {
        Toast.show({
          type: "success",
          text1: "Success !",
          text1: data.message,
          position: "top",
        });
        setResetPasswordRequestLoading(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Error !",
          text1: data.message,
          position: "top",
        });
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Error response:", error.response.data);
        return error.response.data;
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Error request:", error.request);
        return { success: false, message: "No response from server" };
      } else {
        // Something happened in setting up the request
        console.log("Error:", error.message);
        return { success: false, message: error.message };
      }
    }
    // dispatch(forgotPassword(formData));
  };

  const handleGetOtp = async () => {
    try {
      if (!email) {
        Toast.show({
          type: "error",
          text1: "Error !",
          text1: "Please enter your email address.",
          position: "top",
        });
        return;
      }

      // In a real "forgot password" flow, you generally wouldn't compare with `user.email`
      // because the user might be trying to recover an account they aren't currently logged into.
      // If this screen is specifically for a logged-in user who forgot their password,
      // then comparing with `user.email` makes sense. Assuming it's for anyone for now.
      // If `email != user.email` check is truly desired, ensure `user` is available and handled correctly.
      setDisableEmail(false);
      setOtpRequestLoading(true); // Start loading for OTP request
      const { data } = await axios.post(`${server}/user/request-otp`, {
        email,
      });
      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Success !",
          text1: data.message,
          position: "top",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error !",
          text1: data.message || "Failed to send OTP. Please try again.",
          position: "top",
        });
      }
    } catch (err) {
      console.error("API error:", err);
      // More specific error handling if err.response exists
      if (err.response && err.response.data && err.response.data.message) {
        Toast.show({
          type: "error",
          text1: "Error !",
          text1: err?.response?.data?.message,
          position: "top",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error !",
          text1: "An unexpected error occurred. Please try again later.",
          position: "top",
        });
      }
    } finally {
      setOtpRequestLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <View>
      <BackButton />
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
              disabled={disableEmail}
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
            disabled={resetPasswordRequestLoading} // Disable while password update is loading
          >
            {resetPasswordRequestLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.btnActionText}>RESET PASSWORD</Text>
            )}
            {/* <Text style={styles.btnActionText}>RESET PASSWORD</Text> */}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
