import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtpRequest, verifyOtpRequest } from "../utils/festiveAuthApi";
import { useUser } from "../context/UserContext";
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
      showNotification(`❌ ${response.message || "Failed to send OTP."}`, "error");
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification({ message: "", type: "" });
    const response = await verifyOtpRequest(activeTab, formData);
    if (response.success && response.token) {
      if (activeTab === 'login') {
        showNotification(`🎉 Welcome back!`, "success");
        login({ email: formData.email }, response.token);
        setTimeout(() => navigate('/'), 2000);
      } else {
        showNotification(`🎉 Registration successful! Please login.`, "success");
        setTimeout(() => handleTabChange('login'), 2000);
      }
    } else {
      showNotification(`❌ ${response.message || "Invalid OTP."}`, "error");
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === "login" ? "active" : ""}`} onClick={() => handleTabChange("login")}>Login</button>
          <button className={`tab-btn ${activeTab === "register" ? "active" : ""}`} onClick={() => handleTabChange("register")}>Register</button>
        </div>

        {notification.message && <div className={`notification ${notification.type}`}>{notification.message}</div>}

        <div className="form-content">
          {activeTab === "login" &&
            (loginStep === "email" ? (
              <form onSubmit={handleSendOtp} className="auth-form">
                <h2>Welcome Back!</h2>
                <div className="input-group"><input id="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required /></div>
                <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? "Sending..." : "Request OTP"}</button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="auth-form">
                <h2>Verify OTP</h2>
                <p className="otp-info">OTP sent to <strong>{formData.email}</strong></p>
                <div className="input-group"><input id="otp" type="text" placeholder="Enter 6-digit OTP" value={formData.otp} onChange={handleInputChange} required maxLength="6" /></div>
                <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? "Verifying..." : "Verify & Login"}</button>
                <button type="button" className="back-btn" onClick={() => setLoginStep("email")}>Back</button>
              </form>
            ))}

          {activeTab === "register" &&
            (registerStep === "details" ? (
              <form onSubmit={handleSendOtp} className="auth-form register-form">
                <h2>Create Account</h2>
                <div className="input-group"><input id="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} required /></div>
                <div className="input-group"><input id="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required /></div>
                <div className="input-group"><input id="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required /></div>
                <div className="input-group"><input id="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required /></div>

                {/* --- The Gender dropdown is now here, before Location --- */}
                <div className="input-group" ref={genderMenuRef}>
                  <div className="custom-select-container">
                    <button type="button" className="custom-select-trigger" onClick={() => setIsGenderMenuOpen(!isGenderMenuOpen)}>
                      {formData.gender || "Select Gender"}
                      <span className={`arrow ${isGenderMenuOpen ? 'open' : ''}`}></span>
                    </button>
                    {isGenderMenuOpen && (
                      <div className="custom-select-options">
                        <div className="custom-select-option" onClick={() => handleGenderSelect('Male')}>Male</div>
                        <div className="custom-select-option" onClick={() => handleGenderSelect('Female')}>Female</div>
                        <div className="custom-select-option" onClick={() => handleGenderSelect('Other')}>Other</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="input-group"><input id="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required /></div>

                <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? "Sending..." : "Register & Send OTP"}</button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="auth-form">
                <h2>Verify OTP</h2>
                <p className="otp-info">OTP sent to <strong>{formData.email}</strong></p>
                <div className="input-group"><input id="otp" type="text" placeholder="Enter 6-digit OTP" value={formData.otp} onChange={handleInputChange} required maxLength="6" /></div>
                <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? "Verifying..." : "Complete Registration"}</button>
                <button type="button" className="back-btn" onClick={() => setRegisterStep("details")}>Back</button>
              </form>
            ))}
        </div>
      </div>
    </div>
  );
}