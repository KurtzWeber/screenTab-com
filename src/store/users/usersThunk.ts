import { createAsyncThunk } from "@reduxjs/toolkit";

type ApiOk<T = any> = { ok: true; data: T };
type ApiFail = {
    ok: false;
    code: string;
    message: string;
};

const BASE = (process.env.NEXT_PUBLIC_SERVER_URL || "").replace(/\/+$/, "");

const url = (p: string) => new URL(p, BASE).toString();

export const fetchUsersThunk = createAsyncThunk<
    {
        items: { email: string; createdAt: string }[];
        total: number;
    },
    { page: number; limit: number },
    { rejectValue: string }
>("users/fetch", async (args, { rejectWithValue }) => {
    const q = new URLSearchParams({
        page: String(args.page),
        limit: String(args.limit),
    }).toString();

    const res = await fetch(url(`/users?${q}`), {
        credentials: "include",
    });

    let body:
        | ApiOk<{
              items: { email: string; createdAt: string }[];
              total: number;
          }>
        | ApiFail;

    try {
        body = await res.json();
    } catch {
        return rejectWithValue(`HTTP ${res.status}`);
    }

    if (!res.ok || !("ok" in body)) {
        return rejectWithValue(`HTTP ${res.status}`);
    }
    if (!body.ok) {
        return rejectWithValue(body.message || "Request failed");
    }

    return body.data;
});
