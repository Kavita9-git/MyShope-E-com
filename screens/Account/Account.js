import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import React, { useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../../redux/features/auth/userActions";
import { useNavigation } from "@react-navigation/native";

const Account = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  // console.log("user :", user);
  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  return (
    <Layout showBackButton={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#0075f8", "#0075f8"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{
                    uri: user?.profilePic?.url?.startsWith("http")
                      ? user?.profilePic?.url
                      : `https://nodejsapp-hfpl.onrender.com${user?.profilePic?.url}`,
                  }}
                  style={styles.profileImage}
                />
              </View>
              <Text style={styles.greeting}>
                Hello, <Text style={styles.userName}>{user?.name}</Text>
              </Text>
              <Text style={styles.userInfo}>{user?.email}</Text>
              <Text style={styles.userInfo}>{user?.phone}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#ebf8ff" }]}>
              <Feather name="shopping-bag" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>My Orders</Text>
              <Text style={styles.statLabel}>View order history</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={16}
              color="#a0aec0"
              style={styles.statArrow}
            />
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#feebef" }]}>
              <Feather name="bell" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Notifications</Text>
              <Text style={styles.statLabel}>Check updates</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={16}
              color="#a0aec0"
              style={styles.statArrow}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account Management</Text>

        <View style={styles.sectionCard}>
          {[
            {
              label: "Edit Profile",
              icon: "edit",
              gradient: ["#4facfe", "#00f2fe"],
              screen: "profile",
            },
            {
              label: "Change Password",
              icon: "lock",
              gradient: ["#6a11cb", "#2575fc"],
              screen: "editpassword",
            },
            // {
            //   label: "Forgot Password",
            //   icon: "questioncircleo",
            //   gradient: ["#FF9966", "#FF5E62"],
            //   screen: "forgotPassword",
            // },
            {
              label: "Upload Profile Picture",
              icon: "upload",
              gradient: ["#56ab2f", "#a8e063"],
              screen: "uploadprofilepic",
            },
            {
              label: "My Orders",
              icon: "bars",
              gradient: ["#ff9a9e", "#fad0c4"],
              screen: "myorders",
            },
            {
              label: "Notifications",
              icon: "notification",
              gradient: ["#b721ff", "#21d4fd"],
              screen: "notifications",
            },
            user?.role === "admin"
              ? {
                  label: "Admin Panel",
                  icon: "dashboard",
                  gradient: ["#000428", "#004e92"],
                  screen: "adminpanel",
                }
              : null,
          ]
            .filter(Boolean)
            .map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() =>
                  navigation.navigate(item.screen, { _id: user?._id })
                }
              >
                <LinearGradient
                  colors={item.gradient}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <AntDesign name={item.icon} size={22} color="#fff" />
                </LinearGradient>
                <View style={styles.btnTextContainer}>
                  <Text style={styles.btnText}>{item.label}</Text>
                  <Text style={styles.btnSubText}>
                    {getSubtextForOption(item.label)}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
              </TouchableOpacity>
            ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Account Portal v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

// Helper function to get subtexts for each option
const getSubtextForOption = (label) => {
  switch (label) {
    case "Edit Profile":
      return "Update your personal information";
    case "Change Password":
      return "Update your security credentials";
    case "Forgot Password":
      return "Reset your password";
    case "Upload Profile Picture":
      return "Change your profile image";
    case "My Orders":
      return "View your order history";
    case "Notifications":
      return "Check your latest updates";
    case "Admin Panel":
      return "Access admin controls";
    default:
      return "";
  }
};

export default Account;

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
  profileImageContainer: {
    padding: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 65,
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#fff",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  userName: {
    fontWeight: "800",
  },
  userInfo: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 25,
    marginTop: -25,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statIconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
  },
  statArrow: {
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    paddingHorizontal: 15,
    color: "#333",
  },
  sectionCard: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconGradient: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  btnTextContainer: {
    flex: 1,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  btnSubText: {
    fontSize: 12,
    color: "#718096",
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
