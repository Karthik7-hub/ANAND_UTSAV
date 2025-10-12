import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/BookServicePage.css"; // CSS remains the same
import { useUser } from "../context/UserContext";
// ✨ --- IMPORT NEW ICONS --- ✨
import { Calendar, Users, Home, Edit3, ArrowLeft, CalendarClock } from 'lucide-react';

// --- Skeleton Loader Component (no changes) ---
const BookingSkeleton = () => (
  // ... same skeleton code as before
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

  const [date, setDate] = useState("");
  const [minp, setMinp] = useState("");
  const [maxp, setMaxp] = useState("");
  const [venue, setVenue] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);

  // ✨ --- CALCULATE THE EARLIEST BOOKABLE DATE --- ✨
  const minBookingDate = React.useMemo(() => {
    if (!service) return new Date().toISOString().split("T")[0];

    const earliestDate = new Date();
    // Add the required notice days to today's date
    earliestDate.setDate(earliestDate.getDate() + (service.mindaysprior || 0));
    return earliestDate.toISOString().split("T")[0];
  }, [service]);


  useEffect(() => {
    const fetchService = async () => {
      try {
        setPageLoading(true);
        const res = await axios.get("https://anand-u.vercel.app/provider/allservices");
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

  // ... (handleCheckAvailability and handleConfirmBooking functions remain the same)
  const handleCheckAvailability = async () => {
    if (!date || !minp || !maxp) {
      alert("Please fill in the date and number of guests.");
      return;
    }
    if (Number(minp) > Number(maxp)) {
      alert("Minimum guests cannot be more than maximum guests.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await axios.post("https://anand-u.vercel.app/booking/availabilty", {
        minp: Number(minp),
        maxp: Number(maxp),
        date,
        serviceId: id,
      });

      if (res.data.success) {
        alert("✅ Service is available! Please confirm your details.");
        setStep(2);
      } else {
        alert(res.data.msg || "Sorry, the service is not available for the selected date or guest count.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while checking availability.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!venue.trim()) {
      alert("Please enter the venue address.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await axios.post(
        "https://anand-u.vercel.app/booking/book",
        {
          minp: Number(minp),
          maxp: Number(maxp),
          date,
          venue,
          specialRequests,
          totalAmount: service?.priceInfo?.amount || 0,
          serviceId: id,
          provider: service?.providers?._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("🎉 Booking request sent! You will be notified upon provider's confirmation.");
        navigate(`/service/${id}`);
      } else {
        alert(res.data.msg || "Booking failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during booking.");
    } finally {
      setActionLoading(false);
    }
  };

  if (pageLoading) {
    return <BookingSkeleton />;
  }

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
      <button className="bsp-back-btn" onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
        <ArrowLeft size={18} /> {step === 1 ? 'Back' : 'Edit Details'}
      </button>

      <h1 className="bsp-page-title">Book Service</h1>

      <div className="bsp-card bsp-service-summary">
        <h2>{service.name}</h2>
        <p>{service.description}</p>
        <p className="bsp-price">
          ₹{service.priceInfo?.amount || 'N/A'}{" "}
          {service.priceInfo?.unit && `/ ${service.priceInfo.unit.replace('-', ' ')}`}
        </p>

        {/* ✨ --- NEW DETAILS SECTION --- ✨ */}
        <div className="bsp-service-meta">
          <div className="bsp-meta-item">
            <Users size={16} className="bsp-meta-icon" />
            <span>
              Guests: {service.minPeople || 1} - {service.maxPeople || 'Any'}
            </span>
          </div>
          <div className="bsp-meta-item">
            <CalendarClock size={16} className="bsp-meta-icon" />
            <span>
              {service.mindaysprior > 0 ? `${service.mindaysprior} days notice required` : 'No prior notice required'}
            </span>
          </div>
        </div>

      </div>

      <div className="bsp-card bsp-form-card">
        {step === 1 ? (
          <>
            <h3>Step 1: Check Availability</h3>
            <div className="bsp-input-group">
              <Calendar size={18} className="bsp-input-icon" />
              {/* ✨ --- DATE INPUT IS NOW SMARTER --- ✨ */}
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={minBookingDate} />
            </div>
            <div className="bsp-guest-inputs">
              <div className="bsp-input-group">
                <Users size={18} className="bsp-input-icon" />
                <input type="number" placeholder="Min guests" value={minp} onChange={(e) => setMinp(e.target.value)} min="0" />
              </div>
              <div className="bsp-input-group">
                <Users size={18} className="bsp-input-icon" />
                <input type="number" placeholder="Max guests" value={maxp} onChange={(e) => setMaxp(e.target.value)} min="0" />
              </div>
            </div>
            <button className="bsp-button" onClick={handleCheckAvailability} disabled={actionLoading}>
              {actionLoading ? "Checking..." : "Check Availability"}
            </button>
          </>
        ) : (
          // ... (Step 2 remains the same)
          <>
            <h3>Step 2: Confirm Booking Details</h3>
            <div className="bsp-input-group">
              <Home size={18} className="bsp-input-icon" />
              <input type="text" placeholder="Venue address" value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>
            <div className="bsp-input-group">
              <Edit3 size={18} className="bsp-input-icon" />
              <textarea placeholder="Special requests (optional)" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
            </div>
            <button className="bsp-button" onClick={handleConfirmBooking} disabled={actionLoading}>
              {actionLoading ? "Booking..." : "Confirm Booking"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}