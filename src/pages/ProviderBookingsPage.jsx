import React, { useEffect, useState } from "react";
import axios from "axios";
import { providerFetchNewBookings, providerRespondBooking } from "../utils/providerAuthApi";

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // 1️⃣ Fetch new booking IDs
      const resIds = await providerFetchNewBookings();
      if (!resIds.success) throw new Error(resIds.msg || "Failed to get booking IDs");
      const bookingIds = resIds.newBookings;

      // 2️⃣ Fetch all bookings
      const resAllBookings = await axios.get("https://anand-u.vercel.app/booking/getBookings");
      const allBookings = Array.isArray(resAllBookings.data.bookings)
        ? resAllBookings.data.bookings
        : [];

      // 3️⃣ Filter only bookings we need
      const filteredBookings = allBookings.filter((b) => bookingIds.includes(b._id));

      // 4️⃣ Fetch all services
      const resServices = await axios.get("https://anand-u.vercel.app/provider/allservices");
      const allServices = Array.isArray(resServices.data) ? resServices.data : [];

      // 5️⃣ Enrich bookings with service info
      const enrichedBookings = filteredBookings.map((b) => {
        const service = allServices.find((s) => s._id === b.service) || {};
        return {
          bookingId: b._id,
          serviceName: service.name || "Unknown Service",
          serviceCategory: service.categories?.name || "Unknown Category",
          price: service.priceInfo?.amount || 0,
          date: b.eventDate,
          guests: b.avgGuestsCount || 0,
          venue: b.venue || "N/A",
          status: b.status || "Pending",
          paymentStatus: b.paymentStatus || "Pending",
        };
      });

      setBookings(enrichedBookings);
    } catch (err) {
      console.error(err);
      alert("Error fetching bookings");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleResponse = async (bookingId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) return;
    try {
      const res = await providerRespondBooking(bookingId, action);
      if (res.success) {
        alert(res.msg);
        setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
      } else {
        alert(res.msg || "Action failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error responding to booking");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (bookings.length === 0) return <div>No new bookings.</div>;

  return (
    <div>
      <h2>Bookings</h2>
      <div className="service-grid">
        {bookings.map((b) => (
          <div key={b.bookingId} className="service-card-wrapper">
            <h3>{b.serviceName}</h3>
            <p><strong>Booking ID:</strong> {b.bookingId}</p>
            <p><strong>Category:</strong> {b.serviceCategory}</p>
            <p><strong>Price:</strong> ₹{b.price}</p>
            <p><strong>Date:</strong> {new Date(b.date).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> {b.guests}</p>
            <p><strong>Venue:</strong> {b.venue}</p>
            <p><strong>Status:</strong> {b.status}</p>
            <p><strong>Payment:</strong> {b.paymentStatus}</p>

            {/* Show Accept/Reject only for pending bookings */}
            {b.status.toLowerCase().includes("pending") && (
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  onClick={() => handleResponse(b.bookingId, "accept")}
                  style={{ background: "#22c55e", color: "#fff", padding: "0.5rem 1rem" }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(b.bookingId, "reject")}
                  style={{ background: "#ef4444", color: "#fff", padding: "0.5rem 1rem" }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
