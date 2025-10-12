import React, { useEffect, useState } from "react";
import {
  providerFetchNewBookings,
  providerFetchUpcomingBookings,
  providerFetchCompletedBookings,
  providerRespondBooking,
} from "../utils/providerAuthApi";

export default function ProviderBookingsPage() {
  const [activeTab, setActiveTab] = useState("new"); // "new" | "upcoming" | "completed"
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFn =
    activeTab === "upcoming"
      ? providerFetchUpcomingBookings
      : activeTab === "completed"
      ? providerFetchCompletedBookings
      : providerFetchNewBookings;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetchFn();
      if (!res.success) throw new Error(res.msg || "Failed to fetch bookings");
      console.log(`[${activeTab} bookings response]`, res);

      const bookingData =
        res.newBookings || res.upComingBookings || res.completedBookings || [];
      setBookings(bookingData);
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      alert("Error fetching bookings");
      setBookings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const handleResponse = async (bookingId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) return;

    try {
      const res = await providerRespondBooking(bookingId, action);
      if (res.success) {
        alert(res.msg);
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        alert(res.msg || "Action failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error responding to booking");
    }
  };


  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ textTransform: "capitalize" }}>Bookings</h2>

      {/* --- Tabs --- */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {["new", "upcoming", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.5rem 1rem",
              background: activeTab === tab ? "#FF9B33" : "#1e293b",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Loading {activeTab} bookings...</div>
      ) : bookings.length === 0 ? (
        <div>No {activeTab} bookings.</div>
      ) : (
        <div className="service-grid">
          {bookings.map((b) => {
            const service = b.service || {};
            return (
              <div key={b._id} className="service-card-wrapper">
                <h3>{service.name || "Unknown Service"}</h3>
                <p><strong>Price:</strong> ₹{service.priceInfo?.amount || 0}</p>
                <p><strong>Date:</strong> {b.eventDate ? new Date(b.eventDate).toLocaleDateString() : "N/A"}</p>
                <p><strong>Guests:</strong> {b.avgGuestsCount || 0}</p>
                <p><strong>Venue:</strong> {b.venue || "N/A"}</p>
                <p><strong>Status:</strong> {b.status || "Pending"}</p>
                <p><strong>Payment:</strong> {b.paymentStatus || "Pending"}</p>

                {activeTab === "new" && b.status && b.status.toLowerCase().includes("pending") && (
  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
    <button
      onClick={() => handleResponse(b._id, "accept")}
      style={{ background: "#22c55e", color: "#fff", padding: "0.5rem 1rem" }}
    >
      Accept
    </button>
    <button
      onClick={() => handleResponse(b._id, "reject")}
      style={{ background: "#ef4444", color: "#fff", padding: "0.5rem 1rem" }}
    >
      Reject
    </button>
  </div>
)}


              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
