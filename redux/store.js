import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./features/auth/userReducer";
import { orderReducer } from "./features/auth/orderReducer";
import { cartReducer } from "./features/auth/cartReducer";
import { productReducer } from "./features/auth/productReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { categoryReducer } from "./features/auth/categoryReducer";

// persist only cart
const cartPersistConfig = {
  key: "cart",
  storage: AsyncStorage,
};

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

export default store = configureStore({
  reducer: {
    user: userReducer,
    order: orderReducer,
    cart: persistedCartReducer,
    product: productReducer,
    category: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ignore redux-persist non-serializable actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

//HOST
export const server = "https://nodejsapp-hfpl.onrender.com/api/v1";
// export const server = "http://192.168.8.209:8080/api/v1";
