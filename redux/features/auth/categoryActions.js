import { server } from "../../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

//GET ALL CATEGORY ACTION
export const getAllCategories = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllCategoriesRequest",
    });
    //HITTING NODE GET ALL CATEGORY API REQUEST
    const { data } = await axios.get(`${server}/category/get-all`);
    dispatch({
      type: "getAllCategoriesSuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "getAllCategoriesFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//CREATE CATEGORY ACTION
export const createCategory = (category) => async (dispatch) => {
  try {
    dispatch({
      type: "createCategoryRequest",
    });
    //HITTING NODE CREATE CATEGORY API REQUEST
    const { data } = await axios.post(`${server}/category/create`, {
      category,
    });
    dispatch({
      type: "createCategorySuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    dispatch({
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
    const { data } = await axios.post(
      `${server}/category/update/${categoryId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    dispatch({
      type: "updateCategorySuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    dispatch({
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
    const { data } = await axios.delete(
      `${server}/category/delete/${categoryId}`
    );
    dispatch({
      type: "deleteCategorySuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "deleteCategoryFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//CLEAR MESSAGE AND ERROR
export const clearMessage = () => (dispatch) => {
  dispatch({ type: "clearMessage" });
  dispatch({ type: "clearError" });
};
