import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  providerLoginRequest,
  providerRegisterRequest,
  providerForgotPasswordRequest,
  providerResetPasswordRequest,
} from "../utils/providerAuthApi";
import { providerLogoutRequest } from "../utils/providerAuthApi";
import "../css/FestiveAuth.css";
import { useUser } from '../context/UserContext'; 

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
  const [loginStep, setLoginStep] = useState("loginform"); // loginform / forgototp
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [genderOpen, setGenderOpen] = useState(false);
  const genderRef = useRef(null);

  const navigate = useNavigate();

  const { login } = useUser();

  // Close gender dropdown when clicked outside
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
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("🔑 Login Attempt:", form);
    const res = await providerLoginRequest(form);
    console.log("🔑 Login Response:", res);
    if (res.success) {
  notify("🎉 Login successful!", "success");

  if (res.user && res.token) {
        login(res.user, res.token);
      }
      
  setTimeout(() => navigate("/provider/dashboard"), 1500); // go to dashboard
}
 else {
      notify(res.msg || "Login failed", "error");
    }
    setLoading(false);
  };
  const handleLogout = async () => {
  setLoading(true);
  const res = await providerLogoutRequest();
  if (res.success) {
    notify("✅ Logged out successfully", "success");
    // Clear form and reset tabs
    changeTab("login");
  } else {
    notify(res.msg || "❌ Logout failed", "error");
  }
  setLoading(false);
};


  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("📝 Register Attempt:", form);
    const res = await providerRegisterRequest(form);
    console.log("📝 Register Response:", res);
    if (res.success) {
      notify("🎉 Registration successful!", "success");
      setTimeout(() => changeTab("login"), 2000);
    } else {
      notify(res.msg || "Registration failed", "error");
    }
    setLoading(false);
  };

  // ---------------- FORGOT PASSWORD ----------------
  const handleForgotPassword = async () => {
    if (!form.email?.trim())
      return notify("Enter your email", "error");
    setLoading(true);
    const res = await providerForgotPasswordRequest(form.email);
    console.log("OTP Response:", res);
    if (res.success) {
      notify(`✅ OTP sent to ${form.email}`, "success");
      setLoginStep("forgototp");
    } else {
      notify(res.msg || "Failed to send OTP", "error");
    }
    setLoading(false);
  };

  // ---------------- RESET PASSWORD ----------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await providerResetPasswordRequest(form);
    console.log("Reset Password Response:", res);
    if (res.success) {
      notify("✅ Password reset successful!", "success");
      setTimeout(() => changeTab("login"), 2000);
    } else {
      notify(res.msg || "Invalid OTP", "error");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => changeTab("login")}
          >
            Login
          </button>
          <button
            className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => changeTab("register")}
          >
            Register
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
                <h2>Provider Login</h2>
                <div className="input-group">
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
                <button
                  type="button"
                  className="back-btn"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="auth-form">
                <h2>Reset Password</h2>
                <p>
                  OTP sent to <strong>{form.email}</strong>
                </p>
                <div className="input-group">
                  <input
                    id="otp"
                    placeholder="Enter OTP"
                    value={form.otp}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    id="password"
                    type="password"
                    placeholder="New Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setLoginStep("loginform")}
                >
                  Back
                </button>
              </form>
            ))}

          {/* --- REGISTER FORM --- */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="auth-form register-form">
              <h2>Provider Register</h2>
              <div className="input-group">
                <input
                  id="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group" ref={genderRef}>
                <button
                  type="button"
                  className="custom-select-trigger"
                  onClick={() => setGenderOpen(!genderOpen)}
                >
                  {form.gender || "Select Gender"}
                </button>
                {genderOpen && (
                  <div className="custom-select-options">
                    <div onClick={() => selectGender("Male")}>Male</div>
                    <div onClick={() => selectGender("Female")}>Female</div>
                    <div onClick={() => selectGender("Other")}>Other</div>
                  </div>
                )}
              </div>
              <div className="input-group">
                <input
                  id="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  id="location"
                  placeholder="Location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}