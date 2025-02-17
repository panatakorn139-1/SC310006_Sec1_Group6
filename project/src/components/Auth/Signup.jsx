import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/db/firebase";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();

    // ตรวจสอบว่า password กับ confirmPassword ตรงกันหรือไม่
    if (password !== confirmPassword) {
      alert("รหัสผ่านทั้งสองช่องไม่ตรงกัน!");
      return;
    }

    // เรียกใช้ createUserWithEmailAndPassword เพื่อสร้างบัญชีใหม่
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Sign Up successful:", userCredential.user);
        // หลังจากสมัครสมาชิกสำเร็จ อาจเปลี่ยนหน้าไป Login หรือ Dashboard
        navigate("/"); // ตัวอย่าง: เปลี่ยนไปหน้า Login
      })
      .catch((error) => {
        console.error("Sign Up error:", error);
        alert(error.message);
      });
  };

  return (
    <div className="signup-container">
      <h2>สมัครสมาชิก</h2>
      <form className="signup-form" onSubmit={handleSignUp}>
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
        <input
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="signup-button">
          สร้างบัญชี
        </button>
      </form>
      <p className="signup-hint">
        มีบัญชีแล้ว? <span onClick={() => navigate("/")}>เข้าสู่ระบบ</span>
      </p>
    </div>
  );
};

export default SignUp;
