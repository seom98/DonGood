"use client";

import { CacheProvider } from "@emotion/react";
import createEmotionCache from "./createEmotionCache";

const clientSideEmotionCache = createEmotionCache();

export default function EmotionRegistry({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>
    );
}
