import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../../config/db/firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  setDoc,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import ReactQrCode from "react-qr-code";
import "./ManageClassroom.css";

const ManageClassroom = () => {
  const { cid } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // ใช้ onAuthStateChanged เพื่อติดตามสถานะการล็อกอิน
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchClassroomData();
      } else {
        // หากไม่มีผู้ใช้สามารถเพิ่มการ redirect ไปที่หน้า login ได้
        console.warn("ไม่มีผู้ใช้ที่ล็อกอินอยู่");
      }
    });
    return () => unsubscribe();
  }, [cid]);

  // ดึงข้อมูลของห้องเรียน: รายละเอียดวิชา, นักเรียนที่ลงทะเบียน และประวัติการเช็คชื่อ
  const fetchClassroomData = async () => {
    try {
      // ดึงข้อมูลรายละเอียดวิชาจาก subcollection "info" (document "infoDoc")
      const infoDocRef = doc(db, "classroom", cid, "info", "infoDoc");
      const infoSnap = await getDoc(infoDocRef);
      if (infoSnap.exists()) {
        setCourseInfo(infoSnap.data());
      } else {
        console.warn("ไม่พบข้อมูลใน infoDoc สำหรับ cid =", cid);
      }

      // ดึงรายชื่อนักเรียนที่ลงทะเบียน
      const studentsSnap = await getDocs(collection(db, "classroom", cid, "students"));
      const studentsData = [];
      studentsSnap.forEach((docSnap) => {
        studentsData.push({ id: docSnap.id, ...docSnap.data() });
      });
      setStudents(studentsData);

      // ดึงประวัติการเช็คชื่อเรียงตามวันที่ล่าสุดก่อน
      const checkinQuery = query(
        collection(db, "classroom", cid, "checkin"),
        orderBy("date", "desc")
      );
      const checkinSnap = await getDocs(checkinQuery);
      const checkins = [];
      checkinSnap.forEach((docSnap) => {
        checkins.push({ cno: docSnap.id, ...docSnap.data() });
      });
      setCheckinHistory(checkins);
    } catch (error) {
      console.error("Error fetching classroom data:", error);
    }
  };

  // ฟังก์ชันเพิ่มการเช็คชื่อใหม่
  const handleAddCheckin = async () => {
    if (!currentUser) {
      alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }
    try {
      const checkinRef = await addDoc(collection(db, "classroom", cid, "checkin"), {
        code: "รหัสเช็คชื่อ",
        date: new Date(),
        status: 0,
        owner: currentUser.uid,
      });
      const cno = checkinRef.id;

      // คัดลอกรายชื่อนักเรียนไปยัง subcollection "scores" ของ checkin session ที่สร้างใหม่ พร้อมกำหนด status=0
      const studentsSnap = await getDocs(collection(db, "classroom", cid, "students"));
      studentsSnap.forEach(async (docSnap) => {
        await setDoc(
          doc(db, "classroom", cid, "checkin", cno, "scores", docSnap.id),
          {
            ...docSnap.data(),
            status: 0,
          }
        );
      });
      alert("เพิ่มการเช็คชื่อสำเร็จ");

      // รีเฟรชประวัติการเช็คชื่อ
      const checkinQuery = query(
        collection(db, "classroom", cid, "checkin"),
        orderBy("date", "desc")
      );
      const checkinSnap = await getDocs(checkinQuery);
      const checkins = [];
      checkinSnap.forEach((docSnap) => {
        checkins.push({ cno: docSnap.id, ...docSnap.data() });
      });
      setCheckinHistory(checkins);
    } catch (error) {
      console.error("Add checkin error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="manage-classroom-container">
      {courseInfo && (
        <div className="course-details">
          <h2>{courseInfo.name}</h2>
          <p>รหัสวิชา: {courseInfo.code}</p>
          <img src={courseInfo.photo} alt={courseInfo.name} className="course-bg" />
          {/* แสดง QR code โดยใช้ react-qr-code */}
          <div className="qrcode-container">
            <ReactQrCode value={cid} size={128} />
          </div>
        </div>
      )}

      <h3>รายชื่อนักเรียนที่ลงทะเบียน</h3>
      <table className="students-table">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>รหัส</th>
            <th>ชื่อ</th>
            <th>รูปภาพ</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s, index) => (
              <tr key={s.id}>
                <td>{index + 1}</td>
                <td>{s.stdid || s.id}</td>
                <td>{s.name}</td>
                <td>
                  {s.photo ? (
                    <img src={s.photo} alt={s.name} width="50" />
                  ) : (
                    "ไม่มี"
                  )}
                </td>
                <td>{s.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">ยังไม่มีนักเรียนลงทะเบียน</td>
            </tr>
          )}
        </tbody>
      </table>

      <button onClick={handleAddCheckin} className="button">
        เพิ่มการเช็คชื่อ
      </button>

      <h3>ประวัติการเช็คชื่อ</h3>
      <table className="checkin-history-table">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>วัน-เวลา</th>
            <th>จำนวนคนเข้าเรียน</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {checkinHistory.length > 0 ? (
            checkinHistory.map((checkin, index) => (
              <tr key={checkin.cno}>
                <td>{index + 1}</td>
                <td>{new Date(checkin.date.seconds * 1000).toLocaleString()}</td>
                <td>{checkin.count ? checkin.count : "-"}</td>
                <td>{checkin.status === 0 ? "กำลังเรียน" : "เสร็จสิ้น"}</td>
                <td>
                  <button className="button">เช็คเชื่อ</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">ยังไม่มีประวัติการเช็คชื่อ</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageClassroom;
