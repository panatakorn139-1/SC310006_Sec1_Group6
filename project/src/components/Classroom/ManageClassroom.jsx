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
import Swal from "sweetalert2";
import "./ManageClassroom.css";

const ManageClassroom = () => {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState(null);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [studentsCheckedIn, setStudentsCheckedIn] = useState([]);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchClassroomData();
      } else {
        Swal.fire("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อน", "warning").then(() => {
          navigate("/SC310006_Sec1_Group6");
        });
      }
    });
    return () => unsubscribe();
  }, [cid]);

  const fetchClassroomData = async () => {
    setLoading(true);
    try {
      const infoDocRef = doc(db, "classroom", cid, "info", "infoDoc");
      const infoSnap = await getDoc(infoDocRef);
      if (infoSnap.exists()) {
        setCourseInfo(infoSnap.data());
      } else {
        Swal.fire("แจ้งเตือน", "ไม่พบข้อมูลวิชาเรียน", "warning");
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
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCheckin = async () => {
    if (!currentUser) {
      Swal.fire("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อน", "warning");
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

      Swal.fire("สำเร็จ!", "เพิ่มการเช็คชื่อเรียบร้อยแล้ว", "success");
      fetchClassroomData();
    } catch (error) {
      console.error("Add checkin error:", error);
      Swal.fire("เกิดข้อผิดพลาด", error.message, "error");
    }
  };

  const handleChangeStatus = async (cno, newStatus) => {
    try {
      const checkinDocRef = doc(db, `classroom/${cid}/checkin/${cno}`);
      await updateDoc(checkinDocRef, { status: newStatus });
      fetchClassroomData();
    } catch (error) {
      console.error("Error updating check-in status:", error);
      Swal.fire("เกิดข้อผิดพลาด", error.message, "error");
    }
  };

  return (
    <div className="manage-classroom-container max-w-5xl mx-auto">
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          {courseInfo && (
            <div className="course-details shadow-xl p-4 md:p-8 rounded-3xl">
              <h2 className="text-3xl font-bold mb-2">{courseInfo.name}</h2>
              <p className="text-xl">รหัสวิชา: {courseInfo.code}</p>
            </div>
          )}

          <div className="mt-4 flex gap-4">
            <button onClick={() => navigate(`/SC310006_Sec1_Group6/classroom/${cid}/checkin`)} className="btn-primary">
              ไปที่หน้าเช็คชื่อ
            </button>
            <button onClick={() => navigate(`/SC310006_Sec1_Group6/classroom/${cid}/scores`)} className="btn-primary">
              ไปที่หน้าบันทึกคะแนน
            </button>
          </div>

          <button onClick={handleAddCheckin} className="mt-4 btn-primary">
            เพิ่มการเช็คชื่อ
          </button>

          <h3 className="mt-6">ประวัติการเช็คชื่อ</h3>
          <table className="checkin-history-table mt-2 w-full">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>วัน-เวลา</th>
                <th>รหัสเช็คชื่อ</th>
                <th>จำนวนเข้าเรียน</th>
                <th>สถานะ</th>
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
                      <button onClick={() => handleChangeStatus(checkin.cno, (checkin.status + 1) % 3)} className="btn-primary">
                        เปลี่ยนสถานะ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">ยังไม่มีประวัติการเช็คชื่อ</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ManageClassroom;
