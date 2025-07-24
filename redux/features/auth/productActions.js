import { server } from "../../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../../utils/axiosConfig";

//GET ALL PRODUCTS ACTION
export const getAllProducts = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsRequest",
    });
    // console.log("getAllProducts - fetching from:", `${server}/product/get-all`);

    //HITTING NODE GET ALL PRODUCTS API REQUEST
    const { data } = await axiosInstance.get(`/product/get-all`);
    // console.log("getAllProducts response:", data);

    if (data && data.products) {
      return dispatch({
        type: "getAllProductsSuccess",
        payload: {
          message: data.message || "Products fetched successfully",
          products: data.products,
        },
      });
    } else {
      throw new Error("Invalid response format from API");
    }
  } catch (error) {
    console.log("getAllProducts error:", error);
    return dispatch({
      type: "getAllProductsFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//CREATE PRODUCT ACTION
export const createProduct = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "createProductRequest",
    });
    //HITTING NODE CREATE ORDER API REQUEST
    const { data } = await axiosInstance.post(`/product/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // console.log("data create Product", data);

    return dispatch({
      type: "createProductSuccess",
      payload: data,
    });
  } catch (error) {
    console.log("data create Product error", error.response?.data);
    return dispatch({
      type: "createProductFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//UPDATE PRODUCT ACTION
export const updateProduct = (productId, formData) => async (dispatch) => {
  try {
    dispatch({
      type: "updateProductRequest",
    });
    //HITTING NODE UPDATE ORDER API REQUEST
    const { data } = await axiosInstance.put(
      `/product/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return dispatch({
      type: "updateProductSuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "updateProductFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//UPDATE PRODUCT IMAGE ACTION
export const updateProductImage = (productId, formData) => async (dispatch) => {
  try {
    dispatch({
      type: "updateProductImageRequest",
    });
    //HITTING NODE UPDATE ORDER API REQUEST
    const { data } = await axiosInstance.put(
      `/product/image/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    dispatch({
      type: "updateProductImageSuccess",
      payload: data,
    });
    return dispatch(getAllProducts());
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "updateProductImageFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//DELETE PRODUCT IMAGE ACTION
export const deleteProductImage =
  (productId, img, color = null) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "deleteProductImageRequest",
      });
      const query = `imageUrl=${encodeURIComponent(img)}${
        color ? `&color=${encodeURIComponent(color)}` : ""
      }`;

      //HITTING NODE UPDATE ORDER API REQUEST
      const { data } = await axiosInstance.delete(
        `/product/delete-image/${productId}/?${query}`
      );
      dispatch({
        type: "deleteProductImageSuccess",
        payload: data,
      });
      return dispatch(getAllProducts());
    } catch (error) {
      console.log(error);
      return dispatch({
        type: "deleteProductImageFail",
        payload: error.response?.data?.message || error.message,
      });
    }
  };

//DELETE PRODUCT ALL IMAGE ACTION
export const deleteAllProductImages = (productId) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteProductAllImageRequest",
    });
    //HITTING NODE UPDATE ORDER API REQUEST
    const { data } = await axiosInstance.delete(
      `/product/delete-image/all/${productId}`
    );
    dispatch({
      type: "deleteProductAllImageSuccess",
      payload: data,
    });
    return dispatch(getAllProducts());
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "deleteProductAllImageFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//DELETE PRODUCT ACTION
export const deleteProduct = (productId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteProductRequest" });

    const { data } = await axiosInstance.delete(
      `/product/delete-product/${productId}`
    );

    return dispatch({ type: "deleteProductSuccess", payload: data });
    // dispatch(getAllProducts());
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "deleteProductFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// REVIEW PRODUCT ACTION
export const reviewProduct = (productId, reviewData) => async (dispatch) => {
  try {
    dispatch({ type: "reviewProductRequest" });

    const { data } = await axiosInstance.put(
      `/product/${productId}/review`,
      reviewData
    );

    dispatch({
      type: "reviewProductSuccess",
      payload: data.message,
    });

    return dispatch(getAllProducts());
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "reviewProductFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//CLEAR MESSAGE AND ERROR
export const clearMessage = () => (dispatch) => {
  dispatch({ type: "clearMessage" });
  return dispatch({ type: "clearError" });
};
