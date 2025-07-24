import { View, Text, StatusBar, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import BackButton from "./BackButton";
import { useNavigation } from "@react-navigation/native";

const Layout = ({ children, showBackButton = false }) => {
  const navigation = useNavigation();

  // Only show back button if explicitly requested and we can go back
  const canGoBack = navigation.canGoBack();
  const shouldShowBackButton = showBackButton && canGoBack;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      {shouldShowBackButton && <BackButton />}
      <View style={styles.contentContainer}>{children}</View>
      <View style={styles.footer}>
        <Footer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    position: "relative",
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80, // Increased padding to ensure content doesn't hide under footer
    // paddingTop: 10,
  },
  footer: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
    zIndex: 10, // Higher z-index to ensure footer is above all content
    borderColor: "lightgray",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default Layout;
