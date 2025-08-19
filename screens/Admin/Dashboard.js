import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import Layout from "../../components/Layout/Layout";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import useProtectedRoute from "../../hooks/useProtectedRoute";

const Dashboard = ({ navigation }) => {
  // Use protected route hook with admin privileges required
  const { user } = useProtectedRoute(true);

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <Text style={styles.heading}>Admin Dashboard</Text>
              <Text style={styles.subHeading}>Manage your store</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#ebf8ff" }]}>
              <Feather name="shopping-bag" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Products</Text>
              <Text style={styles.statLabel}>Manage inventory</Text>
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
              <Feather name="users" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Users</Text>
              <Text style={styles.statLabel}>Customer accounts</Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={16}
              color="#a0aec0"
              style={styles.statArrow}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("managecategories")}
          >
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="category" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.btnTextContainer}>
              <Text style={styles.btnText}>Manage Categories</Text>
              <Text style={styles.btnSubText}>
                Add, edit or delete categories
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("manageproducts")}
          >
            <LinearGradient
              colors={["#6a11cb", "#2575fc"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="package" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.btnTextContainer}>
              <Text style={styles.btnText}>Manage Products</Text>
              <Text style={styles.btnSubText}>
                Create and update your products
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("manageorders")}
          >
            <LinearGradient
              colors={["#ff9a9e", "#fad0c4"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="shopping-cart" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.btnTextContainer}>
              <Text style={styles.btnText}>Manage Orders</Text>
              <Text style={styles.btnSubText}>
                Track and update order status
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("manageusers")}
          >
            <LinearGradient
              colors={["#f093fb", "#f5576c"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AntDesign name="user" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.btnTextContainer}>
              <Text style={styles.btnText}>Manage Users</Text>
              <Text style={styles.btnSubText}>
                View and manage user accounts
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("managenotifications")}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="notifications" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.btnTextContainer}>
              <Text style={styles.btnText}>Manage Notifications</Text>
              <Text style={styles.btnSubText}>
                Send notifications and manage settings
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("about")}
          >
            <LinearGradient
              colors={["#84fab0", "#8fd3f4"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AntDesign name="info" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.btnTextContainer}>
              <Text style={styles.btnText}>About App</Text>
              <Text style={styles.btnSubText}>
                Information about the application
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Admin Portal v1.0</Text>
        </View>
      </ScrollView>
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
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  heading: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subHeading: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 25,
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
  btnContainer: {
    paddingHorizontal: 15,
  },
  btn: {
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

export default Dashboard;
