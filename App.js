import { createNativeStackNavigator } from "@react-navigation/native-stack"; //Its a Hook
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/store";
import Main from "./Main";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";
import AntDesign from "react-native-vector-icons/AntDesign";

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
                <AntDesign name="checkcircleo" size={20} color="#28a745" />
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {text1}
                </Text>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  {text2}
                </Text>
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
