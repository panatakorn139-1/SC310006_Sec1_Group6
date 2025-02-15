// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration ที่ได้รับจาก Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB_kWn5ZtonrQxeqnS8Ta97Dubr2nQgvog",
  authDomain: "project-attendance-1e593.firebaseapp.com",
  projectId: "project-attendance-1e593",
  storageBucket: "project-attendance-1e593.firebasestorage.app",
  messagingSenderId: "16976614955",
  appId: "1:16976614955:web:e32519e0a2134b4c733c6e",
  measurementId: "G-D759CH83G0"
};

// เริ่มต้น Firebase App
const app = initializeApp(firebaseConfig);

// ตั้งค่า Firebase Authentication และ Google Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ส่งออก auth และ googleProvider เพื่อให้ไฟล์อื่นสามารถใช้งานได้
export { auth, googleProvider };
