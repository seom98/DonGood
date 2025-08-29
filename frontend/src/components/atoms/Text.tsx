"use client";
import styled from "@emotion/styled";

interface TextProps {
    sub?: boolean;
    pink?: boolean;
    purple?: boolean;
    children: React.ReactNode;
}

const getColor = ({ sub, pink, purple }: TextProps) => {
    if (pink) return "var(--pink300)";
    if (purple) return "var(--purple300)";
    if (sub) return "var(--grey500)";
    return "var(--grey800)";
};

const createText = (
    size: number,
    height: number,
    weight: number
) => styled.span<TextProps>`
    font-size: ${size}px;
    font-weight: ${weight};
    color: ${getColor};
    line-height: 1;
    margin: 0;
    letter-spacing: -0.02em;
`;

export const Text12 = createText(12, 1.4, 300);
export const Text14 = createText(14, 1.4, 300);
export const Text16 = createText(16, 1.4, 300);
export const Text20 = createText(20, 1.4, 400);
export const Text24 = createText(24, 1.2, 400);
export const Text30 = createText(30, 1.2, 400);
