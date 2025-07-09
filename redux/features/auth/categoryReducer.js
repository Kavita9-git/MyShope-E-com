import { createReducer } from "@reduxjs/toolkit";

export const categoryReducer = createReducer({ token: null }, (builder) => {
  //GET ALL CATEGORY CASE
  builder.addCase("getAllCategoriesRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("getAllCategoriesSuccess", (state, action) => {
    const { message, categories, TotalCategory } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
    state.categories = categories;
  });
  builder.addCase("getAllCategoriesFail", (state, action) => {
    state.isAuth = false;
    state.error = action.payload;
  });

  //CREATE CATEGORY CASE
  builder.addCase("createCategoryRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("createCategorySuccess", (state, action) => {
    state.loading = false;
    state.isAuth = true;
    state.message = action.payload.message;
  });
  builder.addCase("createCategoryFail", (state, action) => {
    state.error = action.payload;
  });

  //UPDATE CATEGORY CASE
  builder.addCase("updateCategoryRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("updateCategorySuccess", (state, action) => {
    const { message } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
  });
  builder.addCase("updateCategoryFail", (state, action) => {
    state.error = action.payload;
  });

  //DELETE CATEGORY CASE
  builder.addCase("deleteCategoryRequest", (state, action) => {
    state.loading = true;
  });
  builder.addCase("deleteCategorySuccess", (state, action) => {
    const { message } = action.payload;
    state.loading = false;
    state.isAuth = true;
    state.message = message;
  });
  builder.addCase("deleteCategoryFail", (state, action) => {
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
