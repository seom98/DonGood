"use client";
import { useState, useEffect } from "react";
import styles from "@/styles/components/HomeHeader.module.css";
import LogoIcon from "./icons/LogoIcon";
import MenuIcon from "./icons/MenuIcon";
import SunIcon from "./icons/SunIcon";
import MoonIcon from "./icons/MoonIcon";
import SystemIcon from "./icons/SystemIcon";
import { setTheme, getCurrentTheme } from "@/utils/theme";

export default function HomeHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<
        "light" | "dark" | "system"
    >("light");

    useEffect(() => {
        // 컴포넌트 마운트 시 현재 테마 가져오기
        setCurrentTheme(getCurrentTheme());
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleThemeChange = (theme: "light" | "dark" | "system") => {
        setTheme(theme);
        setCurrentTheme(theme);
        setIsMenuOpen(false); // 테마 변경 후 메뉴 닫기
    };

    return (
        <div className={styles.header}>
            <div className={styles.headerLogo}>
                <LogoIcon
                    className={styles.headerLogoIcon}
                    width={36}
                    height={28}
                />
                <div className={styles.headerLogoText}>DonGood</div>
            </div>
            <div className={styles.headerMenu}>
                <div className={styles.themeIcons}>
                    <button
                        className={`${styles.themeButton} ${
                            currentTheme === "light" ? styles.active : ""
                        }`}
                        onClick={() => handleThemeChange("light")}
                        aria-label="라이트 모드"
                    >
                        <SunIcon className={styles.headerMenuIcon} />
                    </button>
                    <button
                        className={`${styles.themeButton} ${
                            currentTheme === "dark" ? styles.active : ""
                        }`}
                        onClick={() => handleThemeChange("dark")}
                        aria-label="다크 모드"
                    >
                        <MoonIcon className={styles.headerMenuIcon} />
                    </button>
                    <button
                        className={`${styles.themeButton} ${
                            currentTheme === "system" ? styles.active : ""
                        }`}
                        onClick={() => handleThemeChange("system")}
                        aria-label="시스템 설정"
                    >
                        <SystemIcon className={styles.headerMenuIcon} />
                    </button>
                </div>
                <button
                    className={styles.menuButton}
                    onClick={toggleMenu}
                    aria-label="메뉴 열기"
                >
                    <MenuIcon className={styles.headerMenuIcon} />
                    <div
                        className={`${styles.menuPopup} ${
                            isMenuOpen ? styles.menuOpen : ""
                        }`}
                    >
                        <div className={styles.menuContent}></div>
                    </div>
                </button>
            </div>
        </div>
    );
}
