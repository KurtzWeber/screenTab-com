import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import useApiRequest from "./useApiRequest";
import { logout } from "@/store/auth/authSlice";
import ReactToastify from "./useReactToastify";

const useLogout = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { makeRequest } = useApiRequest();

    const handleLogout = async () => {
        await makeRequest(
            {
                url: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/logout`,
                method: "POST",
            },
            () => {
                dispatch(logout());
                ReactToastify("success", "Logged out successfully");
                router.push("/");
            }
        );
    };

    return { handleLogout };
};

export default useLogout;
