import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import InputBox from "../../components/Form/InputBox";

import { login } from "../../redux/features/auth/userActions";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { loading, error, message, isAuth } = useSelector(
    (state) => state.user
  );

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    dispatch(login(email, password));
  };

  useEffect(() => {
    if (error) {
      Alert.alert("Login Error", error);
    }

    if (message) {
      Alert.alert("Login Success", message);
    }

    if (isAuth) {
      navigation.navigate("home");
    }
  }, [error, message, isAuth, dispatch, navigation]);

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
              autoComplete={"email"}
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
          </View>

          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
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
    // Adjusted margins for its new position
    marginTop: 10, // Space above the icon (from the image)
    marginBottom: 10, // Space below the icon (to the "Welcome Back!" text)
  },
  image: {
    height: 180,
    width: "100%",
    resizeMode: "contain",
    marginBottom: 0, // Removed bottom margin as icon will now be below it
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    // marginTop: 15, // This will provide space from the icon above it
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
});

export default Login;
