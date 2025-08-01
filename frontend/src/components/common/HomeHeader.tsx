"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import styles from "@/styles/components/HomeHeader.module.css";
import LogoIcon from "@/components/icons/logos/LogoIcon";
import MenuIcon from "@/components/icons/MenuIcon";
import SunIcon from "@/components/icons/SunIcon";
import MoonIcon from "@/components/icons/MoonIcon";
import SystemIcon from "@/components/icons/SystemIcon";
import { setTheme, getCurrentTheme } from "@/utils/theme";

export default function HomeHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<
        "light" | "dark" | "system"
    >("light");
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 컴포넌트 마운트 시 현재 테마 가져오기
        setCurrentTheme(getCurrentTheme());
    }, []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            menuRef.current &&
            !menuRef.current.contains(event.target as Node)
        ) {
            setIsMenuOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen, handleClickOutside]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleThemeChange = (theme: "light" | "dark" | "system") => {
        setTheme(theme);
        setCurrentTheme(theme);
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
            <div className={styles.headerMenu} ref={menuRef}>
                <button
                    className={styles.menuButton}
                    onClick={toggleMenu}
                    aria-label="메뉴 열기"
                >
                    <MenuIcon className={styles.headerMenuIcon} />
                </button>
                <div
                    className={`${styles.menuPopup} ${
                        isMenuOpen ? styles.menuOpen : ""
                    }`}
                >
                    <div className={styles.menuContent}>
                        <div className={styles.menuSection}>
                            <div className={styles.menuSectionTitle}>
                                테마 설정
                            </div>
                            <div className={styles.themeOptions}>
                                <button
                                    className={`${styles.themeOption} ${
                                        currentTheme === "light"
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={() => handleThemeChange("light")}
                                >
                                    <div className={styles.themeOptionContent}>
                                        <div
                                            className={styles.themeOptionTitle}
                                        >
                                            밝은 라이트 모드
                                        </div>
                                    </div>
                                    <div className={styles.themeOptionIcon}>
                                        <SunIcon className={styles.themeIcon} />
                                    </div>
                                </button>
                                <button
                                    className={`${styles.themeOption} ${
                                        currentTheme === "dark"
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={() => handleThemeChange("dark")}
                                >
                                    <div className={styles.themeOptionContent}>
                                        <div
                                            className={styles.themeOptionTitle}
                                        >
                                            어두운 다크 모드
                                        </div>
                                    </div>
                                    <div className={styles.themeOptionIcon}>
                                        <MoonIcon
                                            className={styles.themeIcon}
                                        />
                                    </div>
                                </button>
                                <button
                                    className={`${styles.themeOption} ${
                                        currentTheme === "system"
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={() => handleThemeChange("system")}
                                >
                                    <div className={styles.themeOptionContent}>
                                        <div
                                            className={styles.themeOptionTitle}
                                        >
                                            시스템 설정
                                        </div>
                                    </div>
                                    <div className={styles.themeOptionIcon}>
                                        <SystemIcon
                                            className={styles.themeIcon}
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
