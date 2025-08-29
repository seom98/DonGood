import HomeHeader from "@/components/common/HomeHeader";
import SpinDonGood from "@/components/SpinDonGood";
import StartButton from "@/components/home/StartButton";
import { MainContainer } from "@/components/home/HomePageStyles";
import { Text16 } from "@/components/atoms/Text";

export default function HomePage() {
    return (
        <MainContainer>
            <HomeHeader />
            <SpinDonGood />
            <Text16>돈 굳었다! 돈, 굳!</Text16>
            <StartButton />
        </MainContainer>
    );
}
