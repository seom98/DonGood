"use client";

import styled from "@emotion/styled";

const MobileNavContainer = styled.nav`
    display: block; /* 모바일에서만 표시 */

    /* 600px 초과일 때 (데스크톱) */
    @media (min-width: 601px) {
        display: none;
    }
`;

export default function MobileNav() {
    return <MobileNavContainer>모바일</MobileNavContainer>;
}
