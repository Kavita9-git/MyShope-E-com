import { server } from "../../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../../utils/axiosConfig";

//GET ALL CATEGORY ACTION
export const getAllCategories = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllCategoriesRequest",
    });
    //HITTING NODE GET ALL CATEGORY API REQUEST
    const { data } = await axiosInstance.get(`/category/get-all`);
    return dispatch({
      type: "getAllCategoriesSuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "getAllCategoriesFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//CREATE CATEGORY ACTION
export const createCategory =
  (category, subcategories = []) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "createCategoryRequest",
      });
      //HITTING NODE CREATE CATEGORY API REQUEST
      const { data } = await axiosInstance.post(`/category/create`, {
        category,
        subcategories,
      });
      return dispatch({
        type: "createCategorySuccess",
        payload: data,
      });
    } catch (error) {
      console.log(error);
      return dispatch({
        type: "createCategoryFail",
        payload: error.response?.data?.message || error.message,
      });
    }
  };

//UPDATE CATEGORY ACTION
export const updateCategory = (categoryId, formData) => async (dispatch) => {
  try {
    dispatch({
      type: "updateCategoryRequest",
    });
    //HITTING NODE UPDATE CATEGORY API REQUEST
    console.log("updateCategory formData:", formData);
    console.log(
      "subcategories in request:",
      JSON.stringify(formData.subcategories)
    );
    const { data } = await axiosInstance.post(
      `/category/update/${categoryId}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response from server:", data);
    return dispatch({
      type: "updateCategorySuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "updateCategoryFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//DELETE CATEGORY ACTION
export const deleteCategory = (categoryId) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteCategoryRequest",
    });
    //HITTING NODE DELETE CATEGORY API REQUEST
    const { data } = await axiosInstance.delete(
      `/category/delete/${categoryId}`
    );
    return dispatch({
      type: "deleteCategorySuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "deleteCategoryFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//CLEAR MESSAGE AND ERROR
export const clearMessage = () => (dispatch) => {
  dispatch({ type: "clearMessage" });
  return dispatch({ type: "clearError" });
};
