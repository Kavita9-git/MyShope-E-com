import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  wishlistItems: [],
  loading: false,
  error: null,
  message: null,
};

export const wishlistReducer = createReducer({ token: null }, (builder) => {
  // Add to wishlist
  builder.addCase("addToWishlistRequest", (state) => {
    state.loading = true;
  });

  builder.addCase("addToWishlistSuccess", (state, action) => {
    // console.log("WISHLIST ADD SUCCESS PAYLOAD:", action.payload);
    state.loading = false;
    state.wishlistItems = Array.isArray(action.payload) ? action.payload : [];
    state.message = "Product added to wishlist";
  });

  builder.addCase("addToWishlistFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

  // Remove from wishlist
  builder.addCase("removeFromWishlistRequest", (state) => {
    state.loading = true;
  });

  builder.addCase("removeFromWishlistSuccess", (state, action) => {
    // console.log("WISHLIST REMOVE SUCCESS PAYLOAD:", action.payload);
    state.loading = false;
    state.wishlistItems = Array.isArray(action.payload) ? action.payload : [];
    state.message = "Product removed from wishlist";
  });

  builder.addCase("removeFromWishlistFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

  // Get wishlist
  builder.addCase("getWishlistRequest", (state) => {
    state.loading = true;
  });

  builder.addCase("getWishlistSuccess", (state, action) => {
    // console.log("WISHLIST GET SUCCESS PAYLOAD:", action.payload);
    state.loading = false;
    state.wishlistItems = Array.isArray(action.payload) ? action.payload : [];
  });

  builder.addCase("getWishlistFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

  // Move to cart
  builder.addCase("moveToCartRequest", (state) => {
    state.loading = true;
  });

  builder.addCase("moveToCartSuccess", (state, action) => {
    // console.log("WISHLIST MOVE SUCCESS PAYLOAD:", action.payload);
    state.loading = false;
    state.wishlistItems = Array.isArray(action.payload) ? action.payload : [];
    state.message = "Product moved to cart";
  });

  builder.addCase("moveToCartFail", (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

  // Clear messages and errors
  builder.addCase("clearWishlistError", (state) => {
    state.error = null;
  });

  builder.addCase("clearWishlistMessage", (state) => {
    state.message = null;
  });
});
