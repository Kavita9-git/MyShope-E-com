import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout/Layout";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

const NotificationHistory = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("all"); // all, sent, failed, pending
  const [analytics, setAnalytics] = useState({
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalFailed: 0,
  });

  useEffect(() => {
    loadNotificationHistory();
    calculateAnalytics();
  }, []);

  const loadNotificationHistory = async () => {
    setLoading(true);
    try {
      const history = await AsyncStorage.getItem("notificationHistory");
      if (history) {
        const parsedHistory = JSON.parse(history);
        setNotifications(parsedHistory);
        calculateAnalytics(parsedHistory);
      } else {
        // Add some sample data for demonstration
        const sampleData = generateSampleData();
        setNotifications(sampleData);
        await AsyncStorage.setItem("notificationHistory", JSON.stringify(sampleData));
        calculateAnalytics(sampleData);
      }
    } catch (error) {
      console.log("Error loading notification history:", error);
      Alert.alert("Error", "Failed to load notification history");
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleNotifications = [
      {
        id: "1",
        title: "🎉 Weekend Sale Alert!",
        body: "Get up to 70% off on selected items this weekend only!",
        target: "all",
        priority: "high",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "sent",
        deliveredCount: 1245,
        openedCount: 523,
        action: "screen",
        actionValue: "promotions",
      },
      {
        id: "2",
        title: "📦 Your Order is Ready",
        body: "Order #12345 has been processed and will be shipped soon.",
        target: "users",
        priority: "normal",
        sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        status: "sent",
        deliveredCount: 1,
        openedCount: 1,
        action: "screen",
        actionValue: "orderdetail",
      },
      {
        id: "3",
        title: "🛒 Items in your cart",
        body: "Don't forget about the items waiting in your cart!",
        target: "segment",
        segment: "cart-abandoners",
        priority: "low",
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "sent",
        deliveredCount: 234,
        openedCount: 89,
        action: "screen",
        actionValue: "cart",
      },
      {
        id: "4",
        title: "🚨 System Maintenance",
        body: "We'll be performing maintenance tonight from 2-4 AM EST.",
        target: "all",
        priority: "high",
        sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "sent",
        deliveredCount: 1567,
        openedCount: 234,
        action: "default",
      },
    ];
    return sampleNotifications;
  };

  const calculateAnalytics = (data = notifications) => {
    const analytics = {
      totalSent: data.length,
      totalDelivered: data.reduce((sum, notif) => sum + (notif.deliveredCount || 0), 0),
      totalOpened: data.reduce((sum, notif) => sum + (notif.openedCount || 0), 0),
      totalFailed: data.filter(notif => notif.status === "failed").length,
    };
    setAnalytics(analytics);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotificationHistory();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true;
    return notif.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "sent": return "#10B981";
      case "failed": return "#EF4444";
      case "pending": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high": return { name: "priority-high", color: "#EF4444" };
      case "low": return { name: "low-priority", color: "#6B7280" };
      default: return { name: "remove", color: "#F59E0B" };
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const openNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification from history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedNotifications = notifications.filter(n => n.id !== notificationId);
            setNotifications(updatedNotifications);
            await AsyncStorage.setItem("notificationHistory", JSON.stringify(updatedNotifications));
            calculateAnalytics(updatedNotifications);
            setModalVisible(false);
          }
        }
      ]
    );
  };

  const resendNotification = (notification) => {
    Alert.alert(
      "Resend Notification",
      "Do you want to resend this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Resend",
          onPress: () => {
            navigation.navigate("sendpushnotification", { 
              prefillData: {
                title: notification.title,
                body: notification.body,
                target: notification.target,
                priority: notification.priority,
                action: notification.action,
                actionValue: notification.actionValue,
              }
            });
          }
        }
      ]
    );
  };

  const chartData = [
    {
      name: "Delivered",
      population: analytics.totalDelivered,
      color: "#10B981",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Opened",
      population: analytics.totalOpened,
      color: "#3B82F6",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Not Opened",
      population: analytics.totalDelivered - analytics.totalOpened,
      color: "#E5E7EB",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
  ];

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.notificationCard}
      onPress={() => openNotificationDetails(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationTitleRow}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <MaterialIcons 
            name={getPriorityIcon(item.priority).name}
            size={16}
            color={getPriorityIcon(item.priority).color}
          />
        </View>
        <Text style={styles.notificationTime}>{formatTimeAgo(item.sentAt)}</Text>
      </View>

      <Text style={styles.notificationBody} numberOfLines={2}>
        {item.body}
      </Text>

      <View style={styles.notificationFooter}>
        <View style={styles.notificationStats}>
          <View style={styles.statItem}>
            <Ionicons name="paper-plane" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item.deliveredCount || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item.openedCount || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.openRateText}>
              {item.deliveredCount ? Math.round((item.openedCount / item.deliveredCount) * 100) : 0}%
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const NotificationDetailsModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {selectedNotification && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notification Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Title</Text>
                  <Text style={styles.detailValue}>{selectedNotification.title}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Content</Text>
                  <Text style={styles.detailValue}>{selectedNotification.body}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Target</Text>
                    <Text style={styles.detailValue}>{selectedNotification.target}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Priority</Text>
                    <Text style={styles.detailValue}>{selectedNotification.priority}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Sent At</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedNotification.sentAt).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Delivered</Text>
                    <Text style={styles.detailValue}>{selectedNotification.deliveredCount || 0}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Opened</Text>
                    <Text style={styles.detailValue}>{selectedNotification.openedCount || 0}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Open Rate</Text>
                  <Text style={styles.detailValue}>
                    {selectedNotification.deliveredCount 
                      ? Math.round((selectedNotification.openedCount / selectedNotification.deliveredCount) * 100) 
                      : 0}%
                  </Text>
                </View>

                {selectedNotification.action !== "default" && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Action</Text>
                    <Text style={styles.detailValue}>
                      {selectedNotification.action}: {selectedNotification.actionValue}
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => resendNotification(selectedNotification)}
                >
                  <MaterialIcons name="replay" size={20} color="#667eea" />
                  <Text style={styles.actionButtonText}>Resend</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteNotification(selectedNotification.id)}
                >
                  <MaterialIcons name="delete" size={20} color="#EF4444" />
                  <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <Layout showBackButton={true}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#a18cd1", "#fbc2eb"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialIcons name="history" size={32} color="#fff" />
            <Text style={styles.headerText}>Notification History</Text>
          </LinearGradient>
        </View>

        {/* Analytics Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Performance Overview</Text>
          {analytics.totalDelivered > 0 && (
            <PieChart
              data={chartData}
              width={width - 30}
              height={200}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.totalSent}</Text>
              <Text style={styles.statLabel}>Total Sent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.totalDelivered}</Text>
              <Text style={styles.statLabel}>Delivered</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.totalOpened}</Text>
              <Text style={styles.statLabel}>Opened</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {analytics.totalDelivered ? Math.round((analytics.totalOpened / analytics.totalDelivered) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Open Rate</Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {["all", "sent", "failed", "pending"].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.filterButtonActive
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text style={[
                styles.filterText,
                filter === filterOption && styles.filterTextActive
              ]}>
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={60} color="#CBD5E0" />
              <Text style={styles.emptyText}>No notifications found</Text>
              <Text style={styles.emptySubText}>
                {filter === "all" 
                  ? "Start sending notifications to see them here"
                  : `No ${filter} notifications found`
                }
              </Text>
            </View>
          }
        />

        <NotificationDetailsModal />
      </View>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  chartContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  statsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButtonActive: {
    backgroundColor: "#a18cd1",
    borderColor: "#a18cd1",
  },
  filterText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  notificationBody: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 10,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  openRateText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
});

export default NotificationHistory;
