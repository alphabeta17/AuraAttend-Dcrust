import React from 'react';
import NotificationAlert from '../../components/NotificationAlerts.jsx';

function StudentDashboard() {
  const mockStudent = {
    name: "Udit",
    attendancePercentage: 84.5,
    status: "Safe Zone"
  };

  const mockAlerts = [
    {
      type: "CANCEL",
      subject: "Advanced DSA (CSE-302)",
      time: "Monday at 9:00 AM",
      note: "Professor Sharma is on official leave."
    },
    {
      type: "RESCHEDULE",
      subject: "Computer Networks (CSE-306)",
      time: "Tuesday at 2:00 PM (Lab Room 4)",
      note: "Shifted due to industrial placement drives."
    }
  ];

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
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ color: '#38bdf8', margin: '0 0 0.5rem 0' }}>AuraAttend</h1>
        <p style={{ color: '#94a3b8', margin: '0 0 2rem 0' }}>University Attendance Dashboard</p>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: '500' }}>
            Welcome back, {mockStudent.name}!
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4ade80' }}>
            {mockStudent.attendancePercentage}%
          </div>
          <span style={{
            display: 'inline-block',
            background: 'rgba(74, 222, 128, 0.1)',
            color: '#4ade80',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            fontWeight: '600'
          }}>
            {mockStudent.status}
          </span>
        </div>

        <NotificationAlert alerts={mockAlerts} />
        
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1.5rem', marginBottom: 0 }}>
          Proximity check active • Monitoring local classroom sync
        </p>
      </div>
    </div>
  );
}

export default StudentDashboard;
