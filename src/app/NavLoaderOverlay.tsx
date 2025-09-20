"use client";

import { useNavigationLoader } from "@/context/NavigationLoaderContext";
import { Loader } from "./components/Loader";

export default function NavLoaderOverlay() {
    const { isNavigating } = useNavigationLoader();
    return isNavigating ? <Loader fullScreen size={80} /> : null;
}
