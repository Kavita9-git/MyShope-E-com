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

  // CREATE ORDER CASES
  builder.addCase("createOrderRequest", (state) => {
    state.loading = true;
    state.success = false;
    state.error = null;
  });
  builder.addCase("createOrderSuccess", (state, action) => {
    const { message, order } = action.payload;
    state.loading = false;
    state.message = message;
    state.order = order;
    state.success = true;
  });
  builder.addCase("createOrderFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.success = false;
  });

  // PAYMENT CASES
  builder.addCase("processPaymentRequest", (state) => {
    state.paymentLoading = true;
  });
  builder.addCase("processPaymentSuccess", (state, action) => {
    const { clientSecret, message } = action.payload;
    state.paymentLoading = false;
    state.clientSecret = clientSecret;
    state.message = message;
    state.paymentSuccess = true;
  });
  builder.addCase("processPaymentFail", (state, action) => {
    state.paymentLoading = false;
    state.error = action.payload;
    state.paymentSuccess = false;
  });

  //ERROR MESSAGE CASE
  builder.addCase("clearError", (state) => {
    state.error = null;
  });
  builder.addCase("clearMessage", (state) => {
    state.message = null;
  });
  builder.addCase("clearSuccess", (state) => {
    state.success = false;
  });
});
