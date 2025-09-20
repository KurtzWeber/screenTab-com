"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { checkAuth } from "@/store/auth/authThunk";
import { useNavigationLoader } from "@/context/NavigationLoaderContext";
import Sidebar from "./components/Sidebar";
import { Loader } from "./components/Loader";
import useResponsiveLayout from "@/hooks/useResponsiveLayout";

function MobileTopBar(p: { onMenu: () => void }) {
    return (
        <div
            className="
            md:hidden sticky top-0 z-30
            bg-neutral-900/60
            border-b border-neutral-800
            px-3 py-2 flex items-center
            justify-between
            "
        >
            <button
                onClick={p.onMenu}
                aria-label="menu"
                className="
                rounded-lg px-3 py-2
                border border-neutral-800
                bg-neutral-900/40
                active:scale-[.98]
                "
            >
                {/* simple hamburger */}
                <div className="w-5 space-y-1">
                    <span
                        className="
                    block h-0.5 w-full
                    bg-neutral-300
                    "
                    />
                    <span
                        className="
                    block h-0.5 w-full
                    bg-neutral-300
                    "
                    />
                    <span
                        className="
                    block h-0.5 w-full
                    bg-neutral-300
                    "
                    />
                </div>
            </button>

            <h1
                className="
            text-sm font-semibold
            "
            >
                <span>SCREEN</span>
                <span className="text-cyan-400">TAB</span>
            </h1>

            <div className="w-10" />
        </div>
    );
}

function MobileSidebar(p: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    // lock scroll when open
    useEffect(() => {
        if (!p.open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [p.open]);

    return (
        <div
            aria-hidden={!p.open}
            className={`
            md:hidden fixed inset-0 z-40
            ${p.open ? "" : "pointer-events-none"}
            `}
        >
            {/* backdrop */}
            <div
                onClick={p.onClose}
                className={`
                absolute inset-0
                bg-black/50 backdrop-blur
                transition-opacity
                ${p.open ? "opacity-100" : "opacity-0"}
                `}
            />

            {/* panel */}
            <aside
                role="dialog"
                aria-modal="true"
                className={`
                absolute left-0 top-0 bottom-0
                w-72 bg-neutral-900
                border-r border-neutral-800
                shadow-2xl
                transition-transform
                ${p.open ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="h-full overflow-y-auto">{p.children}</div>
            </aside>
        </div>
    );
}

function ClientLayoutInner(p: { children: React.ReactNode }) {
    const layout = useResponsiveLayout();
    const isDesk = layout !== "mobile";

    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const { isAuthenticated, isLoading } = useSelector(
        (s: RootState) => s.auth
    );
    const { isNavigating } = useNavigationLoader();

    const [authChecked, setAuthChecked] = useState(false);
    const [mOpen, setMOpen] = useState(false);

    useEffect(() => {
        dispatch(checkAuth()).finally(() => setAuthChecked(true));
    }, [dispatch]);

    useEffect(() => {
        if (!authChecked) return;
        if (!isAuthenticated && pathname !== "/") {
            router.replace("/");
        }
        if (isAuthenticated && pathname === "/") {
            router.replace("/dashboard");
        }
    }, [authChecked, isAuthenticated, pathname, router]);

    if (isLoading || isNavigating || !authChecked) {
        return <Loader fullScreen />;
    }
    if (!isAuthenticated && pathname !== "/") {
        return null;
    }

    return (
        <div className="flex w-full min-w-0">
            {/* desktop sidebar */}
            {isDesk && isAuthenticated && (
                <div
                    className="flex-none min-h-dvh"
                    style={{ width: "var(--sbw, 18rem)" }}
                >
                    <Sidebar />
                </div>
            )}

            {/* mobile drawer */}
            {!isDesk && isAuthenticated && (
                <MobileSidebar open={mOpen} onClose={() => setMOpen(false)}>
                    <Sidebar />
                </MobileSidebar>
            )}

            <div className="flex-1 w-full min-w-0">
                {/* mobile topbar */}
                {!isDesk && isAuthenticated && (
                    <MobileTopBar onMenu={() => setMOpen(true)} />
                )}

                <main
                    className={`
                        w-full min-w-0
                        ${layout !== "mobile" ? "p-6" : "p-2 pt-14"}
                        h-dvh flex flex-col overflow-hidden
                    `}
                >
                    {p.children}
                </main>
            </div>
        </div>
    );
}

export default ClientLayoutInner;
