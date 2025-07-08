"use client";

import { useEffect } from "react";
import { initializeTheme, watchSystemTheme } from "@/utils/theme";

export default function ThemeProvider() {
    useEffect(() => {
        // 테마 초기화
        initializeTheme();

        // 시스템 테마 변경 감지
        watchSystemTheme();
    }, []);

    return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
