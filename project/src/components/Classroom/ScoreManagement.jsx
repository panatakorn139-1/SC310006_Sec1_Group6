import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const db = getFirestore();

const ScoreManagement = () => {
  const { cid } = useParams();
  const [cno, setCno] = useState("");
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (cno) {
      fetchScores();
    }
  }, [cno]);

  const fetchScores = async () => {
    const scoresRef = collection(db, `classroom/${cid}/checkin/${cno}/scores`);
    const scoresSnap = await getDocs(scoresRef);
    const scoresData = scoresSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setScores(scoresData);
  };

  const updateScore = async (studentId, newScore, newRemark) => {
    const scoreRef = doc(db, `classroom/${cid}/checkin/${cno}/scores/${studentId}`);

    try {
      await updateDoc(scoreRef, {
        score: newScore,
        remark: newRemark
      });
      alert("อัปเดตคะแนนสำเร็จ!");
      fetchScores();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตคะแนน:", error);
    }
  };

  return (
    <div>
      <h2>จัดการคะแนน</h2>
      <input type="text" placeholder="ลำดับเช็คชื่อ (cno)" value={cno} onChange={(e) => setCno(e.target.value)} />
      <button onClick={fetchScores}>โหลดคะแนน</button>
      <table>
        <thead>
          <tr>
            <th>รหัสนักเรียน</th>
            <th>ชื่อ</th>
            <th>คะแนน</th>
            <th>หมายเหตุ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score) => (
            <tr key={score.id}>
              <td>{score.stdid}</td>
              <td>{score.name}</td>
              <td><input type="number" value={score.score} onChange={(e) => updateScore(score.id, e.target.value, score.remark)} /></td>
              <td><input type="text" value={score.remark} onChange={(e) => updateScore(score.id, score.score, e.target.value)} /></td>
              <td><button onClick={() => updateScore(score.id, score.score, score.remark)}>บันทึก</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreManagement;
