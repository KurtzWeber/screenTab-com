"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNavigationLoader } from "@/context/NavigationLoaderContext";
import useLogout from "@/hooks/useLogout";

import { LayoutDashboard, Users, Menu as MenuIcon, LogOut } from "lucide-react";
import { useResponsiveLayout } from "@/utils/useResponsiveLayout";

type Item = {
    icon: ReactNode;
    label: string;
    route: string;
};

const menuItems: Item[] = [
    {
        icon: <LayoutDashboard size={20} />,
        label: "Dashboard",
        route: "/dashboard",
    },
    {
        icon: <Users size={20} />,
        label: "All users",
        route: "/users",
    },
];

export default function Sidebar() {
    const { push, refresh } = useNavigationLoader();
    const pathname = usePathname();
    const layout = useResponsiveLayout();
    const isMobile = layout === "mobile";

    const collapsible = !isMobile;

    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (isMobile) setOpen(true);
    }, [isMobile]);

    const { handleLogout } = useLogout();

    const handleNav = (to: string) => {
        if (pathname === to) {
            refresh();
            return;
        }
        push(to);
    };

    const toggle = () => {
        if (!collapsible) return;
        setOpen((v) => !v);
    };

    const wOpen = 240;
    const wClosed = 72;

    const showLabels = collapsible ? open : true;

    const sideWidth = collapsible ? (open ? wOpen : wClosed) : "auto";
    useEffect(() => {
        const w = collapsible ? (open ? wOpen : wClosed) : 0;
        document.documentElement.style.setProperty("--sbw", `${w}px`);
    }, [open, collapsible]);
    return (
        <aside
            style={{ width: sideWidth as any }}
            className="
            h-dvh overflow-x-hidden
            border-r border-neutral-800
            bg-neutral-900
            transition-all duration-200
            "
        >
            <div
                className={`
                    flex items-center
                    ${
                        showLabels
                            ? "justify-between px-3"
                            : "justify-center px-0"
                    }
                    h-14 border-b border-neutral-800
                `}
            >
                {showLabels && (
                    <button
                        onClick={() => handleNav("/dashboard")}
                        className={`
                        text-sm font-semibold
                        tracking-wide
                        text-white/90
                        hover:text-cyan-400
                        `}
                    >
                        <span>SCREENTAB</span>
                        <span
                            className="
                        text-cyan-400
                        "
                        >
                            CHAT
                        </span>
                    </button>
                )}

                {collapsible && (
                    <button
                        onClick={toggle}
                        className={`
                        p-2 rounded-lg
                        text-white/80
                        hover:bg-white/10
                        `}
                        aria-label="Toggle sidebar"
                    >
                        <MenuIcon size={20} />
                    </button>
                )}
            </div>

            <nav className="p-2">
                <ul className="space-y-1">
                    {menuItems.map((i) => {
                        const sel = pathname === i.route;
                        return (
                            <li key={i.label}>
                                <button
                                    onClick={() => handleNav(i.route)}
                                    className={`
                                    group w-full
                                    flex items-center
                                    ${
                                        showLabels
                                            ? "justify-start px-3"
                                            : "justify-center px-0"
                                    }
                                    py-2 rounded-lg
                                    text-white/85
                                    hover:bg-white/10
                                    ${sel ? "bg-white/10" : ""}
                                    `}
                                    aria-current={sel ? "page" : undefined}
                                >
                                    <span
                                        className={`
                                        flex items-center
                                        justify-center
                                        ${showLabels ? "mr-3" : ""}
                                        `}
                                    >
                                        {i.icon}
                                    </span>
                                    {showLabels && (
                                        <span
                                            className="
                                            text-sm
                                            "
                                        >
                                            {i.label}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}

                    <li className="my-2">
                        <div
                            className="
                        h-px bg-white/10
                        "
                        />
                    </li>

                    <li>
                        <button
                            onClick={handleLogout}
                            className={`
                            w-full flex items-center
                            ${
                                showLabels
                                    ? "justify-start px-3"
                                    : "justify-center px-0"
                            }
                            py-2 rounded-lg
                            text-white/85
                            hover:bg-white/10
                            `}
                        >
                            <span
                                className={`
                                flex items-center
                                justify-center
                                ${showLabels ? "mr-3" : ""}
                                `}
                            >
                                <LogOut size={20} />
                            </span>
                            {showLabels && (
                                <span
                                    className="
                                text-sm
                                "
                                >
                                    Log out
                                </span>
                            )}
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}
