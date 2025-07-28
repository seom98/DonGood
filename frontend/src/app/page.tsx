import styles from "@/styles/pages/HomePage.module.css";
import { Metadata } from "next";
import HomeHeader from "@/components/HomeHeader";
import SpinDonGood from "@/components/SpinDonGood";

export const metadata: Metadata = {
    title: "돈 굳었다! 돈굳",
    description: "돈 굳게 도와주는 지금껏 본적없는 새로운 가계부",
    openGraph: {
        title: "돈 굳었다! 돈굳",
        description: "돈 굳게 도와주는 지금껏 본적없는 새로운 가계부",
        images: ["/DonGood_img.png"],
    },
};

export default function HomePage() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <HomeHeader />
                <SpinDonGood />
                <div className={styles.dongoodText}>돈 굳었다! 돈, 굳!</div>
                <a href="/login">시작하기</a>
            </main>
        </div>
    );
}
