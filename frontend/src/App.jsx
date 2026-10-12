import React, { useState } from 'react';
import Login from './pages/login/login.jsx';

function App() {
  const [userRole, setUserRole] = useState(null);

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    if (role === 'student') {
      // Redirect directly to your standalone HTML student dashboard page
      window.location.href = '/student/StudentDashboard.html';
    } else if (role === 'teacher') {
      // Redirect to teacher portal if applicable
      window.location.href = '/teacher/teacherDashboard.html';
    }
  };

  // If user is not logged in, render the Login page
  if (!userRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return null;
}

export default App;