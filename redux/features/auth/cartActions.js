import { server } from '../../store';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../../utils/axiosConfig';

export const addToCart = item => async dispatch => {
  try {
    dispatch({ type: 'addToCartRequest' });
    console.log('Adding item to cart:', item);
    const { data } = await axiosInstance.post(`/cart/add`, item, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return dispatch({
      type: 'addToCartSuccess',
      payload: data?.cart?.items,
    });
  } catch (error) {
    console.log(error);
    return dispatch({
      type: 'addToCartFail',
      payload: error.response?.data?.message || 'Failed to add to cart',
    });
  }
};

// ➤ Get Cart from server
export const getCart = () => async dispatch => {
  try {
    dispatch({ type: 'getCartRequest' });

    const { data } = await axiosInstance.get(`/cart`);

    return dispatch({
      type: 'getCartSuccess',
      payload: data?.cart?.items,
    });
  } catch (error) {
    return dispatch({
      type: 'getCartFail',
      payload: error.response?.data?.message || 'Failed to fetch cart',
    });
  }
};

export const increaseQty = productId => async dispatch => {
  try {
    dispatch({ type: 'increaseQtyRequest' });

    const { data } = await axiosInstance.put(`/cart/increase/${productId}`);

    dispatch({
      type: 'increaseQtySuccess',
      payload: data.cart.items,
    });
    return dispatch(getCart());
  } catch (error) {
    return dispatch({
      type: 'increaseQtyFail',
      payload: error.response?.data?.message || 'Failed to increase quantity',
    });
  }
};

export const decreaseQty = productId => async dispatch => {
  try {
    dispatch({ type: 'decreaseQtyRequest' });

    const { data } = await axiosInstance.put(`/cart/decrease/${productId}`);

    dispatch({
      type: 'decreaseQtySuccess',
      payload: data.cart.items,
    });
    return dispatch(getCart());
  } catch (error) {
    return dispatch({
      type: 'decreaseQtyFail',
      payload: error.response?.data?.message || 'Failed to decrease quantity',
    });
  }
};

// ➤ Remove Item from Cart (server + redux)
export const removeFromCart = item => async dispatch => {
  // Create a promise that we'll resolve when the action is complete
  let actionComplete;
  const completionPromise = new Promise(resolve => {
    actionComplete = resolve;
  });

  try {
    dispatch({ type: 'removeFromCartRequest' });

    console.log('Removing item from cart:', item);

    // Extract the productId from the item
    const productId = typeof item === 'object' ? item.productId || item._id : item;

    if (!productId) {
      throw new Error('Invalid product ID');
    }

    // Use the correct API endpoint
    const { data } = await axiosInstance.delete(`/cart/remove/${productId}`);

    console.log('Item removed from cart successfully, stock restored');

    // Dispatch the success action and get updated cart
    dispatch({
      type: 'removeFromCartSuccess',
      payload: data.cart.items,
    });

    // Make sure to get updated cart
    dispatch(getCart());

    // Add a small delay before resolving to ensure UI state is consistent
    setTimeout(() => {
      actionComplete();
    }, 300);
  } catch (error) {
    console.log('Error removing item from cart:', error);
    dispatch({
      type: 'removeFromCartFail',
      payload: error?.response?.data?.message || 'Failed to remove from cart',
    });

    // Even on error, resolve the promise so UI can update
    setTimeout(() => {
      actionComplete();
    }, 300);
  }

  // Return the promise for chaining in the component
  return completionPromise;
};

// ➤ Clear Cart (server + redux)
export const clearCart = () => async dispatch => {
  try {
    dispatch({ type: 'clearCartRequest' });

    await axiosInstance.delete(`/cart/clear`);

    return dispatch({ type: 'clearCartSuccess' });
  } catch (error) {
    return dispatch({
      type: 'clearCartFail',
      payload: error.response?.data?.message || 'Failed to clear cart',
    });
  }
};

export const adjustPreCartQty = (productId, type) => (dispatch, getState) => {
  const { cart } = getState();
  const existing = cart.items.find(i => i.productId === productId);
  const currentQty = existing?.quantity || 1;

  if (type === 'increase') {
    const newQty = currentQty + 1;
    return dispatch({
      type: 'setProductQtyBeforeAdd',
      payload: { productId, quantity: newQty },
    });
  } else if (type === 'decrease' && currentQty > 1) {
    const newQty = currentQty - 1;
    return dispatch({
      type: 'setProductQtyBeforeAdd',
      payload: { productId, quantity: newQty },
    });
  }
};

export const setCartFromServer = cartItems => dispatch => {
  return dispatch({
    type: 'setCartFromServer',
    payload: cartItems,
  });
};

export const clearMessage = () => dispatch => {
  return dispatch({ type: 'clearMessage' });
};

export const clearError = () => dispatch => {
  return dispatch({ type: 'clearError' });
};
