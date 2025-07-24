import { server } from "../../../redux/store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addToCart } from "./cartActions";
import axiosInstance from "../../../utils/axiosConfig";

// Add to Wishlist
export const addToWishlist = (item) => async (dispatch) => {
  try {
    dispatch({ type: "addToWishlistRequest" });

    // Send request to server to add item to wishlist
    const response = await axiosInstance.post(`/wishlist/add-item`, item);

    if (response.data.success) {
      return dispatch({
        type: "addToWishlistSuccess",
        payload: response.data.wishlist.items,
      });
    }
  } catch (error) {
    console.log(error);
    return dispatch({
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
    const response = await axiosInstance.get(`/wishlist`);

    if (response.data.success) {
      return dispatch({
        type: "getWishlistSuccess",
        payload: response.data.wishlist.items || [],
      });
    }
  } catch (error) {
    return dispatch({
      type: "getWishlistFail",
      payload: error.response?.data?.message || "Failed to fetch wishlist",
    });
  }
};

// Remove from Wishlist
export const removeFromWishlist = (item) => async (dispatch) => {
  try {
    dispatch({ type: "removeFromWishlistRequest" });

    // console.log("Removing item from wishlist:", item);
    const productId = item?.productId?._id || item?.productId;

    if (!productId) {
      throw new Error("Product ID not found in item");
    }

    // For DELETE requests with body data in Axios
    const response = await axiosInstance.delete(
      `/wishlist/remove-item/${productId}`,
      {
        data: {
          size: item?.size || null,
          color: item?.color || null,
        },
      }
    );

    if (response.data.success) {
      return dispatch({
        type: "removeFromWishlistSuccess",
        payload: response.data.wishlist.items,
      });
    }
  } catch (error) {
    console.log("Error removing from wishlist:", error);
    return dispatch({
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

    const productId = item?.productId?._id || item?.productId;

    if (!productId) {
      throw new Error("Product ID not found in item");
    }

    // console.log("Moving to cart:", {
    //   productId,
    //   size: item?.size || null,
    //   color: item?.color || null,
    // });

    // Send request to move item from wishlist to cart
    const response = await axiosInstance.post(
      `/wishlist/move-to-cart/${productId}`,
      {
        size: item?.size || null,
        color: item?.color || null,
      }
    );

    if (response.data.success) {
      return dispatch({
        type: "moveToCartSuccess",
        payload: response.data.wishlist.items,
      });
    }
  } catch (error) {
    console.log("Error moving to cart:", error);
    return dispatch({
      type: "moveToCartFail",
      payload: error.response?.data?.message || "Failed to move to cart",
    });
  }
};

// Clear messages and errors
export const clearWishlistMessage = () => (dispatch) => {
  return dispatch({ type: "clearWishlistMessage" });
};

export const clearWishlistError = () => (dispatch) => {
  return dispatch({ type: "clearWishlistError" });
};
