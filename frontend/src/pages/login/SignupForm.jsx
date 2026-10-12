import React, { useState } from 'react';

export default function SignupForm({ onSwitchToLogin, onSignupSuccess }) {
  const [step, setStep] = useState(1); // Step 1: Input Email, Step 2: Input OTP & Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' }); // Inline message state

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); // Clear previous messages

    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ text: "OTP sent successfully to your email!", type: 'success' });
        setStep(2); // Move to OTP verification step
      } else {
        setMessage({ text: data.message || "Failed to send OTP.", type: 'error' });
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setMessage({ text: "Network error: Could not connect to backend server.", type: 'error' });
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); // Clear previous messages

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ text: "Account registered successfully!", type: 'success' });
        if (onSignupSuccess) onSignupSuccess('student');
      } else {
        setMessage({ text: data.message || "Invalid OTP code.", type: 'error' });
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setMessage({ text: "Failed to verify OTP. Please try again.", type: 'error' });
    }
  };

  return (
    <div className="form-panel">
      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="auth-form">
          <div className="form-main-content">
            <div className="input-section">
              <div className="form-header">
                <h2>Create Account</h2>
                <p>Enter your email to receive a verification OTP</p>
              </div>

              <div className="input-group">
                <label htmlFor="signup-email">Email-ID / Mobile Number</label>
                <div className="input-field-wrapper">
                  <i className="fa-regular fa-envelope"></i>
                  <input 
                    type="text" 
                    placeholder="Enter your email or mobile" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-actions-inline">
                <span className="signup-prompt-text">
                  Already have an account? <span onClick={onSwitchToLogin} className="create-link" style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: 600 }}>Sign in</span>
                </span>
              </div>
            </div>
          </div>

          {/* Inline Status Message */}
          {message.text && (
            <div style={{ 
              margin: '8px 0', 
              padding: '8px 12px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              textAlign: 'center', 
              backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', 
              color: message.type === 'error' ? '#dc2626' : '#16a34a',
              fontWeight: 500
            }}>
              {message.text}
            </div>
          )}

          <button type="submit" className="submit-btn">Send OTP</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndSignup} className="auth-form">
          <div className="form-main-content">
            <div className="input-section">
              <div className="form-header">
                <h2>Verify OTP</h2>
                <p>Enter the 6-digit code sent to {email}</p>
              </div>

              <div className="input-group">
                <label htmlFor="otp">Enter OTP</label>
                <div className="input-field-wrapper">
                  <i className="fa-solid fa-shield-keyhole"></i>
                  <input 
                    type="text" 
                    placeholder="123456" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="new-password">Set Password</label>
                <div className="input-field-wrapper">
                  <i className="fa-solid fa-lock"></i>
                  <input 
                    type="password" 
                    placeholder="Create a strong password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inline Status Message */}
          {message.text && (
            <div style={{ 
              margin: '8px 0', 
              padding: '8px 12px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              textAlign: 'center', 
              backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', 
              color: message.type === 'error' ? '#dc2626' : '#16a34a',
              fontWeight: 500
            }}>
              {message.text}
            </div>
          )}

          <button type="submit" className="submit-btn">Verify & Complete Signup</button>
        </form>
      )}
    </div>
  );
  // Jab login ya signup successfully ho jaye (data.success === true):
if (data.success) {
    window.location.href = '/student/StudentDashboard.html';
}
}