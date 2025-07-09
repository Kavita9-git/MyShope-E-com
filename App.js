import { createNativeStackNavigator } from "@react-navigation/native-stack"; //Its a Hook
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/store";
import Main from "./Main";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <Main />
        <Toast
          config={{
            customType: ({ text1, text2 }) => (
              <View
                style={{
                  padding: 20,
                  backgroundColor: "purple",
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {text1}
                </Text>
                <Text style={{ color: "white", fontSize: 20 }}>{text2}</Text>
              </View>
            ),
          }}
        />
      </PersistGate>
    </Provider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
