import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PaymentSelector = ({ selectedMethod, setSelectedMethod }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        <Icon name="credit-card" size={18} color="#1e3c72" /> Payment Method
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedMethod === "COD" && styles.selectedOption,
          ]}
          onPress={() => setSelectedMethod("COD")}
        >
          <Icon
            name="cash"
            size={24}
            color={selectedMethod === "COD" ? "#1e3c72" : "#666"}
          />
          <Text
            style={[
              styles.optionText,
              selectedMethod === "COD" && styles.selectedOptionText,
            ]}
          >
            Cash on Delivery
          </Text>
          {selectedMethod === "COD" && (
            <Icon
              name="check-circle"
              size={20}
              color="#1e3c72"
              style={styles.checkIcon}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedMethod === "ONLINE" && styles.selectedOption,
          ]}
          onPress={() => setSelectedMethod("ONLINE")}
        >
          <Icon
            name="credit-card-outline"
            size={24}
            color={selectedMethod === "ONLINE" ? "#1e3c72" : "#666"}
          />
          <Text
            style={[
              styles.optionText,
              selectedMethod === "ONLINE" && styles.selectedOptionText,
            ]}
          >
            Credit / Debit Card
          </Text>
          {selectedMethod === "ONLINE" && (
            <Icon
              name="check-circle"
              size={20}
              color="#1e3c72"
              style={styles.checkIcon}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
    flexDirection: "row",
    alignItems: "center",
  },
  optionsContainer: {
    marginBottom: 10,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedOption: {
    borderColor: "#1e3c72",
    backgroundColor: "rgba(30, 60, 114, 0.05)",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    color: "#333",
  },
  selectedOptionText: {
    fontWeight: "600",
    color: "#1e3c72",
  },
  checkIcon: {
    marginLeft: "auto",
  },
});

export default PaymentSelector;
