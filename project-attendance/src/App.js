// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import EditProfile from "./components/EditProfile";
import AddCourse from "./components/AddCourse";
import ManageClassroom from "./components/ManageClassroom";
import Checkin from "./components/Checkin";
import QnA from "./components/QnA";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/manage/:cid" element={<ManageClassroom />} />
        <Route path="/checkin/:cid/:cno" element={<Checkin />} />
        <Route path="/qna/:cid/:cno" element={<QnA />} />
      </Routes>
    </Router>
  );
}

export default App;
