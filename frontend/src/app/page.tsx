import styles from "@/styles/pages/HomePage.module.css";
import HomeHeader from "@/components/common/HomeHeader";
import HomeContent from "@/components/home/HomeContent";
import SpinDonGood from "@/components/SpinDonGood";

export default function HomePage() {
    return (
        <div>
            <main className={styles.main}>
                <HomeHeader />
                <SpinDonGood />
                <div>돈 굳었다! 돈, 굳!</div>
                <HomeContent />
            </main>
        </div>
    );
}
