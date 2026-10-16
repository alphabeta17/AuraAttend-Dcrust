import React, { useState, useEffect } from 'react';
import SignupForm from './SignupForm.jsx';
import './login.css';

export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' }); // Pop-up ki jagah inline message state

  const GOOGLE_CLIENT_ID = "166248464188-kh51ko7innf6jk9ojgalgtk61352uqcb.apps.googleusercontent.com";

  useEffect(() => {
    if (document.getElementById('google-client-script')) return;
    const script = document.createElement('script');
    script.id = 'google-client-script';
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
        });
      }
    };
  }, []);

  // Google button render in Login view
  useEffect(() => {
    if (!isSignUp && window.google) {
      const googleDiv = document.getElementById("googleButtonDiv");
      if (googleDiv) {
        googleDiv.innerHTML = "";
        window.google.accounts.id.renderButton(googleDiv, { theme: "outline", size: "large", width: "100%" });
      }
    }
  }, [isSignUp]);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userEmail", data.email);
        window.location.href = '/student/StudentDashboard.html';
      } else {
        setMessage({ text: data.message || "Google login failed", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Unable to connect to server.", type: 'error' });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password: password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("userEmail", data.email);
        window.location.href = '/student/StudentDashboard.html';
      } else {
        setMessage({ text: data.message || "Login failed", type: 'error' }); // Pop-up ki jagah HTML error msg
      }
    } catch (err) {
      setMessage({ text: "Unable to connect to server.", type: 'error' });
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
      <div className="login-wrapper">
        <div className="login-container">
          <div className="brand-panel">
            <div className="brand-top">
              <div className="logo-icon"><i className="fa-solid fa-graduation-cap"></i></div>
              <div className="brand-name"><h2>AuraAttend</h2><span>Student Portal</span></div>
            </div>
            <div className="brand-center">
              <div className="app-icon-box"><i className="fa-solid fa-user-graduate"></i></div>
              <h2>AuraAttend -<br/>Student Portal</h2>
              <p>Check your education and emfort university platform.</p>
            </div>
            <div className="brand-footer-graphics"></div>
          </div>

          {isSignUp ? (
            <SignupForm 
              onSwitchToLogin={() => setIsSignUp(false)} 
              onSignupSuccess={onLoginSuccess}
            />
          ) : (
            <div className="form-panel">
              <form onSubmit={handleLoginSubmit} className="auth-form" autoComplete="off">
                <div className="form-main-content">
                  <div className="input-section">
                    <div className="form-header">
                      <h2>Sign In</h2>
                      <p>Sign in your student platform</p>
                    </div>

                    <div className="input-group">
                      <label htmlFor="rollno">Mobile Number / Email-ID</label>
                      <div className="input-field-wrapper">
                        <i className="fa-regular fa-id-card"></i>
                        <input 
                          type="text" 
                          id="rollno" 
                          name="rollno" 
                          placeholder="Enter your email/mobile" 
                          value={identifier} 
                          onChange={(e) => setIdentifier(e.target.value)} 
                          autoComplete="off" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="password">Password</label>
                      <div className="input-field-wrapper">
                        <i className="fa-solid fa-lock"></i>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          id="password" 
                          name="password" 
                          placeholder="Enter Password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          autoComplete="new-password" 
                          required 
                        />
                        <i className={`fa-regular ${showPassword ? "fa-eye" : "fa-eye-slash"} toggle-password`} id="togglePassword" onClick={handleTogglePassword}></i>
                      </div>
                    </div>

                    {message.text && (
                      <div style={{ margin: '8px 0', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', textAlign: 'center', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
                        {message.text}
                      </div>
                    )}

                    <div className="form-actions-inline">
                      <a href="#forgot" className="forgot-link">Forgot Password?</a>
                      <span className="signup-prompt-text">Don't have an account? <span onClick={() => setIsSignUp(true)} className="create-link" style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: 600 }}>Sign up</span></span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="submit-btn">Connect and Fetch Attendance</button>

                <div className="divider"><span>Or connect with</span></div>
                <div className="auth-options-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div id="googleButtonDiv" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="alt-login-btn"><i className="fa-solid fa-building-columns"></i> Staff Login</button>
                    <button type="button" className="alt-login-btn"><i className="fa-solid fa-user-tie"></i> Admin Login</button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}