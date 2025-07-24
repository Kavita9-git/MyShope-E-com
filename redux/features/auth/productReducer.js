import { createReducer } from "@reduxjs/toolkit";

export const productReducer = createReducer({ token: null }, (builder) => {
  //GET ALL PRODUCT CASE
  builder.addCase("getAllProductsRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("getAllProductsSuccess", (state, action) => {
    const { message, products, totalProducts } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
    state.products = products;
  });
  builder.addCase("getAllProductsFail", (state, action) => {
    state.isAuth = false;
    state.error = action.payload;
  });

  //CREATE PRODUCT CASE
  builder.addCase("createProductRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("createProductSuccess", (state, action) => {
    state.loading = false;
    state.isAuth = true;
    state.message = action.payload.message;
  });
  builder.addCase("createProductFail", (state, action) => {
    state.error = action.payload;
  });

  //UPDATE PRODUCT CASE
  builder.addCase("updateProductRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("updateProductSuccess", (state, action) => {
    const { product, message } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
    state.product = product;
    console.log("updateProductSuccess msg :", message);
  });
  builder.addCase("updateProductFail", (state, action) => {
    state.error = action.payload;
  });

  //UPDATE PRODUCT IMAGE CASE
  builder.addCase("updateProductImageRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("updateProductImageSuccess", (state, action) => {
    const { product, message } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
    state.product = product;
  });
  builder.addCase("updateProductImageFail", (state, action) => {
    const { error, message } = action.payload;
    state.error = error;
  });

  //DELETE PRODUCT IMAGE CASE
  builder.addCase("deleteProductImageRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("deleteProductImageSuccess", (state, action) => {
    const { product, message } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
    state.product = product;
  });
  builder.addCase("deleteProductImageFail", (state, action) => {
    const { error, message } = action.payload;
    state.error = error;
    state.message = message;
    console.log(state.message);
    console.log(state.error);
  });

  //DELETE PRODUCT CASE
  builder.addCase("deleteProductRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("deleteProductSuccess", (state, action) => {
    const { message } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
  });
  builder.addCase("deleteProductFail", (state, action) => {
    state.error = action.payload;
  });

  // REVIEW PRODUCT CASE
  builder.addCase("reviewProductRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("reviewProductSuccess", (state, action) => {
    const { message, product } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
    state.product = product;
  });
  builder.addCase("reviewProductFail", (state, action) => {
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
