import { useState } from "react";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../config/db/firebase";
import { useNavigate } from "react-router-dom";
import "./AddClassroom.css";

const AddClassroom = () => {
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [classroomName, setClassroomName] = useState("");
  const [imageLink, setImageLink] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // สร้าง document ห้องเรียนใน collection "classroom" พร้อมเก็บ owner เท่านั้น
      const classroomRef = await addDoc(collection(db, "classroom"), {
        owner: auth.currentUser.uid,
      });
      const cid = classroomRef.id;

      // สร้าง subcollection "info" พร้อม document "infoDoc" สำหรับข้อมูลวิชา
      await setDoc(doc(db, "classroom", cid, "info", "infoDoc"), {
        code: courseCode,
        name: courseName,
        room: classroomName,
        photo: imageLink,
      });

      // บันทึกข้อมูลใน /users/{uid}/classroom/{cid} พร้อม status = 1
      await setDoc(doc(db, "users", auth.currentUser.uid, "classroom", cid), {
        status: 1,
      });

      alert("เพิ่มวิชาใหม่สำเร็จ");
      navigate("/SC310006_Sec1_Group6/dashboard");
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
          <label style={{ display: "block", textAlign: "left" }}>รหัสวิชา:</label> 
          <input
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder="รหัสวิชา"
            required
          />
        </div>
        <div>
          <label style={{ display: "block", textAlign: "left" }}>ชื่อวิชา:</label> 
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="ชื่อวิชา"
            required
          />
        </div>
        <div>
          <label style={{ display: "block", textAlign: "left" }}>ชื่อห้องเรียน:</label> 
          <input
            type="text"
            value={classroomName}
            onChange={(e) => setClassroomName(e.target.value)}
            placeholder="ชื่อห้องเรียน"
            required
          />
        </div>
        <div>
          <label style={{ display: "block", textAlign: "left" }}>Link รูปภาพ:</label> 
          <input
            type="text"
            value={imageLink}
            onChange={(e) => setImageLink(e.target.value)}
            placeholder="Link รูปภาพ"
          />
        </div>
        <button type="submit">บันทึกข้อมูล</button>
      </form>
    </div>
  );
};

export default AddClassroom;
