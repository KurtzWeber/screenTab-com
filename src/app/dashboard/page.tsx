"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import useApiRequest from "@/hooks/useApiRequest";

type Msg = {
    id: string;
    role: "user" | "bot";
    text: string;
    ts: number;
};

type Tab = {
    id: string;
    tid?: string;
    title: string;
    msgs: Msg[];
    loaded?: boolean;
};

const now = () => Date.now();
const rid = () => Math.random().toString(36).slice(2, 10);

const mk = (r: Msg["role"], t: string): Msg => ({
    id: rid(),
    role: r,
    text: t,
    ts: now(),
});

const BASE = (process.env.NEXT_PUBLIC_SERVER_URL || "").replace(/\/+$/, "");

const apiUrl = (p: string) => new URL(p, BASE).toString();

export default function Page() {
    const { makeRequest, isLoading } = useApiRequest();

    const [tabs, setTabs] = useState<Tab[]>([]);
    const [cur, setCur] = useState<string>("");
    const [txt, setTxt] = useState("");
    const [busySend, setBusySend] = useState(false);

    const sc = useRef<HTMLDivElement>(null);

    const tab = useMemo(() => tabs.find((t) => t.id === cur)!, [tabs, cur]);

    const nextTitle = (tabs: Tab[]) => {
        const used = new Set<number>();
        const re = /^chat\s+(\d+)$/i;

        for (const t of tabs) {
            const m = (t.title || "").trim().match(re);
            if (m) used.add(Number(m[1]));
        }
        let n = 1;
        while (used.has(n)) n++;
        return `Chat ${n}`;
    };

    useEffect(() => {
        makeRequest<{
            items: { _id: string; title: string }[];
        }>(
            {
                url: apiUrl("/chat/threads"),
                method: "GET",
            },
            (data) => {
                const items = data.items || [];
                if (!items.length) {
                    const t: Tab = {
                        id: rid(),
                        title: "Chat 1",
                        msgs: [mk("bot", "Hi! Send a movie title.")],
                        loaded: true,
                    };
                    setTabs([t]);
                    setCur(t.id);
                    return;
                }
                const mapped: Tab[] = items.map((x) => ({
                    id: x._id,
                    tid: x._id,
                    title: x.title || "Chat",
                    msgs: [],
                    loaded: false,
                }));
                setTabs(mapped);
                setCur(mapped[0].id);
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const t = tabs.find((x) => x.id === cur);
        if (!t || t.loaded || !t.tid) return;

        makeRequest<{
            threadId: string;
            title: string;
            msgs: {
                id: string;
                role: "user" | "bot";
                text: string;
                ts: string;
            }[];
        }>(
            {
                url: apiUrl(`/chat/history?threadId=${t.tid}`),
                method: "GET",
            },
            (data) => {
                const msgs: Msg[] = (data.msgs || []).map((m) => ({
                    id: String(m.id),
                    role: m.role,
                    text: m.text,
                    ts: new Date(m.ts).getTime(),
                }));
                setTabs((v) =>
                    v.map((x) =>
                        x.id === t.id
                            ? {
                                  ...x,
                                  title: data.title || x.title,
                                  msgs,
                                  loaded: true,
                              }
                            : x
                    )
                );
                setTimeout(() => {
                    sc.current?.scrollTo({
                        top: 9e9,
                        behavior: "smooth",
                    });
                }, 0);
            }
        );
    }, [tabs, cur, makeRequest]);

    const addTab = () => {
        const title = nextTitle(tabs);
        const t: Tab = {
            id: rid(),
            title,
            msgs: [mk("bot", "New chat. Type a title.")],
            loaded: true,
        };
        setTabs((v) => [...v, t]);
        setCur(t.id);
    };

    const wipeAll = () => {
        makeRequest(
            {
                url: apiUrl("/chat/wipe"),
                method: "DELETE",
            },
            () => {
                const t: Tab = {
                    id: rid(),
                    title: "Chat 1",
                    msgs: [mk("bot", "History wiped. Start new.")],
                    loaded: true,
                };
                setTabs([t]);
                setCur(t.id);
            }
        );
    };

    const deleteCurrent = () => {
        const t = tabs.find((x) => x.id === cur);
        if (!t) return;

        if (!t.tid) {
            const rest = tabs.filter((x) => x.id !== t.id);
            if (rest.length) {
                setTabs(rest);
                setCur(rest[0].id);
            } else {
                const fresh: Tab = {
                    id: rid(),
                    title: "Chat 1",
                    msgs: [mk("bot", "Start a new chat.")],
                    loaded: true,
                };
                setTabs([fresh]);
                setCur(fresh.id);
            }
            return;
        }

        makeRequest<{ threadId: string }>(
            { url: apiUrl(`/chat/thread/${t.tid}`), method: "DELETE" },
            () => {
                const rest = tabs.filter((x) => x.id !== t.id);
                if (rest.length) {
                    setTabs(rest);
                    setCur(rest[0].id);
                } else {
                    const fresh: Tab = {
                        id: rid(),
                        title: "Chat 1",
                        msgs: [mk("bot", "Start a new chat.")],
                        loaded: true,
                    };
                    setTabs([fresh]);
                    setCur(fresh.id);
                }
            }
        );
    };

    const onSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        const q = txt.trim();
        if (!q || busySend) return;

        const t = tabs.find((x) => x.id === cur);
        if (!t) return;

        setTxt("");
        setBusySend(true);

        const payload: any = { text: q };
        if (t.tid) {
            payload.threadId = t.tid;
        } else {
            payload.title = t.title;
        }

        makeRequest<{
            threadId: string;
            title: string;
            user: { id: string; text: string; ts: string };
            bot: { id: string; text: string; ts: string };
        }>(
            {
                url: apiUrl("/chat/send"),
                method: "POST",
                data: payload,
            },
            (d) => {
                const u: Msg = {
                    id: String(d.user.id),
                    role: "user",
                    text: d.user.text,
                    ts: new Date(d.user.ts).getTime(),
                };
                const b: Msg = {
                    id: String(d.bot.id),
                    role: "bot",
                    text: d.bot.text,
                    ts: new Date(d.bot.ts).getTime(),
                };
                setTabs((v) =>
                    v.map((x) =>
                        x.id === t.id
                            ? {
                                  ...x,
                                  tid: d.threadId || x.tid,
                                  title: x.title,
                                  msgs: [...x.msgs, u, b],
                              }
                            : x
                    )
                );
                setTimeout(() => {
                    sc.current?.scrollTo({ top: 9e9, behavior: "smooth" });
                }, 0);
            }
        ).finally(() => setBusySend(false));
    };

    const sending = busySend || isLoading;

    return (
        <div
            className="w-full mx-auto"
            style={{
                maxWidth: "min(44rem, calc(100vw - var(--sbw, 0px) - 32px))",
            }}
        >
            <div className="flex items-center justify-between gap-2 mb-3">
                <h1 className="text-base font-bold tracking-wide">
                    <span>SCREEN</span>
                    <span className="text-cyan-400">TAB</span> <span>CHAT</span>
                </h1>

                <div className="flex gap-2">
                    <button
                        onClick={addTab}
                        className="
                            rounded-lg px-3 py-1.5
                            text-xs border
                            border-neutral-800
                            bg-neutral-900/40
                            hover:border-neutral-700
                        "
                    >
                        + Tab
                    </button>
                    <button
                        onClick={deleteCurrent}
                        className="
                            rounded-lg px-3 py-1.5
                            text-xs border
                            border-red-700
                            text-red-200
                            hover:bg-red-900/30
                        "
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="mb-3 flex items-center gap-2 overflow-x-auto scrollbar-thin">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setCur(t.id)}
                        className={`
                            rounded-xl px-3 py-1.5
                            text-xs border shrink-0
                            ${
                                t.id === cur
                                    ? "border-cyan-500 bg-cyan-500/10"
                                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                            }
                        `}
                    >
                        {t.title}
                    </button>
                ))}
            </div>

            <div
                ref={sc}
                className="
                    overflow-y-auto rounded-2xl p-3
                    bg-neutral-900/40 border border-neutral-800
                "
                style={{
                    paddingBottom: "9rem",
                    maxHeight: "calc(100dvh - 12rem)",
                }}
            >
                {!tab?.msgs?.length && (
                    <p className="text-sm text-neutral-400">
                        Empty. Ask about a movie.
                    </p>
                )}

                {tab?.msgs?.map((m) => (
                    <div
                        key={m.id}
                        className={`
                            mb-2 flex items-end gap-2
                            ${m.role === "user" ? "justify-end" : ""}
                        `}
                    >
                        <div className="max-w-[80%]">
                            <div
                                className={`
                                    rounded-2xl px-3 py-2
                                    ${
                                        m.role === "user"
                                            ? "bg-cyan-600 text-white rounded-br-sm"
                                            : "bg-neutral-800 border border-neutral-700 rounded-bl-sm"
                                    }
                                `}
                            >
                                <pre className="whitespace-pre-wrap text-xs leading-5">
                                    {m.text}
                                </pre>
                            </div>
                            <div className="mt-0.5 text-[10px] text-neutral-400">
                                {new Date(m.ts).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div
                data-chat-composer
                className="
                    fixed z-30 bottom-4
                    left-0 right-0
                    md:left-[var(--sbw)]
                "
            >
                <form
                    onSubmit={onSend}
                    className="
                        mx-auto w-full
                        rounded-2xl border border-neutral-800
                        bg-neutral-950/90 backdrop-blur
                        shadow-xl p-2 sm:p-3
                        pb-[max(env(safe-area-inset-bottom),0px)]
                    "
                    style={{
                        maxWidth:
                            "min(44rem, calc(100vw - var(--sbw, 0px) - 32px))",
                    }}
                >
                    <div className="flex items-center gap-2">
                        <input
                            value={txt}
                            onChange={(e) => setTxt(e.target.value)}
                            disabled={sending}
                            className="
                                flex-1 rounded-xl px-3 py-2
                                bg-neutral-900 border border-neutral-800
                                outline-none placeholder:text-neutral-500
                                focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500
                                disabled:opacity-50
                            "
                            placeholder="Type movie title..."
                        />
                        <button
                            type="submit"
                            disabled={sending}
                            className="
                                rounded-xl px-4 py-2
                                bg-cyan-500 text-white
                                hover:bg-cyan-400
                                disabled:opacity-50
                            "
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>

            <div className="h-32" />
        </div>
    );
}
