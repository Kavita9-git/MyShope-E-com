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
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../../redux/features/auth/userActions";

const Account = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: `https://nodejsapp-hfpl.onrender.com${user?.profilePic?.url}`,
            }}
            style={styles.profileImage}
          />
          <Text style={styles.greeting}>
            Hello, <Text style={styles.userName}>{user?.name}</Text>
          </Text>
          <Text style={styles.userInfo}>{user?.email}</Text>
          <Text style={styles.userInfo}>{user?.phone}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          {[
            {
              label: "Edit Profile",
              icon: "edit",
              color: "#3498db",
              bg: "#e8f4fd",
              screen: "profile",
            },
            {
              label: "Change Password",
              icon: "lock",
              color: "#e67e22",
              bg: "#fff4e6",
              screen: "editpassword",
            },
            {
              label: "Forgot Password",
              icon: "questioncircleo",
              color: "#e74c3c",
              bg: "#fdecea",
              screen: "forgotpassword",
            },
            {
              label: "Upload Profile Picture",
              icon: "upload",
              color: "#2ecc71",
              bg: "#eafaf1",
              screen: "uploadprofilepic",
            },
            {
              label: "My Orders",
              icon: "bars",
              color: "#f39c12",
              bg: "#fdf6ec",
              screen: "myorders",
            },
            {
              label: "Notifications",
              icon: "notification",
              color: "#9b59b6",
              bg: "#f5edff",
              screen: "notifications",
            },
            user?.role === "admin"
              ? {
                  label: "Admin Panel",
                  icon: "dashboard",
                  color: "#34495e",
                  bg: "#ecf0f1",
                  screen: "adminPanel",
                }
              : null,
          ]
            .filter(Boolean)
            .map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.option, { backgroundColor: item.bg }]}
                onPress={() =>
                  navigation.navigate(item.screen, { id: user?._id })
                }
              >
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: item.color },
                  ]}
                >
                  <AntDesign name={item.icon} style={styles.optionIcon} />
                </View>
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </Layout>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    minHeight: "100%",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 14,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  userName: {
    color: "#2ecc71",
  },
  userInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  optionIconContainer: {
    borderRadius: 25,
    padding: 12,
    marginRight: 18,
  },
  optionIcon: {
    fontSize: 20,
    color: "#fff",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
});
