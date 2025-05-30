import { View, Text, StyleSheet } from "react-native";
import React from "react";

const PriceTable = ({ price, title }) => {
  return (
    <View style={stlyes.conatiner}>
      <Text>{title}</Text>
      <Text>{price} $</Text>
    </View>
  );
};

const stlyes = StyleSheet.create({
  conatiner: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    alignItems: "center",
  },
});

export default PriceTable;
