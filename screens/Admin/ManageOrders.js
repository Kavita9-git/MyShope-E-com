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

const ManageOrders = ({ navigation }) => {
  return (
    <Layout showBackButton={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="package" size={40} color="#fff" />
            <Text style={styles.headerText}>Manage Orders</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#ebf8ff" }]}>
              <Feather name="clipboard" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>Order Management</Text>
              <Text style={styles.statLabel}>
                Track and manage customer orders
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Available Actions</Text>

        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate("updatedeleteorder")}
          >
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AntDesign name="edit" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.btnTextContainer}>
              <Text style={styles.btnText}>Update/Delete Orders</Text>
              <Text style={styles.btnSubText}>
                Manage order status and information
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
          </TouchableOpacity>

          {/* Placeholder for future order management features */}
          <TouchableOpacity
            style={[styles.optionButton, styles.comingSoonOption]}
          >
            <LinearGradient
              colors={["#6a11cb", "#2575fc"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AntDesign name="dashboard" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.btnTextContainer}>
              <Text style={styles.btnText}>Order Analytics</Text>
              <Text style={styles.btnSubText}>Coming Soon</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#a0aec0" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Order Management v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

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
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },
  statsContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#718096",
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
  comingSoonOption: {
    opacity: 0.7,
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

export default ManageOrders;
