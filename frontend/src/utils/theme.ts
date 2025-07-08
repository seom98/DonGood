type Theme = "light" | "dark" | "system";

// 테마를 로컬 스토리지에 저장
const saveTheme = (theme: Theme) => {
    localStorage.setItem("theme", theme);
};

// 저장된 테마 가져오기
const getSavedTheme = (): Theme | null => {
    return localStorage.getItem("theme") as Theme | null;
};

// 현재 테마 적용
const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    if (theme === "system") {
        // 시스템 설정 사용
        root.removeAttribute("data-theme");
        saveTheme("system");
    } else {
        // 수동 선택한 테마 적용
        root.setAttribute("data-theme", theme);
        saveTheme(theme);
    }
};

// 특정 테마로 설정
export const setTheme = (theme: Theme) => {
    applyTheme(theme);
};

// 테마 토글 (라이트 ↔ 다크)
export const toggleTheme = () => {
    const currentTheme = getCurrentTheme();

    if (currentTheme === "dark") {
        applyTheme("light");
    } else {
        applyTheme("dark");
    }
};

// 현재 테마 가져오기
export const getCurrentTheme = (): Theme => {
    const savedTheme = getSavedTheme();

    if (savedTheme) {
        return savedTheme;
    }

    // 저장된 테마가 없으면 시스템 설정 확인
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }

    return "light";
};

// 테마 초기화 (페이지 로드 시 호출)
export const initializeTheme = () => {
    const savedTheme = getSavedTheme();

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // 저장된 테마가 없으면 시스템 설정 사용
        applyTheme("system");
    }
};

// 시스템 테마 변경 감지
export const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", () => {
        const currentTheme = getCurrentTheme();

        // 사용자가 수동으로 테마를 선택하지 않은 경우에만 시스템 설정 반영
        if (currentTheme === "system") {
            applyTheme("system");
        }
    });
};
