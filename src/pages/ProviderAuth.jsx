import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { providerLoginRequest, providerRegisterRequest, providerForgotPasswordRequest, providerResetPasswordRequest } from "../utils/providerAuthApi";
import { useProvider } from "../context/ProviderContext";
import { useTheme } from "../context/ThemeContext";
import { CheckCircle, XCircle, Mail, Lock, User, Phone, MapPin, KeyRound, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import Dialog from '../components/Dialog';
import "../css/ProviderAuth.css";

const INITIAL_FORM = {
  name: "", gender: "", phone: "", location: "", email: "", password: "",
  otp: "", newPassword: "", confirmNewPassword: ""
};

export default function ProviderAuth() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginStep, setLoginStep] = useState("loginform");
  const [resetStep, setResetStep] = useState('email');
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState({ isOpen: false });

  const { login } = useProvider();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegisterPass, setShowRegisterPass] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);
  const [isGenderMenuOpen, setIsGenderMenuOpen] = useState(false);
  const genderMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (genderMenuRef.current && !genderMenuRef.current.contains(e.target)) {
        setIsGenderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDialog = (config) => setDialogState({ ...config, isOpen: true });
  const closeDialog = () => setDialogState(prevState => ({ ...prevState, isOpen: false }));

  // This function now works correctly for ALL inputs because they have the 'name' attribute
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectGender = (g) => { setForm((prev) => ({ ...prev, gender: g })); setIsGenderMenuOpen(false); };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setForm(INITIAL_FORM);
    setLoginStep("loginform");
    setResetStep('email');
  };

  // --- API Handlers ---

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await providerLoginRequest(form);
    if (res.success) {
      showDialog({
        type: 'success', title: 'Login Successful!', icon: <CheckCircle />, confirmButtonOnly: true, confirmText: 'Continue',
        children: 'Welcome back! Redirecting to your dashboard.',
        onConfirm: () => {
          if (res.user && res.token) login(res.user, res.token);
          navigate("/provider/dashboard");
        }
      });
    } else {
      showDialog({
        type: 'error', title: 'Login Failed', icon: <XCircle />, confirmButtonOnly: true, confirmText: 'Try Again',
        children: res.msg || "Invalid credentials.", onConfirm: closeDialog
      });
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await providerRegisterRequest(form);
    if (res.success) {
      showDialog({
        type: 'success', title: 'Registration Successful!', icon: <CheckCircle />, confirmButtonOnly: true, confirmText: 'OK',
        children: 'Your provider account is created. You can now log in.',
        onConfirm: () => { changeTab("login"); closeDialog(); }
      });
    } else {
      showDialog({
        type: 'error', title: 'Registration Failed', icon: <XCircle />, confirmButtonOnly: true, confirmText: 'Close',
        children: res.msg || "Could not create account.", onConfirm: closeDialog
      });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email?.trim()) {
      showDialog({ type: 'error', title: 'Email Required', icon: <XCircle />, confirmButtonOnly: true, confirmText: 'OK', children: "Please enter your email address.", onConfirm: closeDialog });
      return;
    }
    setLoading(true);
    const res = await providerForgotPasswordRequest(form.email);
    if (res.success) {
      showDialog({
        type: 'success', title: 'OTP Sent!', icon: <CheckCircle />, confirmButtonOnly: true, confirmText: 'OK',
        children: `An OTP has been sent to ${form.email}.`,
        onConfirm: () => {
          setResetStep('otp');
          closeDialog();
        }
      });
    } else {
      showDialog({ type: 'error', title: 'Request Failed', icon: <XCircle />, confirmButtonOnly: true, confirmText: 'Close', children: res.msg || "Failed to send OTP.", onConfirm: closeDialog });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      showDialog({ type: 'error', title: 'Passwords Do Not Match', icon: <XCircle />, confirmButtonOnly: true, confirmText: 'OK', children: "Please ensure both new password fields match.", onConfirm: closeDialog });
      return;
    }
    setLoading(true);
    const res = await providerResetPasswordRequest({ email: form.email, otp: form.otp, password: form.newPassword });
    if (res.success) {
      showDialog({
        type: 'success', title: 'Password Reset!', icon: <CheckCircle />, confirmButtonOnly: true, confirmText: 'OK',
        children: "Your password has been reset. You can now sign in.",
        onConfirm: () => { changeTab("login"); closeDialog(); }
      });
    } else {
      showDialog({ type: 'error', title: 'Reset Failed', icon: <XCircle />, confirmButtonOnly: true, confirmText: 'Try Again', children: res.msg || "Invalid OTP or password.", onConfirm: closeDialog });
    }
    setLoading(false);
  };

  return (
    <div className={`auth-page-wrapper ${theme === "light" ? "light-theme" : ""}`}>
      <Dialog {...dialogState} onClose={closeDialog} />
      <div className="auth-container">
        <div className="form-panel">
          <div className="tabs-slider">
            <button className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => changeTab('login')}>Sign In</button>
            <button className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => changeTab('register')}>Register</button>
            <div className="tab-indicator" style={{ transform: activeTab === 'register' ? 'translateX(100%)' : 'translateX(0%)' }}></div>
          </div>
          <div className={`form-content ${isGenderMenuOpen ? 'dropdown-active' : ''}`}>
            {activeTab === "login" && (
              <div className="form-fader">
                <form onSubmit={handleLogin} className={`auth-form ${loginStep === 'loginform' ? 'active' : ''}`}>
                  <h2>Provider Dashboard</h2>
                  <div className="input-group"><label htmlFor="signin-email">Email</label><div className="input-field"><Mail className="input-icon" size={20} /><input id="signin-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" /></div></div>
                  {/* ✅ FIX: Added name="password" */}
                  <div className="input-group"><label htmlFor="signin-password">Password</label><div className="input-field"><Lock className="input-icon" size={20} /><input id="signin-password" name="password" type={showLoginPass ? "text" : "password"} value={form.password} onChange={handleChange} required placeholder="••••••••" /><button type="button" className="password-toggle-btn" onClick={() => setShowLoginPass(!showLoginPass)}>{showLoginPass ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>
                  <button type="submit" className="submit-btn primary-btn" disabled={loading}>{loading ? "Signing In..." : "Sign In"}</button>
                  <div className="switcher-section" style={{ marginTop: '1rem' }}><button type="button" className="switcher-link" onClick={() => { setLoginStep('forgototp'); setResetStep('email'); }}>Forgot Password?</button></div>
                  <div className="switcher-section" style={{ marginTop: '1rem' }}>Not a provider? <button type="button" className="switcher-link" onClick={() => navigate("/login")}>Go to User Login</button></div>
                </form>

                <div className={`auth-form ${loginStep === 'forgototp' ? 'active' : ''}`}>
                  <form onSubmit={handleResetPassword} >
                    <h2>Reset Password</h2>
                    <div className="form-section">
                      <div className={`form-step-content ${resetStep === 'email' ? 'active' : ''}`}>
                        <p className="otp-info">Enter your email to receive a verification code.</p>
                        <div className="input-group"><label htmlFor="reset-email">Your Email</label><div className="input-field"><Mail className="input-icon" size={20} /><input id="reset-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" /></div></div>
                        <button type="button" className="submit-btn primary-btn" onClick={handleForgotPassword} disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
                      </div>

                      <div className={`form-step-content ${resetStep === 'otp' ? 'active' : ''}`}>
                        <p className="otp-info">An OTP was sent to <strong>{form.email}</strong></p>
                        {/* ✅ FIX: Added name attributes to all inputs */}
                        <div className="input-group"><label htmlFor="otp">Enter OTP</label><div className="input-field"><KeyRound className="input-icon" size={20} /><input id="otp" name="otp" value={form.otp} onChange={handleChange} required maxLength="6" placeholder="_ _ _ _ _ _" /></div></div>
                        <div className="input-group"><label htmlFor="newPassword">New Password</label><div className="input-field"><Lock className="input-icon" size={20} /><input id="newPassword" name="newPassword" type={showResetPass ? "text" : "password"} value={form.newPassword} onChange={handleChange} required placeholder="New secure password" /><button type="button" className="password-toggle-btn" onClick={() => setShowResetPass(!showResetPass)}>{showResetPass ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>
                        <div className="input-group"><label htmlFor="confirmNewPassword">Confirm New Password</label><div className="input-field"><Lock className="input-icon" size={20} /><input id="confirmNewPassword" name="confirmNewPassword" type={showResetPass ? "text" : "password"} value={form.confirmNewPassword} onChange={handleChange} required placeholder="Confirm new password" /></div></div>
                        <button type="submit" className="submit-btn primary-btn" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
                        <button type="button" className="submit-btn back-btn" onClick={() => setResetStep('email')}>Back</button>
                      </div>
                    </div>
                  </form>
                  <button type="button" className="submit-btn back-btn standalone-back-btn" onClick={() => setLoginStep("loginform")}>Back to Sign In</button>
                </div>
              </div>
            )}
            {activeTab === "register" && (
              <div className="form-fader">
                <form onSubmit={handleRegister} className="auth-form register-form active">
                  <h2>Become a Provider</h2>
                  {/* ✅ FIX: Added name attributes to all inputs */}
                  <div className="input-group"><label htmlFor="name">Full Name / Company</label><div className="input-field"><User className="input-icon" size={20} /><input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. John's Catering" /></div></div>
                  <div className="input-group"><label htmlFor="phone">Phone Number</label><div className="input-field"><Phone className="input-icon" size={20} /><input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+91 12345 67890" /></div></div>
                  <div className={`input-group ${isGenderMenuOpen ? 'dropdown-open' : ''}`} ref={genderMenuRef}> <label>Gender</label> <div className="custom-select-container"> <button type="button" className={`custom-select-trigger ${form.gender ? "selected" : ""}`} onClick={() => setIsGenderMenuOpen(!isGenderMenuOpen)}> {form.gender || "Select Gender"} <span className={`arrow ${isGenderMenuOpen ? "open" : ""}`}></span> </button> {isGenderMenuOpen && (<div className="custom-select-options"> <div className="custom-select-option" onClick={() => selectGender("Male")}>Male</div> <div className="custom-select-option" onClick={() => selectGender("Female")}>Female</div> <div className="custom-select-option" onClick={() => selectGender("Other")}>Other</div> </div>)} </div> </div>
                  <div className="input-group"><label htmlFor="location">Base Location / City</label><div className="input-field"><MapPin className="input-icon" size={20} /><input id="location" name="location" value={form.location} onChange={handleChange} required placeholder="e.g. New York" /></div></div>
                  <div className="input-group"><label htmlFor="register-email">Email Address</label><div className="input-field"><Mail className="input-icon" size={20} /><input id="register-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" /></div></div>
                  <div className="input-group"><label htmlFor="register-password">Create Password</label><div className="input-field"><Lock className="input-icon" size={20} /><input id="register-password" name="password" type={showRegisterPass ? "text" : "password"} value={form.password} onChange={handleChange} required placeholder="Choose a strong password" /><button type="button" className="password-toggle-btn" onClick={() => setShowRegisterPass(!showRegisterPass)}>{showRegisterPass ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>
                  <button type="submit" className="submit-btn primary-btn" disabled={loading}>{loading ? "Creating Account..." : "Register as Provider"}</button>
                </form>
              </div>
            )}
          </div>
        </div>
        <div className="info-panel">
          <h1 className="welcome-text">Join as a Provider</h1>
          <p className="welcome-subtext">Manage your services, track bookings, and grow your business with us.</p>
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