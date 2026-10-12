import React, { useState } from 'react';
// Import your components and login page
import Login from './pages/login/login.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';

function App() {
  // Track authentication state ('none', 'student', or 'teacher')
  const [userRole, setUserRole] = useState(null);

  // If user is not logged in, render the Login page
  if (!userRole) {
    return <Login onLoginSuccess={(role) => setUserRole(role)} />;
  }

  // Once logged in, render the appropriate dashboard based on role
  return (
    <>
      {userRole === 'student' && <StudentDashboard />}
      {userRole === 'teacher' && <TeacherDashboard />}
    </>
  );
}

export default App;