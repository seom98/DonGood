import { useState, useEffect } from "react";
import { setTheme, getCurrentTheme } from "@/utils/theme";

type ThemeType = "light" | "dark" | "system";

interface UseThemeReturn {
    currentTheme: ThemeType;
    setCurrentTheme: (theme: ThemeType) => void;
    handleThemeChange: (theme: ThemeType) => void;
}

export function useTheme(): UseThemeReturn {
    const [currentTheme, setCurrentThemeState] = useState<ThemeType>("system");

    useEffect(() => {
        // 컴포넌트 마운트 시 현재 테마 가져오기
        setCurrentThemeState(getCurrentTheme());
    }, []);

    const handleThemeChange = (theme: ThemeType) => {
        setTheme(theme);
        setCurrentThemeState(theme);
    };

    return {
        currentTheme,
        setCurrentTheme: setCurrentThemeState,
        handleThemeChange,
    };
}
