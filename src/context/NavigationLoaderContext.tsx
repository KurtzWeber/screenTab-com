"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type NavigationContextType = {
    isNavigating: boolean;
    push: (path: string) => void;
    refresh: () => void;
};

const NavigationLoaderContext = createContext<NavigationContextType>({
    isNavigating: false,
    push: () => {},
    refresh: () => {},
});

export const NavigationLoaderProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const router = useRouter();
    const pathname = usePathname();

    const [isNavigating, setIsNavigating] = useState(false);
    const targetPathRef = useRef<string | null>(null);

    const push = (path: string) => {
        if (!path || path === pathname) return;
        targetPathRef.current = path;
        setIsNavigating(true);
        router.push(path);
    };

    const refresh = () => {
        setIsNavigating(true);
        router.refresh();
        setTimeout(() => setIsNavigating(false), 600);
    };

    useEffect(() => {
        if (targetPathRef.current && pathname === targetPathRef.current) {
            setIsNavigating(false);
            targetPathRef.current = null;
        }
    }, [pathname]);

    return (
        <NavigationLoaderContext.Provider
            value={{ isNavigating, push, refresh }}
        >
            {children}
        </NavigationLoaderContext.Provider>
    );
};

export const useNavigationLoader = () => useContext(NavigationLoaderContext);
