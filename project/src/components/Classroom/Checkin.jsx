import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../../config/db/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Checkin = () => {
  const { cid } = useParams();
  const [cno, setCno] = useState("");
  const [code, setCode] = useState("");
  const [currentCode, setCurrentCode] = useState("");
  const [status, setStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        alert("กรุณาเข้าสู่ระบบก่อนเช็คชื่อ");
      }
    });
    return () => unsubscribe();
  }, []);

  // โหลดข้อมูลรอบเช็คชื่อปัจจุบัน
  useEffect(() => {
    if (cno) {
      fetchCheckinData();
    }
  }, [cno]);

  const fetchCheckinData = async () => {
    try {
      const checkinDocRef = doc(db, `classroom/${cid}/checkin/${cno}`);
      const checkinSnap = await getDoc(checkinDocRef);
      if (checkinSnap.exists()) {
        const data = checkinSnap.data();
        setCurrentCode(data.code);
        setStatus(data.status);
      } else {
        alert("ไม่พบข้อมูลเช็คชื่อ!");
      }
    } catch (error) {
      console.error("Error fetching check-in data:", error);
    }
  };

  const handleCheckin = async () => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    if (status === 0) {
      alert("ไม่สามารถเช็คชื่อได้ ขณะนี้ยังไม่เริ่ม");
      return;
    }

    if (code !== currentCode) {
      alert("รหัสเช็คชื่อไม่ถูกต้อง!");
      return;
    }

    try {
      const studentRef = doc(db, `classroom/${cid}/checkin/${cno}/students/${currentUser.uid}`);
      await setDoc(studentRef, {
        stdid: currentUser.uid,
        name: currentUser.displayName || "ไม่มีชื่อ",
        remark: "เข้าเรียน",
        date: new Date().toISOString(),
      });

      // 🔥 อัปเดตจำนวนคนเข้าเรียน (เพิ่ม count ทีละ 1)
      const checkinDocRef = doc(db, `classroom/${cid}/checkin/${cno}`);
      await updateDoc(checkinDocRef, {
        count: increment(1), // เพิ่ม count ขึ้นทีละ 1
      });

      alert("เช็คชื่อสำเร็จ!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert("เช็คชื่อไม่สำเร็จ");
    }
  };

  return (
    <div>
      <h2>เช็คชื่อ</h2>
      <p>รอบเช็คชื่อปัจจุบัน: {cno}</p>
      <input
        type="text"
        placeholder="ลำดับเช็คชื่อ (cno)"
        value={cno}
        onChange={(e) => setCno(e.target.value)}
      />
      <input
        type="text"
        placeholder="รหัสเช็คชื่อ"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleCheckin} disabled={status === 0}>
        เช็คชื่อ
      </button>
      {status === 0 && <p style={{ color: "red" }}>เช็คชื่อยังไม่เริ่ม</p>}
    </div>
  );
};

export default Checkin;
