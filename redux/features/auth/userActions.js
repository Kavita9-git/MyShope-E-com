import { server } from "../../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

//FUNCTION LOGIN

//LOGIN ACTION
export const login = (email, password) => async (dispatch) => {
  try {
    // console.log(email);
    dispatch({
      type: "loginRequest",
    });
    //HITTING NODE LOGIN API REQUEST
    const { data } = await axios.post(
      `${server}/user/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    dispatch({
      type: "loginSuccess",
      payload: data,
    });
    await AsyncStorage.setItem("@auth", data?.token);
  } catch (error) {
    dispatch({
      type: "loginFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//REGISTER ACTION
export const register = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "registerRequest",
    });
    //HITTING NODE REGISTER API REQUEST
    const { data } = await axios.post(`${server}/user/register`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch({
      type: "registerSuccess",
      payload: data.message,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "registerFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//GET USER DATA ACTION
export const getUserData = () => async (dispatch) => {
  try {
    // console.log(email);
    dispatch({
      type: "getUserDataRequest",
    });
    //HITTING NODE PROFILE API REQUEST
    const { data } = await axios.get(`${server}/user/profile`);
    dispatch({
      type: "getUserDataSuccess",
      payload: data?.user,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "getUserDataFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//GET ALL USER DATA ACTION
export const getAllUserData = () => async (dispatch) => {
  try {
    // console.log(email);
    dispatch({
      type: "getAllUserDataRequest",
    });
    //HITTING NODE PROFILE API REQUEST
    const { data } = await axios.get(`${server}/user/all-users`, {
      withCredentials: true,
    });
    // console.log("data :", data);
    dispatch({
      type: "getAllUserDataSuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "getAllUserDataFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//UPDATE USER PROFILE ACTION
export const updateProfile = (formData) => async (dispatch) => {
  try {
    // console.log(email);
    dispatch({
      type: "updateProfileRequest",
    });
    //HITTING NODE UPDATE PROFILE API REQUEST
    const { data } = await axios.put(
      `${server}/user/profile-update`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    dispatch({
      type: "updateProfileSuccess",
      payload: data?.message,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "updateProfileFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//UPDATE USER PASSWORD ACTION
export const updatePassword = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "updatePasswordRequest",
    });
    //HITTING NODE UPDATE PASSWORD API REQUEST
    const { data } = await axios.put(
      `${server}/user/update-password`,
      formData
    );
    // console.log(data);
    dispatch({
      type: "updatePasswordSuccess",
      payload: data?.message,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "updatePasswordFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//FORGOT USER PASSWORD OTP VERIFY ACTION
export const forgotPassword = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "forgotPasswordRequest",
    });

    const { data } = await axios.post(`${server}/user/verify-otp`, formData);
    dispatch({
      type: "forgotPasswordSuccess",
      payload: data?.message,
      //payload: data?.otp,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "forgotPasswordFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//UPDATE PROFILE PIC ACTION
export const uploadProfilePic = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "uploadProfilePicRequest",
    });
    //HITTING NODE UPDATE PROFILE PIC API REQUEST
    const { data } = await axios.put(
      `${server}/user/update-picture`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    // console.log(data);
    dispatch({
      type: "uploadProfilePicSuccess",
      payload: data?.message,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "uploadProfilePicFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//CLEAR MESSAGE AND ERROR
export const clearMessage = () => (dispatch) => {
  dispatch({ type: "clearMessage" });
  dispatch({ type: "clearError" });
};

//LOGOUT
export const logout = () => async (dispatch) => {
  try {
    // console.log(email);
    dispatch({
      type: "logoutRequest",
    });
    //HITTING NODE LOGOUT API REQUEST
    const { data } = await axios.get(`${server}/user/logout`);
    dispatch({
      type: "logoutSuccess",
      payload: data?.message,
    });
    await AsyncStorage.removeItem("@auth");
  } catch (error) {
    dispatch({
      type: "logoutFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};
