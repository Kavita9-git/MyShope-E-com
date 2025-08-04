import { createReducer } from '@reduxjs/toolkit';

export const userReducer = createReducer(
  { token: null, loading: false, error: null, message: null },
  builder => {
    //LOGIN CASE
    builder.addCase('loginRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('loginSuccess', (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.isAuth = true;
      state.token = action.payload.token;
    });
    builder.addCase('loginFail', (state, action) => {
      state.loading = false;
      state.isAuth = false;
      state.error = action.payload;
    });

    //ERROR MESSAGE CASE
    builder.addCase('clearError', state => {
      state.error = null;
    });
    builder.addCase('clearMessage', state => {
      state.message = null;
      state.msg = null;
    });

    //REGISTER
    builder.addCase('registerRequest', (state, action) => {
      // state.loading = true;
    });
    builder.addCase('registerSuccess', (state, action) => {
      // state.loading = false;
      state.isAuth = true;
      state.regMessage = action.payload;
    });
    builder.addCase('registerFail', (state, action) => {
      // state.isAuth = false;
      state.error = action.payload;
    });

    //GET USER DATA
    builder.addCase('getUserDataRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('getUserDataSuccess', (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuth = true;
    });
    builder.addCase('getUserDataFail', (state, action) => {
      // state.isAuth = false;
      state.error = action.payload;
    });

    //GET ALL USER DATA CASE
    builder.addCase('getAllUserDataRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('getAllUserDataSuccess', (state, action) => {
      const { message, users, totalUsers } = action.payload;
      state.loading = false;
      state.isAuth = true;
      state.users = users;
      // console.log("getAllUserDataSuccess :", action.payload);
    });
    builder.addCase('getAllUserDataFail', (state, action) => {
      state.error = action.payload;
      //console.log("getAllUserDataFail :", action.payload);
    });

    //UPDATE USER PROFILE CASE
    builder.addCase('updateProfileRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('updateProfileSuccess', (state, action) => {
      state.loading = false;
      state.isAuth = true;
      state.msg = action.payload;
      // state.message = action.payload;
    });
    builder.addCase('updateProfileFail', (state, action) => {
      state.error = action.payload;
    });

    //UPDATE USER PASSWORD CASE
    builder.addCase('updatePasswordRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('updatePasswordSuccess', (state, action) => {
      state.loading = false;
      state.isAuth = true;
      // state.message = action.payload;
    });
    builder.addCase('updatePasswordFail', (state, action) => {
      state.error = action.payload;
    });

    //UPDATE PROFILE PIC CASE
    builder.addCase('uploadProfilePicRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('uploadProfilePicSuccess', (state, action) => {
      state.loading = false;
      state.isAuth = true;
      // state.message = action.payload;
    });
    builder.addCase('uploadProfilePicFail', (state, action) => {
      state.error = action.payload;
    });

    //FORGOT USER PASSWORD CASE
    builder.addCase('forgotPasswordRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('forgotPasswordSuccess', (state, action) => {
      // const { message, user, token } = action.payload;
      state.loading = false;
      state.isAuth = true;
      // state.message = action.payload;
    });
    builder.addCase('forgotPasswordFail', (state, action) => {
      state.error = action.payload;
    });

    //LOGOUT
    builder.addCase('logoutRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('logoutSuccess', (state, action) => {
      state.loading = false;
      state.user = null;
      state.isAuth = false;
      // state.message = action.payload;
    });
    builder.addCase('logoutFail', (state, action) => {
      state.isAuth = false;
      state.error = action.payload;
    });

    //UPDATE SAVED ADDRESSES CASE
    builder.addCase('updateSavedAddressesRequest', state => {
      state.addressLoading = true;
    });
    builder.addCase('updateSavedAddressesSuccess', (state, action) => {
      state.addressLoading = false;
      // state.message = action.payload.message;
      if (state.user) {
        state.user.savedAddresses = action.payload.savedAddresses;
      }
    });
    builder.addCase('updateSavedAddressesFail', (state, action) => {
      state.addressLoading = false;
      state.error = action.payload;
    });

    // GET ALL USERS - ADMIN
    builder.addCase('getAllUsersRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('getAllUsersSuccess', (state, action) => {
      state.loading = false;
      state.users = action.payload;
    });
    builder.addCase('getAllUsersFail', (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // BLOCK USER - ADMIN
    builder.addCase('blockUserRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('blockUserSuccess', (state, action) => {
      state.loading = false;
      // state.message = action.payload.message;
    });
    builder.addCase('blockUserFail', (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // DELETE USER - ADMIN
    builder.addCase('deleteUserRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('deleteUserSuccess', (state, action) => {
      state.loading = false;
      // state.message = action.payload.message;
    });
    builder.addCase('deleteUserFail', (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // UPDATE USER ROLE - ADMIN
    builder.addCase('updateUserRoleRequest', (state, action) => {
      state.loading = true;
    });
    builder.addCase('updateUserRoleSuccess', (state, action) => {
      state.loading = false;
      // state.message = action.payload.message;
    });
    builder.addCase('updateUserRoleFail', (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
);
