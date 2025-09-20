import { createSlice } from "@reduxjs/toolkit";
import { checkAuth } from "./authThunk";

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        authStart: (s) => {
            s.isLoading = true;
            s.error = null;
        },
        authSuccess: (s) => {
            s.isAuthenticated = true;
            s.isLoading = false;
            s.error = null;
        },
        authFailure: (s, a) => {
            s.isAuthenticated = false;
            s.isLoading = false;
            s.error = (a.payload as string) || "Auth error";
        },
        logout: (s) => {
            s.isAuthenticated = false;
            s.isLoading = false;
            s.error = null;
        },
    },
    extraReducers: (b) => {
        b.addCase(checkAuth.pending, (s) => {
            s.isLoading = true;
        });
        b.addCase(checkAuth.fulfilled, (s, a) => {
            s.isAuthenticated = a.payload;
            s.isLoading = false;
        });
        b.addCase(checkAuth.rejected, (s) => {
            s.isAuthenticated = false;
            s.isLoading = false;
        });
    },
});

export const { authStart, authSuccess, authFailure, logout } = slice.actions;

export default slice.reducer;
