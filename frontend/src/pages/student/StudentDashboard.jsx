import React from 'react'
import StudentDashboard from "./StudentDashboard";

const StudentDashboard = () => {
  return (
    <div>
      <StudentDashboard
  defaultActive="attendance"
  onNavigate={(id) => console.log(id)}   // connect to react-router here
  onLogout={() => console.log("logout")}
/>
    </div>
  )
}

export default StudentDashboard
