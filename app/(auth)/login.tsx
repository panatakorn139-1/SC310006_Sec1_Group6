import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../assets/services/firebaseConfig"; // ใช้ Firebase ที่ตั้งค่าไว้

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // ฟังก์ชัน Login
  const handleEmailPasswordSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      // ล็อกอินผ่าน Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Login successful:", user);

      // ตรวจสอบว่า Firestore ได้เชื่อมต่อถูกต้อง
      if (!db) {
        console.error("❌ Firestore Database ไม่สามารถเข้าถึงได้");
        Alert.alert("Error", "เกิดปัญหากับฐานข้อมูล กรุณาลองใหม่อีกครั้ง");
        return;
      }

      // ดึงข้อมูลผู้ใช้จาก Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log("📌 ข้อมูลผู้ใช้จาก Firestore:", userData);

        // ตรวจสอบ role ของผู้ใช้ และเปลี่ยนหน้าไปยัง Dashboard ที่เหมาะสม
        if (userData.role === "student") {
          console.log("🎓 เปลี่ยนไปหน้า Student Dashboard");
          router.replace("/student-dashboard");
        } else if (userData.role === "teacher") {
          console.log("👨‍🏫 เปลี่ยนไปหน้า Teacher Dashboard");
          router.replace("/student-dashboard");
        } else {
          Alert.alert("Error", "บัญชีนี้ไม่มีสิทธิ์ใช้งาน กรุณาติดต่อแอดมิน");
        }
      } else {
        console.warn("❌ ไม่พบข้อมูลผู้ใช้ใน Firestore");
        Alert.alert("Error", "ไม่พบข้อมูลผู้ใช้ในระบบ กรุณาสมัครสมาชิกใหม่");
      }
    } catch (error) {
      console.error("❌ Email/Password Login error:", error);
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เข้าสู่ระบบ</Text>

      <TextInput
        style={styles.input}
        placeholder="อีเมล"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="รหัสผ่าน"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleEmailPasswordSignIn}>
        <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.signupText}>ยังไม่มีบัญชี? สมัครสมาชิก</Text>
      </TouchableOpacity>
    </View>
  );
}

// สไตล์ UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  loginButton: {
    width: "80%",
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupText: {
    color: "#007bff",
    marginTop: 20,
    fontSize: 16,
  },
});
