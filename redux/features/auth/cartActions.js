import { server } from "../../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const addToCart = (item) => async (dispatch) => {
  try {
    dispatch({ type: "addToCartRequest" });

    const { data } = await axios.post(`${server}/cart/add`, item, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch({
      type: "addToCartSuccess",
      payload: data?.cart?.items,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "addToCartFail",
      payload: error.response?.data?.message || "Failed to add to cart",
    });
  }
};

// ➤ Get Cart from server
export const getCart = () => async (dispatch) => {
  try {
    dispatch({ type: "getCartRequest" });

    const token = await AsyncStorage.getItem("token");

    const { data } = await axios.get(`${server}/cart`);

    dispatch({
      type: "getCartSuccess",
      payload: data.cart.items,
    });
  } catch (error) {
    dispatch({
      type: "getCartFail",
      payload: error.response?.data?.message || "Failed to fetch cart",
    });
  }
};

export const increaseQty = (productId) => async (dispatch) => {
  try {
    dispatch({ type: "increaseQtyRequest" });

    const { data } = await axios.put(`${server}/cart/increase/${productId}`);

    dispatch({
      type: "increaseQtySuccess",
      payload: data.cart.items,
    });
    dispatch(getCart());
  } catch (error) {
    dispatch({
      type: "increaseQtyFail",
      payload: error.response?.data?.message || "Failed to increase quantity",
    });
  }
};

export const decreaseQty = (productId) => async (dispatch) => {
  try {
    dispatch({ type: "decreaseQtyRequest" });

    const { data } = await axios.put(`${server}/cart/decrease/${productId}`);

    dispatch({
      type: "decreaseQtySuccess",
      payload: data.cart.items,
    });
    dispatch(getCart());
  } catch (error) {
    dispatch({
      type: "decreaseQtyFail",
      payload: error.response?.data?.message || "Failed to decrease quantity",
    });
  }
};

// ➤ Remove Item from Cart (server + redux)
export const removeFromCart = (productId) => async (dispatch) => {
  try {
    dispatch({ type: "removeFromCartRequest" });

    const { data } = await axios.delete(`${server}/cart/remove/${productId}`);

    dispatch({
      type: "removeFromCartSuccess",
      payload: data.cart.items,
    });
  } catch (error) {
    dispatch({
      type: "removeFromCartFail",
      payload: error.response?.data?.message || "Failed to remove from cart",
    });
  }
};

// ➤ Clear Cart (server + redux)
export const clearCart = () => async (dispatch) => {
  try {
    dispatch({ type: "clearCartRequest" });

    const token = await AsyncStorage.getItem("token");

    await axios.delete(`${server}/cart/clear`);

    dispatch({ type: "clearCartSuccess" });
  } catch (error) {
    dispatch({
      type: "clearCartFail",
      payload: error.response?.data?.message || "Failed to clear cart",
    });
  }
};

export const adjustPreCartQty = (productId, type) => (dispatch, getState) => {
  const { cart } = getState();
  const existing = cart.items.find((i) => i.productId === productId);
  const currentQty = existing?.quantity || 1;

  if (type === "increase") {
    const newQty = currentQty + 1;
    dispatch({
      type: "setProductQtyBeforeAdd",
      payload: { productId, quantity: newQty },
    });
  } else if (type === "decrease" && currentQty > 1) {
    const newQty = currentQty - 1;
    dispatch({
      type: "setProductQtyBeforeAdd",
      payload: { productId, quantity: newQty },
    });
  }
};

export const setCartFromServer = (cartItems) => (dispatch) => {
  dispatch({
    type: "setCartFromServer",
    payload: cartItems,
  });
};

export const clearMessage = () => (dispatch) => {
  dispatch({ type: "clearMessage" });
};

export const clearError = () => (dispatch) => {
  dispatch({ type: "clearError" });
};
