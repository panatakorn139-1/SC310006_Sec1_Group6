import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Camera, CameraView } from "expo-camera";
import { auth, db } from "../../assets/services/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import AnswerQuestionModal from "./AnswerQuestionModal"; // นำเข้า component ใหม่

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [classroomIdInput, setClassroomIdInput] = useState("");
  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("⚠️ กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนดูห้องเรียน");
        router.replace("/login");
        return;
      }
      const studentRef = collection(db, `users/${user.uid}/classroom`);
      const querySnapshot = await getDocs(studentRef);
      const classroomData = [];
      for (const classDoc of querySnapshot.docs) {
        const cid = classDoc.id;
        const infoRef = doc(db, `classroom/${cid}/info`, "infoDoc");
        const infoSnap = await getDoc(infoRef);
        if (infoSnap.exists()) {
          classroomData.push({
            id: cid,
            ...infoSnap.data(),
            status: classDoc.data().status,
          });
        }
      }
      setClassrooms(classroomData);
    } catch (error) {
      console.error("Fetch classrooms error:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดห้องเรียนได้: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setCameraOpen(false);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("⚠️ กรุณาเข้าสู่ระบบ", "กรุณาเข้าสู่ระบบก่อนเข้าห้องเรียน");
        return;
      }

      const url = new URL(data);
      const cid = url.pathname.split("/")[2];
      const joinParam = url.searchParams.get("join");

      if (joinParam === "true") {
        await joinClassroom(user, cid);
        router.push(`/classroom/${cid}`);
      } else {
        Alert.alert("⚠️ แจ้งเตือน", "QR Code ไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("Scan QR error:", error);
      Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถดำเนินการได้: " + error.message);
    }
  };

  const joinClassroom = async (user, cid) => {
    try {
      console.log("Joining classroom with CID:", cid);
      const infoRef = doc(db, `classroom/${cid}/info`, "infoDoc");
      const infoSnap = await getDoc(infoRef);
      console.log("Info snapshot exists:", infoSnap.exists(), "Data:", infoSnap.data());

      if (!infoSnap.exists()) {
        Alert.alert("❌ ไม่พบห้องเรียน", `รหัสห้องเรียน ${cid} ไม่ถูกต้อง`);
        return;
      }

      const studentRef = doc(db, `classroom/${cid}/students`, user.uid);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        await setDoc(studentRef, {
          stdid: user.uid,
          name: user.displayName || "ไม่ทราบชื่อ",
          status: 0,
        });

        await setDoc(doc(db, `users/${user.uid}/classroom`, cid), {
          status: 2,
        });

        Alert.alert("✅ สำเร็จ!", "คุณเข้าร่วมห้องเรียนเรียบร้อยแล้ว รอการตรวจสอบจากอาจารย์");
        fetchClassrooms();
      } else {
        Alert.alert("📌 แจ้งเตือน", "คุณอยู่ในห้องเรียนนี้แล้ว");
      }
    } catch (error) {
      console.error("Join classroom error:", error);
      Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถเข้าร่วมห้องเรียนได้: " + error.message);
    }
  };

  const handleAddClassroom = async () => {
    const trimmedClassroomId = classroomIdInput.trim();
    console.log("Attempting to join classroom with ID:", trimmedClassroomId);

    if (!trimmedClassroomId) {
      Alert.alert("⚠️ ข้อผิดพลาด", "กรุณากรอกรหัสห้องเรียน");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("⚠️ กรุณาเข้าสู่ระบบ", "กรุณาเข้าสู่ระบบก่อนเพิ่มห้องเรียน");
        return;
      }

      await joinClassroom(user, trimmedClassroomId);
      setModalVisible(false);
      setClassroomIdInput("");
      router.push(`/classroom/${trimmedClassroomId}`);
    } catch (error) {
      console.error("Add classroom error:", error);
      Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถเพิ่มห้องเรียนได้: " + error.message);
    }
  };

  const openAnswerModal = (classroom) => {
    setSelectedClassroom(classroom);
    setAnswerModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ห้องเรียนของฉัน</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : classrooms.length > 0 ? (
        <FlatList
          data={classrooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.classroomCard}
              onPress={() => router.push(`/classroom/${item.id}`)}
            >
              <View style={styles.classroomHeader}>
                <Text style={styles.classroomTitle}>{item.name}</Text>
                <Text style={styles.classroomCode}>รหัสวิชา: {item.code}</Text>
              </View>
              <Text style={styles.classroomRoom}>
                ห้องเรียน: {item.room || "ไม่ระบุ"}
              </Text>
              <TouchableOpacity
                style={styles.answerButton}
                onPress={() => openAnswerModal(item)}
              >
                <Text style={styles.buttonText}>ตอบคำถาม</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noClassText}>ยังไม่มีห้องเรียน</Text>
      )}

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          setScanned(false);
          setCameraOpen(true);
        }}
      >
        <Text style={styles.buttonText}>สแกน QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>เพิ่มวิชาเอง</Text>
      </TouchableOpacity>

      <Modal visible={cameraOpen} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            barcodeScannerSettings={{ barCodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCameraOpen(false)}
          >
            <Text style={styles.buttonText}>ปิดกล้อง</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มวิชาใหม่</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกรหัสห้องเรียน (CID)"
              value={classroomIdInput}
              onChangeText={setClassroomIdInput}
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleAddClassroom}
            >
              <Text style={styles.buttonText}>เพิ่มวิชา</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {answerModalVisible && (
        <AnswerQuestionModal
          classroom={selectedClassroom}
          onClose={() => setAnswerModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  classroomCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
  },
  classroomHeader: {
    marginBottom: 10,
  },
  classroomTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  classroomCode: {
    fontSize: 14,
    color: "#555",
  },
  classroomRoom: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  answerButton: {
    backgroundColor: "#17a2b8",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  noClassText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  scanButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  camera: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
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
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
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
});