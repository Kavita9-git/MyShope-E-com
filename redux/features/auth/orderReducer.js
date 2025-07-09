import { createReducer } from "@reduxjs/toolkit";

export const orderReducer = createReducer({ token: null }, (builder) => {
  //ORDERS CASE
  builder.addCase("getAllOrdersRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("getAllOrdersSuccess", (state, action) => {
    const { message, orders, totalOrders } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
    state.orders = orders;
  });
  builder.addCase("getAllOrdersFail", (state, action) => {
    state.isAuth = false;
    state.error = action.payload;
  });

  //ERROR MESSAGE CASE
  builder.addCase("clearError", (state) => {
    state.error = null;
  });
  builder.addCase("clearMessage", (state) => {
    state.message = null;
  });
});
