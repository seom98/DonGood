export default function LogoIcon({
    className,
    width,
    height,
}: {
    className?: string;
    width?: number;
    height?: number;
}) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 108 88"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M82 24L6 24C4.89543 24 4 24.8954 4 26L4 42C4 43.1046 4.89543 44 6 44L64 44L64 82C64 83.1046 64.8954 84 66 84L82 84C83.1046 84 84 83.1046 84 82L84 26C84 24.8954 83.1046 24 82 24Z"
                fill="var(--pink200)"
                stroke="var(--grey800)"
                strokeWidth="8"
            />
            <path
                d="M62 4L26 4C24.8954 4 24 4.89543 24 6L24 62C24 63.1046 24.8954 64 26 64L64 64L64 44L44 44L44 24L64 24L64 6C64 4.89543 63.1046 4 62 4Z"
                fill="var(--purple200)"
            />
            <path
                d="M102 44L84 44L84 64L102 64C103.105 64 104 63.1046 104 62L104 46C104 44.8954 103.105 44 102 44Z"
                fill="var(--purple200)"
            />
            <path
                d="M62 4L26 4C24.8954 4 24 4.89543 24 6L24 62C24 63.1046 24.8954 64 26 64L64 64L64 44L44 44L44 24L64 24L64 6C64 4.89543 63.1046 4 62 4Z"
                stroke="var(--grey800)"
                strokeWidth="8"
            />
            <path
                d="M102 44L84 44L84 64L102 64C103.105 64 104 63.1046 104 62L104 46C104 44.8954 103.105 44 102 44Z"
                stroke="var(--grey800)"
                strokeWidth="8"
            />
        </svg>
    );
}
