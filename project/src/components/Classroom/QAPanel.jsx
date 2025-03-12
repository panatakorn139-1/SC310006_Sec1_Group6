import { useState, useEffect } from "react";
import { db } from "../../config/db/firebase";
import { doc, updateDoc, collection, onSnapshot, getDocs, query, orderBy } from "firebase/firestore";
import Swal from "sweetalert2";
import "./QAPanel.css";

const QAPanel = ({ cid, selectedCheckin, onClose }) => {
  const [questionNo, setQuestionNo] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [checkinList, setCheckinList] = useState([]); // รายการการเช็คชื่อ
  const [localSelectedCheckin, setLocalSelectedCheckin] = useState(selectedCheckin); // เก็บ cno ที่เลือกใน QAPanel

  // ดึงรายการเช็คชื่อทั้งหมดเมื่อเปิด QAPanel
  useEffect(() => {
    const fetchCheckinList = async () => {
      const checkinQuery = query(
        collection(db, "classroom", cid, "checkin"),
        orderBy("date", "desc")
      );
      const checkinSnap = await getDocs(checkinQuery);
      const checkins = checkinSnap.docs.map((docSnap) => ({
        cno: docSnap.id,
        ...docSnap.data(),
      }));
      setCheckinList(checkins);
      if (!localSelectedCheckin && checkins.length > 0) {
        setLocalSelectedCheckin(checkins[0].cno); // เลือกครั้งแรกอัตโนมัติ
      }
    };
    fetchCheckinList();
  }, [cid]);

  // Realtime Listener สำหรับคำตอบ
  useEffect(() => {
    if (localSelectedCheckin && questionNo) {
      const answersRef = collection(
        db,
        `classroom/${cid}/checkin/${localSelectedCheckin}/answers/${questionNo}/students`
      );
      const unsubscribe = onSnapshot(answersRef, (snapshot) => {
        const answersData = snapshot.docs.map((docSnap) => ({
          stdid: docSnap.id,
          ...docSnap.data(),
        }));
        setAnswers(answersData);
      });
      return () => unsubscribe();
    }
  }, [cid, localSelectedCheckin, questionNo]);

  const startQuestion = async () => {
    if (!localSelectedCheckin) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกการเช็คชื่อก่อนตั้งคำถาม", "warning");
      return;
    }
    if (!questionNo || !questionText) {
      Swal.fire("แจ้งเตือน", "กรุณากรอกหมายเลขคำถามและข้อความคำถาม", "warning");
      return;
    }

    try {
      const checkinRef = doc(db, "classroom", cid, "checkin", localSelectedCheckin);
      await updateDoc(checkinRef, {
        question_no: questionNo,
        question_text: questionText,
        question_show: true,
      });
      Swal.fire("สำเร็จ", "เริ่มการถามคำถามเรียบร้อยแล้ว", "success");
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถตั้งคำถามได้", "error");
    }
  };

  const stopQuestion = async () => {
    if (!localSelectedCheckin) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกการเช็คชื่อก่อนปิดคำถาม", "warning");
      return;
    }

    try {
      const checkinRef = doc(db, "classroom", cid, "checkin", localSelectedCheckin);
      await updateDoc(checkinRef, {
        question_show: false,
      });
      setAnswers([]);
      Swal.fire("สำเร็จ", "ปิดคำถามเรียบร้อยแล้ว", "success");
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถปิดคำถามได้", "error");
    }
  };

  return (
    <div className="qa-panel">
      <h3>ตั้งคำถามในห้องเรียน</h3>
      <div>
        <label>เลือกการเช็คชื่อ: </label>
        <select
          value={localSelectedCheckin || ""}
          onChange={(e) => setLocalSelectedCheckin(e.target.value)}
        >
          <option value="">-- เลือกการเช็คชื่อ --</option>
          {checkinList.map((checkin) => (
            <option key={checkin.cno} value={checkin.cno}>
              {checkin.code} ({new Date(checkin.date.toDate()).toLocaleString()})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>หมายเลขคำถาม: </label>
        <input
          type="text"
          value={questionNo}
          onChange={(e) => setQuestionNo(e.target.value)}
          placeholder="เช่น 1, 2, 3"
        />
      </div>
      <div>
        <label>ข้อความคำถาม: </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="พิมพ์คำถามที่นี่"
        />
      </div>
      <button onClick={startQuestion} className="btn-primary">
        เริ่มถาม
      </button>
      <button onClick={stopQuestion} className="btn-secondary">
        ปิดคำถาม
      </button>
      <button onClick={onClose} className="btn-secondary">
        ออก
      </button>

      {answers.length > 0 && (
        <div className="answers-section">
          <h4>คำตอบจากนักเรียน</h4>
          <table>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>รหัสนักศึกษา</th>
                <th>คำตอบ</th>
                <th>เวลาที่ส่ง</th>
              </tr>
            </thead>
            <tbody>
              {answers.map((answer, index) => (
                <tr key={answer.stdid}>
                  <td>{index + 1}</td>
                  <td>{answer.stdid}</td>
                  <td>{answer.text}</td>
                  <td>
                    {answer.time
                      ? new Date(answer.time.toDate()).toLocaleString()
                      : "ไม่ระบุ"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QAPanel;