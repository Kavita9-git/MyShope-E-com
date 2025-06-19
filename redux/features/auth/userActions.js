import { server } from "../../store";
import axios from "axios";

//FUNCTION LOGIN
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
      payload: data?.message,
    });
  } catch (error) {
    dispatch({
      type: "loginFail",
      payload: error.response.data.message,
    });
  }
};
