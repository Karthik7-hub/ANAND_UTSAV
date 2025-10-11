import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtpRequest, verifyOtpRequest } from "../utils/festiveAuthApi";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import "../css/FestiveAuth.css";

const INITIAL_FORM_STATE = {
  email: "",
  username: "",
  phone: "",
  fullName: "",
  gender: "",
  location: "",
  otp: "",
};

export default function FestiveAuth() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginStep, setLoginStep] = useState("email");
  const [registerStep, setRegisterStep] = useState("details");
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenderMenuOpen, setIsGenderMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // NEW STATE for theme
  const genderMenuRef = useRef(null);

  const { login } = useUser();
  const navigate = useNavigate();


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
    setNotification({ message: "", type: "" });
    setLoginStep("email");
    setRegisterStep("details");
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGenderSelect = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }));
    setIsGenderMenuOpen(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification({ message: "", type: "" });

    const response = await sendOtpRequest(activeTab, formData);

    if (response.success) {
      showNotification(`✅ OTP sent to ${formData.email}`, "success");
      (activeTab === "login" ? setLoginStep : setRegisterStep)("otp");
    } else {
      let msg = response.message?.toLowerCase() || "";
      if (msg.includes("email") || msg.includes("user not found")) {
        showNotification("❌ Invalid Email or user not found. Please check and try again.", "error");
      } else {
        showNotification(`❌ ${response.message || "Failed to send OTP."}`, "error");
      }
    }

    setIsLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification({ message: "", type: "" });

    const response = await verifyOtpRequest(activeTab, formData);

    if (response.success && response.token) {
      if (activeTab === "login") {
        showNotification(`🎉 Welcome back!`, "success");
        login(response.u, response.token);
        setTimeout(() => navigate("/"), 2000);
      } else {
        showNotification(`🎉 Registration successful! You can now log in.`, "success");
        setTimeout(() => handleTabChange("login"), 2000);
      }
    } else {
      let msg = response.message?.toLowerCase() || "";
      if (msg.includes("otp")) {
        showNotification("❌ Invalid OTP. Please try again.", "error");
      } else {
        showNotification(`❌ ${response.message || "Verification failed."}`, "error");
      }
    }

    setIsLoading(false);
  };


  return (
    // THEME CLASS APPLIED HERE
    <div className={`auth-page-wrapper ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="auth-container">

        {/* --- LEFT PANEL: TABS & FORM --- */}
        <div className="form-panel">
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => handleTabChange("login")}
            >
              User Login
            </button>
            <button
              className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
              onClick={() => handleTabChange("register")}
            >
              User Register
            </button>
          </div>

          {notification.message && <div className={`notification ${notification.type}`}>{notification.message}</div>}

          <div className="form-content">
            {/* LOGIN FORM */}
            {activeTab === "login" && (
              loginStep === "email" ? (
                <form id="login-form-email" onSubmit={handleSendOtp} className="auth-form">
                  <h2>Sign In with Email</h2>

                  <div className="input-group">
                    <label htmlFor="email">Your Email Address</label>
                    <input id="email" type="email" placeholder="" value={formData.email} onChange={handleInputChange} required />
                  </div>

                  {/* REQUEST OTP Button moved here, below the email input */}
                  <button type="submit" className="submit-btn primary-btn request-otp-btn" disabled={isLoading}>
                    {isLoading ? "SENDING..." : "REQUEST OTP"}
                  </button>

                  {/* Provider Login Button moved here, below the Request OTP button */}
                  <div className="provider-login-section">
                    <button type="button" className="submit-btn provider-btn" onClick={() => navigate("/provider-login")}>
                      LOGIN AS Service Provider
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="auth-form otp-form">
                  <h2>Verify Code</h2>
                  <p className="otp-info">We sent a 6-digit code to **{formData.email}**</p>

                  <div className="input-group">
                    <label htmlFor="otp">Enter OTP</label>
                    <input id="otp" type="text" placeholder="" value={formData.otp} onChange={handleInputChange} required maxLength="6" pattern="\d{6}" title="Must be a 6-digit number" />
                  </div>

                  <button type="submit" className="submit-btn primary-btn" disabled={isLoading}>{isLoading ? "Verifying..." : "Verify & Log In"}</button>
                  <button type="button" className="back-btn" onClick={() => setLoginStep("email")}>Back to Email</button>
                </form>
              )
            )}

            {/* REGISTER FORM */}
            {activeTab === "register" && (
              registerStep === "details" ? (
                <form onSubmit={handleSendOtp} className="auth-form register-form">
                  <h2>Create Account</h2>
                  <div className="input-group"><label htmlFor="fullName">Full Name</label><input id="fullName" placeholder="" value={formData.fullName} onChange={handleInputChange} required /></div>
                  <div className="input-group"><label htmlFor="username">Username</label><input id="username" placeholder="" value={formData.username} onChange={handleInputChange} required /></div>
                  <div className="input-group"><label htmlFor="email">Email Address</label><input id="email" type="email" placeholder="" value={formData.email} onChange={handleInputChange} required /></div>
                  <div className="input-group"><label htmlFor="phone">Phone Number</label><input id="phone" type="tel" placeholder="" value={formData.phone} onChange={handleInputChange} required /></div>

                  <div className="input-group" ref={genderMenuRef}>
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

                  <div className="input-group"><label htmlFor="location">Location</label><input id="location" placeholder="" value={formData.location} onChange={handleInputChange} required /></div>

                  <button type="submit" className="submit-btn primary-btn" disabled={isLoading}>{isLoading ? "Sending OTP..." : "Register & Send OTP"}</button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="auth-form otp-form">
                  <h2>Verify Code</h2>
                  <p className="otp-info">A 6-digit code has been sent to **{formData.email}**</p>
                  <div className="input-group">
                    <label htmlFor="otp">Enter OTP</label>
                    <input id="otp" type="text" placeholder="" value={formData.otp} onChange={handleInputChange} required maxLength="6" pattern="\d{6}" title="Must be a 6-digit number" />
                  </div>
                  <button type="submit" className="submit-btn primary-btn" disabled={isLoading}>{isLoading ? "Verifying..." : "Complete Registration"}</button>
                  <button type="button" className="back-btn" onClick={() => setRegisterStep("details")}>Back to Details</button>
                </form>
              )
            )}

          </div>
        </div>

        {/* --- RIGHT PANEL: WELCOME & PRIMARY ACTION (Now just for display) --- */}
        <div className="info-panel">
          <h1 className="welcome-text">WELCOME</h1>
          <p className="welcome-subtext">Login in to unlock exclusive AnandUtsav</p>
        </div>



      </div>

      {/* NEW THEME TOGGLE SWITCH */}
      <div className="theme-toggle-container">
        <input
          type="checkbox"
          id="theme-switch"
          className="theme-toggle-input"
          checked={theme === 'light'} // Checked means Light Theme is ON
          onChange={toggleTheme}
          title="Toggle Dark/Light Theme"
        />
        <label htmlFor="theme-switch" className="theme-toggle-label"></label>
      </div>
    </div>
  );
}