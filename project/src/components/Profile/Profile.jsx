import { useState, useEffect } from "react";
import { auth } from "../../config/db/firebase";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import "./Profile.css";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setName(user.displayName || "");
        setEmail(user.email || "");
        setPhoto(user.photoURL || "");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("ไม่พบข้อมูลผู้ใช้");
      return;
    }
    // อัปเดตข้อมูลโปรไฟล์ Firebase Auth
    updateProfile(currentUser, {
      displayName: name,
      photoURL: photo,
    })
      .then(() => {
        alert("อัปเดตโปรไฟล์สำเร็จ");
        // หากต้องการอัปเดตข้อมูลใน Firestore เพิ่มโค้ดในนี้
      })
      .catch((error) => {
        console.error("Update error:", error);
        alert(error.message);
      });
  };

  return (
    <div className="edit-profile-container">
      <div className="text-lg font-medium md:text-xl mb-2 md:mb-4">แก้ไขข้อมูลส่วนตัว</div >
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

export default Profile;
