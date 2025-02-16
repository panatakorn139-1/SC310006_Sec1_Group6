// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_kWn5ZtonrQxeqnS8Ta97Dubr2nQgvog",
  authDomain: "project-attendance-1e593.firebaseapp.com",
  projectId: "project-attendance-1e593",
  storageBucket: "project-attendance-1e593.firebasestorage.app",
  messagingSenderId: "16976614955",
  appId: "1:16976614955:web:e32519e0a2134b4c733c6e",
  measurementId: "G-D759CH83G0"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };
