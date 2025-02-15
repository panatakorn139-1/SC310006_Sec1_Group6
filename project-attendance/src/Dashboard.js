// src/Dashboard.js
import React from "react";
import { getAuth } from "firebase/auth";

const Dashboard = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <div style={styles.container}>
      <h1>Welcome to My Web</h1>
      {user && (
        <p>
          Hello, {user.displayName ? user.displayName : user.email}!
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px"
  }
};

export default Dashboard;
