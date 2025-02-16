// src/EditProfile.js
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";
import "../styles/EditProfile.css";

const EditProfile = () => {
  // สมมุติว่าข้อมูลโปรไฟล์ดึงมาจาก auth.currentUser
  const currentUser = auth.currentUser;
  const [name, setName] = useState(currentUser ? currentUser.displayName : "");
  const [email, setEmail] = useState(currentUser ? currentUser.email : "");
  const [photo, setPhoto] = useState(currentUser ? currentUser.photoURL : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    // อัปเดตข้อมูลโปรไฟล์ Firebase Auth
    updateProfile(currentUser, {
      displayName: name,
      photoURL: photo,
    })
      .then(() => {
        alert("อัปเดตโปรไฟล์สำเร็จ");
        // อาจมีการอัปเดตข้อมูลใน Firestore ด้วย
      })
      .catch((error) => {
        console.error("Update error:", error);
        alert(error.message);
      });
  };

  return (
    <div className="edit-profile-container">
      <h2>แก้ไขข้อมูลส่วนตัว</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div>
          <label>ชื่อ:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>อีเมล:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>รูปภาพ:</label>
          <input
            type="text"
            placeholder="URL รูปภาพหรือเลือกจากรายการ"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />
          {/* สามารถเพิ่มปุ่ม Upload ได้ที่นี่ */}
        </div>
        <button type="submit">บันทึกข้อมูล</button>
      </form>
    </div>
  );
};

export default EditProfile;
