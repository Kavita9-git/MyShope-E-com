import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import Layout from "../../components/Layout/Layout";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";

const Notifications = () => {
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
            <View style={styles.profileHeader}>
              <View style={styles.iconContainer}>
                <AntDesign name="bells" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                Check your latest updates
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#ebf8ff" }]}>
              <Feather name="bell" size={24} color="#3182ce" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>New Notifications</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#feebef" }]}>
              <Feather name="clock" size={24} color="#e53e3e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Past Notifications</Text>
            </View>
          </View>
        </View>

        <View style={styles.notificationsContainer}>
          <View style={styles.emptyStateContainer}>
            <AntDesign name="notification" size={60} color="#CBD5E0" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You don't have any notifications yet
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Feather name="info" size={20} color="#3182ce" />
            <Text style={styles.infoTitle}>How Notifications Work</Text>
          </View>
          <Text style={styles.infoText}>• Get updates about your orders</Text>
          <Text style={styles.infoText}>• Receive alerts about promotions</Text>
          <Text style={styles.infoText}>
            • Stay informed about new products
          </Text>
          <Text style={styles.infoText}>• Get notified about price drops</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Notifications Management v1.0</Text>
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
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  headerSubtitle: {
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
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
  },
  notificationsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 5,
    textAlign: "center",
  },
  infoCard: {
    marginHorizontal: 15,
    backgroundColor: "#ebf8ff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3182ce",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 6,
    paddingLeft: 10,
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

export default Notifications;
