import React, { useEffect, useState, useCallback } from "react";
import {
  providerFetchNewBookings,
  providerFetchUpcomingBookings,
  providerFetchCompletedBookings,
  providerRespondBooking,
} from "../utils/providerAuthApi";
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Dialog from '../components/Dialog';
import '../css/ProviderBookingsPage.css'; // Import the new, specific stylesheet

export default function ProviderBookingsPage() {
  const [activeTab, setActiveTab] = useState("new"); // "new" | "upcoming" | "completed"
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogState, setDialogState] = useState({ isOpen: false });

  const showDialog = (config) => setDialogState({ ...config, isOpen: true });

  const closeDialog = () => setDialogState(prevState => ({ ...prevState, isOpen: false }));

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const fetchFn =
      activeTab === "upcoming" ? providerFetchUpcomingBookings
        : activeTab === "completed" ? providerFetchCompletedBookings
          : providerFetchNewBookings;

    try {
      const res = await fetchFn();
      if (!res.success) throw new Error(res.msg || "Failed to fetch bookings");

      const bookingData = res.newBookings || res.upComingBookings || res.completedBookings || [];
      setBookings(bookingData);
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      showDialog({
        type: 'error', title: 'Fetch Error', icon: <XCircle />,
        children: "Could not retrieve bookings. Please try again later.",
        confirmButtonOnly: true, confirmText: 'OK', onConfirm: closeDialog
      });
      setBookings([]);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // This function performs the API call after confirmation
  const confirmResponse = async (bookingId, action) => {
    closeDialog();
    try {
      const res = await providerRespondBooking(bookingId, action);
      if (res.success) {
        showDialog({
          type: 'success', title: 'Success', icon: <CheckCircle />,
          children: res.msg || `Booking ${action}ed successfully.`,
          confirmButtonOnly: true, confirmText: 'Great!', onConfirm: closeDialog
        });
        // Optimistically remove the booking from the current view
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        throw new Error(res.msg || "Action failed");
      }
    } catch (err) {
      console.error(err);
      showDialog({
        type: 'error', title: 'Action Failed', icon: <XCircle />,
        children: err.message || "An error occurred while responding to the booking.",
        confirmButtonOnly: true, confirmText: 'Close', onConfirm: closeDialog
      });
    }
  };

  // This function opens the confirmation dialog
  const handleResponse = (bookingId, action) => {
    showDialog({
      type: 'warning',
      title: `Confirm ${action}`,
      icon: <AlertTriangle />,
      children: `Are you sure you want to ${action} this booking request?`,
      confirmText: `Yes, ${action}`,
      cancelText: 'Cancel',
      onConfirm: () => confirmResponse(bookingId, action),
      onClose: closeDialog,
    });
  };

  const renderBookingCard = (booking) => {
    const service = booking.service || {};
    const user = booking.user || {};

    return (
      <div key={booking._id} className="booking-card">
        <div className="booking-card-header">
          <h3>{service.name || "Unknown Service"}</h3>
          <span className={`status-badge status-${(booking.status || 'pending').toLowerCase()}`}>
            {booking.status || 'Pending'}
          </span>
        </div>
        <div className="booking-card-body">
          <div className="info-row">
            <span className="info-label">Client</span>
            <span className="info-value">{user.fullName || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Event Date</span>
            <span className="info-value">{booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "N/A"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Guests</span>
            <span className="info-value">{booking.avgGuestsCount || 0}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Venue</span>
            <span className="info-value venue">{booking.venue || "Not specified"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Price</span>
            <span className="info-value price">₹{booking.totalPrice?.toLocaleString() || 0}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment</span>
            <span className="info-value">{booking.paymentStatus || "Pending"}</span>
          </div>
        </div>

        {activeTab === "new" && (booking.status || '').toLowerCase().includes("pending") && (
          <div className="booking-card-footer">
            <button className="action-button reject" onClick={() => handleResponse(booking._id, "reject")}>
              <XCircle size={16} /> Reject
            </button>
            <button className="action-button accept" onClick={() => handleResponse(booking._id, "accept")}>
              <CheckCircle size={16} /> Accept
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="view-wrapper bookings-page-wrapper">
      <Dialog {...dialogState} onClose={closeDialog} />
      <div className="view-header">
        <h2>Manage Bookings</h2>
      </div>

      <div className="bookings-tabs">
        {["new", "upcoming", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`booking-tab-btn ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="view-content">
        {loading ? (
          <div className="status-container"><div className="loading-spinner"></div></div>
        ) : bookings.length === 0 ? (
          <div className="status-container">
            <h3>No {activeTab} bookings</h3>
            <p>When you get a booking in this category, it will show up here.</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(renderBookingCard)}
          </div>
        )}
      </div>
    </div>
  );
}