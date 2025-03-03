import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import { QRCodeCanvas } from "qrcode.react";
import "./ManageClassroom.css";

const ManageClassroom = () => {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [studentsCheckedIn, setStudentsCheckedIn] = useState([]);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchClassroomData();
        checkJoinClassroom(user);
      } else {
        Swal.fire("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อน", "warning").then(() => {
          navigate("/");
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
      }

      const studentsRef = collection(db, `classroom/${cid}/students`);
      const studentsSnap = await getDocs(studentsRef);
      setStudents(studentsSnap.docs.map(docSnap => docSnap.data()));

      const checkinQuery = query(
        collection(db, "classroom", cid, "checkin"),
        orderBy("date", "desc")
      );
      const checkinSnap = await getDocs(checkinQuery);
      setCheckinHistory(checkinSnap.docs.map(docSnap => ({
        cno: docSnap.id,
        ...docSnap.data()
      })));
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const checkJoinClassroom = async (user) => {
    const joinClass = searchParams.get("join") === "true";
    if (joinClass) {
      try {
        const studentRef = doc(db, `classroom/${cid}/students`, user.uid);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
          await setDoc(studentRef, {
            name: user.displayName || "ไม่ทราบชื่อ",
            stdid: user.uid,
            status: 1,
          });

          await setDoc(doc(db, `users/${user.uid}/classroom`, cid), {
            status: 2,
          });

          Swal.fire("สำเร็จ!", "คุณเข้าร่วมห้องเรียนเรียบร้อยแล้ว", "success");
        } else {
          Swal.fire("แจ้งเตือน", "คุณอยู่ในห้องเรียนนี้แล้ว", "info");
        }

        navigate(`/classroom/${cid}`);
      } catch (error) {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเข้าห้องเรียนได้", "error");
      }
    }
  };

  const createNewCheckin = async () => {
    try {
      const checkinRef = collection(db, "classroom", cid, "checkin");
      const checkinSnap = await getDocs(checkinRef);
      const newCheckinNumber = checkinSnap.docs.length + 1; // กำหนดลำดับถัดไป

      // สร้างรหัสเช็คชื่อแบบสุ่ม
      const checkinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // กำหนด ID เป็นตัวเลขลำดับแทนค่าอัตโนมัติ
      const newCheckinRef = doc(db, "classroom", cid, "checkin", newCheckinNumber.toString());

      await setDoc(newCheckinRef, {
        code: checkinCode,
        date: serverTimestamp(),
        status: 1,
        count: 0
      });

      Swal.fire("สำเร็จ", "สร้างการเช็คชื่อใหม่เรียบร้อยแล้ว", "success");
      fetchClassroomData();
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถสร้างการเช็คชื่อใหม่ได้", "error");
    }
  };

  const toggleCheckinStatus = async (cno, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 2 : 1;
      await updateDoc(doc(db, "classroom", cid, "checkin", cno), {
        status: newStatus
      });
      Swal.fire("สำเร็จ", `เช็คชื่อถูก ${newStatus === 1 ? "เปิด" : "ปิด"} แล้ว`, "success");
      fetchClassroomData();
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเปลี่ยนสถานะเช็คชื่อได้", "error");
    }
  };

  const fetchCheckedInStudents = async (cno) => {
    try {
      const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/students`);
      const studentsSnap = await getDocs(studentsRef);
      const checkedInStudents = studentsSnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setStudentsCheckedIn(checkedInStudents);
      setSelectedCheckin(cno);
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดรายชื่อได้", "error");
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
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
                <div>
                  <div>
                    <div className="text-xl md:text-3xl font-bold mb-1">{courseInfo.name}</div>
                    <div className="text-md md:text-xl md:mb-4">รหัสวิชา: {courseInfo.code}</div>
                  </div>
                  <div className="qrcode-container">
                    <h3>QR Code สำหรับเข้าห้องเรียน</h3>
                    <QRCodeCanvas
                      value={`${window.location.origin}/classroom/${cid}?join=true`}
                      size={128}
                    />
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl mt-4 md:mt-0 max-w-md">
                  <img src={courseInfo.photo} alt={courseInfo.name} className="course-bg w-full min-w-sm" />
                </div>
              </div>
            </div>
          )}

          <button onClick={createNewCheckin} className="btn-primary mb-5 mt-10">
            + เพิ่มการเช็คชื่อใหม่
          </button>

          <div className="text-md md:text-xl mt-6">รายชื่อนักเรียนที่ลงทะเบียน</div>
          <table className="students-table mt-2 w-full">
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
          <table className="students-table mt-2 w-full">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>วัน-เวลา</th>
                <th>รหัสเช็คชื่อ</th>
                <th>จำนวนเข้าเรียน</th>
                <th>สถานะ</th>
                <th>เปลี่ยนสถานะ</th>
                <th>ดูรายชื่อ</th>
              </tr>
            </thead>
            <tbody>
              {checkinHistory.map((checkin, index) => (
                <tr key={checkin.cno}>
                  <td>{index + 1}</td>
                  <td>{new Date(checkin.date.toDate()).toLocaleString()}</td>
                  <td>{checkin.code}</td>
                  <td>{checkin.count || 0}</td>
                  <td>{checkin.status === 1 ? "กำลังเช็คชื่อ" : "ปิดเช็คชื่อ"}</td>
                  <td>
                    <button onClick={() => toggleCheckinStatus(checkin.cno, checkin.status)}>
                      {checkin.status === 1 ? "ปิด" : "เปิด"}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => fetchCheckedInStudents(checkin.cno)}>
                      ดูรายชื่อ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* แสดงรายชื่อนักเรียนที่เช็คชื่อแล้ว */}
          {selectedCheckin && (
            <div className="checked-in-students mt-4">
              <div className="text-md md:text-xl">รายชื่อนักเรียนที่เช็คชื่อแล้ว (รหัสเช็คชื่อ: {checkinHistory.find(c => c.cno === selectedCheckin)?.code})</div>
              {studentsCheckedIn.length > 0 ? (
                <table className="students-table mt-2 w-full">
                  <thead>
                    <tr>
                      <th>ลำดับ</th>
                      <th>ชื่อ</th>
                      <th>รหัสนักศึกษา</th>
                      <th>วันที่และเวลาเช็คชื่อ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsCheckedIn.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.stdid}</td>
                        <td>
                          {student.date // เปลี่ยนจาก timestamp เป็น date
                            ? new Date(student.date).toLocaleString() // แปลง string ISO 8601 เป็นวันที่
                            : "ไม่พบข้อมูลเวลา"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>ยังไม่มีนักเรียนเช็คชื่อสำหรับรหัสนี้</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageClassroom;