import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUsersThunk } from "./usersThunk";

type Row = {
    email: string;
    createdAt: string;
};

type State = {
    items: Row[];
    total: number;
    page: number;
    limit: number;
    isLoading: boolean;
    error: string | null;
};

const initial: State = {
    items: [],
    total: 0,
    page: 1,
    limit: 15,
    isLoading: false,
    error: null,
};

const slice = createSlice({
    name: "users",
    initialState: initial,
    reducers: {
        setPage: (s, a: PayloadAction<number>) => {
            s.page = a.payload || 1;
        },
        resetUsers: (s) => {
            Object.assign(s, initial);
        },
    },
    extraReducers: (b) => {
        b.addCase(fetchUsersThunk.pending, (s) => {
            s.isLoading = true;
            s.error = null;
        });
        b.addCase(fetchUsersThunk.fulfilled, (s, a) => {
            s.items = a.payload.items;
            s.total = a.payload.total;
            s.isLoading = false;
        });
        b.addCase(fetchUsersThunk.rejected, (s, a) => {
            s.isLoading = false;
            s.error = (a.payload as string) || a.error.message || "Load error";
        });
    },
});

export const { setPage, resetUsers } = slice.actions;

export default slice.reducer;

export { fetchUsersThunk as fetchUsers };
