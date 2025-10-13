import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtpRequest, verifyOtpRequest } from "../utils/festiveAuthApi";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { CheckCircle, XCircle, Mail, User, Phone, MapPin, KeyRound, Sun, Moon } from 'lucide-react';
import Dialog from '../components/Dialog';
import "../css/FestiveAuth.css";

const INITIAL_FORM_STATE = { email: "", username: "", phone: "", fullName: "", gender: "", location: "", otp: "" };

export default function FestiveAuth() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginStep, setLoginStep] = useState("email");
  const [registerStep, setRegisterStep] = useState("details");
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { login } = useUser();
  const navigate = useNavigate();
  const [dialogState, setDialogState] = useState({ isOpen: false });

  const [isGenderMenuOpen, setIsGenderMenuOpen] = useState(false);
  const genderMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderMenuRef.current && !genderMenuRef.current.contains(event.target)) {
        setIsGenderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData(INITIAL_FORM_STATE);
    setLoginStep("email");
    setRegisterStep("details");
  };

  const showDialog = (config) => setDialogState({ ...config, isOpen: true });
  const closeDialog = () => setDialogState(prevState => ({ ...prevState, isOpen: false }));

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  const handleGenderSelect = (value) => { setFormData((prev) => ({ ...prev, gender: value })); setIsGenderMenuOpen(false); };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await sendOtpRequest(activeTab, formData);
    if (response.success) {
      showDialog({
        type: 'success', title: 'OTP Sent!', icon: <CheckCircle />, confirmButtonOnly: true, confirmText: 'OK',
        children: `An OTP has been sent to ${formData.email}.`,
        onConfirm: () => { (activeTab === "login" ? setLoginStep : setRegisterStep)("otp"); closeDialog(); }
      });
    } else {
      showDialog({
        type: 'error', title: 'Request Failed', icon: <XCircle />, confirmButtonOnly: true, confirmText: 'Close',
        children: response.message || "Failed to send OTP.", onConfirm: closeDialog,
      });
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await verifyOtpRequest(activeTab, formData);
    if (response.success && response.token) {
      const action = () => { login(response.u, response.token); navigate("/"); };
      showDialog({
        type: 'success', title: 'Success!', icon: <CheckCircle />, confirmButtonOnly: true, confirmText: 'Continue',
        children: 'Welcome! You will be redirected shortly.', onConfirm: action,
      });
    } else {
      showDialog({
        type: 'error', title: 'Verification Failed', icon: <XCircle />, confirmButtonOnly: true, confirmText: 'Try Again',
        children: response.message || "Verification failed.", onConfirm: closeDialog,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className={`auth-page-wrapper ${theme === 'light' ? 'light-theme' : ''}`}>
      <Dialog {...dialogState} onClose={closeDialog} />
      <div className="auth-container">
        <div className="form-panel">
          <div className="tabs-slider">
            <button className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => handleTabChange('login')}>Sign In</button>
            <button className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => handleTabChange('register')}>Register</button>
            <div className="tab-indicator" style={{ transform: activeTab === 'register' ? 'translateX(100%)' : 'translateX(0%)' }}></div>
          </div>

          <div className="form-content">
            <div className={`form-content ${isGenderMenuOpen ? 'dropdown-active' : ''}`}></div>
            {activeTab === 'login' && (
              <div className="form-step-container" style={{ transform: loginStep === 'otp' ? 'translateX(-50%)' : 'translateX(0%)' }}>
                <div className="form-step">
                  <form id="login-form-email" onSubmit={handleSendOtp} className="auth-form">
                    <h2>Welcome Back!</h2>
                    <div className="input-group">
                      <label htmlFor="email">Email Address</label>
                      <div className="input-field">
                        <Mail className="input-icon" size={20} />
                        <input id="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="you@example.com" />
                      </div>
                    </div>
                    <button type="submit" className="submit-btn primary-btn" disabled={isLoading}>{isLoading ? "Sending..." : "Continue"}</button>
                    <div className="switcher-section">
                      Are you a service provider? <button type="button" className="switcher-link" onClick={() => navigate("/provider-login")}>Login here</button>
                    </div>
                  </form>
                </div>
                <div className="form-step">
                  <form onSubmit={handleVerifyOtp} className="auth-form otp-form">
                    <h2>Enter Verification Code</h2>
                    <p className="otp-info">We sent a 6-digit code to <strong>{formData.email}</strong></p>
                    <div className="input-group">
                      <label htmlFor="otp">One-Time Password</label>
                      <div className="input-field">
                        <KeyRound className="input-icon" size={20} />
                        <input id="otp" type="text" value={formData.otp} onChange={handleInputChange} required maxLength="6" pattern="\d{6}" title="Must be a 6-digit number" placeholder="_ _ _ _ _ _" />
                      </div>
                    </div>
                    <button type="submit" className="submit-btn primary-btn" disabled={isLoading}>{isLoading ? "Verifying..." : "Verify & Sign In"}</button>
                    <button type="button" className="submit-btn back-btn" onClick={() => setLoginStep("email")}>Back</button>
                  </form>
                </div>
              </div>
            )}
            {activeTab === 'register' && (
              <div className="form-step-container" style={{ transform: registerStep === 'otp' ? 'translateX(-50%)' : 'translateX(0%)' }}>
                <div className="form-step">
                  <form onSubmit={handleSendOtp} className="auth-form register-form">
                    <h2>Create Your Account</h2>
                    <div className="input-group"><label htmlFor="fullName">Full Name</label><div className="input-field"><User className="input-icon" size={20} /><input id="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="e.g. John Doe" /></div></div>
                    <div className="input-group"><label htmlFor="username">Username</label><div className="input-field"><User className="input-icon" size={20} /><input id="username" value={formData.username} onChange={handleInputChange} required placeholder="e.g. johndoe99" /></div></div>
                    <div className="input-group"><label htmlFor="email">Email Address</label><div className="input-field"><Mail className="input-icon" size={20} /><input id="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="you@example.com" /></div></div>
                    {/* 👉 CHANGE 2: Add conditional class to the gender input group.
                      This will let us control its z-index.
                    */}
                    <div
                      className={`input-group ${isGenderMenuOpen ? 'dropdown-open' : ''}`}
                      ref={genderMenuRef}
                    >
                      <label>Gender</label>
                      <div className="custom-select-container">
                        <button type="button" className={`custom-select-trigger ${formData.gender ? 'selected' : ''}`} onClick={() => setIsGenderMenuOpen(!isGenderMenuOpen)}>
                          {formData.gender || "Select Gender"}
                          <span className={`arrow ${isGenderMenuOpen ? 'open' : ''}`}></span>
                        </button>
                        {isGenderMenuOpen && (
                          <div className="custom-select-options">
                            <div className="custom-select-option" onClick={() => handleGenderSelect('Male')}>Male</div>
                            <div className="custom-select-option" onClick={() => handleGenderSelect('Female')}>Female</div>
                            <div className="custom-select-option" onClick={() => handleGenderSelect('Other')}>Other</div>
                            <div className="custom-select-option" onClick={() => handleGenderSelect('Prefer not to say')}>Prefer not to say</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="input-group"><label htmlFor="phone">Phone Number</label><div className="input-field"><Phone className="input-icon" size={20} /><input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="+91 12345 67890" /></div></div>
                    <div className="input-group"><label htmlFor="location">Location</label><div className="input-field"><MapPin className="input-icon" size={20} /><input id="location" value={formData.location} onChange={handleInputChange} required placeholder="e.g. New York, USA" /></div></div>
                    <button type="submit" className="submit-btn primary-btn" disabled={isLoading}>{isLoading ? "Processing..." : "Create Account"}</button>
                  </form>
                </div>
                <div className="form-step">
                  <form onSubmit={handleVerifyOtp} className="auth-form otp-form">
                    <h2>Final Step: Verification</h2>
                    <p className="otp-info">A 6-digit code has been sent to <strong>{formData.email}</strong></p>
                    <div className="input-group"><label htmlFor="otp">One-Time Password</label><div className="input-field"><KeyRound className="input-icon" size={20} /><input id="otp" type="text" value={formData.otp} onChange={handleInputChange} required maxLength="6" pattern="\d{6}" title="Must be a 6-digit number" placeholder="_ _ _ _ _ _" /></div></div>
                    <button type="submit" className="submit-btn primary-btn" disabled={isLoading}>{isLoading ? "Verifying..." : "Complete Registration"}</button>
                    <button type="button" className="submit-btn back-btn" onClick={() => setRegisterStep("details")}>Back to Details</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="info-panel">
          <h1 className="welcome-text">AnandUtsav</h1>
          <p className="welcome-subtext">Your One Stop Digital Marketplace for Every Celebration.</p>
        </div>
      </div>
      <div className="theme-toggle-container">
        <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle theme">
          <Sun className="sun-icon" size={24} />
          <Moon className="moon-icon" size={24} />
        </button>
      </div>
    </div>
  );
}