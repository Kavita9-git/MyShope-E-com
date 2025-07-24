import { server } from "../../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../../utils/axiosConfig";

//FUNCTION LOGIN

//LOGIN ACTION
export const login = (email, password) => async (dispatch) => {
  console.log("[userActions] Login called with email:", email);
  try {
    console.log("[userActions] Dispatching loginRequest");
    dispatch({
      type: "loginRequest",
    });

    //HITTING NODE LOGIN API REQUEST
    console.log("[userActions] Sending login request to server");
    const { data } = await axios.post(
      `${server}/user/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      "[userActions] Login success data received:",
      data?.token ? "Token received" : "No token in response"
    );

    console.log("[userActions] Dispatching loginSuccess");
    dispatch({
      type: "loginSuccess",
      payload: data,
    });

    // Store token in AsyncStorage for Bearer token auth
    console.log("[userActions] Storing token in AsyncStorage");
    await AsyncStorage.setItem("@auth", data?.token);

    // Set token for current session
    console.log("[userActions] Setting authorization headers");
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${data.token}`;

    console.log("[userActions] Clearing previous messages");
    dispatch(clearMessage());

    // Make sure we clear the showLogin flag if it somehow persists
    console.log("[userActions] Ensuring showLogin flag is cleared");
    await AsyncStorage.removeItem("@showLogin");

    return data;
  } catch (error) {
    console.log(
      "[userActions] Login error:",
      error.response?.data || error.message
    );

    // Extract the error message from the response
    const errorMessage =
      error.response?.data?.message ||
      "Login failed. Please check your credentials.";

    console.log("[userActions] Error message being dispatched:", errorMessage);

    return dispatch({
      type: "loginFail",
      payload: errorMessage,
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
    const { data } = await axiosInstance.post(`/user/register`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return dispatch({
      type: "registerSuccess",
      payload: data.message,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "registerFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//GET USER DATA ACTION
export const getUserData = () => async (dispatch) => {
  try {
    dispatch({
      type: "getUserDataRequest",
    });
    //HITTING NODE PROFILE API REQUEST
    const { data } = await axiosInstance.get(`/user/profile`);

    return dispatch({
      type: "getUserDataSuccess",
      payload: data?.user,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "getUserDataFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//GET ALL USER DATA ACTION
export const getAllUserData = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllUserDataRequest",
    });
    console.log("Users data Actions called");
    //HITTING NODE PROFILE API REQUEST
    const { data } = await axiosInstance.get(`/user/all-users`, {
      withCredentials: true,
    });
    console.log("Users data Actions:", data);
    return dispatch({
      type: "getAllUserDataSuccess",
      payload: data,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "getAllUserDataFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//UPDATE USER PROFILE ACTION
export const updateProfile = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "updateProfileRequest",
    });
    //HITTING NODE UPDATE PROFILE API REQUEST
    const { data } = await axiosInstance.put(`/user/profile-update`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return dispatch({
      type: "updateProfileSuccess",
      payload: data?.message,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
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
    const { data } = await axiosInstance.put(`/user/update-password`, formData);
    return dispatch({
      type: "updatePasswordSuccess",
      payload: data?.message,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
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
    const { data } = await axios.post(`/user/verify-otp`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return dispatch({
      type: "forgotPasswordSuccess",
      payload: data?.message,
    });
  } catch (error) {
    console.log("error response funcc:", error.response);
    console.log(error);
    return dispatch({
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
    const { data } = await axiosInstance.put(`/user/update-picture`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return dispatch({
      type: "uploadProfilePicSuccess",
      payload: data?.message,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "uploadProfilePicFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// UPDATE SAVED ADDRESSES ACTION
export const updateSavedAddresses = (addresses) => async (dispatch) => {
  console.log(
    "[userActions] updateSavedAddresses called with",
    addresses.length,
    "addresses"
  );
  try {
    console.log("[userActions] Dispatching updateSavedAddressesRequest");
    dispatch({
      type: "updateSavedAddressesRequest",
    });

    // HITTING NODE UPDATE SAVED ADDRESSES API REQUEST
    console.log("[userActions] Sending addresses to API");
    const { data } = await axiosInstance.put(
      `/user/update-saved-addresses`,
      { savedAddresses: addresses },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("[userActions] updateSavedAddresses API response:", data);

    return dispatch({
      type: "updateSavedAddressesSuccess",
      payload: {
        // message: data?.message,
        savedAddresses: addresses,
      },
    });
  } catch (error) {
    console.log(
      "[userActions] updateSavedAddresses error:",
      error.response?.data || error.message
    );
    return dispatch({
      type: "updateSavedAddressesFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//CLEAR MESSAGE AND ERROR
export const clearMessage = () => (dispatch) => {
  console.log("[userActions] clearMessage called");
  dispatch({ type: "clearMessage" });
  return dispatch({ type: "clearError" });
};

//LOGOUT
export const logout = () => async (dispatch) => {
  console.log("[userActions] logout called");
  try {
    console.log("[userActions] Dispatching logoutRequest");
    dispatch({
      type: "logoutRequest",
    });
    //HITTING NODE LOGOUT API REQUEST
    const { data } = await axiosInstance.get(`/user/logout`);
    console.log("[userActions] logout API response:", data);

    // Clear token from storage
    console.log("[userActions] Removing auth token from AsyncStorage");
    await AsyncStorage.removeItem("@auth");

    // Clear token from axios headers
    console.log("[userActions] Clearing auth headers from axios instances");
    delete axios.defaults.headers.common["Authorization"];
    delete axiosInstance.defaults.headers.common["Authorization"];

    dispatch({
      type: "logoutSuccess",
      payload: data?.message,
    });
    return data;
  } catch (error) {
    console.log(
      "[userActions] logout error:",
      error.response?.data || error.message
    );
    return dispatch({
      type: "logoutFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// GET ALL USERS - ADMIN
export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllUsersRequest",
    });

    const { data } = await axiosInstance.get("/users/all-users");

    dispatch({
      type: "getAllUsersSuccess",
      payload: data.users,
    });
  } catch (error) {
    dispatch({
      type: "getAllUsersFail",
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};

// BLOCK/UNBLOCK USER - ADMIN
export const blockUser = (userId, blocked) => async (dispatch) => {
  try {
    dispatch({
      type: "blockUserRequest",
    });

    const { data } = await axiosInstance.put(
      `/user/admin/users/${userId}/block`,
      {
        blocked,
      }
    );

    dispatch({
      type: "blockUserSuccess",
      payload: data,
    });

    // Refresh users list after blocking/unblocking
    dispatch(getAllUserData());
  } catch (error) {
    dispatch({
      type: "blockUserFail",
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};

// DELETE USER - ADMIN
export const deleteUser = (userId) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteUserRequest",
    });

    const { data } = await axiosInstance.delete(`/user/admin/users/${userId}`);

    dispatch({
      type: "deleteUserSuccess",
      payload: data,
    });

    // Refresh users list after deletion
    dispatch(getAllUserData());
  } catch (error) {
    dispatch({
      type: "deleteUserFail",
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};

// UPDATE USER ROLE - ADMIN
export const updateUserRole = (userId, role) => async (dispatch) => {
  try {
    dispatch({
      type: "updateUserRoleRequest",
    });

    const { data } = await axiosInstance.put(
      `/user/admin/users/${userId}/role`,
      {
        role,
      }
    );

    dispatch({
      type: "updateUserRoleSuccess",
      payload: data,
    });

    // Refresh users list after role update
    dispatch(getAllUserData());
  } catch (error) {
    dispatch({
      type: "updateUserRoleFail",
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};
