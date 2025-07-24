import React from "react";
import { View, Text } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const StarRating = ({ rating, size }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View
          key={index}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Text style={{ fontSize: size, fontWeight: "bold", marginRight: 4 }}>
            {index + 1}
          </Text>
          <MaterialIcons
            name={index < rating ? "star" : "staro"}
            size={size}
            color="#FFB800"
          />
        </View>
      ))}
    </View>
  );
};

export default StarRating;
