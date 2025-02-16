// seedDatabase.js

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// โหลด Service Account JSON
const serviceAccount = require('./serviceAccountKey.json'); // ตรวจสอบ path และชื่อไฟล์

// Initialize Firebase Admin SDK ด้วย Service Account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// อ้างอิง Firestore
const db = admin.firestore();

// ฟังก์ชันสร้างข้อมูลตัวอย่าง
async function createDatabaseStructure() {
  // 1. สร้าง Document ผู้ใช้ใน /users/{uid}
  const uid = "user123"; // ตัวอย่าง UID
  const userDocRef = db.collection('users').doc(uid);
  await userDocRef.set({
    name: "John Doe",
    email: "john@example.com",
    photo: "https://example.com/john.jpg"
  });
  console.log("Created user document for", uid);

  // 2. สร้าง Subcollection classroom ภายใน /users/{uid}/classroom/{cid}
  const cid = "classroom123"; // ตัวอย่างรหัสห้องเรียนที่ผู้ใช้เข้าร่วม
  const userClassroomRef = userDocRef.collection("classroom").doc(cid);
  await userClassroomRef.set({
    status: 1 // 1 = อาจารย์, 2 = นักเรียน
  });
  console.log("Created user's classroom document for", cid);

  // 3. สร้าง Document ห้องเรียนใน /classroom/{cid}
  const classroomDocRef = db.collection("classroom").doc(cid);
  await classroomDocRef.set({
    owner: uid  // UID ของอาจารย์เจ้าของห้องเรียน
  });
  console.log("Created classroom document for", cid);

  // 4. สร้าง Subcollection info ภายใน /classroom/{cid}/info
  const classroomInfoRef = classroomDocRef.collection("info").doc("infoDoc");
  await classroomInfoRef.set({
    code: "SC310001",                   
    name: "Computer Programming",       
    photo: "https://example.com/course.jpg", 
    room: "SC5101"                      
  });
  console.log("Created classroom info for", cid);

  // 5. สร้าง Subcollection students ภายใน /classroom/{cid}/students
  const studentUid = "student456"; // ตัวอย่าง UID ของนักเรียน
  const classroomStudentRef = classroomDocRef.collection("students").doc(studentUid);
  await classroomStudentRef.set({
    stdid: "S456",          
    name: "Alice",          
    status: 0               
  });
  console.log("Added student", studentUid, "to classroom", cid);

  // 6. สร้าง Document การเช็คชื่อใน /classroom/{cid}/checkin/{cno}
  const cno = "1";  
  const checkinDocRef = classroomDocRef.collection("checkin").doc(cno);
  await checkinDocRef.set({
    code: "ABC123", 
    date: admin.firestore.Timestamp.fromDate(new Date("2025-02-10T13:00:00")),
    status: 0,  
    question_no: 1,                     
    question_text: "What is Firebase?", 
    question_show: true                 
  });
  console.log("Created checkin document for classroom", cid, "checkin", cno);

  // 7. สร้าง Subcollection students ภายใน /classroom/{cid}/checkin/{cno}/students
  const checkinStudentRef = checkinDocRef.collection("students").doc(studentUid);
  await checkinStudentRef.set({
    stdid: "S456",
    name: "Alice",
    remark: "",
    date: admin.firestore.Timestamp.now()  
  });
  console.log("Recorded checkin for student", studentUid, "in checkin", cno);

  // 8. สร้าง Subcollection scores ภายใน /classroom/{cid}/checkin/{cno}/scores
  const checkinScoreRef = checkinDocRef.collection("scores").doc(studentUid);
  await checkinScoreRef.set({
    date: admin.firestore.Timestamp.fromDate(new Date("2025-02-10T13:00:00")),
    name: "Alice",
    uid: studentUid,
    remark: "",
    score: 100,      
    status: 1        
  });
  console.log("Recorded score for student", studentUid, "in checkin", cno);

  // 9. สร้าง Subcollection answers ภายใน /classroom/{cid}/checkin/{cno}/answers
  const qno = "1"; 
  const answerDocRef = checkinDocRef.collection("answers").doc(qno);
  await answerDocRef.set({
    text: "Firebase is a mobile and web application development platform."
  });
  console.log("Created answer document for question", qno);

  // 10. สร้าง Subcollection students ภายใน /classroom/{cid}/checkin/{cno}/answers/{qno}/students
  const answerStudentRef = answerDocRef.collection("students").doc(studentUid);
  await answerStudentRef.set({
    text: "It is a cloud service by Google.",
    time: admin.firestore.Timestamp.now()
  });
  console.log("Recorded answer for student", studentUid, "in question", qno);

  console.log("Database structure created successfully.");
}

// เรียกฟังก์ชันและจับข้อผิดพลาด
createDatabaseStructure().catch((error) => {
  console.error("Error creating database structure:", error);
});
