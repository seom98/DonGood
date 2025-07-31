import { getAuthUser } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import styles from "./login.module.css";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
    const user = await getAuthUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <h1 className={styles.title}>돈 굳었다!</h1>
                <p className={styles.subtitle}>소비 습관을 개선해보세요</p>

                <LoginForm />

                <p className={styles.terms}>
                    계속하기를 클릭하면 <a href="/terms">이용약관</a>과{" "}
                    <a href="/privacy">개인정보처리방침</a>에 동의하는 것으로
                    간주됩니다.
                </p>
            </div>
        </div>
    );
}
