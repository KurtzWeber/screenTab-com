"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchUsers, setPage } from "@/store/users/usersSlice";

const fmt = (v: string) => new Date(v).toLocaleString();

export default function Page() {
    const sp = useSearchParams();
    const r = useRouter();
    const d = useDispatch<AppDispatch>();

    const { items, total, page, limit, isLoading, error } = useSelector(
        (s: RootState) => s.users
    );

    useEffect(() => {
        const p = Number(sp.get("page") || 1);
        d(setPage(p));
        d(fetchUsers({ page: p, limit }));
        // eslint-disable-next-line
    }, [sp, d]);

    const max = Math.max(1, Math.ceil(total / limit));

    const go = (p: number) => {
        if (p < 1 || p > max) return;
        r.replace(`/users?page=${p}`);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1
                className="
                text-base font-bold mb-3
                tracking-wide
            "
            >
                Users
            </h1>

            <div
                className="
                rounded-2xl border
                border-neutral-800
                bg-neutral-900/40
                overflow-hidden
            "
            >
                <div
                    className="
                    grid grid-cols-2
                    text-xs px-3 py-2
                    border-b border-neutral-800
                    text-neutral-400
                "
                >
                    <div>Email</div>
                    <div>Registered</div>
                </div>

                {isLoading && (
                    <div
                        className="
                        p-3 text-sm
                        text-neutral-400
                    "
                    >
                        Loading...
                    </div>
                )}

                {error && (
                    <div
                        className="
                        p-3 text-sm
                        text-red-400
                    "
                    >
                        {error}
                    </div>
                )}

                {!isLoading && !items.length && (
                    <div
                        className="
                        p-3 text-sm
                        text-neutral-400
                    "
                    >
                        No users found.
                    </div>
                )}

                <ul
                    className="divide-y
                    divide-neutral-800"
                >
                    {items.map((u) => (
                        <li
                            key={u.email}
                            className="
                            grid grid-cols-2
                            px-3 py-2 text-sm
                        "
                        >
                            <div
                                className="
                                truncate pr-2
                            "
                            >
                                {u.email}
                            </div>
                            <div
                                className="
                                text-neutral-300
                            "
                            >
                                {fmt(u.createdAt)}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div
                className="
                mt-3 flex items-center
                justify-between
            "
            >
                <button
                    onClick={() => go(page - 1)}
                    disabled={page <= 1}
                    className="
                    rounded-lg px-3 py-1.5
                    text-xs border
                    border-neutral-800
                    bg-neutral-900/40
                    hover:border-neutral-700
                    disabled:opacity-50
                    "
                >
                    Prev
                </button>

                <div
                    className="
                    text-xs text-neutral-400
                "
                >
                    Page {page} / {max}
                </div>

                <button
                    onClick={() => go(page + 1)}
                    disabled={page >= max}
                    className="
                    rounded-lg px-3 py-1.5
                    text-xs border
                    border-neutral-800
                    bg-neutral-900/40
                    hover:border-neutral-700
                    disabled:opacity-50
                    "
                >
                    Next
                </button>
            </div>
        </div>
    );
}
