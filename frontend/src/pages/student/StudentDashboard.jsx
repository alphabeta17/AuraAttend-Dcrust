import React from 'react';
import ActualStudentDashboard from "./StudentDashboard"; // Ya agar component kisi aur file mein hai toh uska sahi path dein

const StudentDashboardWrapper = () => {
  return (
    <div>
      <ActualStudentDashboard
        defaultActive="attendance"
        onNavigate={(id) => console.log(id)}
        onLogout={() => console.log("logout")}
      />
    </div>
  );
};

export default StudentDashboardWrapper;