import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { auth, db } from "../../assets/services/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function CheckInScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const classroomId = Array.isArray(id) ? id[0] : id;
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cno, setCno] = useState("");
  const [checkinCode, setCheckinCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const user = auth.currentUser;

  useEffect(() => {
    fetchClassroomData();
  }, [classroomId]);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      if (!user) {
        Alert.alert("⚠️ กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนเข้าห้องเรียน");
        router.replace("/login");
        return;
      }
      if (!classroomId) {
        Alert.alert("ข้อผิดพลาด", "ไม่พบ ID ของห้องเรียน");
        return;
      }
      const classRef = doc(db, "classroom", classroomId);
      const classSnap = await getDoc(classRef);
      if (!classSnap.exists()) {
        Alert.alert("❌ ไม่พบห้องเรียน", "ไม่พบข้อมูลห้องเรียนนี้");
        router.back();
        return;
      }
      setClassroom({ id: classSnap.id, ...classSnap.data() });
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลห้องเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!classroomId || !cno || !checkinCode || !studentName || !studentId) {
      Alert.alert("⚠️ ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      const checkinRef = doc(db, `classroom/${classroomId}/checkin/${cno}`);
      const checkinSnap = await getDoc(checkinRef);

      if (!checkinSnap.exists() || checkinSnap.data()?.code !== checkinCode) {
        Alert.alert("❌ ผิดพลาด", "รหัสเช็คชื่อไม่ถูกต้อง");
        return;
      }

      if (!user) {
        Alert.alert("⚠️ กรุณาเข้าสู่ระบบ", "ไม่พบผู้ใช้");
        return;
      }

      const studentRef = doc(db, `classroom/${classroomId}/checkin/${cno}/students`, user.uid);
      await setDoc(studentRef, {
        stdid: studentId,
        name: studentName,
        date: new Date().toISOString(),
      }, { merge: true });

      const userClassRef = doc(db, `classroom/${classroomId}/students`, user.uid);
      await setDoc(userClassRef, {
        stdid: studentId,
      }, { merge: true });

      Alert.alert("✅ เช็คชื่อสำเร็จ", "คุณได้ทำการเช็คชื่อเรียบร้อยแล้ว!", [
        { text: "ตกลง", onPress: () => router.push(`/classroom/${classroomId}`) }
      ]);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเช็คชื่อได้");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{classroom?.info?.name || "ห้องเรียน"}</Text>
      <Text style={styles.code}>รหัสวิชา: {classroom?.info?.code || "ไม่ระบุ"}</Text>
      <TextInput style={styles.input} placeholder="ลำดับการเช็คชื่อ (CNO)" value={cno} onChangeText={setCno} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="รหัสเช็คชื่อ" value={checkinCode} onChangeText={setCheckinCode} />
      <TextInput style={styles.input} placeholder="รหัสนักศึกษา" value={studentId} onChangeText={setStudentId} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="ชื่อ-สกุล" value={studentName} onChangeText={setStudentName} />
      <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
        <Text style={styles.buttonText}>เช็คชื่อ</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
  },
  code: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  checkInButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
