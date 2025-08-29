import styled from "@emotion/styled";
import LogoIcon from "@/components/icons/logos/LogoIcon";
import { Text20 } from "../atoms/Text";
import { useRouter } from "next/navigation";

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 2px;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.2s ease-in-out;
    &:hover {
        opacity: 0.8;
    }
`;

const LogoIconStyled = styled(LogoIcon)`
    flex-shrink: 0;
`;

interface LogoProps {
    showText?: boolean;
}

export default function Logo({ showText = true }: LogoProps) {
    const router = useRouter();
    return (
        <LogoContainer onClick={() => router.push("/")}>
            <LogoIconStyled className="logo-icon" width={28} height={28} />
            {showText && <Text20>DonGood</Text20>}
        </LogoContainer>
    );
}
