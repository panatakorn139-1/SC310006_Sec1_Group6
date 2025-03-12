import { useState, useEffect } from "react";
import { db } from "../../config/db/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import "./AnswerPanel.css";

const AnswerPanel = ({ cid, cno, onClose }) => {
  const [answersData, setAnswersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      try {
        console.log("🟢 กำลังโหลดข้อมูลสำหรับ cid:", cid, "cno:", cno);

        // ดึงข้อมูลนักเรียนที่ตอบคำถาม
        const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/answers/1/students`);
        const studentsSnap = await getDocs(studentsRef);

        let answers = studentsSnap.docs.map((docSnap) => ({
          stdid: docSnap.id, // รหัสนักศึกษา
          ...docSnap.data(),
        }));

        console.log("✅ คำตอบที่โหลด:", answers);

        // ดึงชื่อของนักเรียนแต่ละคนจาก `classroom/{cid}/students/{stdid}`
        const studentNames = await Promise.all(
          answers.map(async (answer) => {
            const studentDoc = await getDoc(doc(db, `classroom/${cid}/students`, answer.stdid));
            return {
              ...answer,
              name: studentDoc.exists() ? studentDoc.data().name : "ไม่ทราบชื่อ", // ถ้าไม่มีชื่อ ให้แสดง "ไม่ทราบชื่อ"
            };
          })
        );

        setAnswersData(studentNames);
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการโหลดคำตอบ:", error);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดคำตอบได้", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [cid, cno]);

  return (
    <div className="answer-panel">
      <h3>คำตอบของนักเรียน (รหัสเช็คชื่อ: {cno})</h3>
      {loading ? (
        <p>กำลังโหลดคำตอบ...</p>
      ) : (
        <>
          {answersData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่อนักศึกษา</th> {/* แสดงชื่อแทนรหัส */}
                  <th>คำตอบ</th>
                  <th>เวลาที่ส่ง</th>
                </tr>
              </thead>
              <tbody>
                {answersData.map((answer, index) => (
                  <tr key={answer.stdid}>
                    <td>{index + 1}</td>
                    <td>{answer.name}</td> {/* ใช้ชื่อที่ดึงมา */}
                    <td>{answer.text || "ไม่มีคำตอบ"}</td>
                    <td>
                      {answer.time && answer.time.toDate
                        ? new Date(answer.time.toDate()).toLocaleString()
                        : "ไม่ระบุ"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>ยังไม่มีคำตอบสำหรับการเช็คชื่อนี้</p>
          )}
        </>
      )}
      <button onClick={onClose} className="btn-secondary">ออก</button>
    </div>
  );
};

export default AnswerPanel;
