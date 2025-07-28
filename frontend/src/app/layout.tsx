import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Metadata } from "next";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "돈 굳었다! 돈굳 - 소비 습관 개선 가계부",
    description:
        "과소비 지출을 기록하며 소비 습관을 길러주는 세미 가계부. 돈을 굳혀보세요!",
    keywords: "가계부, 지출관리, 소비습관, 돈관리, 절약, 가계부앱, 지출기록",
    authors: [{ name: "DonGood" }],
    creator: "DonGood",
    publisher: "DonGood",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://www.don-good.xyz"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "돈 굳었다! 돈굳 - 소비 습관 개선 가계부",
        description:
            "과소비 지출을 기록하며 소비 습관을 길러주는 세미 가계부. 돈을 굳혀보세요!",
        url: "https://www.don-good.xyz",
        siteName: "돈 굳었다! 돈굳",
        images: [
            {
                url: "/DonGood_img.png",
                width: 1200,
                height: 630,
                alt: "돈 굳었다! 돈굳",
            },
        ],
        locale: "ko_KR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "돈 굳었다! 돈굳 - 소비 습관 개선 가계부",
        description:
            "과소비 지출을 기록하며 소비 습관을 길러주는 세미 가계부. 돈을 굳혀보세요!",
        images: ["/DonGood_img.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <AuthProvider>
                    <ThemeProvider />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
