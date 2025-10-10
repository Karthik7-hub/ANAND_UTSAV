import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  providerLoginRequest,
  providerRegisterRequest,
  providerForgotPasswordRequest,
  providerResetPasswordRequest,
} from "../utils/providerAuthApi";
import "../css/FestiveAuth.css";
import { useProvider } from '../context/ProviderContext'; // ✅ CHANGED: Import useProvider

const INITIAL_FORM = {
  name: "",
  gender: "",
  phone: "",
  location: "",
  email: "",
  password: "",
  otp: "",
};

export default function ProviderAuth() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginStep, setLoginStep] = useState("loginform");
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [genderOpen, setGenderOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const genderRef = useRef(null);

  const navigate = useNavigate();
  const { login } = useProvider(); // ✅ CHANGED: Use the provider's login function

  // ... (All other functions like toggleTheme, useEffect, notify, handleChange, etc., remain exactly the same) ...
  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (genderRef.current && !genderRef.current.contains(e.target)) {
        setGenderOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notify = (msg, type) => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const selectGender = (g) => {
    setForm((prev) => ({ ...prev, gender: g }));
    setGenderOpen(false);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setForm(INITIAL_FORM);
    setLoginStep("loginform");
    setNotification({ message: "", type: "" });
  };

  // ---------------- LOGIN ----------------
  // No changes needed here. It correctly receives 'res.user' (which is the provider object)
  // and 'res.token', and passes them to the 'login' function from our new context.
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await providerLoginRequest(form);
    if (res.success) {
      notify("🎉 Login successful!", "success");
      // The backend sends 'user' and 'token' keys for the provider
      if (res.user && res.token) {
        login(res.user, res.token); // This now calls the login from ProviderContext
      }
      setTimeout(() => navigate("/provider/dashboard"), 1500);
    } else {
      notify(res.msg || "Login failed", "error");
    }
    setLoading(false);
  };

  // ... (handleRegister, handleForgotPassword, handleResetPassword functions remain the same) ...

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await providerRegisterRequest(form);
    if (res.success) {
      notify("🎉 Registration successful! Proceed to Login.", "success");
      setTimeout(() => changeTab("login"), 2000);
    } else {
      notify(res.msg || "Registration failed", "error");
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!form.email?.trim())
      return notify("Enter your email", "error");
    setLoading(true);
    const res = await providerForgotPasswordRequest(form.email);
    if (res.success) {
      notify(`✅ OTP sent to ${form.email}`, "success");
      setLoginStep("forgototp");
    } else {
      notify(res.msg || "Failed to send OTP", "error");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await providerResetPasswordRequest(form);
    if (res.success) {
      notify("✅ Password reset successful! Log in now.", "success");
      setTimeout(() => changeTab("login"), 2000);
    } else {
      notify(res.msg || "Invalid OTP or new password", "error");
    }
    setLoading(false);
  };

  const goToUserLogin = () => {
    navigate("/login");
  };

  // ---------------- JSX / RENDER ----------------
  // No changes are needed in the JSX part of the component.
  return (
    <div className={`auth-page-wrapper ${isDarkTheme ? '' : 'light-theme'}`}>
      {/* ... The entire JSX structure remains identical ... */}
      <div className="auth-container">
        {/* --- LEFT PANEL: TABS & FORM (FORM PANEL WRAPPER ADDED) --- */}
        <div className="form-panel">
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => changeTab("login")}
            >
              Provider Login
            </button>
            <button
              className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
              onClick={() => changeTab("register")}
            >
              Provider Register
            </button>
          </div>

          {notification.message && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}
          <div className="form-content">
            {/* --- LOGIN FORM --- */}
            {activeTab === "login" &&
              (loginStep === "loginform" ? (
                <form onSubmit={handleLogin} className="auth-form">
                  <h2>Event Provider Sign In</h2>
                  <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder=""
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      placeholder=""
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn primary-btn" disabled={loading}>
                    {loading ? "Logging in..." : "Login to Dashboard"}
                  </button>
                  <button
                    type="button"
                    className="back-btn"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>

                  {/* --- NEW BUTTON: Go to User Login --- */}
                  <div className="provider-login-section" style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="submit-btn provider-btn"
                      onClick={goToUserLogin}
                    >
                      GO TO USER LOGIN
                    </button>
                  </div>

                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="auth-form">
                  <h2>Reset Password</h2>
                  <p className="otp-info">
                    OTP sent to <strong>{form.email}</strong>
                  </p>
                  <div className="input-group">
                    <label htmlFor="otp">Enter OTP</label>
                    <input
                      id="otp"
                      placeholder=""
                      value={form.otp}
                      onChange={handleChange}
                      required
                      maxLength="6"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="password">New Password</label>
                    <input
                      id="password"
                      type="password"
                      placeholder=""
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn primary-btn" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => setLoginStep("loginform")}
                  >
                    Back to Login
                  </button>
                </form>
              ))}

            {/* --- REGISTER FORM --- */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="auth-form register-form">
                <h2>Event Provider Registration</h2>
                <div className="input-group">
                  <label htmlFor="name">Full Name / Company Rep</label>
                  <input
                    id="name"
                    placeholder=""
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group" ref={genderRef}>
                  <label>Gender (of representative)</label>
                  <div className="custom-select-container">
                    <button
                      type="button"
                      className={`custom-select-trigger ${form.gender ? 'selected' : ''}`}
                      onClick={() => setGenderOpen(!genderOpen)}
                    >
                      {form.gender || "Select Gender"}
                      <span className={`arrow ${genderOpen ? 'open' : ''}`}></span>
                    </button>
                    {genderOpen && (
                      <div className="custom-select-options">
                        <div className="custom-select-option" onClick={() => selectGender("Male")}>Male</div>
                        <div className="custom-select-option" onClick={() => selectGender("Female")}>Female</div>
                        <div className="custom-select-option" onClick={() => selectGender("Other")}>Other</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder=""
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="location">Base Location / City</label>
                  <input
                    id="location"
                    placeholder=""
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder=""
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="password">Create Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder=""
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn primary-btn" disabled={loading}>
                  {loading ? "Registering..." : "Complete Registration"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* --- RIGHT PANEL: WELCOME & INFO --- */}
        <div className="info-panel">
          <h1 className="welcome-text">WELCOME, PROVIDER</h1>
          <p className="welcome-subtext">Manage your events, track bookings, and grow your audience here.</p>
        </div>



      </div>

      {/* NEW THEME TOGGLE SWITCH */}
      <div className="theme-toggle-container">
        <input
          type="checkbox"
          id="theme-switch-provider" /* Use a unique ID here if rendered on the same page */
          className="theme-toggle-input"
          checked={!isDarkTheme} // Checked means Light Theme is ON
          onChange={toggleTheme}
          title="Toggle Dark/Light Theme"
        />
        <label htmlFor="theme-switch-provider" className="theme-toggle-label"></label>
      </div>
    </div>
  );
}