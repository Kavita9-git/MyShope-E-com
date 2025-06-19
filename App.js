import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; //Its a Hook
import { Provider } from "react-redux";
import Home from "./screens/Home";
import About from "./screens/About";
import ProductDetails from "./screens/ProductDetails";
import Cart from "./screens/Cart";
import Checkout from "./screens/Checkout";
import Payment from "./screens/Payment";
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";
import Account from "./screens/Account/Account";
import Notifications from "./screens/Account/Notifications";
import Profile from "./screens/Account/Profile";
import MyOrders from "./screens/Account/MyOrders";
import Dashboard from "./screens/Admin/Dashboard";
import store from "./redux/store";

//routes
const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="login">
          <Stack.Screen
            name="home"
            component={Home}
            options={{
              headerShown: false, //Hides the header
            }}
          />

          <Stack.Screen name="productDetails" component={ProductDetails} />
          <Stack.Screen name="checkout" component={Checkout} />
          <Stack.Screen name="myorders" component={MyOrders} />
          <Stack.Screen name="profile" component={Profile} />
          <Stack.Screen name="notifications" component={Notifications} />
          <Stack.Screen name="adminpanel" component={Dashboard} />
          <Stack.Screen
            name="login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="register"
            component={Register}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="payment" component={Payment} />
          <Stack.Screen name="account" component={Account} />
          <Stack.Screen name="cart" component={Cart} />
          <Stack.Screen name="mobile" component={About} />
        </Stack.Navigator>
      </NavigationContainer>
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
