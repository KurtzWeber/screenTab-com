"use client";

import { useEffect, useState } from "react";

export type LayoutVariant =
    | "mobile"
    | "tablet"
    | "mixed"
    | "horizontal"
    | "wide";

const getEffectiveLayout = (width: number): LayoutVariant => {
    if (width < 760) return "mobile";
    if (width < 1260) return "tablet";
    if (width < 1440) return "mixed";
    if (width < 2560) return "horizontal";
    return "wide";
};

export const useResponsiveLayout = (): LayoutVariant => {
    const [layout, setLayout] = useState<LayoutVariant>(() =>
        getEffectiveLayout(
            typeof window !== "undefined" ? window.innerWidth : 1920
        )
    );

    useEffect(() => {
        const handleResize = () => {
            setLayout(getEffectiveLayout(window.innerWidth));
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return layout;
};
