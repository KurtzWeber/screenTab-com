"use client";

import React, { FC, useMemo } from "react";
import { Triangle } from "react-loader-spinner";

type LoaderProps = {
    fullScreen?: boolean;
    backgroundColor?: string;
    size?: number;
};

export const Loader: FC<LoaderProps> = ({
    fullScreen = true,
    size = 80,
    backgroundColor,
}) => {
    const clsBase = "flex items-center justify-center";
    const clsOverlay = "fixed inset-0 z-[9999]";
    const clsBg = "bg-neutral-950";

    const className = fullScreen
        ? `${clsBase} ${clsOverlay} ${clsBg}`
        : clsBase;

    const style = useMemo(() => {
        return backgroundColor ? { backgroundColor } : undefined;
    }, [backgroundColor]);

    return (
        <div className={className} style={style}>
            <Triangle
                height={size}
                width={size}
                color="#22d3ee"
                ariaLabel="triangle-loading"
            />
        </div>
    );
};
