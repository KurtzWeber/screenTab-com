import { useEffect, useState } from "react";

export type Layout = "mobile" | "tablet" | "desktop";

const mqMobile = "(max-width: 767.98px)";
const mqTablet = "(min-width: 768px) and " + "(max-width: 1023.98px)";
const mqDesktop = "(min-width: 1024px)";

const detect = (): Layout => {
    if (typeof window === "undefined") return "mobile";
    if (window.matchMedia(mqMobile).matches) return "mobile";
    if (window.matchMedia(mqTablet).matches) return "tablet";
    return "desktop";
};

const add = (m: MediaQueryList, h: () => void) => {
    const anyM = m as any;
    if (anyM.addEventListener) {
        anyM.addEventListener("change", h);
    } else {
        anyM.addListener(h);
    }
};

const remove = (m: MediaQueryList, h: () => void) => {
    const anyM = m as any;
    if (anyM.removeEventListener) {
        anyM.removeEventListener("change", h);
    } else {
        anyM.removeListener(h);
    }
};

export default function useResponsiveLayout(): Layout {
    const [layout, setLayout] = useState<Layout>("mobile");

    useEffect(() => {
        if (typeof window === "undefined") return;

        const on = () => setLayout(detect());

        const m1 = window.matchMedia(mqMobile);
        const m2 = window.matchMedia(mqTablet);
        const m3 = window.matchMedia(mqDesktop);

        add(m1, on);
        add(m2, on);
        add(m3, on);
        window.addEventListener("resize", on);

        on(); // init after mount

        return () => {
            remove(m1, on);
            remove(m2, on);
            remove(m3, on);
            window.removeEventListener("resize", on);
        };
    }, []);

    return layout;
}
