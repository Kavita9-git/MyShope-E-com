import { View, Text, StyleSheet } from "react-native";
import React from "react";

const PriceTable = ({ price, title }) => {
  return (
    <View style={styles.container}>
      <Text
        style={
          title === "Grand Total" ? styles.labelTextBold : styles.labelText
        }
      >
        {title}
      </Text>
      <Text
        style={
          title === "Grand Total" ? styles.priceTextBold : styles.priceText
        }
      >
        ${price.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    alignItems: "center",
    paddingVertical: 8,
  },
  labelText: {
    fontSize: 14,
    color: "#718096",
  },
  priceText: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "500",
  },
  labelTextBold: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "700",
  },
  priceTextBold: {
    fontSize: 18,
    color: "#1E3C72",
    fontWeight: "700",
  },
});

export default PriceTable;
