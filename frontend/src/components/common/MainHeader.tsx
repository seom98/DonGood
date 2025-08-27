"use client";

import styled from "@emotion/styled";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import SignOutButton from "@/components/auth/SignOutButton";

const HeaderContainer = styled.header`
    background-color: var(--grey025);
    border-bottom: 1px solid var(--grey100);
    position: fixed;
    height: 72px;
    top: 0;
    left: 0;
    right: 0;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const UserInfoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const UserName = styled.span`
    font-size: 16px;
    font-weight: 500;
    color: var(--grey800);
`;

const Avatar = styled(Image)`
    border-radius: 50%;
    object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--grey200);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--grey600);
`;

interface MainHeaderProps {
    user: User;
}

export default function MainHeader({ user }: MainHeaderProps) {
    return (
        <HeaderContainer>
            <div>로고</div>

            <UserInfoContainer>
                <UserName>
                    {user.user_metadata?.nickname || user.user_metadata?.name}
                </UserName>
                {user.user_metadata?.avatar_url ? (
                    <Avatar
                        src={user.user_metadata?.avatar_url}
                        alt="프로필 이미지"
                        width={40}
                        height={40}
                        priority
                    />
                ) : (
                    <AvatarPlaceholder>
                        {user.user_metadata?.nickname?.[0] ||
                            user.user_metadata?.name?.[0]}
                    </AvatarPlaceholder>
                )}
            </UserInfoContainer>
            <SignOutButton />
        </HeaderContainer>
    );
}
