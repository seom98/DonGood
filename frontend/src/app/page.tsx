import Link from "next/link";
import styles from "@/styles/pages/HomePage.module.css";
import HomeHeader from "@/components/common/HomeHeader";
import SpinDonGood from "@/components/SpinDonGood";

export default function HomePage() {
    return (
        <div>
            <main className={styles.main}>
                <HomeHeader />
                <SpinDonGood />
                <div>돈 굳었다! 돈, 굳!</div>
                <Link href="/login">시작하기</Link>
            </main>
        </div>
    );
}
