import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { auth, db } from "../../assets/services/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const AnswerQuestionModal = ({ classroom, onClose }) => {
  const [checkinList, setCheckinList] = useState([]);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [questionNo, setQuestionNo] = useState("");
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const checkinQuery = collection(db, `classroom/${classroom.id}/checkin`);
        const checkinSnap = await getDocs(checkinQuery);
        const checkins = checkinSnap.docs.map((docSnap) => ({
          cno: docSnap.id,
          ...docSnap.data(),
        }));
        setCheckinList(checkins);

        const activeCheckin = checkins.find((c) => c.question_show === true) || checkins[0];
        if (activeCheckin) {
          setSelectedCheckin(activeCheckin.cno);
          setQuestionNo(activeCheckin.question_no || "");
          setQuestionText(activeCheckin.question_text || "");
        }
      } catch (error) {
        console.error("Fetch checkin error:", error);
        Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลเช็คชื่อได้: " + error.message);
      }
    };

    if (classroom) {
      fetchCheckins();
    }
  }, [classroom]);

  const submitAnswer = async () => {
    if (!answerText.trim()) {
      Alert.alert("⚠️ ข้อผิดพลาด", "กรุณากรอกคำตอบ");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("⚠️ กรุณาเข้าสู่ระบบ", "กรุณาเข้าสู่ระบบก่อนตอบคำถาม");
        return;
      }

      const answerRef = doc(
        db,
        `classroom/${classroom.id}/checkin/${selectedCheckin}/answers/${questionNo}/students`,
        user.uid
      );
      await setDoc(answerRef, {
        text: answerText,
        time: serverTimestamp(),
      });

      Alert.alert("✅ สำเร็จ!", "ส่งคำตอบเรียบร้อยแล้ว");
      setAnswerText("");
      onClose();
    } catch (error) {
      console.error("Submit answer error:", error);
      Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถส่งคำตอบได้: " + error.message);
    }
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>ตอบคำถาม</Text>
          {selectedCheckin ? (
            <>
              <Text style={styles.questionLabel}>
                คำถามข้อที่ {questionNo}: {questionText}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="พิมพ์คำตอบของคุณ"
                value={answerText}
                onChangeText={setAnswerText}
                multiline
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={submitAnswer}
              >
                <Text style={styles.buttonText}>ส่งคำตอบ</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noQuestionText}>ยังไม่มีคำถามในขณะนี้</Text>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>ปิด</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  noQuestionText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 60,
  },
  confirmButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AnswerQuestionModal;