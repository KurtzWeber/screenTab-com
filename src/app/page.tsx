"use client";

import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useNavigationLoader } from "@/context/NavigationLoaderContext";
import useApiRequest from "@/hooks/useApiRequest";
import { authFailure, authStart, authSuccess } from "@/store/auth/authSlice";

type LoginDto = {
    email: string;
    password: string;
};

type RegisterDto = {
    email: string;
    password: string;
    confirm: string;
};

type FormErrs = Partial<Record<keyof RegisterDto, string>>;

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passRx = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function Page() {
    const dispatch = useDispatch<AppDispatch>();
    const { push } = useNavigationLoader();
    const { isLoading: sliceLoading, error } = useSelector(
        (s: RootState) => s.auth
    );

    const { makeRequest, isLoading } = useApiRequest();

    const [tab, setTab] = useState<"login" | "register">("login");

    const [login, setLogin] = useState<LoginDto>({ email: "", password: "" });

    const [reg, setReg] = useState<RegisterDto>({
        email: "",
        password: "",
        confirm: "",
    });

    const [errs, setErrs] = useState<FormErrs>({});

    const busy = useMemo(
        () => isLoading || sliceLoading,
        [isLoading, sliceLoading]
    );

    const vEmail = (v: string) => (emailRx.test(v) ? "" : "Invalid email");

    const vPass = (v: string) => (passRx.test(v) ? "" : "Min 8, letter+digit");

    const vConfirm = (p: string, c: string) =>
        p === c ? "" : "Passwords differ";

    const clearErrs = () => setErrs({});

    const onLogin = async () => {
        clearErrs();
        const e1 = vEmail(login.email);
        const e2 = vPass(login.password);
        const next: FormErrs = {};
        if (e1) next.email = e1;
        if (e2) next.password = e2;
        setErrs(next);
        if (Object.keys(next).length) return;

        try {
            dispatch(authStart());
            await makeRequest(
                {
                    url: process.env.NEXT_PUBLIC_SERVER_URL + "/auth/login",
                    method: "POST",
                    data: {
                        email: login.email,
                        password: login.password,
                    },
                },
                () => {
                    dispatch(authSuccess());
                    push("/dashboard");
                },
                () => {
                    dispatch(authFailure("Login failed"));
                }
            );
        } catch {
            dispatch(authFailure("Login failed"));
        }
    };

    const onRegister = async () => {
        clearErrs();
        const e1 = vEmail(reg.email);
        const e2 = vPass(reg.password);
        const e3 = vConfirm(reg.password, reg.confirm);
        const next: FormErrs = {};
        if (e1) next.email = e1;
        if (e2) next.password = e2;
        if (e3) next.confirm = e3;
        setErrs(next);
        if (Object.keys(next).length) return;

        try {
            dispatch(authStart());
            await makeRequest(
                {
                    url: process.env.NEXT_PUBLIC_SERVER_URL + "/auth/register",
                    method: "POST",
                    data: {
                        email: reg.email,
                        password: reg.password,
                    },
                },
                () => {
                    dispatch(authSuccess());
                    push("/dashboard");
                },
                () => {
                    dispatch(authFailure("Register failed"));
                }
            );
        } catch {
            dispatch(authFailure("Register failed"));
        }
    };

    return (
        <div
            className="
            min-h-dvh grid place-items-center
            overflow-hidden bg-neutral-950
            text-neutral-100 p-4
            "
        >
            <div
                className="
                w-full max-w-sm rounded-2xl p-6
                bg-neutral-900/60 border
                border-neutral-800 shadow-xl
                "
            >
                <div className="text-center mb-3">
                    <h1
                        className="
                        text-xl font-bold
                        tracking-wide
                        "
                    >
                        <span>SCREENTAB</span>
                        <span
                            className="
                        text-cyan-400
                        "
                        >
                            CHAT
                        </span>{" "}
                    </h1>
                    <p
                        className="
                        text-xs text-neutral-400
                        "
                    >
                        Sign in to the panel
                    </p>
                </div>

                <div
                    className="
                    grid grid-cols-2 gap-2 mb-4
                    "
                >
                    <button
                        onClick={() => setTab("login")}
                        className={`
                        rounded-lg py-2 text-sm
                        border
                        ${
                            tab === "login"
                                ? "border-cyan-500 " + "bg-cyan-500/10"
                                : "border-neutral-800 " + "bg-neutral-900/40"
                        }
                        `}
                    >
                        Sign in
                    </button>
                    <button
                        onClick={() => setTab("register")}
                        className={`
                        rounded-lg py-2 text-sm
                        border
                        ${
                            tab === "register"
                                ? "border-cyan-500 " + "bg-cyan-500/10"
                                : "border-neutral-800 " + "bg-neutral-900/40"
                        }
                        `}
                    >
                        Register
                    </button>
                </div>

                {tab === "login" ? (
                    <LoginForm
                        dto={login}
                        setDto={setLogin}
                        errs={errs}
                        busy={busy}
                        onSubmit={onLogin}
                        error={error}
                    />
                ) : (
                    <RegisterForm
                        dto={reg}
                        setDto={setReg}
                        errs={errs}
                        busy={busy}
                        onSubmit={onRegister}
                        error={error}
                    />
                )}
            </div>
        </div>
    );
}

function LoginForm(p: {
    dto: LoginDto;
    setDto: (v: LoginDto) => void;
    errs: FormErrs;
    busy: boolean;
    onSubmit: () => void;
    error: string | null;
}) {
    return (
        <>
            <label
                className="
                block text-sm text-neutral-400
                "
                htmlFor="email"
            >
                Email
            </label>
            <input
                id="email"
                type="email"
                value={p.dto.email}
                onChange={(e) =>
                    p.setDto({
                        ...p.dto,
                        email: e.target.value,
                    })
                }
                disabled={p.busy}
                className="
                mt-1 w-full rounded-lg px-3 py-2
                bg-neutral-800 border
                border-neutral-700 outline-none
                placeholder:text-neutral-500
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:border-cyan-500
                focus:ring-2 focus:ring-cyan-500
                "
                placeholder="Enter email"
                autoComplete="username"
            />
            {p.errs.email && (
                <p
                    className="
                mt-1 text-xs text-red-400
                "
                >
                    {p.errs.email}
                </p>
            )}

            <label
                className="
                block text-sm text-neutral-400 mt-3
                "
                htmlFor="password"
            >
                Password
            </label>
            <input
                id="password"
                type="password"
                value={p.dto.password}
                onChange={(e) =>
                    p.setDto({
                        ...p.dto,
                        password: e.target.value,
                    })
                }
                disabled={p.busy}
                className="
                mt-1 w-full rounded-lg px-3 py-2
                bg-neutral-800 border
                border-neutral-700 outline-none
                placeholder:text-neutral-500
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:border-cyan-500
                focus:ring-2 focus:ring-cyan-500
                "
                placeholder="Enter password"
                autoComplete="current-password"
            />
            {p.errs.password && (
                <p
                    className="
                mt-1 text-xs text-red-400
                "
                >
                    {p.errs.password}
                </p>
            )}

            {p.error && (
                <div
                    className="
                    mt-3 rounded-lg border px-3 py-2
                    border-red-700/60 bg-red-950
                    text-red-200 text-sm
                    "
                    role="alert"
                >
                    {p.error}
                </div>
            )}

            <button
                onClick={p.onSubmit}
                disabled={p.busy}
                className="
                mt-4 w-full rounded-lg py-2
                font-medium text-white
                bg-cyan-500 hover:bg-cyan-400
                disabled:opacity-50
                "
            >
                {p.busy ? (
                    <span
                        className="
                        inline-block h-5 w-5
                        align-[-2px] animate-spin
                        rounded-full border-2
                        border-white
                        border-t-transparent
                        "
                        aria-label="loading"
                    />
                ) : (
                    "Sign in"
                )}
            </button>
        </>
    );
}

function RegisterForm(p: {
    dto: RegisterDto;
    setDto: (v: RegisterDto) => void;
    errs: FormErrs;
    busy: boolean;
    onSubmit: () => void;
    error: string | null;
}) {
    return (
        <>
            <label
                className="
                block text-sm text-neutral-400
                "
                htmlFor="remail"
            >
                Email
            </label>
            <input
                id="remail"
                type="email"
                value={p.dto.email}
                onChange={(e) =>
                    p.setDto({
                        ...p.dto,
                        email: e.target.value,
                    })
                }
                disabled={p.busy}
                className="
                mt-1 w-full rounded-lg px-3 py-2
                bg-neutral-800 border
                border-neutral-700 outline-none
                placeholder:text-neutral-500
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:border-cyan-500
                focus:ring-2 focus:ring-cyan-500
                "
                placeholder="Enter email"
                autoComplete="username"
            />
            {p.errs.email && (
                <p
                    className="
                mt-1 text-xs text-red-400
                "
                >
                    {p.errs.email}
                </p>
            )}

            <label
                className="
                block text-sm text-neutral-400 mt-3
                "
                htmlFor="rpassword"
            >
                Password
            </label>
            <input
                id="rpassword"
                type="password"
                value={p.dto.password}
                onChange={(e) =>
                    p.setDto({
                        ...p.dto,
                        password: e.target.value,
                    })
                }
                disabled={p.busy}
                className="
                mt-1 w-full rounded-lg px-3 py-2
                bg-neutral-800 border
                border-neutral-700 outline-none
                placeholder:text-neutral-500
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:border-cyan-500
                focus:ring-2 focus:ring-cyan-500
                "
                placeholder="Create password"
                autoComplete="new-password"
            />
            {p.errs.password && (
                <p
                    className="
                mt-1 text-xs text-red-400
                "
                >
                    {p.errs.password}
                </p>
            )}

            <label
                className="
                block text-sm text-neutral-400 mt-3
                "
                htmlFor="rconfirm"
            >
                Confirm password
            </label>
            <input
                id="rconfirm"
                type="password"
                value={p.dto.confirm}
                onChange={(e) =>
                    p.setDto({
                        ...p.dto,
                        confirm: e.target.value,
                    })
                }
                disabled={p.busy}
                className="
                mt-1 w-full rounded-lg px-3 py-2
                bg-neutral-800 border
                border-neutral-700 outline-none
                placeholder:text-neutral-500
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:border-cyan-500
                focus:ring-2 focus:ring-cyan-500
                "
                placeholder="Repeat password"
                autoComplete="new-password"
            />
            {p.errs.confirm && (
                <p
                    className="
                mt-1 text-xs text-red-400
                "
                >
                    {p.errs.confirm}
                </p>
            )}

            {p.error && (
                <div
                    className="
                    mt-3 rounded-lg border px-3 py-2
                    border-red-700/60 bg-red-950
                    text-red-200 text-sm
                    "
                    role="alert"
                >
                    {p.error}
                </div>
            )}

            <button
                onClick={p.onSubmit}
                disabled={p.busy}
                className="
                mt-4 w-full rounded-lg py-2
                font-medium text-white
                bg-cyan-500 hover:bg-cyan-400
                disabled:opacity-50
                "
            >
                {p.busy ? (
                    <span
                        className="
                        inline-block h-5 w-5
                        align-[-2px] animate-spin
                        rounded-full border-2
                        border-white
                        border-t-transparent
                        "
                        aria-label="loading"
                    />
                ) : (
                    "Create account"
                )}
            </button>
        </>
    );
}
