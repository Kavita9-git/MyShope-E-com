import { View, Text, StyleSheet } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

const DisplayMessage = ({ successMessage, messageType }) => {
  if (successMessage?.includes(messageType)) {
    return (
      <View style={styles.successMessage}>
        <AntDesign
          name="checkcircleo"
          size={20}
          color="#28a745"
          style={styles.messageIcon}
        />
        <Text style={styles.successText}>{successMessage}</Text>
      </View>
    );
  }
};

export default DisplayMessage;

const styles = StyleSheet.create({
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  messageIcon: {
    marginRight: 10,
  },
  successText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#28a745",
  },
});
