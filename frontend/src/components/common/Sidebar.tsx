"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styled from "@emotion/styled";
import {
    DashboardIcon,
    CalendarIcon,
    ChartIcon,
    SearchIcon,
    MenuIcon,
} from "@/components/icons/NavIcon";

const SidebarContainer = styled.aside`
    display: none; /* 모바일에서는 숨김 */

    /* 600px 초과일 때 (데스크톱) */
    @media (min-width: 601px) {
        display: flex;
        flex-direction: column;
        gap: 12px;
        position: fixed;
        width: 164px;
        height: calc(100vh - 120px);
        top: 96px;
        left: 24px;
        padding: 12px;
        border-radius: 20px;
        background-color: var(--grey025);
        box-shadow: 0 4px 25px 0 var(--shadow1);
    }
`;

const SidebarItem = styled.div`
    display: flex;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    background-color: var(--grey025);
    align-items: center;
    color: var(--grey500);
    cursor: pointer;
    font-size: 14px;
    font-weight: 300;
    transition: all 0.2s ease-in-out;
    &:hover {
        background-color: var(--grey100);
        color: var(--grey800);
    }
    &.active {
        background-color: var(--grey100);
        color: var(--grey800);
    }
`;

const SIDEBAR_ITEMS = [
    { id: "home", label: "홈", icon: DashboardIcon, path: "/dashboard" },
    { id: "monthly", label: "달력", icon: CalendarIcon, path: "/monthly" },
    { id: "chart", label: "통계", icon: ChartIcon, path: "/chart" },
    { id: "search", label: "검색", icon: SearchIcon, path: "/search" },
    { id: "menu", label: "메뉴", icon: MenuIcon, path: "/menu" },
];

export default function Sidebar() {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    return (
        <SidebarContainer>
            {SIDEBAR_ITEMS.map(({ id, label, icon: Icon, path }) => (
                <SidebarItem
                    key={id}
                    onMouseEnter={() => setHoveredItem(id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={pathname === path ? "active" : ""}
                    onClick={() => router.push(path)}
                >
                    <Icon active={hoveredItem === id || pathname === path} />
                    {label}
                </SidebarItem>
            ))}
        </SidebarContainer>
    );
}
