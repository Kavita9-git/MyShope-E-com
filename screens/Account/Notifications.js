import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Layout from "../../components/Layout/Layout";

const Notifications = () => {
  return (
    <Layout>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Text>You dont have any notification yet</Text>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({});

export default Notifications;
