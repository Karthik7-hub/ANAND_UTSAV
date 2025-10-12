import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../css/UserBookingsPage.css";
import { UserCheck, Calendar, Users, MapPin, CreditCard } from "lucide-react";

const BookingsSkeleton = () => (
  <div className="ubp-page">
    <div className="ubp-container">
      <div className="ubp-header"><div className="ubp-skeleton title"></div></div>
      <div className="ubp-skeleton section-title"></div>
      <div className="ubp-skeleton card"></div>
      <div className="ubp-skeleton section-title"></div>
      <div className="ubp-skeleton card"></div>
    </div>
  </div>
);

export default function UserBookingsPage() {
  const { token } = useUser();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        setLoading(true);
        const res = await axios.get("https://anand-u.vercel.app/booking/getUserBookings", { headers: { Authorization: `Bearer ${token}` } });

        // ✨ --- FETCHING PROVIDER NAME FROM API RESPONSE --- ✨
        setBookings(res.data.bookings.map(b => ({
          bookingId: b._id,
          serviceId: b.service?._id,
          serviceName: b.service?.name || "Unknown Service",
          providerName: b.service?.providers?.name || "Unknown Provider",
          status: b.status || "Pending",
          paymentStatus: b.paymentStatus || "Pending",
          eventDate: b.eventDate || null,
          guests: b.avgGuestsCount || 0,
          venue: b.venue || "N/A",
          totalAmount: b.totalAmount || 0,
        })));
      } catch (err) { console.error("Error fetching bookings:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  const handleDemoPayment = async (bookingId) => {
    if (!window.confirm("This will simulate a payment. Proceed?")) return;
    setPayingId(bookingId);
    try {
      const res = await axios.post("https://anand-u.vercel.app/booking/demo-payment", { bookingId }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        alert("Payment successful!");
        setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, paymentStatus: "Paid", status: "Completed" } : b));
      } else { alert(res.data.msg || "Payment failed."); }
    } catch (err) { console.error("Payment error:", err); alert("Payment processing failed."); }
    finally { setPayingId(null); }
  };

  const { actionRequired, upcoming, past } = useMemo(() => {
    const sections = { actionRequired: [], upcoming: [], past: [] };
    bookings.forEach(b => {
      const status = b.status.toLowerCase();
      const paymentStatus = b.paymentStatus.toLowerCase();

      if (status === 'completed' || status === 'cancelled') {
        sections.past.push(b);
      } else if (status.includes('pending') || (status === 'confirmed' && paymentStatus === 'pending')) {
        sections.actionRequired.push(b);
      } else {
        sections.upcoming.push(b);
      }
    });
    return sections;
  }, [bookings]);

  if (loading) return <BookingsSkeleton />;

  // ✨ --- COMPLETELY REDESIGNED CARD COMPONENT --- ✨
  const renderBookingCard = (b) => {
    const hasActions =
      (b.status.toLowerCase() === "confirmed" && b.paymentStatus.toLowerCase() !== "paid") ||
      (b.status.toLowerCase() === "completed" && b.paymentStatus.toLowerCase() === "paid" && b.serviceId);

    let bookingStatusText = b.status;
    let bookingStatusClass = b.status.toLowerCase();
    if (b.status.toLowerCase().includes('pending')) {
      bookingStatusText = 'Pending Confirmation';
      bookingStatusClass = 'pending-confirmation';
    }

    let paymentStatusText = b.paymentStatus;
    let paymentStatusClass = `payment-${b.paymentStatus.toLowerCase()}`;
    if (b.status.toLowerCase() === 'cancelled') {
      paymentStatusText = 'Not Required';
      paymentStatusClass = 'payment-not-required';
    }

    return (
      <div key={b.bookingId} className="ubp-booking-card">
        <div className="ubp-card-header">
          <h3 onClick={() => navigate(`/service/${b.serviceId}`)}>{b.serviceName}</h3>
          <div className="ubp-provider-info">
            <UserCheck size={14} />
            <span>{b.providerName}</span>
          </div>
        </div>

        <div className="ubp-card-content">
          <div className="ubp-card-details">
            <div className="ubp-detail-item"><Calendar size={16} /><strong>Date:</strong> <span>{b.eventDate ? new Date(b.eventDate).toLocaleDateString() : "N/A"}</span></div>
            <div className="ubp-detail-item"><Users size={16} /><strong>Guests:</strong> <span>{b.guests}</span></div>
            <div className="ubp-detail-item"><MapPin size={16} /><strong>Venue:</strong> <span>{b.venue}</span></div>
            <div className="ubp-detail-item"><CreditCard size={16} /><strong>Total:</strong> <span>₹{b.totalAmount.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div className="ubp-card-footer">
          <div className="ubp-status-group">
            <div className="ubp-status-item">
              <span>Booking:</span>
              <span className={`ubp-status-badge ${bookingStatusClass}`}>{bookingStatusText}</span>
            </div>
            <div className="ubp-status-item">
              <span>Payment:</span>
              <span className={`ubp-status-badge ${paymentStatusClass}`}>{paymentStatusText}</span>
            </div>
          </div>
          {hasActions && (
            <div className="ubp-card-actions">
              {b.status.toLowerCase() === "confirmed" && b.paymentStatus.toLowerCase() !== "paid" && (
                <button onClick={() => handleDemoPayment(b.bookingId)} disabled={payingId === b.bookingId} className="ubp-button pay">
                  {payingId === b.bookingId ? "Processing..." : "Proceed to Pay"}
                </button>
              )}
              {b.status.toLowerCase() === "completed" && b.paymentStatus.toLowerCase() === "paid" && b.serviceId && (
                <button onClick={() => navigate(`/service/${b.serviceId}`)} className="ubp-button rate">
                  Rate Service
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ubp-page">
      <div className="ubp-container">
        <div className="ubp-header"><h1>Your Bookings</h1></div>
        {bookings.length === 0 ? (
          <div className="ubp-empty-state">
            <h2>No Bookings Found</h2>
            <p>You haven't made any bookings yet.</p>
          </div>
        ) : (
          <>
            {actionRequired.length > 0 && (
              <div className="ubp-section">
                <h2 className="ubp-section-title">Action Required</h2>
                <div className="ubp-bookings-grid">{actionRequired.map(renderBookingCard)}</div>
              </div>
            )}
            {upcoming.length > 0 && (
              <div className="ubp-section">
                <h2 className="ubp-section-title">Upcoming Bookings</h2>
                <div className="ubp-bookings-grid">{upcoming.map(renderBookingCard)}</div>
              </div>
            )}
            {past.length > 0 && (
              <div className="ubp-section">
                <h2 className="ubp-section-title">Past Bookings</h2>
                <div className="ubp-bookings-grid">{past.map(renderBookingCard)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}