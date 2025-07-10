import { server } from "../../../redux/store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addToCart } from "./cartActions";

// Add to Wishlist
export const addToWishlist = (item) => async (dispatch) => {
  try {
    dispatch({ type: "addToWishlistRequest" });

    // Send request to server to add item to wishlist
    const response = await axios.post(`${server}/wishlist/add-item`, item, {
      withCredentials: true,
    });

    if (response.data.success) {
      dispatch({
        type: "addToWishlistSuccess",
        payload: response.data.wishlist.items,
      });
    }
  } catch (error) {
    console.log(error);
    dispatch({
      type: "addToWishlistFail",
      payload: error.response?.data?.message || "Failed to add to wishlist",
    });
  }
};

// Get Wishlist
export const getWishlist = () => async (dispatch) => {
  try {
    dispatch({ type: "getWishlistRequest" });

    // Get wishlist from server
    const response = await axios.get(`${server}/wishlist`, {
      withCredentials: true,
    });

    if (response.data.success) {
      dispatch({
        type: "getWishlistSuccess",
        payload: response.data.wishlist.items || [],
      });
    }
  } catch (error) {
    dispatch({
      type: "getWishlistFail",
      payload: error.response?.data?.message || "Failed to fetch wishlist",
    });
  }
};

// Remove from Wishlist
export const removeFromWishlist =
  (productId, size = null, color = null) =>
  async (dispatch) => {
    try {
      dispatch({ type: "removeFromWishlistRequest" });

      // Build query params for size and color if they exist
      let queryParams = "";
      if (size && color) {
        queryParams = `?size=${size}&color=${color}`;
      }

      // Remove item from wishlist on server
      const response = await axios.delete(
        `${server}/wishlist/remove-item/${productId}${queryParams}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        dispatch({
          type: "removeFromWishlistSuccess",
          payload: response.data.wishlist.items,
        });
      }
    } catch (error) {
      dispatch({
        type: "removeFromWishlistFail",
        payload:
          error.response?.data?.message || "Failed to remove from wishlist",
      });
    }
  };

// Move to Cart
export const moveToCart = (item) => async (dispatch) => {
  try {
    dispatch({ type: "moveToCartRequest" });

    // Build query params for size and color if they exist
    let queryParams = "";
    if (item.size && item.color) {
      queryParams = `?size=${item.size}&color=${item.color}`;
    }

    // Send request to move item from wishlist to cart
    const response = await axios.post(
      `${server}/wishlist/move-to-cart/${item.productId}${queryParams}`,
      {},
      { withCredentials: true }
    );

    if (response.data.success) {
      dispatch({
        type: "moveToCartSuccess",
        payload: response.data.wishlist.items,
      });
    }
  } catch (error) {
    dispatch({
      type: "moveToCartFail",
      payload: error.response?.data?.message || "Failed to move to cart",
    });
  }
};

// Clear messages and errors
export const clearWishlistMessage = () => (dispatch) => {
  dispatch({ type: "clearWishlistMessage" });
};

export const clearWishlistError = () => (dispatch) => {
  dispatch({ type: "clearWishlistError" });
};
