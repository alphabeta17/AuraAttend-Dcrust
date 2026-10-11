import React, { useState } from 'react';
// 1. Import both dashboard view modules
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';

function App() {
  // 2. Initialize a state hook variable to remember which screen is active
  // Defaults to "student" view first
  const [currentView, setCurrentView] = useState('student');

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      
      {/* 3. Global Control Navigation Bar Panel */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '1rem',
        background: '#1e293b',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <button 
          onClick={() => setCurrentView('student')}
          style={{
            background: currentView === 'student' ? '#38bdf8' : 'transparent',
            color: currentView === 'student' ? '#0f172a' : '#94a3b8',
            border: currentView === 'student' ? 'none' : '1px solid #475569',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🎓 Student View
        </button>

        <button 
          onClick={() => setCurrentView('teacher')}
          style={{
            background: currentView === 'teacher' ? '#eab308' : 'transparent',
            color: currentView === 'teacher' ? '#0f172a' : '#94a3b8',
            border: currentView === 'teacher' ? 'none' : '1px solid #475569',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          👨‍🏫 Teacher Portal
        </button>
      </nav>

      {/* 4. Conditional Rendering Matrix Block */}
      {/* If currentView is 'student', show StudentDashboard. Otherwise, show TeacherDashboard. */}
      <div>
        {currentView === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
      </div>

    </div>
  );
}

export default App;
