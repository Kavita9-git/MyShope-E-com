import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  FlatList,
  RefreshControl,
  Animated,
} from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../../components/Layout/Layout";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  blockUser,
  deleteUser,
  updateUserRole,
  getAllUserData,
} from "../../redux/features/auth/userActions";

const ManageUsers = ({ navigation }) => {
  const dispatch = useDispatch();
  const { users, loading, error, message } = useSelector((state) => state.user);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [successMessage, setSuccessMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // 'all', 'admin', 'user', 'blocked'
  const [userStats, setUserStats] = useState({
    total: 0,
    admins: 0,
    active: 0,
    blocked: 0,
  });
  // console.log("users under:", users);
  useEffect(() => {
    dispatch(getAllUserData());
    fetchUsers();
  }, []);

  // Debug useEffect for seeing the data
  useEffect(() => {
    if (users && users.length > 0) {
      console.log(
        "Users data:",
        users.map((user) => ({
          name: user.name,
          role: user.role,
          blocked: user.blocked,
          blockedType: typeof user.blocked,
          user,
        }))
      );
    }
  }, [users]);

  useEffect(() => {
    if (
      message &&
      (message.includes("blocked") ||
        message.includes("unblocked") ||
        message.includes("deleted") ||
        message.includes("updated"))
    ) {
      showSuccessNotification(message);
      // Refresh user list after actions
      setTimeout(() => {
        fetchUsers();
      }, 500);
    }
  }, [message]);

  useEffect(() => {
    if (users && users.length > 0) {
      // Handle both string and boolean types for blocked status
      const isBlocked = (user) =>
        user.blocked === true ||
        user.blocked === "true" ||
        user.blocked === "yes" ||
        user.blocked === 1;

      const stats = {
        total: users.length,
        // Check for both uppercase and lowercase "admin"
        admins: users.filter(
          (user) => user.role === "admin" || user.role === "ADMIN"
        ).length,
        active: users.filter((user) => !isBlocked(user)).length,
        blocked: users.filter((user) => isBlocked(user)).length,
      };

      setUserStats(stats);
    }
  }, [users]);

  const showSuccessNotification = (msg) => {
    setSuccessMessage(msg);
    setShowNotification(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowNotification(false);
      });
    }, 3000);
  };

  const fetchUsers = useCallback(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [fetchUsers]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Helper function to check if user is blocked
  const isBlocked = (user) => user.blocked === true || user.blocked === "true";

  // Helper function to check if user is admin
  const isAdmin = (user) => user.role === "admin" || user.role === "ADMIN";

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterRole === "all") return matchesSearch;
    if (filterRole === "admin") return matchesSearch && isAdmin(user);
    if (filterRole === "blocked") return matchesSearch && isBlocked(user);
    return matchesSearch && !isAdmin(user); // user role
  });

  const handleUserAction = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleBlockUser = (userId, isUserBlocked) => {
    Alert.alert(
      isUserBlocked ? "Unblock User" : "Block User",
      `Are you sure you want to ${
        isUserBlocked ? "unblock" : "block"
      } this user?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => {
            dispatch(blockUser(userId, !isUserBlocked));
            setModalVisible(false);

            // Update the selectedUser object immediately for better UX
            if (selectedUser && selectedUser._id === userId) {
              setSelectedUser({
                ...selectedUser,
                blocked: !isUserBlocked,
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch(deleteUser(userId));
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const handleRoleChange = (userId, isUserAdmin) => {
    const newRole = isUserAdmin ? "user" : "admin"; // Toggle role between admin and user
    Alert.alert(
      isUserAdmin ? "Remove Admin Role" : "Make Admin",
      `Are you sure you want to ${
        isUserAdmin ? "remove admin privileges from" : "make"
      } this user ${isUserAdmin ? "" : "an admin"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            dispatch(updateUserRole(userId, newRole));
            setModalVisible(false);

            // Update the selectedUser object immediately for better UX
            if (selectedUser && selectedUser._id === userId) {
              setSelectedUser({
                ...selectedUser,
                role: newRole,
              });
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserAction(item)}
    >
      <View style={styles.userAvatarContainer}>
        {item?.profilePic ? (
          <Image
            source={{
              uri: item?.profilePic?.url
                ? item?.profilePic?.url.startsWith("http")
                  ? item?.profilePic?.url
                  : `https://nodejsapp-hfpl.onrender.com${item?.profilePic?.url}`
                : item?.profilePic.startsWith("http")
                ? item?.profilePic
                : `https://nodejsapp-hfpl.onrender.com${item?.profilePic}`,
            }}
            style={styles.userAvatar}
          />
        ) : (
          <View style={styles.userAvatarFallback}>
            <Text style={styles.avatarText}>
              {item.name ? item.name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
        )}
        {isAdmin(item) && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {item.email}
        </Text>
        <View style={styles.userMeta}>
          <Text style={styles.userJoined}>
            Joined: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <View
            style={[
              styles.userStatus,
              { backgroundColor: isBlocked(item) ? "#FEE2E2" : "#DCFCE7" },
            ]}
          >
            <Text
              style={[
                styles.userStatusText,
                { color: isBlocked(item) ? "#DC2626" : "#16A34A" },
              ]}
            >
              {isBlocked(item) ? "Blocked" : "Active"}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
    </TouchableOpacity>
  );

  const renderUserDetailsModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {selectedUser && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <AntDesign name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.userDetailsContainer}>
                <View style={styles.userProfileHeader}>
                  {selectedUser.profilePic ? (
                    <Image
                      source={{
                        uri: selectedUser.profilePic?.url
                          ? selectedUser.profilePic?.url.startsWith("http")
                            ? selectedUser.profilePic?.url
                            : `https://nodejsapp-hfpl.onrender.com${selectedUser.profilePic?.url}`
                          : selectedUser.profilePic.startsWith("http")
                          ? selectedUser.profilePic
                          : `https://nodejsapp-hfpl.onrender.com${selectedUser.profilePic}`,
                      }}
                      style={styles.modalUserAvatar}
                    />
                  ) : (
                    <View style={styles.modalUserAvatarFallback}>
                      <Text style={styles.modalAvatarText}>
                        {selectedUser.name
                          ? selectedUser.name.charAt(0).toUpperCase()
                          : "U"}
                      </Text>
                    </View>
                  )}

                  <View style={styles.userDetailInfo}>
                    <Text style={styles.userDetailName}>
                      {selectedUser.name}
                    </Text>
                    <Text style={styles.userDetailEmail}>
                      {selectedUser.email}
                    </Text>
                    <View
                      style={[
                        styles.userDetailBadge,
                        {
                          backgroundColor: isAdmin(selectedUser)
                            ? "#C7D2FE"
                            : "#E2E8F0",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.userDetailBadgeText,
                          {
                            color: isAdmin(selectedUser)
                              ? "#4338CA"
                              : "#64748B",
                          },
                        ]}
                      >
                        {isAdmin(selectedUser) ? "Admin" : "User"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.userDetailsMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#718096"
                    />
                    <Text style={styles.metaText}>
                      Joined:{" "}
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={18} color="#718096" />
                    <Text style={styles.metaText}>
                      Last updated:{" "}
                      {new Date(selectedUser.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name={
                        isBlocked(selectedUser)
                          ? "close-circle-outline"
                          : "checkmark-circle-outline"
                      }
                      size={18}
                      color={isBlocked(selectedUser) ? "#DC2626" : "#16A34A"}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        {
                          color: isBlocked(selectedUser)
                            ? "#DC2626"
                            : "#16A34A",
                        },
                      ]}
                    >
                      Status: {isBlocked(selectedUser) ? "Blocked" : "Active"}
                    </Text>
                  </View>

                  {selectedUser?.phone && (
                    <View style={styles.metaItem}>
                      <Ionicons name="call-outline" size={18} color="#718096" />
                      <Text style={styles.metaText}>
                        Phone: {selectedUser.phone}
                      </Text>
                    </View>
                  )}

                  {selectedUser?.address && (
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#718096"
                      />
                      <Text style={styles.metaText} numberOfLines={2}>
                        Address: {selectedUser.address}, {selectedUser.city},{" "}
                        {selectedUser.country}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.userActionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.roleButton]}
                    onPress={() =>
                      handleRoleChange(selectedUser._id, isAdmin(selectedUser))
                    }
                  >
                    <LinearGradient
                      colors={["#4F46E5", "#7C3AED"]}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons
                        name={
                          isAdmin(selectedUser) ? "shield-outline" : "shield"
                        }
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.actionButtonText}>
                        {isAdmin(selectedUser)
                          ? "Remove Admin Role"
                          : "Make Admin"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.blockButton]}
                    onPress={() =>
                      handleBlockUser(selectedUser._id, isBlocked(selectedUser))
                    }
                  >
                    <LinearGradient
                      colors={
                        isBlocked(selectedUser)
                          ? ["#059669", "#10B981"]
                          : ["#F59E0B", "#F97316"]
                      }
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons
                        name={
                          isBlocked(selectedUser) ? "lock-open" : "lock-closed"
                        }
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.actionButtonText}>
                        {isBlocked(selectedUser)
                          ? "Unblock User"
                          : "Block User"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(selectedUser._id)}
                  >
                    <LinearGradient
                      colors={["#DC2626", "#EF4444"]}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="trash" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Delete User</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
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
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#43cea2", "#185a9d"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="people" size={40} color="#fff" />
            <Text style={styles.headerText}>User Management</Text>
          </LinearGradient>
        </View>

        {showNotification && (
          <Animated.View
            style={[styles.notificationContainer, { opacity: fadeAnim }]}
          >
            <LinearGradient
              colors={["#43cea2", "#185a9d"]}
              style={styles.notificationGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <AntDesign name="checkcircle" size={24} color="#fff" />
              <Text style={styles.notificationText}>{successMessage}</Text>
              <TouchableOpacity
                onPress={() => setShowNotification(false)}
                style={styles.closeButton}
              >
                <AntDesign name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.statsCardsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, styles.totalCard]}>
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                style={styles.statsCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.statsIconContainer}>
                  <Ionicons name="people" size={28} color="#fff" />
                </View>
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsNumber}>{userStats.total}</Text>
                  <Text style={styles.statsLabel}>Total Users</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={[styles.statsCard, styles.adminCard]}>
              <LinearGradient
                colors={["#3B82F6", "#1D4ED8"]}
                style={styles.statsCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.statsIconContainer}>
                  <Ionicons name="shield-checkmark" size={28} color="#fff" />
                </View>
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsNumber}>{userStats.admins}</Text>
                  <Text style={styles.statsLabel}>Admins</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statsCard, styles.activeCard]}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.statsCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.statsIconContainer}>
                  <Ionicons name="checkmark-circle" size={28} color="#fff" />
                </View>
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsNumber}>{userStats.active}</Text>
                  <Text style={styles.statsLabel}>Active</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={[styles.statsCard, styles.blockedCard]}>
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={styles.statsCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.statsIconContainer}>
                  <Ionicons name="close-circle" size={28} color="#fff" />
                </View>
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsNumber}>{userStats.blocked}</Text>
                  <Text style={styles.statsLabel}>Blocked</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search"
              size={20}
              color="#718096"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users by name or email"
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#A0AEC0"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#CBD5E0" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterRole === "all" && styles.filterButtonActive,
              ]}
              onPress={() => setFilterRole("all")}
            >
              <Text
                style={[
                  styles.filterText,
                  filterRole === "all" && styles.filterTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterRole === "admin" && styles.filterButtonActive,
              ]}
              onPress={() => setFilterRole("admin")}
            >
              <Text
                style={[
                  styles.filterText,
                  filterRole === "admin" && styles.filterTextActive,
                ]}
              >
                Admins
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterRole === "user" && styles.filterButtonActive,
              ]}
              onPress={() => setFilterRole("user")}
            >
              <Text
                style={[
                  styles.filterText,
                  filterRole === "user" && styles.filterTextActive,
                ]}
              >
                Users
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterRole === "blocked" && styles.filterButtonActive,
              ]}
              onPress={() => setFilterRole("blocked")}
            >
              <Text
                style={[
                  styles.filterText,
                  filterRole === "blocked" && styles.filterTextActive,
                ]}
              >
                Blocked
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#43cea2" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={50} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
              <LinearGradient
                colors={["#43cea2", "#185a9d"]}
                style={styles.retryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            renderItem={renderUserItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#43cea2"]}
              />
            }
            contentContainerStyle={styles.userList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={60} color="#CBD5E0" />
                <Text style={styles.emptyText}>No users found</Text>
                {searchQuery ? (
                  <Text style={styles.emptySubText}>
                    Try a different search term
                  </Text>
                ) : null}
              </View>
            }
          />
        )}

        {renderUserDetailsModal()}
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
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#2D3748",
  },
  filterContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EDF2F7",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: "#43cea2",
    borderColor: "#43cea2",
  },
  filterText: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#718096",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  retryButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  userList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userAvatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e2e8f0",
  },
  userAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#43cea2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  adminBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4338CA",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userJoined: {
    fontSize: 12,
    color: "#A0AEC0",
  },
  userStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  userStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#718096",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: "#A0AEC0",
    marginTop: 5,
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
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3748",
  },
  userDetailsContainer: {
    marginTop: 15,
  },
  userProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  modalUserAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    backgroundColor: "#e2e8f0",
  },
  modalUserAvatarFallback: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#43cea2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  modalAvatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  userDetailInfo: {
    flex: 1,
  },
  userDetailName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 2,
  },
  userDetailEmail: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 6,
  },
  userDetailBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  userDetailBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  userDetailsMeta: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4A5568",
  },
  userActionsContainer: {
    marginTop: 5,
  },
  actionButton: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  actionButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  roleButton: {
    marginBottom: 15,
  },
  blockButton: {
    marginBottom: 15,
  },
  notificationContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  notificationGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  notificationText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  statsCardsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statsCard: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsCardGradient: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  statsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statsTextContainer: {
    flex: 1,
  },
  statsNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  totalCard: {
    marginRight: 5,
  },
  adminCard: {
    marginLeft: 5,
  },
  activeCard: {
    marginRight: 5,
  },
  blockedCard: {
    marginLeft: 5,
  },
});

export default ManageUsers;
