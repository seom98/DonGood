import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                {/* <div className={styles.don_2}>
                    <div className={styles.don1}></div>
                    <div className={styles.don2}></div>
                    <div className={styles.don3}></div>
                    <div className={styles.don4}></div>
                    <div className={styles.don5}></div>
                    <div className={styles.don6}></div>
                    <div className={styles.don7}></div>
                </div>
                s */}
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
            </main>
        </div>
    );
}
