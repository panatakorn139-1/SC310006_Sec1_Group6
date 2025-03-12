import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../../config/db/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";

const Checkin = () => {
  const { cid } = useParams();
  const [cno, setCno] = useState("");
  const [code, setCode] = useState("");
  const [currentCode, setCurrentCode] = useState("");
  const [status, setStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        Swal.fire("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อนเช็คชื่อ", "warning");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (cno) {
      fetchCheckinData();
    }
  }, [cno]);

  const fetchCheckinData = async () => {
    setLoading(true);
    try {
      const checkinDocRef = doc(db, `classroom/${cid}/checkin/${cno}`);
      const checkinSnap = await getDoc(checkinDocRef);
      if (checkinSnap.exists()) {
        const data = checkinSnap.data();
        setCurrentCode(data.code);
        setStatus(data.status);
      } else {
        Swal.fire("ไม่พบข้อมูล", "ไม่พบข้อมูลเช็คชื่อ!", "error");
      }
    } catch (error) {
      console.error("Error fetching check-in data:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!currentUser) {
      Swal.fire("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อน", "warning");
      return;
    }

    if (status === 0) {
      Swal.fire("เช็คชื่อยังไม่เริ่ม", "ไม่สามารถเช็คชื่อได้ในขณะนี้", "info");
      return;
    }

    if (code !== currentCode) {
      Swal.fire("รหัสไม่ถูกต้อง!", "โปรดตรวจสอบรหัสเช็คชื่ออีกครั้ง", "error");
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

      const checkinDocRef = doc(db, `classroom/${cid}/checkin/${cno}`);
      await updateDoc(checkinDocRef, {
        count: increment(1),
      });

      Swal.fire("เช็คชื่อสำเร็จ!", "คุณได้เช็คชื่อเรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      Swal.fire("เกิดข้อผิดพลาด!", "เช็คชื่อไม่สำเร็จ กรุณาลองใหม่", "error");
    }
  };

  return (
    <div>
      <h2>เช็คชื่อ</h2>
      <p>รอบเช็คชื่อปัจจุบัน: {cno || "ยังไม่มี"}</p>

      <input
        type="text"
        placeholder="ลำดับเช็คชื่อ (cno)"
        value={cno}
        onChange={(e) => setCno(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="รหัสเช็คชื่อ"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={loading}
      />

      <button onClick={handleCheckin} disabled={status === 0 || loading}>
        {loading ? "กำลังโหลด..." : "เช็คชื่อ"}
      </button>

      {status === 0 && <p style={{ color: "red" }}>เช็คชื่อยังไม่เริ่ม</p>}
    </div>
  );
};

export default Checkin;
