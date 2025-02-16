// src/AddCourse.js
import React, { useState } from "react";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/AddCourse.css";

const AddCourse = () => {
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [classroomName, setClassroomName] = useState("");
  const [imageLink, setImageLink] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // สร้าง document ใน collection classroom
      const classroomRef = await addDoc(collection(db, "classroom"), {
        owner: auth.currentUser.uid,
        info: {
          code: courseCode,
          name: courseName,
          room: classroomName,
          photo: imageLink,
        },
      });
      const cid = classroomRef.id;

      // บันทึกข้อมูลใน /users/{uid}/classroom/{cid} พร้อม status = 1
      await setDoc(
        doc(db, "users", auth.currentUser.uid, "classroom", cid),
        {
          status: 1,
        }
      );

      alert("เพิ่มวิชาสำเร็จ");
      navigate("/dashboard");
    } catch (error) {
      console.error("Add course error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="add-course-container">
      <h2>เพิ่มวิชาใหม่</h2>
      <form onSubmit={handleSubmit} className="add-course-form">
        <div>
          <label>รหัสวิชา:</label>
          <input
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            required
          />
        </div>
        <div>
          <label>ชื่อวิชา:</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>ชื่อห้องเรียน:</label>
          <input
            type="text"
            value={classroomName}
            onChange={(e) => setClassroomName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Link รูปภาพ:</label>
          <input
            type="text"
            value={imageLink}
            onChange={(e) => setImageLink(e.target.value)}
          />
          {/* หรือให้มีปุ่ม Upload / เลือกรูปภาพ */}
        </div>
        <button type="submit">บันทึกข้อมูล</button>
      </form>
    </div>
  );
};

export default AddCourse;
