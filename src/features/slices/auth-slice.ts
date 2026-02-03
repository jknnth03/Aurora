// src/features/auth/authSlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { CONFIG } from "../../config/config";
import { getCookie } from "../../utils/cookie";
import { decrypt } from "../../utils/crypto";
import { ITokenData, IUserData } from "../api/aurora/auth/types";

// Define the authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: ITokenData | null;
  userData: IUserData | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  userData: null,
  loading: false,
  error: null,
};

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Get the encrypted user data from cookie
      const encryptedData = getCookie(CONFIG.COOKIE.SESSION.LABEL);

      if (!encryptedData) {
        return rejectWithValue("No session found");
      }

      try {
        // Decrypt the user data
        const decryptedData = decrypt(encryptedData);

        if (!decryptedData) {
          return rejectWithValue("Invalid session data");
        }

        // Parse the decrypted user data
        const userData = JSON.parse(decryptedData) as ITokenData;

        if (!userData || !userData.token) {
          return rejectWithValue("Invalid user data");
        }

        // Return the user data
        return userData;
      } catch (decryptError) {
        //console.error("Error decrypting/parsing cookie:", decryptError);
        return rejectWithValue("Error processing session data");
      }
    } catch (error) {
      //console.error("Authentication check failed:", error);
      // If any error occurs, reject the thunk
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to authenticate");
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set authenticated user after successful login
    setCredentials: (
      state,
      action: PayloadAction<{ tokenData: ITokenData; userData: IUserData }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.tokenData;
      state.userData = action.payload.userData;
      state.error = null;
    },
    // Clear user data on logout
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = {
        firstName: null,
        lastName: null,
        permissions: null,
        role: null,
        userId: null,
        username: null,
      };
      state.userData = null;
    },
    // Clear any authentication errors
    clearError: (state) => {
      state.error = null;
    },
    // Set error state
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle checkAuth pending state
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle checkAuth fulfilled state
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      // Handle checkAuth rejected state
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.userData = null;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setCredentials, logoutSuccess, clearError, setError } =
  authSlice.actions;

// Export selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserData = (state: { auth: AuthState }) =>
  state.auth.userData;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const ongoingMutation = (state: RootState) => state.auroraApi.mutations;
export const ongoingQuery = (state: RootState) => state.auroraApi.queries;

// Export reducer
export default authSlice.reducer;
