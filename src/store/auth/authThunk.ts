import { createAsyncThunk } from "@reduxjs/toolkit";

type ApiOk<T = any> = { ok: true; data: T };
type ApiFail = {
    ok: false;
    code: string;
    message: string;
};

export const checkAuth = createAsyncThunk<boolean>(
    "auth/checkAuth",
    async () => {
        try {
            const res = await fetch(
                process.env.NEXT_PUBLIC_SERVER_URL + "/auth/check",
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            const body = (await res.json()) as
                | ApiOk<{ auth: boolean }>
                | ApiFail;

            if (!res.ok || !("ok" in body)) return false;

            if (!body.ok) return false;

            return !!(
                body as ApiOk<{
                    auth: boolean;
                }>
            ).data.auth;
        } catch {
            return false;
        }
    }
);

export const login = createAsyncThunk<
    boolean,
    { email: string; password: string },
    { rejectValue: string }
>("auth/login", async (dto, { rejectWithValue }) => {
    const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/auth/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dto),
            credentials: "include",
        }
    );

    const body = (await res.json()) as ApiOk<{ message?: string }> | ApiFail;

    if (!res.ok || !("ok" in body)) {
        const msg = (body as ApiFail)?.message || `HTTP ${res.status}`;
        return rejectWithValue(msg);
    }
    if (!body.ok)
        return rejectWithValue((body as ApiFail).message || "Login failed");
    return true;
});
