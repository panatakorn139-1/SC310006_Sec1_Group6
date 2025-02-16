// src/QnA.js
import React, { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useParams } from "react-router-dom";
import "../styles/QnA.css";

const QnA = () => {
  const { cid, cno } = useParams();
  const [questionNo, setQuestionNo] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [answers, setAnswers] = useState([]);

  const handleStartQuestion = async () => {
    // กำหนดค่าใน /classroom/{cid}/checkin/{cno}
    await setDoc(
      doc(db, "classroom", cid, "checkin", cno),
      {
        question_no: questionNo,
        question_text: questionText,
        question_show: true,
      },
      { merge: true }
    );
    setIsQuestionActive(true);
  };

  const handleCloseQuestion = async () => {
    await setDoc(
      doc(db, "classroom", cid, "checkin", cno),
      {
        question_show: false,
      },
      { merge: true }
    );
    setIsQuestionActive(false);
  };

  useEffect(() => {
    // สังเกตคำตอบ realtime จาก /classroom/{cid}/checkin/{cno}/answers/{qno}
    if (questionNo) {
      const answersRef = collection(db, "classroom", cid, "checkin", cno, "answers", questionNo, "students");
      const unsubscribe = onSnapshot(answersRef, (snapshot) => {
        const answersData = [];
        snapshot.forEach((doc) => {
          answersData.push({ id: doc.id, ...doc.data() });
        });
        setAnswers(answersData);
      });
      return () => unsubscribe();
    }
  }, [cid, cno, questionNo]);

  return (
    <div className="qna-container">
      <h2>ถาม-ตอบ</h2>
      <div className="question-form">
        <input
          type="text"
          placeholder="ข้อที่"
          value={questionNo}
          onChange={(e) => setQuestionNo(e.target.value)}
        />
        <input
          type="text"
          placeholder="ข้อความคำถาม"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
        <button onClick={handleStartQuestion}>เริ่มถาม</button>
        <button onClick={handleCloseQuestion}>ปิดคำถาม</button>
      </div>
      <div className="answers-list">
        <h3>คำตอบ</h3>
        <ul>
          {answers.map((ans, index) => (
            <li key={ans.id}>
              {index + 1}. {ans.text} ({new Date(ans.time?.seconds * 1000).toLocaleString()})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QnA;
