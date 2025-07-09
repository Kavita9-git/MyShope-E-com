import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; //Its a Hook
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
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EditPassword from "./screens/Account/EditPassword";
import ForgotPassword from "./screens/Account/ForgotPassword";
import UploadProfilePic from "./screens/Account/UploadProfilePic";
import ManageProducts from "./screens/Admin/ManageProducts";
import CreateProduct from "./screens/Admin/Products/CreateProduct";
import ManageCategories from "./screens/Admin/ManageCategories";
import CreateCategory from "./screens/Admin/Categories/CreateCategory";
import UpdateCategory from "./screens/Admin/Categories/UpdateCategory";
import DeleteCategory from "./screens/Admin/Categories/DeleteCategory";
import UpdateProducts from "./screens/Admin/Products/UpdateProducts";
import UpdateImageProducts from "./screens/Admin/Products/UpdateImageProducts";
import DeleteImageProduct from "./screens/Admin/Products/DeleteImageProduct";
import DeleteProduct from "./screens/Admin/Products/DeleteProduct";
import CreateProductReviewsComments from "./screens/Admin/Products/CreateProductReviewsComments";
import ManageOrders from "./screens/Admin/ManageOrders";
import UpdatedeleteOrders from "./screens/Admin/Orders/UpdatedeleteOrders";

//routes
const Stack = createNativeStackNavigator();

export default function Main() {
  const [isAuth, setIsAuth] = useState(null);
  //GET USER
  useEffect(() => {
    const getUserLocalData = async () => {
      let data = await AsyncStorage.getItem("@auth");
      setIsAuth(data);
      //   let loginData = JSON.parse(data);
      console.log("Login User Data ==>", data);
    };
    getUserLocalData();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">
        <Stack.Screen
          name="home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="productDetails" component={ProductDetails} />
        <Stack.Screen name="checkout" component={Checkout} />
        <Stack.Screen name="myorders" component={MyOrders} />
        <Stack.Screen name="profile" component={Profile} />
        <Stack.Screen name="editpassword" component={EditPassword} />
        <Stack.Screen name="forgotpassword" component={ForgotPassword} />
        <Stack.Screen name="uploadprofilepic" component={UploadProfilePic} />
        <Stack.Screen name="notifications" component={Notifications} />
        <Stack.Screen name="payment" component={Payment} />
        <Stack.Screen name="account" component={Account} />
        <Stack.Screen name="cart" component={Cart} />
        <Stack.Screen name="mobile" component={About} />
        {/* //ADMIN PAGES */}
        <Stack.Screen name="adminPanel" component={Dashboard} />

        {/* //ADMIN CATEGORIES */}
        <Stack.Screen name="managecategories" component={ManageCategories} />
        <Stack.Screen name="createcategories" component={CreateCategory} />
        <Stack.Screen name="updatecategories" component={UpdateCategory} />
        <Stack.Screen name="deletecategories" component={DeleteCategory} />

        {/* //ADMIN PRODUCTS */}
        <Stack.Screen name="manageproducts" component={ManageProducts} />
        <Stack.Screen name="createproducts" component={CreateProduct} />
        <Stack.Screen name="updateproducts" component={UpdateProducts} />
        <Stack.Screen
          name="updateimageproducts"
          component={UpdateImageProducts}
        />
        <Stack.Screen
          name="deleteimageproducts"
          component={DeleteImageProduct}
        />
        <Stack.Screen name="deleteproducts" component={DeleteProduct} />
        <Stack.Screen
          name="createproductsreviewcomment"
          component={CreateProductReviewsComments}
        />

        {/* //ADMIN ORDERS */}
        <Stack.Screen name="manageorders" component={ManageOrders} />
        <Stack.Screen
          name="updatedeleteorders"
          component={UpdatedeleteOrders}
        />

        {!isAuth && <></>}

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
