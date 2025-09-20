import { useState } from "react";
import { useDispatch } from "react-redux";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import ReactToastify from "./useReactToastify";
import { logout } from "@/store/auth/authSlice";

// API response types based on safeReply format
type ApiOk<T = any> = { ok: true; data: T };
type ApiFail = { ok: false; code: string; message: string };

// Extend Axios config to ensure `url` is always required
interface ApiRequestConfig extends AxiosRequestConfig {
    url: string;
}

// Success callback receives parsed data and AxiosResponse
type SuccessCallback<T = any> = (data: T, res: AxiosResponse) => void;
// Failure callback receives raw error
type FailureCallback = (error: any) => void;

const useApiRequest = () => {
    // Tracks loading state of the current request
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Redux dispatch for triggering logout
    const dispatch = useDispatch();

    /**
     * Maps error codes to user-friendly messages.
     * Codes must match backend safeReply fail codes.
     */
    const mapCodeToMessage = (code?: string, message?: string) => {
        const mapping: Record<string, string> = {
            BAD_REQUEST: "Invalid input",
            VALIDATION_ERROR: "Invalid input",
            UNAUTHORIZED: "Please log in",
            FORBIDDEN: "Access denied",
            NOT_FOUND: "Not found",
            INSUFFICIENT_FUNDS: "Insufficient funds",
            PRICING_UNAVAILABLE: "Category not available",
            RATE_LIMIT: "Too many requests",
            INTERNAL: "Request failed. Please try again later",
        };
        if (code && mapping[code]) return mapping[code];
        if (message && message.length <= 80) return message;
        return "Request failed. Please try again later";
    };

    /**
     * Handles unauthorized session globally.
     */
    const handleUnauthorized = () => {
        ReactToastify("warn", "Session expired. Please log in again.");
        dispatch(logout());
    };

    /**
     * Centralized request handler for all HTTP calls.
     * Automatically attaches cookies, handles safeReply format,
     * and processes common errors globally.
     */
    const makeRequest = async <T = any,>(
        config: ApiRequestConfig,
        onSuccess?: SuccessCallback<T>,
        onFailure?: FailureCallback
    ): Promise<T | void> => {
        try {
            setIsLoading(true);

            // Perform the request with cookies attached
            const response = await axios({
                ...config,
                withCredentials: true,
                headers: { ...(config.headers || {}) },
            });

            // Parse backend response according to safeReply
            const body = response.data as ApiOk<T> | ApiFail;

            // If request succeeded (ok: true)
            if (body.ok) {
                onSuccess?.((body as ApiOk<T>).data, response);
                return (body as ApiOk<T>).data;
            }

            // If request failed (ok: false) but not thrown as Axios error
            const fail = body as ApiFail;
            if (response.status === 401) {
                handleUnauthorized();
                return;
            }
            ReactToastify("warn", mapCodeToMessage(fail.code, fail.message));
            onFailure?.(fail);
        } catch (error: any) {
            // Detect network/server unreachable
            const isNetworkError =
                error.code === "ECONNREFUSED" ||
                error.message?.includes("Network Error");
            if (isNetworkError) {
                window.location.href = "/maintenance";
                return;
            }

            const status = error.response?.status;
            const body = error.response?.data as ApiFail;

            // Session expired / unauthorized
            if (status === 401) {
                handleUnauthorized();
                return;
            }

            // Internal server error
            if (status >= 500) {
                window.location.href = "/maintenance";
                return;
            }

            // Show mapped safe message
            ReactToastify("warn", mapCodeToMessage(body?.code, body?.message));

            onFailure?.(error);
        } finally {
            // Always unset loading flag
            setIsLoading(false);
        }
    };

    // Expose request method and loading state
    return { makeRequest, isLoading };
};

export default useApiRequest;
