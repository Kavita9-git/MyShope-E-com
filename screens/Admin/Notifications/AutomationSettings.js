import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout/Layout";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AutomationSettings = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    cartAbandonment: {
      enabled: true,
      delay1: 30, // minutes
      delay2: 120, // minutes (2 hours)
      delay3: 1440, // minutes (24 hours)
      title1: "🛒 Items waiting in your cart",
      body1: "Complete your purchase before these items sell out!",
      title2: "🕐 Don't forget your cart items",
      body2: "Your selected items are still available. Complete your order now!",
      title3: "⏰ Last chance for your cart items",
      body3: "These items might sell out soon. Complete your purchase now!",
    },
    priceDrops: {
      enabled: true,
      threshold: 5, // percentage
      checkInterval: 30, // minutes
      title: "💰 Price Drop Alert!",
      body: "Great news! An item in your wishlist just got cheaper.",
    },
    orderUpdates: {
      enabled: true,
      processing: {
        enabled: true,
        title: "📦 Order Confirmed",
        body: "Your order has been confirmed and is being processed.",
      },
      shipped: {
        enabled: true,
        title: "🚚 Order Shipped",
        body: "Your order is on its way! Track your package.",
      },
      delivered: {
        enabled: true,
        title: "✅ Order Delivered",
        body: "Your order has been delivered. Enjoy your purchase!",
      },
      cancelled: {
        enabled: true,
        title: "❌ Order Cancelled",
        body: "Your order has been cancelled. A refund will be processed.",
      },
    },
    stockAlerts: {
      enabled: true,
      checkInterval: 120, // minutes (2 hours)
      title: "🔔 Back in Stock!",
      body: "Great news! An item from your wishlist is back in stock.",
    },
    reEngagement: {
      enabled: true,
      inactiveAfter: 48, // hours
      weeklyReminder: 168, // hours (1 week)
      title1: "👋 We miss you!",
      body1: "Check out what's new since your last visit.",
      title2: "🎯 Special offers waiting for you",
      body2: "Don't miss out on our latest deals and new arrivals!",
    },
    promotions: {
      enabled: true,
      flashSales: true,
      weeklyDeals: true,
      seasonalOffers: true,
      personalizedOffers: true,
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAutomationSettings();
  }, []);

  const loadAutomationSettings = async () => {
    setLoading(true);
    try {
      const savedSettings = await AsyncStorage.getItem("automationSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log("Error loading automation settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAutomationSettings = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem("automationSettings", JSON.stringify(settings));
      Alert.alert("Success", "Automation settings saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save automation settings");
      console.log("Error saving automation settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateNestedSetting = (category, subcategory, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: {
          ...prev[category][subcategory],
          [key]: value
        }
      }
    }));
  };

  const resetToDefaults = () => {
    Alert.alert(
      "Reset to Defaults",
      "Are you sure you want to reset all automation settings to default values?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setSettings({
              cartAbandonment: {
                enabled: true,
                delay1: 30,
                delay2: 120,
                delay3: 1440,
                title1: "🛒 Items waiting in your cart",
                body1: "Complete your purchase before these items sell out!",
                title2: "🕐 Don't forget your cart items",
                body2: "Your selected items are still available. Complete your order now!",
                title3: "⏰ Last chance for your cart items",
                body3: "These items might sell out soon. Complete your purchase now!",
              },
              priceDrops: {
                enabled: true,
                threshold: 5,
                checkInterval: 30,
                title: "💰 Price Drop Alert!",
                body: "Great news! An item in your wishlist just got cheaper.",
              },
              orderUpdates: {
                enabled: true,
                processing: {
                  enabled: true,
                  title: "📦 Order Confirmed",
                  body: "Your order has been confirmed and is being processed.",
                },
                shipped: {
                  enabled: true,
                  title: "🚚 Order Shipped",
                  body: "Your order is on its way! Track your package.",
                },
                delivered: {
                  enabled: true,
                  title: "✅ Order Delivered",
                  body: "Your order has been delivered. Enjoy your purchase!",
                },
                cancelled: {
                  enabled: true,
                  title: "❌ Order Cancelled",
                  body: "Your order has been cancelled. A refund will be processed.",
                },
              },
              stockAlerts: {
                enabled: true,
                checkInterval: 120,
                title: "🔔 Back in Stock!",
                body: "Great news! An item from your wishlist is back in stock.",
              },
              reEngagement: {
                enabled: true,
                inactiveAfter: 48,
                weeklyReminder: 168,
                title1: "👋 We miss you!",
                body1: "Check out what's new since your last visit.",
                title2: "🎯 Special offers waiting for you",
                body2: "Don't miss out on our latest deals and new arrivals!",
              },
              promotions: {
                enabled: true,
                flashSales: true,
                weeklyDeals: true,
                seasonalOffers: true,
                personalizedOffers: true,
              },
            });
            Alert.alert("Reset Complete", "All settings have been reset to defaults");
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <Layout showBackButton={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffecd2" />
          <Text style={styles.loadingText}>Loading automation settings...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout showBackButton={true}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#ffecd2", "#fcb69f"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="settings" size={32} color="#fff" />
            <Text style={styles.headerText}>Automation Settings</Text>
          </LinearGradient>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Cart Abandonment */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="shopping-cart" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Cart Abandonment</Text>
              <Switch
                value={settings.cartAbandonment.enabled}
                onValueChange={(value) => updateSetting("cartAbandonment", "enabled", value)}
                trackColor={{ false: "#E2E8F0", true: "#FF6B35" }}
                thumbColor={settings.cartAbandonment.enabled ? "#fff" : "#f4f3f4"}
              />
            </View>

            {settings.cartAbandonment.enabled && (
              <View style={styles.sectionContent}>
                <Text style={styles.description}>
                  Send reminder notifications to users who abandon their cart
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>First reminder after (minutes):</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={settings.cartAbandonment.delay1}
                      onValueChange={(value) => updateSetting("cartAbandonment", "delay1", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="15 minutes" value={15} />
                      <Picker.Item label="30 minutes" value={30} />
                      <Picker.Item label="60 minutes" value={60} />
                      <Picker.Item label="120 minutes" value={120} />
                    </Picker>
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Second reminder after (minutes):</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={settings.cartAbandonment.delay2}
                      onValueChange={(value) => updateSetting("cartAbandonment", "delay2", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="2 hours" value={120} />
                      <Picker.Item label="4 hours" value={240} />
                      <Picker.Item label="6 hours" value={360} />
                      <Picker.Item label="12 hours" value={720} />
                    </Picker>
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Final reminder after (hours):</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={settings.cartAbandonment.delay3}
                      onValueChange={(value) => updateSetting("cartAbandonment", "delay3", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="24 hours" value={1440} />
                      <Picker.Item label="48 hours" value={2880} />
                      <Picker.Item label="72 hours" value={4320} />
                    </Picker>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Price Drop Alerts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="trending-down" size={24} color="#4ECDC4" />
              <Text style={styles.sectionTitle}>Price Drop Alerts</Text>
              <Switch
                value={settings.priceDrops.enabled}
                onValueChange={(value) => updateSetting("priceDrops", "enabled", value)}
                trackColor={{ false: "#E2E8F0", true: "#4ECDC4" }}
                thumbColor={settings.priceDrops.enabled ? "#fff" : "#f4f3f4"}
              />
            </View>

            {settings.priceDrops.enabled && (
              <View style={styles.sectionContent}>
                <Text style={styles.description}>
                  Notify users when wishlist items drop in price
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Minimum price drop (%):</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={settings.priceDrops.threshold.toString()}
                    onChangeText={(text) => updateSetting("priceDrops", "threshold", parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="5"
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Check interval (minutes):</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={settings.priceDrops.checkInterval}
                      onValueChange={(value) => updateSetting("priceDrops", "checkInterval", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="15 minutes" value={15} />
                      <Picker.Item label="30 minutes" value={30} />
                      <Picker.Item label="60 minutes" value={60} />
                      <Picker.Item label="120 minutes" value={120} />
                    </Picker>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Order Updates */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="local-shipping" size={24} color="#45B7D1" />
              <Text style={styles.sectionTitle}>Order Updates</Text>
              <Switch
                value={settings.orderUpdates.enabled}
                onValueChange={(value) => updateSetting("orderUpdates", "enabled", value)}
                trackColor={{ false: "#E2E8F0", true: "#45B7D1" }}
                thumbColor={settings.orderUpdates.enabled ? "#fff" : "#f4f3f4"}
              />
            </View>

            {settings.orderUpdates.enabled && (
              <View style={styles.sectionContent}>
                <Text style={styles.description}>
                  Automatically notify users about order status changes
                </Text>

                {Object.entries(settings.orderUpdates).map(([key, value]) => {
                  if (key === "enabled") return null;
                  return (
                    <View key={key} style={styles.subSetting}>
                      <View style={styles.subSettingHeader}>
                        <Text style={styles.subSettingTitle}>
                          {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                        </Text>
                        <Switch
                          value={value.enabled}
                          onValueChange={(enabled) => updateNestedSetting("orderUpdates", key, "enabled", enabled)}
                          trackColor={{ false: "#E2E8F0", true: "#45B7D1" }}
                          thumbColor={value.enabled ? "#fff" : "#f4f3f4"}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Stock Alerts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="inventory" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Stock Alerts</Text>
              <Switch
                value={settings.stockAlerts.enabled}
                onValueChange={(value) => updateSetting("stockAlerts", "enabled", value)}
                trackColor={{ false: "#E2E8F0", true: "#10B981" }}
                thumbColor={settings.stockAlerts.enabled ? "#fff" : "#f4f3f4"}
              />
            </View>

            {settings.stockAlerts.enabled && (
              <View style={styles.sectionContent}>
                <Text style={styles.description}>
                  Notify users when out-of-stock wishlist items are available
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Check interval (minutes):</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={settings.stockAlerts.checkInterval}
                      onValueChange={(value) => updateSetting("stockAlerts", "checkInterval", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="60 minutes" value={60} />
                      <Picker.Item label="120 minutes" value={120} />
                      <Picker.Item label="240 minutes" value={240} />
                      <Picker.Item label="480 minutes" value={480} />
                    </Picker>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Re-engagement */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="favorite" size={24} color="#E91E63" />
              <Text style={styles.sectionTitle}>Re-engagement</Text>
              <Switch
                value={settings.reEngagement.enabled}
                onValueChange={(value) => updateSetting("reEngagement", "enabled", value)}
                trackColor={{ false: "#E2E8F0", true: "#E91E63" }}
                thumbColor={settings.reEngagement.enabled ? "#fff" : "#f4f3f4"}
              />
            </View>

            {settings.reEngagement.enabled && (
              <View style={styles.sectionContent}>
                <Text style={styles.description}>
                  Bring back inactive users with targeted notifications
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Consider inactive after (hours):</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={settings.reEngagement.inactiveAfter}
                      onValueChange={(value) => updateSetting("reEngagement", "inactiveAfter", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="24 hours" value={24} />
                      <Picker.Item label="48 hours" value={48} />
                      <Picker.Item label="72 hours" value={72} />
                      <Picker.Item label="1 week" value={168} />
                    </Picker>
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Weekly reminder after (hours):</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={settings.reEngagement.weeklyReminder}
                      onValueChange={(value) => updateSetting("reEngagement", "weeklyReminder", value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="1 week" value={168} />
                      <Picker.Item label="2 weeks" value={336} />
                      <Picker.Item label="1 month" value={720} />
                    </Picker>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Promotional Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="local-offer" size={24} color="#9C27B0" />
              <Text style={styles.sectionTitle}>Promotional Notifications</Text>
              <Switch
                value={settings.promotions.enabled}
                onValueChange={(value) => updateSetting("promotions", "enabled", value)}
                trackColor={{ false: "#E2E8F0", true: "#9C27B0" }}
                thumbColor={settings.promotions.enabled ? "#fff" : "#f4f3f4"}
              />
            </View>

            {settings.promotions.enabled && (
              <View style={styles.sectionContent}>
                <Text style={styles.description}>
                  Send promotional notifications for sales and offers
                </Text>

                <View style={styles.promotionToggles}>
                  {[
                    { key: "flashSales", label: "Flash Sales" },
                    { key: "weeklyDeals", label: "Weekly Deals" },
                    { key: "seasonalOffers", label: "Seasonal Offers" },
                    { key: "personalizedOffers", label: "Personalized Offers" },
                  ].map(({ key, label }) => (
                    <View key={key} style={styles.promotionToggle}>
                      <Text style={styles.promotionLabel}>{label}</Text>
                      <Switch
                        value={settings.promotions[key]}
                        onValueChange={(value) => updateSetting("promotions", key, value)}
                        trackColor={{ false: "#E2E8F0", true: "#9C27B0" }}
                        thumbColor={settings.promotions[key] ? "#fff" : "#f4f3f4"}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetToDefaults}
            >
              <MaterialIcons name="refresh" size={20} color="#EF4444" />
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveAutomationSettings}
              disabled={saving}
            >
              <LinearGradient
                colors={saving ? ["#ccc", "#ccc"] : ["#ffecd2", "#fcb69f"]}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <MaterialIcons name="save" size={20} color="#fff" />
                )}
                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : "Save Settings"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
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
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  sectionContent: {
    padding: 15,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 15,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    width: 150,
  },
  picker: {
    height: 40,
    width: 150,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    width: 80,
    textAlign: "center",
    fontSize: 14,
  },
  subSetting: {
    marginBottom: 10,
    paddingLeft: 10,
  },
  subSettingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subSettingTitle: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  promotionToggles: {
    marginTop: 10,
  },
  promotionToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  promotionLabel: {
    fontSize: 14,
    color: "#333",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },
  resetButtonText: {
    color: "#EF4444",
    fontWeight: "600",
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default AutomationSettings;
