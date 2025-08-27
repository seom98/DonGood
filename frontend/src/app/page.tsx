import styles from "@/styles/pages/HomePage.module.css";
import HomeHeader from "@/components/common/HomeHeader";
import SpinDonGood from "@/components/SpinDonGood";
import StartButton from "@/components/home/StartButton";

export default function HomePage() {
    return (
        <div>
            <main className={styles.main}>
                <HomeHeader />
                <SpinDonGood />
                <div>돈 굳었다! 돈, 굳!</div>
                <StartButton />
            </main>
        </div>
    );
}
