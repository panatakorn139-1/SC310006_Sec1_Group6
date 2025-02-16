// src/Checkin.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, setDoc, doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Checkin.css";

const Checkin = () => {
  const { cid, cno } = useParams(); // cid และ cno ของห้องเรียนและการเช็คชื่อนั้น
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [checkinStatus, setCheckinStatus] = useState("closed");
  const [checkinCode, setCheckinCode] = useState("");

  useEffect(() => {
    // สังเกตการเปลี่ยนแปลงใน /classroom/{cid}/checkin/{cno}/students แบบ realtime
    const unsubscribe = onSnapshot(
      collection(db, "classroom", cid, "checkin", cno, "students"),
      (snapshot) => {
        const studentsData = [];
        snapshot.forEach((doc) => {
          studentsData.push({ id: doc.id, ...doc.data() });
        });
        setStudents(studentsData);
      }
    );
    return () => unsubscribe();
  }, [cid, cno]);

  const handleOpenCheckin = () => {
    setCheckinStatus("open");
    // อัปเดตสถานะใน Firestore ถ้าต้องการ
  };

  const handleCloseCheckin = () => {
    setCheckinStatus("closed");
    // อัปเดตสถานะใน Firestore ถ้าต้องการ
  };

  const handleSaveCheckin = async () => {
    // คัดลอกข้อมูลจาก /classroom/{cid}/checkin/{cno}/students ไปยัง /classroom/{cid}/checkin/{cno}/scores พร้อม status = 1
    students.forEach(async (student) => {
      await setDoc(
        doc(db, "classroom", cid, "checkin", cno, "scores", student.id),
        { ...student, status: 1 }
      );
    });
    alert("บันทึกการเช็คชื่อสำเร็จ");
  };

  const handleShowCheckinCode = async () => {
    // ดึงหรือกำหนดรหัสเช็คชื่อ
    const checkinRef = doc(db, "classroom", cid, "checkin", cno);
    const checkinSnap = await getDoc(checkinRef);
    if (checkinSnap.exists()) {
      setCheckinCode(checkinSnap.data().code);
    }
  };

  return (
    <div className="checkin-container">
      <h2>เช็คชื่อ</h2>
      <div className="checkin-header">
        <p>วิชา: {cid}</p>
        <p>การเช็คชื่อ: {cno}</p>
        <p>รหัสเช็คชื่อ: {checkinCode}</p>
      </div>
      <div className="checkin-actions">
        <button onClick={() => navigate(-1)}>ออก</button>
        <button onClick={handleOpenCheckin}>เปิดเช็คชื่อ</button>
        <button onClick={handleCloseCheckin}>ปิดเช็คชื่อ</button>
        <button onClick={handleSaveCheckin}>บันทึกการเช็คชื่อ</button>
        <button onClick={handleShowCheckinCode}>แสดงรหัสเช็คชื่อ</button>
        {/* เพิ่มปุ่มแสดง QRCode และถามตอบได้ที่นี่ */}
      </div>
      <div className="students-list">
        <h3>รายชื่อผู้เช็คชื่อ</h3>
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>รหัส</th>
              <th>ชื่อ</th>
              <th>หมายเหตุ</th>
              <th>วันเวลา</th>
              <th>ลบ</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, index) => (
              <tr key={s.id}>
                <td>{index + 1}</td>
                <td>{s.stdid || s.id}</td>
                <td>{s.name}</td>
                <td>{s.remark}</td>
                <td>{s.date?.toDate().toLocaleString()}</td>
                <td>
                  <button>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ปุ่มแสดงคะแนนและแก้ไขข้อมูลคะแนนสามารถเพิ่มส่วนนี้ได้ */}
    </div>
  );
};

export default Checkin;
