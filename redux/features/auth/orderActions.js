import { server } from "../../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

//GET ALL ORDERS ACTION
export const getAllOrders = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersRequest",
    });
    //HITTING NODE GET ALL ORDERS API REQUEST
    const { data } = await axios.get(`${server}/order/my-orders`);
    // console.log("getAllOrders data :", data);
    dispatch({
      type: "getAllOrdersSuccess",
      payload: {
        message: data?.message,
        orders: data?.orders,
      },
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "getAllOrdersFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};
