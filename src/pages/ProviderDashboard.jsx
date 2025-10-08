import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  providerLogoutRequest,
  providerFetchServices,
  providerDeleteService,
} from "../utils/providerAuthApi";

import { Plus, LayoutDashboard, Calendar, MessageSquare, Settings, LogOut, ChevronUp } from 'lucide-react';

// Using your custom ServiceCard component via import
import ServiceProviderCard from "../components/ServiceProviderCard";

// NEW: Import the ChatPage component. Adjust the path if it's located elsewhere.
import ChatPage from './ChatPage';


export default function ProviderDashboard() {
  // --- State and Logic ---
  const [services, setServices] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // NEW: State to manage which view is active in the main content area.
  // 'dashboard' is the default view.
  const [activeView, setActiveView] = useState('dashboard');

  // This function now handles the REAL API call
  const fetchServices = async () => {
    setFetching(true);
    try {
      const res = await providerFetchServices();
      if (res.success && Array.isArray(res.services)) {
        setServices(res.services);
      } else {
        console.error("API did not return a valid services array:", res);
        setServices([]);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setServices([]); // Set to empty array on error
    }
    setFetching(false);
  };

  // This useEffect now calls the real fetchServices function
  useEffect(() => {
    // If we are navigating from the "Add Service" page, use the new service data instantly
    if (location.state?.newService) {
      setServices(prev => [location.state.newService, ...prev.filter(s => s._id !== location.state.newService._id)]);
      setFetching(false);
    } else {
      // Otherwise, fetch all services from the backend on initial load
      fetchServices();
    }
  }, [location.state]); // Reruns if location state changes

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✨ Restored Full Logout Functionality
  const handleLogout = async () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);
    try {
      const res = await providerLogoutRequest();
      if (res.success) {
        alert("✅ Logged out successfully");
        navigate("/provider-login");
      } else {
        alert(res.msg || "❌ Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("❌ Logout failed");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    // Optimistically remove from UI
    setServices(prev => prev.filter(s => s._id !== id));

    // Call API to delete from database
    try {
      await providerDeleteService(id);
    } catch (err) {
      console.error("Failed to delete service from backend:", err);
      // Optional: Re-fetch to sync state if the API call fails
      fetchServices();
    }
  };
  const handleDummyLink = (e) => {
    e.preventDefault();
    alert("This feature is not yet available.");
  };

  // NEW: Wrapped the original services view in its own component for cleaner conditional rendering.
  const ServicesView = () => (
    <>
      <div className="dashboard-main-header">
        <h2>My Services</h2>
        <Link to="/provider/add-service" className="action-button"><Plus /> Add New Service</Link>
      </div>

      {fetching ? (
        <div className="status-container"><div className="loading-spinner"></div></div>
      ) : services.length === 0 ? (
        <div className="status-container">
          <h3>No services yet</h3>
          <p>Click "Add New Service" to get started.</p>
        </div>
      ) : (
        <div className="service-grid">
          {services.map((service, index) => (
            <div key={service._id} className="service-card-wrapper" style={{ animationDelay: `${index * 100}ms` }}>
              <ServiceProviderCard
                service={service}
                onDelete={() => handleDelete(service._id)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <style>{`
              :root {
                  --primary-color: #FF9B33; --glass-bg: rgba(30, 41, 59, 0.5);
                  --glass-border: rgba(255, 255, 255, 0.1); --text-color: #cbd5e1;
                  --text-light: #94a3b8; --sidebar-bg: rgba(13, 17, 23, 0.9);
                  --font-sans: 'Poppins', sans-serif;
              }
              
              html, body {
                  overflow: hidden;
                  height: 100%;
                  width: 100%;
              }
              body { 
                  background-color: #0d1117; 
                  font-family: var(--font-sans); 
                  margin: 0;
              }
              * { box-sizing: border-box; }

              .dashboard-layout { 
                  display: grid; 
                  grid-template-columns: 260px 1fr; 
                  height: 100vh;
                  width: 100%;
              }
              .dashboard-sidebar {
                  background: var(--sidebar-bg); border-right: 1px solid var(--glass-border);
                  backdrop-filter: blur(20px); display: flex; flex-direction: column;
                  padding: 1.5rem; color: var(--text-color);
              }
              .sidebar-header { text-align: center; margin-bottom: 2.5rem; }
              .sidebar-header h1 { font-size: 1.8rem; color: #fff; letter-spacing: 1px; }
              .sidebar-nav { flex-grow: 1; }
              .sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
              .nav-item a {
                  display: flex; align-items: center; gap: 0.75rem;
                  padding: 0.8rem 1rem; margin-bottom: 0.5rem; border-radius: 8px;
                  color: var(--text-light); text-decoration: none; transition: all 0.2s ease-in-out;
                  cursor: pointer; /* MODIFIED: Make it clear it's clickable */
              }
              .nav-item a:hover { background: var(--glass-bg); color: #fff; }
              .nav-item a.active { background: var(--primary-color); color: #fff; font-weight: 500; }
              
              .sidebar-profile { position: relative; margin-top: 1rem; }
              .profile-card {
                  display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem;
                  border-radius: 10px; cursor: pointer; background: var(--glass-bg);
                  border: 1px solid transparent; transition: all 0.2s ease-in-out;
              }
              .profile-card:hover { border-color: var(--glass-border); }
              .profile-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); display: grid; place-items: center; font-weight: bold; color: #fff; font-size: 1.2rem; }
              .profile-info { flex-grow: 1; overflow: hidden; }
              .profile-info .name { font-weight: 500; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
              .profile-info .email { font-size: 0.8rem; color: var(--text-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
              .profile-card .chevron { transition: transform 0.3s; }
              .profile-card.open .chevron { transform: rotate(180deg); }

              .profile-menu {
                  position: absolute; bottom: calc(100% + 10px); left: 0; right: 0;
                  background: var(--sidebar-bg); border: 1px solid var(--glass-border);
                  border-radius: 10px; z-index: 10; padding: 0.5rem; backdrop-filter: blur(20px);
                  opacity: 0; visibility: hidden; transform: translateY(10px);
                  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
              }
              .profile-menu.open { opacity: 1; visibility: visible; transform: translateY(0); }
              .profile-menu-item {
                  display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1rem;
                  border-radius: 6px; color: var(--text-light); cursor: pointer; text-decoration: none;
              }
              .profile-menu-item:hover { background: var(--glass-bg); color: #fff; }
              .profile-menu-item.logout { color: #ff8a8a; }
              .profile-menu-item.logout:hover { background: rgba(255, 107, 107, 0.1); color: #ff6b6b; }
              
              .dashboard-main { 
                  padding: 2.5rem; 
                  overflow-y: auto;
                  overflow-x: hidden;
              }
              
              .dashboard-main-header { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                  margin-bottom: 2rem; 
                  padding-bottom: 2rem;
                  border-bottom: 1px solid var(--glass-border);
              }
              .dashboard-main-header h2 { 
                  font-size: 2.5rem; 
                  margin: 0; 
                  color: #fff;
                  font-weight: 600;
              }
              
              .action-button {
                  display: inline-flex; align-items: center; gap: 0.5rem; padding: 12px 24px;
                  border-radius: 50px; border: none; background: var(--primary-color);
                  color: #fff; font-size: 1rem; font-weight: 500; cursor: pointer;
                  text-decoration: none; transition: all 0.3s ease;
              }
              .action-button:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(255, 153, 51, 0.4); }
              
              .service-grid {
                  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                  gap: 2rem;
                  padding-top: 2rem;
              }
              
              .service-card-wrapper {
                  transition: transform 0.3s ease;
                  opacity: 0;
                  animation: fadeInUp 0.5s ease forwards;
              }
              .service-card-wrapper:hover { 
                  transform: translateY(-5px);
              }
              
              @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
              
              .status-container { 
                  padding: 4rem 0;
                  text-align: center; 
              }
              .status-container h3 {
                  color: #fff;
                  font-size: 1.5rem;
                  margin-bottom: 0.75rem;
              }
              .status-container p {
                  color: var(--text-light);
                  font-size: 1rem;
              }

              .loading-spinner { width: 48px; height: 48px; border: 5px solid var(--glass-border); border-bottom-color: var(--primary-color); border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
               @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header"><h1>AnandUtsav</h1></div>
          <nav className="sidebar-nav">
            <ul>
              {/* MODIFIED: Sidebar links now use onClick handlers to switch views */}
              <li className="nav-item">
                <a onClick={() => setActiveView('dashboard')} className={activeView === 'dashboard' ? 'active' : ''}>
                    <LayoutDashboard size={20} /> Dashboard
                </a>
              </li>
              <li className="nav-item"><a href="#" onClick={handleDummyLink}><Calendar size={20} /> Bookings</a></li>
              <li className="nav-item">
                <a onClick={() => setActiveView('messages')} className={activeView === 'messages' ? 'active' : ''}>
                    <MessageSquare size={20} /> Messages
                </a>
              </li>
              <li className="nav-item"><a href="#" onClick={handleDummyLink}><Settings size={20} /> Settings</a></li>
            </ul>
          </nav>
          <div className="sidebar-profile" ref={profileRef}>
            <div className={`profile-menu ${isProfileOpen ? 'open' : ''}`}>
              <a className="profile-menu-item" href="#" onClick={handleDummyLink}><Settings size={18} /> View Profile</a>
              <div className="profile-menu-item logout" onClick={handleLogout}>
                <LogOut size={18} /> {loading ? "Logging out..." : "Logout"}
              </div>
            </div>
            <div className={`profile-card ${isProfileOpen ? 'open' : ''}`} onClick={() => setProfileOpen(!isProfileOpen)}>
              <div className="profile-avatar">S</div>
              <div className="profile-info">
                <div className="name">Service Provider</div>
                <div className="email">Provider Account</div>
              </div>
              <ChevronUp size={20} className="chevron" />
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          {/* // MODIFIED: This is the core of the new feature.
            // We conditionally render the correct component based on the 'activeView' state.
          */}
          {activeView === 'dashboard' && <ServicesView />}
          {activeView === 'messages' && <ChatPage />}
        </main>
      </div>
    </>
  );
}