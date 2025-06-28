import styles from "./page.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "돈 굳었다! 돈굳",
    description: "돈 굳게 도와주는 지금껏 본적없는 새로운 가계부",
    openGraph: {
        title: "돈 굳었다! 돈굳",
        description: "돈 굳게 도와주는 지금껏 본적없는 새로운 가계부",
        images: ["/DonGood_img.png"],
    },
};

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.dongood}>
                    <div className={styles.don}>
                        <div className={styles.don1}></div>
                        <div className={styles.don2}></div>
                        <div className={styles.don3}></div>
                        <div className={styles.don4}></div>
                        <div className={styles.don5}></div>
                        <div className={styles.don6}></div>
                        <div className={styles.don7}></div>
                    </div>
                </div>
                <div>돈 굳었다! 돈, 굳!</div>
                <button>시작하기</button>
            </main>
        </div>
    );
}
