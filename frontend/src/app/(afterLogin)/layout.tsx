"use client";

import styled from "@emotion/styled";
import { UserProvider, useUser } from "@/contexts/UserContext";
import Sidebar from "@/components/common/Sidebar";
import MobileNav from "@/components/common/MobileNav";
import MainHeader from "@/components/common/MainHeader";

const LayoutContainer = styled.div`
    /* 600px 초과일 때 (데스크톱) */
    @media (min-width: 601px) {
        margin-top: 96px;
        margin-left: 212px;
        margin-right: 24px;
    }
`;

const MainContent = styled.main`
    /* 600px 초과일 때 (데스크톱) */
    @media (min-width: 601px) {
        max-width: 800px;
        margin: 0 auto;
    }
`;

function AfterLoginLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();

    if (!user || loading) {
        return null;
    }
    return (
        <LayoutContainer>
            <MainHeader user={user} />
            <Sidebar />
            <MainContent>{children}</MainContent>
            <MobileNav />
        </LayoutContainer>
    );
}

export default function AfterLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <AfterLoginLayoutContent>{children}</AfterLoginLayoutContent>
        </UserProvider>
    );
}
