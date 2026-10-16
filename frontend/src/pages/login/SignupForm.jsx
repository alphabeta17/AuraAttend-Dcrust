import React, { useState, useEffect } from 'react';

export default function SignupForm({ onSwitchToLogin, onSignupSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [emailError, setEmailError] = useState('');

  const GOOGLE_CLIENT_ID = "166248464188-kh51ko7innf6jk9ojgalgtk61352uqcb.apps.googleusercontent.com";

  useEffect(() => {
    if (step === 1 && window.google) {
      const googleDiv = document.getElementById("googleSignupButtonDiv");
      if (googleDiv) {
        googleDiv.innerHTML = "";
        window.google.accounts.id.renderButton(googleDiv, { theme: "outline", size: "large", width: "100%" });
      }
    }
  }, [step]);

  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) return;
    try {
      const response = await fetch('http://localhost:5000/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.exists) {
        setEmailError("Email is already registered");
      } else {
        setEmailError("");
      }
    } catch (err) {
      console.error("Error checking email availability:", err);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!email || !email.includes('@')) {
      setMessage({ text: "Please enter a valid email", type: 'error' });
      return;
    }

    try {
      const checkResponse = await fetch('http://localhost:5000/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setEmailError("Email is already registered");
        return;
      } else {
        setEmailError("");
      }

      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (data.success) {
        setMessage({ text: "OTP sent successfully to your email!", type: 'success' });
        setTimeout(() => {
          setStep(2);
          setMessage({ text: '', type: '' });
        }, 1200);
      } else {
        setMessage({ text: data.message || "Failed to send OTP.", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Network error: Could not connect to backend server.", type: 'error' });
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          otp, 
          password, 
          roll_no: rollNo, 
          university_id: parseInt(universityId) || null 
        })
      });
      const data = await response.json();

      if (data.success) {
        if (onSignupSuccess) onSignupSuccess('student');
        window.location.href = '/student/StudentDashboard.html';
      } else {
        setMessage({ text: data.message || "Invalid OTP code.", type: 'error' });
      }
    } catch (err) {
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }} 
                    onBlur={handleEmailBlur}
                    required 
                  />
                </div>
                {emailError && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 500 }}>{emailError}</span>}
              </div>

              {message.text && (
                <div style={{ margin: '8px 0', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', textAlign: 'center', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
                  {message.text}
                </div>
              )}

              <div className="form-actions-inline">
                <span className="signup-prompt-text">Already have an account? <span onClick={onSwitchToLogin} className="create-link" style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: 600 }}>Sign in</span></span>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn">Send OTP</button>

          <div className="divider"><span>Or connect with</span></div>
          <div id="googleSignupButtonDiv" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndSignup} className="auth-form">
          {/* Top-left Back Arrow */}
          <div style={{ marginBottom: '10px' }}>
            <i 
              className="fa-solid fa-arrow-left" 
              onClick={() => { setStep(1); setMessage({ text: '', type: '' }); }} 
              style={{ cursor: 'pointer', fontSize: '18px', color: '#4b5563' }}
              title="Go back"
            ></i>
          </div>

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
                  <input type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" required />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="rollNo">Roll Number</label>
                <div className="input-field-wrapper">
                  <i className="fa-solid fa-id-card"></i>
                  <input type="text" placeholder="Enter your roll number" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="universityId">University Password / ID (INT)</label>
                <div className="input-field-wrapper">
                  <i className="fa-solid fa-key"></i>
                  <input type="number" placeholder="Enter numeric university ID" value={universityId} onChange={(e) => setUniversityId(e.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="new-password">Set Password</label>
                <div className="input-field-wrapper">
                  <i className="fa-solid fa-lock"></i>
                  <input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          {message.text && (
            <div style={{ margin: '8px 0', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', textAlign: 'center', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
              {message.text}
            </div>
          )}

          <button type="submit" className="submit-btn">Verify & Complete Signup</button>
        </form>
      )}
    </div>
  );
}