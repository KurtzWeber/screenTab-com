import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import users from "@/store/users/usersSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        users,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
