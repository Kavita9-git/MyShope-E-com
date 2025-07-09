import { server } from "../../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

//GET ALL ORDERS ACTION
export const getAllProducts = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsRequest",
    });
    //HITTING NODE GET ALL ORDERS API REQUEST
    const { data } = await axios.get(`${server}/product/get-all`);
    dispatch({
      type: "getAllProductsSuccess",
      payload: {
        message: data?.message,
        products: data?.products,
      },
    });
  } catch (error) {
    console.log(error);
    dispatch({
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
    const { data } = await axios.post(`${server}/product/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // console.log("data create Product", data);
    dispatch({
      type: "createProductSuccess",
      payload: data,
    });
  } catch (error) {
    console.log("data create Product error", error.response?.data);
    dispatch({
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
    const { data } = await axios.put(
      `${server}/product/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    dispatch({
      type: "updateProductSuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    dispatch({
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
    const { data } = await axios.put(
      `${server}/product/image/${productId}`,
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
    dispatch(getAllProducts());
  } catch (error) {
    console.log(error);
    dispatch({
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
      const { data } = await axios.delete(
        `${server}/product/delete-image/${productId}/?${query}`,
        { withCredentials: true }
      );
      dispatch({
        type: "deleteProductImageSuccess",
        payload: data,
      });
      dispatch(getAllProducts());
    } catch (error) {
      console.log(error);
      dispatch({
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
    const { data } = await axios.delete(
      `${server}/product/delete-image/all/${productId}`,
      {
        withCredentials: true,
      }
    );
    dispatch({
      type: "deleteProductAllImageSuccess",
      payload: data,
    });
    dispatch(getAllProducts());
  } catch (error) {
    console.log(error);
    dispatch({
      type: "deleteProductAllImageFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//DELETE PRODUCT ACTION
export const deleteProduct = (productId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteProductRequest" });

    const { data } = await axios.delete(
      `${server}/product/delete-product/${productId}`,
      {
        withCredentials: true,
      }
    );

    dispatch({ type: "deleteProductSuccess", payload: data });
    // dispatch(getAllProducts());
  } catch (error) {
    console.log(error);
    dispatch({
      type: "deleteProductFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// REVIEW PRODUCT ACTION
export const reviewProduct = (productId, reviewData) => async (dispatch) => {
  try {
    dispatch({ type: "reviewProductRequest" });

    const { data } = await axios.put(
      `${server}/product/${productId}/review`,
      reviewData,
      { withCredentials: true }
    );

    dispatch({
      type: "reviewProductSuccess",
      payload: data.message,
    });

    dispatch(getAllProducts());
  } catch (error) {
    console.log(error);
    dispatch({
      type: "reviewProductFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//CLEAR MESSAGE AND ERROR
export const clearMessage = () => (dispatch) => {
  dispatch({ type: "clearMessage" });
  dispatch({ type: "clearError" });
};
