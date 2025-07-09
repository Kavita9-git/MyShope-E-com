import { createReducer } from "@reduxjs/toolkit";

export const cartReducer = createReducer(
  {
    items: [], // each item: { productId, name, price, quantity }
    message: null,
    error: null,
  },
  (builder) => {
    // ADD TO CART
    builder.addCase("addToCartRequest", (state, action) => {
      state.loading = true;
    });

    builder.addCase("addToCartSuccess", (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.message = "Item added to cart";
    });

    builder.addCase("addToCartFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // GET CART
    builder.addCase("getCartRequest", (state, action) => {
      state.loading = true;
    });

    builder.addCase("getCartSuccess", (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });

    builder.addCase("getCartFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    //INCREASE QUANTITY
    builder.addCase("increaseQtyRequest", (state, action) => {
      state.loading = true;
    });

    builder.addCase("increaseQtySuccess", (state, action) => {
      state.loading = false;
      state.items = action.payload; // update items with latest cart from server
      state.message = "Quantity increased";
    });

    builder.addCase("increaseQtyFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Decrease Qty
    builder.addCase("decreaseQtyRequest", (state) => {
      state.loading = true;
    });
    builder.addCase("decreaseQtySuccess", (state, action) => {
      state.loading = false;
      state.items = action.payload; // update items with latest cart from server
      state.message = "Quantity decreased";
    });
    builder.addCase("decreaseQtyFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // REMOVE ITEMS CART
    builder.addCase("removeFromCartRequest", (state, action) => {
      state.loading = true;
    });

    builder.addCase("removeFromCartSuccess", (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.message = "Item removed from cart";
    });

    builder.addCase("removeFromCartFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // CLEAR CART
    builder.addCase("clearCartRequest", (state, action) => {
      state.loading = true;
    });

    builder.addCase("clearCartSuccess", (state, action) => {
      state.loading = false;
      state.items = [];
      state.message = "Cart cleared";
    });

    builder.addCase("clearCartFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // CLEAR MESSAGES / ERRORS
    builder.addCase("clearError", (state) => {
      state.error = null;
    });
    builder.addCase("clearMessage", (state) => {
      state.message = null;
    });

    // SET PRODUCT QTY BEFORE ADD TO CART
    builder.addCase("setProductQtyBeforeAdd", (state, action) => {
      const { productId, quantity } = action.payload;
      const exist = state.items.find((i) => i.productId === productId);
      if (!exist) {
        state.items.push({ productId, quantity });
      } else {
        exist.quantity = quantity;
      }
    });

    // SET CART FROM SERVER
    builder.addCase("setCartFromServer", (state, action) => {
      state.items = action.payload;
    });
  }
);
