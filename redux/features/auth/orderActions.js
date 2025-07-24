import { server } from "../../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../../utils/axiosConfig";

//GET ALL ORDERS ACTION
export const getAllOrders = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersRequest",
    });
    //HITTING NODE GET ALL ORDERS API REQUEST
    const { data } = await axiosInstance.get(`/order/my-orders`);
    // console.log("getAllOrders data :", data);
    return dispatch({
      type: "getAllOrdersSuccess",
      payload: {
        message: data?.message,
        orders: data?.orders,
      },
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "getAllOrdersFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// CREATE ORDER ACTION
export const createOrder = (orderData) => async (dispatch) => {
  try {
    dispatch({
      type: "createOrderRequest",
    });

    // HITTING NODE CREATE ORDER API REQUEST
    const { data } = await axiosInstance.post(`/order/create`, orderData);

    return dispatch({
      type: "createOrderSuccess",
      payload: {
        message: data?.message,
        order: data?.order,
        orderId: data?.orderId,
      },
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "createOrderFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// PROCESS PAYMENT ACTION
export const processPayment = (paymentData) => async (dispatch) => {
  try {
    dispatch({
      type: "processPaymentRequest",
    });

    // HITTING NODE PAYMENT API REQUEST
    const { data } = await axiosInstance.post(`/order/payments`, paymentData);

    return dispatch({
      type: "processPaymentSuccess",
      payload: {
        clientSecret: data?.client_secret,
        paymentIntentId: data?.paymentIntentId,
        message: data?.message,
      },
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: "processPaymentFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// CLEAR ERRORS AND MESSAGES
export const clearErrors = () => async (dispatch) => {
  dispatch({ type: "clearError" });
};

export const clearMessages = () => async (dispatch) => {
  dispatch({ type: "clearMessage" });
};

export const clearSuccess = () => async (dispatch) => {
  dispatch({ type: "clearSuccess" });
};
