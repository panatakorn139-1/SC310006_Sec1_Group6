import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/db/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // ใช้ onAuthStateChanged เพื่อรอให้ข้อมูลผู้ใช้พร้อมก่อนทำการ fetch
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          photo: currentUser.photoURL,
        });
        // ดึงข้อมูลวิชาที่สอนจาก Firestore (collection "classroom" ที่มี owner ตรงกับ currentUser.uid)
        const fetchCourses = async () => {
          try {
            const q = query(
              collection(db, "classroom"),
              where("owner", "==", currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const coursesData = await Promise.all(
              querySnapshot.docs.map(async (docSnap) => {
                // ดึงข้อมูลจาก subcollection "info" (document "infoDoc")
                const infoDocRef = doc(db, "classroom", docSnap.id, "info", "infoDoc");
                const infoDocSnap = await getDoc(infoDocRef);
                const info = infoDocSnap.exists() ? infoDocSnap.data() : {};
                return { cid: docSnap.id, info };
              })
            );
            setCourses(coursesData);
          } catch (error) {
            console.error("Error fetching courses:", error);
          }
        };
        fetchCourses();
      } else {
        // หากไม่มีผู้ใช้ให้กลับไปหน้า login หรือหน้าหลัก
        navigate("/SC310006_Sec1_Group6");
      }
    });

    // ยกเลิกการ subscribe เมื่อ component ถูก unmount
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut();
    navigate("/SC310006_Sec1_Group6");
  };

  const handleAddCourse = () => {
    navigate("/SC310006_Sec1_Group6/add-classroom");
  };

  const handleEditProfile = () => {
    navigate("/SC310006_Sec1_Group6/profile");
  };

  const handleManageClassroom = (cid) => {
    navigate(`/SC310006_Sec1_Group6/classroom/${cid}`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        {user && (
          <div className="user-info">
            <img src={user.photo} alt="User Photo" className="user-photo" />
            <div className="user-details">
              <div className="font-bold">{user.name}</div>
              <div className="">{user.email}</div>
            </div>
          </div>
        )}
        <div className="header-actions">
          <button onClick={handleAddCourse} className="button">
            เพิ่มวิชา
          </button>
          <button onClick={handleEditProfile} className="button">
            แก้ไขข้อมูลส่วนตัว
          </button>
          <button onClick={handleLogout} className="button">
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-content">
        <div className="text-lg md:text-xl mb-2 md:mb-3">วิชาที่สอน</div>
        {courses.length > 0 ? (
          <ul className="course-list">
            {courses.map((course) => (
              <li key={course.cid} className="course-item">
                <img
                  src={course.info.photo}
                  alt={course.info.name}
                  className="course-photo"
                />
                <div className="course-info">
                  <h3>{course.info.name}</h3>
                  <p>รหัสวิชา: {course.info.code}</p>
                  <p>ห้องเรียน: {course.info.room}</p>
                </div>
                <button
                  onClick={() => handleManageClassroom(course.cid)}
                  className="button"
                >
                  จัดการห้องเรียน
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>ยังไม่มีวิชาที่สอน</p>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
