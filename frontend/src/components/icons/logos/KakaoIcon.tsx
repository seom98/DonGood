export default function KakaoIcon({
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
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clipPath="url(#clip0_1_126)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.9999 1.2C8.05823 1.2 -0.00012207 7.42591 -0.00012207 15.1046C-0.00012207 19.88 3.11669 24.0899 7.86293 26.5939L5.86593 33.889C5.6895 34.5336 6.42671 35.0474 6.99281 34.6738L15.7466 28.8964C16.4853 28.9677 17.236 29.0093 17.9999 29.0093C27.9408 29.0093 35.9997 22.7836 35.9997 15.1046C35.9997 7.42591 27.9408 1.2 17.9999 1.2Z"
                    fill="black"
                />
            </g>
            <defs>
                <clipPath id="clip0_1_126">
                    <rect width="35.9999" height="36" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}
