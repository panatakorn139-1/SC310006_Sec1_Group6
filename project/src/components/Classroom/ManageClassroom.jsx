import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../config/db/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import "./ManageClassroom.css";

const ManageClassroom = () => {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState(null);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [studentsCheckedIn, setStudentsCheckedIn] = useState([]);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchClassroomData();
      } else {
        console.warn("ไม่มีผู้ใช้ที่ล็อกอินอยู่");
      }
    });
    return () => unsubscribe();
  }, [cid]);

  const fetchClassroomData = async () => {
    try {
      const infoDocRef = doc(db, "classroom", cid, "info", "infoDoc");
      const infoSnap = await getDoc(infoDocRef);
      if (infoSnap.exists()) {
        setCourseInfo(infoSnap.data());
      } else {
        console.warn("ไม่พบข้อมูล infoDoc สำหรับ cid =", cid);
      }

      const checkinQuery = query(
        collection(db, "classroom", cid, "checkin"),
        orderBy("date", "desc")
      );
      const checkinSnap = await getDocs(checkinQuery);
      setCheckinHistory(
        checkinSnap.docs.map((docSnap) => ({
          cno: docSnap.id,
          ...docSnap.data(),
        }))
      );
    } catch (error) {
      console.error("Error fetching classroom data:", error);
    }
  };

  const handleAddCheckin = async () => {
    if (!currentUser) {
      alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    try {
      const checkinRef = collection(db, `classroom/${cid}/checkin`);
      const checkinSnap = await getDocs(checkinRef);
      const cno = (checkinSnap.size + 1).toString();

      const checkinDocRef = doc(db, `classroom/${cid}/checkin/${cno}`);
      await setDoc(checkinDocRef, {
        code: Math.random().toString(36).substr(2, 6).toUpperCase(),
        date: serverTimestamp(),
        status: 0,
        owner: currentUser.uid,
        count: 0
      });

      alert("เพิ่มการเช็คชื่อสำเร็จ!");
      fetchClassroomData();
    } catch (error) {
      console.error("Add checkin error:", error);
      alert(error.message);
    }
  };

  const handleChangeStatus = async (cno, newStatus) => {
    try {
      const checkinDocRef = doc(db, `classroom/${cid}/checkin/${cno}`);
      await updateDoc(checkinDocRef, { status: newStatus });
      fetchClassroomData();
    } catch (error) {
      console.error("Error updating check-in status:", error);
      alert(error.message);
    }
  };

  const fetchCheckedInStudents = async (cno) => {
    try {
      const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/students`);
      const studentsSnap = await getDocs(studentsRef);
      
      const students = studentsSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      
      setStudentsCheckedIn(students);
      setSelectedCheckin(cno);
    } catch (error) {
      console.error("Error fetching checked-in students:", error);
    }
  };

  return (
    <div className="manage-classroom-container max-w-5xl mx-auto">
      {courseInfo && (
        <div className="course-details shadow-xl p-4 md:p-8 rounded-3xl">
          <div className="text-xl md:text-3xl font-bold mb-1">{courseInfo.name}</div>
          <div className="text-md md:text-xl md:mb-4">รหัสวิชา: {courseInfo.code}</div>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <button onClick={() => navigate(`/classroom/${cid}/checkin`)} className="btn-primary">
          ไปที่หน้าเช็คชื่อ
        </button>
        <button onClick={() => navigate(`/classroom/${cid}/scores`)} className="btn-primary">
          ไปที่หน้าบันทึกคะแนน
        </button>
      </div>

      <button onClick={handleAddCheckin} className="mt-4 btn-primary">
        เพิ่มการเช็คชื่อ
      </button>

      <h3 className="mt-6">ประวัติการเช็คชื่อ</h3>
      <table className="checkin-history-table mt-2 w-full min-w-32">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>วัน-เวลา</th>
            <th>รหัสเช็คชื่อ</th>
            <th>จำนวนเข้าเรียน</th>
            <th>สถานะ</th>
            <th>ดูรายชื่อ</th>
            <th>เปลี่ยนสถานะ</th>
          </tr>
        </thead>
        <tbody>
          {checkinHistory.length > 0 ? (
            checkinHistory.map((checkin, index) => (
              <tr key={checkin.cno}>
                <td>{index + 1}</td>
                <td>{checkin.date ? new Date(checkin.date.toDate()).toLocaleString() : "-"}</td>
                <td>{checkin.code}</td>
                <td>{checkin.count || 0}</td>
                <td>{checkin.status === 0 ? "ยังไม่เริ่ม" : checkin.status === 1 ? "กำลังเช็คชื่อ" : "เสร็จสิ้น"}</td>
                <td>
                  <button onClick={() => fetchCheckedInStudents(checkin.cno)} className="btn-primary">
                    ดูรายชื่อ
                  </button>
                </td>
                <td>
                  <button onClick={() => handleChangeStatus(checkin.cno, (checkin.status + 1) % 3)} className="btn-primary">
                    เปลี่ยนสถานะ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">ยังไม่มีประวัติการเช็คชื่อ</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedCheckin && (
        <div className="mt-6">
          <h3>รายชื่อผู้เช็คชื่อ (รอบ {selectedCheckin})</h3>
          <ul>
            {studentsCheckedIn.length > 0 ? (
              studentsCheckedIn.map((student) => (
                <li key={student.id}>{student.name} ({student.stdid})</li>
              ))
            ) : (
              <p>ยังไม่มีนักเรียนเช็คชื่อ</p>
            )}
          </ul>
          <button onClick={() => setSelectedCheckin(null)} className="btn-primary">
            ปิด
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageClassroom;
