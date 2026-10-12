import React from 'react';

function TeacherDashboard() {
  const mockTeacher = {
    name: "Dr. Sharma",
    department: "CSE",
    activeClasses: 3
  };

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      background: '#0f172a',
      color: '#f8fafc',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: '1rem'
    }}>
      <div style={{
        background: '#1e293b',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '450px',
        width: '100%'
      }}>
        <h1 style={{ color: '#eab308', margin: '0 0 0.5rem 0' }}>AuraAttend Control</h1>
        <p style={{ color: '#94a3b8', margin: '0 0 2rem 0' }}>Professor Management Portal</p>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Welcome, {mockTeacher.name}</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#94a3b8', fontSize: '0.875rem' }}>{mockTeacher.department} Dept.</p>
          <div style={{ fontSize: '1.1rem', color: '#38bdf8' }}>
            📚 Active Modules Today: <strong>{mockTeacher.activeClasses}</strong>
          </div>
        </div>

        {/* Quick Action Simulation Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button style={{
            background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem', 
            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            🚨 Cancel Next Lecture
          </button>
          <button style={{
            background: '#eab308', color: '#0f172a', border: 'none', padding: '0.75rem', 
            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            ⏳ Reschedule Class
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
