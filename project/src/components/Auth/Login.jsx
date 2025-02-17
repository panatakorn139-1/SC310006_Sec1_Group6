import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../../config/db/firebase";
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // ล็อกอินด้วย Email/Password
    const handleEmailPasswordSignIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((result) => {
                console.log("Login successful:", result.user);
                navigate("/dashboard");
            })
            .catch((error) => {
                console.error("Email/Password Login error:", error);
                alert(error.message);
            });
    };

    // ล็อกอินด้วย Google
    const handleGoogleSignIn = () => {
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                console.log("Google Login successful:", result.user);
                navigate("/dashboard");
            })
            .catch((error) => {
                console.error("Google Login error:", error);
                alert(error.message);
            });
    };

    // ปุ่มสมัครสมาชิก
    const handleGoToSignUp = () => {
        navigate("/signup");
    };

    return (
        <div className="login-container">
            <h2>เข้าสู่ระบบ</h2>
            <form className="login-form" onSubmit={handleEmailPasswordSignIn}>
                <input
                    type="email"
                    placeholder="อีเมล"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="login-button">
                    เข้าสู่ระบบ
                </button>
            </form>
            <div className="separator">หรือ</div>
            <button className="google-button" onClick={handleGoogleSignIn}>
                Sign in with Google
            </button>
            {/* ปุ่มไปหน้า Sign Up */}
            <div className="signup-link">
                <p>ยังไม่มีบัญชี? <span onClick={() => navigate("/signup")}>สมัครสมาชิก</span></p>
            </div>
        </div>
    );
};

export default Login;
