export default function GoogleIcon({
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
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M35.28 18.4091C35.28 17.1327 35.1655 15.9055 34.9527 14.7273H18V21.69H27.6873C27.27 23.94 26.0018 25.8464 24.0955 27.1227V31.6391H29.9127C33.3164 28.5055 35.28 23.8909 35.28 18.4091Z"
                fill="#4285F4"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18 36C22.86 36 26.9345 34.3882 29.9127 31.6391L24.0955 27.1227C22.4836 28.2027 20.4218 28.8409 18 28.8409C13.3118 28.8409 9.34363 25.6745 7.92818 21.42H1.91454V26.0836C4.87636 31.9663 10.9636 36 18 36Z"
                fill="#34A853"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.92818 21.42C7.56818 20.34 7.36364 19.1864 7.36364 18C7.36364 16.8137 7.56818 15.66 7.92818 14.58V9.91638H1.91455C0.695454 12.3464 0 15.0955 0 18C0 20.9046 0.695454 23.6537 1.91455 26.0837L7.92818 21.42Z"
                fill="#FBBC05"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18 7.15909C20.6427 7.15909 23.0155 8.06727 24.8809 9.85091L30.0436 4.68818C26.9264 1.78364 22.8518 0 18 0C10.9636 0 4.87636 4.03364 1.91454 9.91636L7.92818 14.58C9.34363 10.3255 13.3118 7.15909 18 7.15909Z"
                fill="#EA4335"
            />
        </svg>
    );
}
