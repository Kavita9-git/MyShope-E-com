import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./features/auth/userReducer";
import { productReducer } from "./features/auth/productReducer";
import { cartReducer } from "./features/auth/cartReducer";
import { categoryReducer } from "./features/auth/categoryReducer";
import { orderReducer } from "./features/auth/orderReducer";
import { wishlistReducer } from "./features/auth/wishlistReducer";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";

export const server = "https://nodejsapp-hfpl.onrender.com/api/v1";

// Root persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user", "cart", "wishlist"], // only these will be persisted
};

// Create root reducer
const rootReducer = combineReducers({
  user: userReducer,
  product: productReducer,
  cart: cartReducer,
  category: categoryReducer,
  order: orderReducer,
  wishlist: wishlistReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export { store };
export default store;
