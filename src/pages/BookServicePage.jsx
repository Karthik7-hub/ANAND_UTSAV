import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/BookServicePage.css"; // Import the new stylesheet
import { useUser } from "../context/UserContext";
import Dialog from '../components/Dialog'; // Import the Dialog component
import { Calendar, Users, Home, Edit3, ArrowLeft, CalendarClock, CheckCircle, XCircle } from 'lucide-react';

// --- Skeleton Loader Component ---
const BookingSkeleton = () => (
  <div className="bsp-book-page">
    <div className="bsp-skeleton bsp-skeleton-title"></div>
    <div className="bsp-card bsp-service-summary">
      <div className="bsp-skeleton bsp-skeleton-h2"></div>
      <div className="bsp-skeleton bsp-skeleton-text"></div>
      <div className="bsp-skeleton bsp-skeleton-text short"></div>
      <div className="bsp-skeleton bsp-skeleton-price"></div>
    </div>
    <div className="bsp-card bsp-form-card">
      <div className="bsp-skeleton bsp-skeleton-h3"></div>
      <div className="bsp-skeleton bsp-skeleton-input"></div>
      <div className="bsp-guest-inputs">
        <div className="bsp-skeleton bsp-skeleton-input"></div>
        <div className="bsp-skeleton bsp-skeleton-input"></div>
      </div>
      <div className="bsp-skeleton bsp-skeleton-button"></div>
    </div>
  </div>
);

export default function BookServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useUser();

  const [form, setForm] = useState({ date: "", minp: "", maxp: "", venue: "", specialRequests: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [dialogState, setDialogState] = useState({ isOpen: false });

  const showDialog = (config) => setDialogState({ ...config, isOpen: true });
  const closeDialog = () => setDialogState(prevState => ({ ...prevState, isOpen: false }));



  const minBookingDate = useMemo(() => {
    if (!service) return new Date().toISOString().split("T")[0];
    const earliestDate = new Date();
    earliestDate.setDate(earliestDate.getDate() + (service.mindaysprior || 0));
    return earliestDate.toISOString().split("T")[0];
  }, [service]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setPageLoading(true);
        const res = await axios.get(`https://anand-u.vercel.app/provider/allservices`);
        const allServices = Array.isArray(res.data) ? res.data : [];
        const selectedService = allServices.find((s) => s._id === id);
        setService(selectedService);
      } catch (err) {
        console.error("Service fetch failed:", err);
        setService(null);
      } finally {
        setPageLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleCheckAvailability = async () => {
    if (!form.date || !form.minp || !form.maxp) {
      showDialog({ type: 'error', title: 'Missing Information', icon: <XCircle />, children: "Please fill in the event date and number of guests.", confirmButtonOnly: true, onConfirm: closeDialog });
      return;
    }
    if (Number(form.minp) > Number(form.maxp)) {
      showDialog({ type: 'error', title: 'Invalid Guest Count', icon: <XCircle />, children: "Minimum guests cannot be more than maximum guests.", confirmButtonOnly: true, onConfirm: closeDialog });
      return;
    }

    setActionLoading(true);
    try {
      const res = await axios.post("https://anand-u.vercel.app/booking/availabilty", {
        minp: Number(form.minp), maxp: Number(form.maxp),
        date: form.date, serviceId: id,
      });

      if (res.data.success) {
        showDialog({
          type: 'success', title: 'Service Available!', icon: <CheckCircle />,
          children: 'Great news! The service is available for your selected date and guest count.',
          confirmButtonOnly: true, confirmText: 'Next Step',
          onConfirm: () => { setStep(2); closeDialog(); }
        });
      } else {
        showDialog({ type: 'warning', title: 'Not Available', icon: <XCircle />, children: res.data.msg || "Sorry, this service is not available for the selected criteria.", confirmButtonOnly: true, onConfirm: closeDialog });
      }
    } catch (err) {
      showDialog({ type: 'error', title: 'Error', icon: <XCircle />, children: "An error occurred while checking availability.", confirmButtonOnly: true, onConfirm: closeDialog });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!form.venue.trim()) {
      showDialog({ type: 'error', title: 'Missing Information', icon: <XCircle />, children: "Please enter the venue address to proceed.", confirmButtonOnly: true, onConfirm: closeDialog });
      return;
    }

    setActionLoading(true);
    try {
      const res = await axios.post("https://anand-u.vercel.app/booking/book", {
        minp: Number(form.minp), maxp: Number(form.maxp),
        date: form.date, venue: form.venue, specialRequests: form.specialRequests,
        totalAmount: service?.priceInfo?.amount || 0,
        serviceId: id, provider: service?.providers,
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        showDialog({
          type: 'success', title: 'Booking Request Sent!', icon: <CheckCircle />,
          children: "Your request has been sent to the provider. You will be notified upon their confirmation.",
          confirmButtonOnly: true, confirmText: 'Done',
          onConfirm: () => navigate(`/service/${id}`)
        });
      } else {
        showDialog({ type: 'error', title: 'Booking Failed', icon: <XCircle />, children: res.data.msg || "Your booking could not be processed. Please try again.", confirmButtonOnly: true, onConfirm: closeDialog });
      }
    } catch (err) {
      showDialog({ type: 'error', title: 'Error', icon: <XCircle />, children: "An unexpected error occurred during booking.", confirmButtonOnly: true, onConfirm: closeDialog });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (pageLoading) return <BookingSkeleton />;

  if (!service) {
    return (
      <div className="bsp-book-page bsp-not-found-container">
        <h2>Service Not Found</h2>
        <p>The service you are looking for might not exist or has been removed.</p>
        <button className="bsp-button" onClick={() => navigate('/services')}>
          <ArrowLeft size={18} /> Back to All Services
        </button>
      </div>
    );
  }

  return (
    <div className="bsp-book-page">
      <Dialog {...dialogState} onClose={closeDialog} />
      <button className="bsp-back-btn" onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
        <ArrowLeft size={18} /> {step === 1 ? 'Back' : 'Edit Details'}
      </button>

      <h1 className="bsp-page-title">Book Service</h1>

      <div className="bsp-card bsp-service-summary">
        <h2>{service.name}</h2>
        <p>{service.description}</p>
        <p className="bsp-price">
          ₹{service.priceInfo?.amount?.toLocaleString() || 'N/A'}{" "}
          {service.priceInfo?.unit && `/ ${service.priceInfo.unit.replace('-', ' ')}`}
        </p>
        <div className="bsp-service-meta">
          <div className="bsp-meta-item">
            <Users size={16} className="bsp-meta-icon" />
            <span>Guests: {service.minPeople || 1} - {service.maxPeople || 'Any'}</span>
          </div>
          <div className="bsp-meta-item">
            <CalendarClock size={16} className="bsp-meta-icon" />
            <span>{service.mindaysprior > 0 ? `${service.mindaysprior} days notice required` : 'No prior notice required'}</span>
          </div>
        </div>
      </div>

      <div className="bsp-card bsp-form-card">
        {step === 1 ? (
          <>
            <h3>Step 1: Check Availability</h3>
            <div className="bsp-input-group">
              <label htmlFor="date">Event Date</label>
              <div className="bsp-input-wrapper">
                <Calendar size={18} className="bsp-input-icon" />
                <input id="date" name="date" type="date" value={form.date} onChange={handleChange} min={minBookingDate} />
              </div>
            </div>
            <label>Number of Guests</label>
            <div className="bsp-guest-inputs">
              <div className="bsp-input-group">
                <div className="bsp-input-wrapper">
                  <Users size={18} className="bsp-input-icon" />
                  <input name="minp" type="number" placeholder="Min" value={form.minp} onChange={handleChange} min="1" />
                </div>
              </div>
              <div className="bsp-input-group">
                <div className="bsp-input-wrapper">
                  <Users size={18} className="bsp-input-icon" />
                  <input name="maxp" type="number" placeholder="Max" value={form.maxp} onChange={handleChange} min={form.minp || "1"} />
                </div>
              </div>
            </div>
            <button className="bsp-button" onClick={handleCheckAvailability} disabled={actionLoading}>
              {actionLoading ? "Checking..." : "Check Availability"}
            </button>
          </>
        ) : (
          <>
            <h3>Step 2: Confirm Booking Details</h3>
            <div className="bsp-input-group">
              <label htmlFor="venue">Venue / Address</label>
              <div className="bsp-input-wrapper">
                <Home size={18} className="bsp-input-icon" />
                <input id="venue" name="venue" type="text" placeholder="e.g., Grand Hotel, City Center" value={form.venue} onChange={handleChange} />
              </div>
            </div>
            <div className="bsp-input-group">
              <label htmlFor="specialRequests">Special Requests (Optional)</label>
              <div className="bsp-input-wrapper">
                <Edit3 size={18} className="bsp-input-icon" />
                <textarea id="specialRequests" name="specialRequests" placeholder="e.g., vegetarian options, specific song list" value={form.specialRequests} onChange={handleChange} />
              </div>
            </div>
            <button className="bsp-button" onClick={handleConfirmBooking} disabled={actionLoading}>
              {actionLoading ? "Sending Request..." : "Confirm Booking"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}