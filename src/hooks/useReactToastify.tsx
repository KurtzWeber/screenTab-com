/**
 * Function: ReactToastify
 *
 * Displays toast notifications using React Toastify library.
 *
 * Parameters:
 *   - type: the type of the toast notification ("success" or "warn")
 *   - message: the message to be displayed in the toast notification
 *
 * Behavior:
 *   - Sets the options for the toast notification.
 *   - Displays a toast notification based on the provided type and message.
 *     - If the type is "success", a success toast notification is shown.
 *     - If the type is "warn", a warning toast notification is shown.
 *
 * Dependencies:
 *   - react-toastify library
 */

import { toast } from "react-toastify";

const useReactToastify = (
    type: "success" | "warn" | "info",
    message: string
) => {
    const toastOptions = {
        position: "top-right" as const,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
    };

    console.log(type, message);
    if (type === "success") {
        toast.success(message, toastOptions);
    } else if (type === "warn") {
        toast.warn(message, toastOptions);
    } else if (type === "info") {
        toast.info(message, toastOptions);
    }
};

export default useReactToastify;
