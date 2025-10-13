import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  providerLogoutRequest,
  providerFetchServices,
  providerDeleteService,
  providerFetchNewBookings, // ✅ Import new booking fetcher
  providerFetchUpcomingBookings, // ✅ Import upcoming booking fetcher
} from "../utils/providerAuthApi";
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../context/ThemeContext';
// ✅ User icon is now imported, Settings is removed
import { Plus, LayoutDashboard, Calendar, MessageSquare, User, LogOut, ChevronUp, Menu, Sun, Moon, CheckCircle, XCircle, Briefcase, Star, AlertTriangle } from 'lucide-react';
import Dialog from '../components/Dialog';
import ServiceProviderCard from "../components/ServiceProviderCard";
import ProviderChatPage from "./ProviderChatPage";
import ProviderBookingsPage from "./ProviderBookingsPage";
import '../css/ProviderDashboard.css';

// Helper function to calculate the weighted average rating
function calculateOverallAverageRating(services) {
  const ratedServices = services.filter(service => service.avgRating > 0 && service.reviewCount > 0);
  if (ratedServices.length === 0) return 0;
  const totals = ratedServices.reduce((acc, service) => {
    acc.totalWeightedRatingSum += service.avgRating * service.reviewCount;
    acc.totalReviewCount += service.reviewCount;
    return acc;
  }, { totalWeightedRatingSum: 0, totalReviewCount: 0 });
  return totals.totalReviewCount === 0 ? 0 : totals.totalWeightedRatingSum / totals.totalReviewCount;
}

// ✅ HELPER FUNCTION: Gets today's date as a 'YYYY-MM-DD' string
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function ProviderDashboard() {
  // --- STATE MANAGEMENT ---
  const [services, setServices] = useState([]);
  const [newBookings, setNewBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [urgentBookings, setUrgentBookings] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [dialogState, setDialogState] = useState({ isOpen: false });

  // --- HOOKS ---
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { provider, logout } = useProvider();
  const { theme, toggleTheme } = useTheme();

  const averageRating = useMemo(() => calculateOverallAverageRating(services), [services]);

  // --- HELPER FUNCTIONS ---
  const showDialog = (config) => setDialogState({ ...config, isOpen: true });

  const closeDialog = () => setDialogState(prevState => ({ ...prevState, isOpen: false }));

  // --- DATA FETCHING & SIDE EFFECTS ---
  const fetchServices = async () => {
    setFetching(true);
    try {
      const res = await providerFetchServices();
      if (res.success && Array.isArray(res.services)) {
        setServices(res.services);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setServices([]);
    }
    setFetching(false);
  };

  // Effect to handle service updates from other pages (Add/Edit)
  useEffect(() => {
    // Clear the location state to prevent re-triggering on view changes
    const state = location.state;
    if (state) {
      window.history.replaceState({}, document.title)
    }

    if (state?.newService) {
      setServices(prev => [state.newService, ...prev]);
      setFetching(false);
    } else if (state?.updatedService) {
      setServices(prev => prev.map(s => s._id === state.updatedService._id ? state.updatedService : s));
    } else {
      fetchServices();
    }
  }, [location.state]);

  // ✅ EFFECT: Calculates urgent bookings whenever the upcoming bookings list changes
  useEffect(() => {
    if (upcomingBookings.length === 0) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dismissedToday = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
    const todayString = getTodayDateString();
    const potentialUrgent = upcomingBookings.filter(b => {
      if (!b.eventDate || !b.service || typeof b.service.mindaysprior === 'undefined') return false;
      const eventDate = new Date(b.eventDate); eventDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
      return diffDays <= b.service.mindaysprior && diffDays >= 0;
    });
    const newUrgent = potentialUrgent.filter(b => dismissedToday[b._id] !== todayString);
    setUrgentBookings(newUrgent);
  }, [upcomingBookings]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setFetching(true);
      try {
        const [servicesRes, newBookingsRes, upcomingBookingsRes] = await Promise.all([
          providerFetchServices(), providerFetchNewBookings(), providerFetchUpcomingBookings(),
        ]);
        if (servicesRes.success) setServices(servicesRes.services || []);
        if (newBookingsRes.success) setNewBookings(newBookingsRes.newBookings || []);
        if (upcomingBookingsRes.success) setUpcomingBookings(upcomingBookingsRes.upComingBookings || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        showDialog({ type: 'error', title: 'Data Error', icon: <XCircle />, children: "Could not load dashboard data.", confirmButtonOnly: true, confirmText: 'OK', onConfirm: closeDialog });
      }
      setFetching(false);
    };
    fetchDashboardData();
  }, []);

  // Effect to close popups on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ UPDATED HANDLER: Now saves the dismissal to localStorage
  const handleDismissNotification = (bookingId) => {
    setUrgentBookings(prev => prev.filter(b => b._id !== bookingId));
    const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
    dismissed[bookingId] = getTodayDateString();
    localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed));
  };

  // --- EVENT HANDLERS ---
  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await providerLogoutRequest();
      if (res.success) {
        logout();
        showDialog({
          type: 'success', title: 'Logged Out', icon: <CheckCircle />,
          children: 'You have been logged out successfully.',
          confirmButtonOnly: true, confirmText: 'OK',
          onConfirm: () => navigate("/provider-login"),
        });
      } else {
        showDialog({
          type: 'error', title: 'Logout Failed', icon: <XCircle />,
          children: res.msg || "Could not log out. Please try again.",
          confirmButtonOnly: true, onConfirm: closeDialog,
        });
      }
    } catch (err) {
      showDialog({
        type: 'error', title: 'Error', icon: <XCircle />,
        children: "An error occurred during logout.",
        confirmButtonOnly: true, onConfirm: closeDialog,
      });
    }
    setLoading(false);
  };

  const confirmDelete = async (id) => {
    closeDialog();
    const originalServices = [...services];
    setServices(prev => prev.filter(s => s._id !== id));
    try {
      const res = await providerDeleteService(id);
      if (!res.success) {
        showDialog({
          type: 'error', title: 'Deletion Failed', icon: <XCircle />,
          children: res.msg || "Could not delete the service from the server.",
          confirmButtonOnly: true, onConfirm: closeDialog
        });
        setServices(originalServices); // Revert UI on failure
      }
    } catch (err) {
      showDialog({
        type: 'error', title: 'Error', icon: <XCircle />,
        children: "A network error occurred. Please try again.",
        confirmButtonOnly: true, onConfirm: closeDialog
      });
      setServices(originalServices); // Revert UI on failure
    }
  };

  const handleDelete = (id) => {
    showDialog({
      type: 'warning',
      title: 'Confirm Deletion',
      icon: <XCircle />,
      children: 'Are you sure you want to delete this service? This action cannot be undone.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: () => confirmDelete(id),
      onClose: closeDialog,
    });
  };

  const handleDummyLink = (e) => { e.preventDefault(); showDialog({ type: 'info', title: 'Feature Not Available', children: 'This feature is under development.', confirmButtonOnly: true, confirmText: 'Got it', onConfirm: closeDialog }); };


  const ServicesView = () => (
    <div className="view-wrapper" id="services-section">
      <div className="view-header">
        <h2>My Services</h2>
        <Link to="/provider/add-service" className="action-button primary"><Plus size={18} /> Add New Service</Link>
      </div>
      <div className="view-content">
        {fetching ? (
          <div className="status-container"><div className="loading-spinner"></div></div>
        ) : services.length === 0 ? (
          <div className="status-container">
            <h3>No services yet</h3><p>Click "Add New Service" to get started.</p>
          </div>
        ) : (
          <div className="service-grid">
            {services.map((service, index) => (
              <div key={service._id} className="service-card-wrapper" style={{ animationDelay: `${index * 50}ms` }}>
                <ServiceProviderCard service={service} onDelete={() => handleDelete(service._id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="provider-dashboard-theme-wrapper" data-theme={theme}>
      <div className="dashboard-layout">
        <Dialog {...dialogState} onClose={closeDialog} />
        {isSidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

        <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <div className="brand-logo">A</div>
            <h1>AnandUtsav</h1>
          </div>
          <nav className="sidebar-nav">
            <a onClick={() => { setActiveView('dashboard'); setSidebarOpen(false); }} className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </a>
            <a onClick={() => { setActiveView('bookings'); setSidebarOpen(false); }} className={`nav-item ${activeView === 'bookings' ? 'active' : ''}`}>
              <Calendar size={20} /> Bookings
            </a>
            <a onClick={() => { setActiveView('messages'); setSidebarOpen(false); }} className={`nav-item ${activeView === 'messages' ? 'active' : ''}`}>
              <MessageSquare size={20} /> Messages
            </a>
          </nav>
        </aside>

        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu size={24} />
            </button>
            <div className="header-title">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </div>
            <div className="header-profile" ref={profileRef}>
              <button className="profile-button" onClick={() => setProfileOpen(!isProfileOpen)}>
                <div className="profile-avatar">{provider?.name?.charAt(0).toUpperCase() || 'P'}</div>
                <span className="profile-name">{provider?.name || 'Provider'}</span>
              </button>
              <div className={`profile-menu ${isProfileOpen ? 'open' : ''}`}>
                <div className="menu-header">
                  <div className="name">{provider?.name || 'Service Provider'}</div>
                  <div className="email">{provider?.email || 'Provider Account'}</div>
                </div>
                <a className="profile-menu-item" href="#" onClick={handleDummyLink}><User size={16} /> View Profile</a>
                <button className="profile-menu-item" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  <span>Toggle Theme</span>
                </button>
                <div className="menu-divider"></div>
                <button className="profile-menu-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>{loading ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </div>
          </header>

          <main className="dashboard-main" id="dashboard-main-content">
            {urgentBookings.length > 0 && (
              <div className="urgent-notifications-container">
                {urgentBookings.map(booking => (
                  <div key={booking._id} className="notification-card">
                    <div className="notification-icon"><AlertTriangle size={20} /></div>
                    <div className="notification-content">
                      <strong>Urgent Booking Approaching:</strong>
                      <p>"{booking.service?.name || 'A service'}" is scheduled for {new Date(booking.eventDate).toLocaleDateString()}.</p>
                    </div>
                    <button className="notification-close-btn" onClick={() => handleDismissNotification(booking._id)} aria-label="Dismiss notification"><X size={18} /></button>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'dashboard' && (
              <>
                <div className="welcome-header">
                  <h1>Welcome back, <span className="provider-name">{provider?.name || 'Provider'}!</span></h1>
                  <p>Here's a quick overview of your business.</p>
                </div>
                <div className="dashboard-stats">
                  <div className="stat-card"><div className="stat-icon"><Briefcase size={24} /></div><div className="stat-info"><span className="stat-value">{services.length}</span><span className="stat-label">Total Services</span></div></div>
                  <div className="stat-card"><div className="stat-icon"><Calendar size={24} /></div><div className="stat-info"><span className="stat-value">{newBookings.length}</span><span className="stat-label">New Bookings</span></div></div>
                  <div className="stat-card"><div className="stat-icon"><Star size={24} /></div><div className="stat-info"><span className="stat-value">{averageRating > 0 ? averageRating.toFixed(1) : "N/A"}</span><span className="stat-label">Avg. Rating</span></div></div>
                </div>
              </>
            )}

            {activeView === 'dashboard' && <ServicesView />}
            {activeView === 'messages' && <ProviderChatPage />}
            {activeView === 'bookings' && <ProviderBookingsPage />}
          </main>
        </div>
      </div>
    </div>
  );
}