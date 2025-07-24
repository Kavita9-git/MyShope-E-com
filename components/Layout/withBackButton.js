import React from "react";
import { View, StyleSheet } from "react-native";
import Layout from "./Layout";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Higher-order component that adds back button functionality to screens
 *
 * @param {React.Component} WrappedComponent - The component to wrap with back button functionality
 * @param {Object} options - Optional configuration
 * @param {boolean} options.showBackButton - Whether to show back button (defaults to true)
 * @param {Object} options.layoutProps - Additional props to pass to the Layout component
 * @returns {React.Component} Component with back button
 */
const withBackButton = (
  WrappedComponent,
  { showBackButton = true, layoutProps = {} } = {}
) => {
  const WithBackButton = (props) => {
    return (
      <Layout showBackButton={showBackButton} {...layoutProps}>
        <View style={styles.container}>
          <WrappedComponent {...props} />
        </View>
      </Layout>
    );
  };

  // Set display name for easier debugging
  WithBackButton.displayName = `withBackButton(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithBackButton;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
});

export default withBackButton;
