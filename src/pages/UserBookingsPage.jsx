import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function UserBookingsPage() {
  const { token } = useUser();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null); // currently processing payment

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get user details
        const userRes = await axios.get("https://anand-u.vercel.app/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // 2️⃣ Get user bookings
        const bookingsRes = await axios.get(
          "https://anand-u.vercel.app/booking/getUserBookings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("🔹 Full response:", bookingsRes.data);

        const bookingsData = bookingsRes.data.bookings.map((b) => ({
          bookingId: b._id,
          serviceId: b.service?._id, 
          serviceName: b.service?.name || "Unknown Service",
          serviceDescription: b.service?.description || "",
          servicePrice: b.service?.priceInfo?.amount || 0,
          servicePriceUnit: b.service?.priceInfo?.unit || "N/A",
          status: b.status || "Pending",
          paymentStatus: b.paymentStatus || "Pending",
          eventDate: b.eventDate || null,
          guests: b.avgGuestsCount || 0,
          venue: b.venue || "N/A",
          totalAmount: b.totalAmount || 0,
        }));

        setBookings(bookingsData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        alert("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Handle demo payment
  const handleDemoPayment = async (bookingId) => {
    if (!window.confirm("Proceed with payment?")) return;

    try {
      setPayingId(bookingId);
      const res = await axios.post(
        "https://anand-u.vercel.app/booking/demo-payment",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert(res.data.msg);
        // Update booking state locally
        setBookings((prev) =>
          prev.map((b) =>
            b.bookingId === bookingId
              ? { ...b, paymentStatus: "Paid", status: "Completed" }
              : b
          )
        );
      } else {
        alert(res.data.msg || "Payment failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed.");
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading your bookings...</div>;
  if (bookings.length === 0)
    return <div style={{ padding: "2rem" }}>You have no bookings yet.</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Bookings</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
        {bookings.map((b) => (
          <div
            key={b.bookingId}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p><strong>Service:</strong> {b.serviceName}</p>
              <p><strong>Date:</strong> {b.eventDate ? new Date(b.eventDate).toDateString() : "N/A"}</p>
              <p><strong>Guests:</strong> {b.guests}</p>
              <p><strong>Venue:</strong> {b.venue}</p>
              <p><strong>Total:</strong> ₹{b.totalAmount}</p>
              <p><strong>Status:</strong> {b.status}</p>
              <p><strong>Payment:</strong> {b.paymentStatus}</p>
            </div>
            <div>
              {b.status === "Confirmed" && b.paymentStatus !== "Paid" && (
                <button
                  onClick={() => handleDemoPayment(b.bookingId)}
                  disabled={payingId === b.bookingId}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#22c55e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {payingId === b.bookingId ? "Processing..." : "Pay Now"}
                </button>
              )}
              {b.paymentStatus === "Paid" && (
                <span style={{ color: "#22c55e", fontWeight: "bold" }}>Paid ✅</span>
              )}
              {/* ✅ Show Rate Service only if booking is completed and paid */}
  {["completed", "confirmed"].includes(b.status?.toLowerCase()) && b.paymentStatus === "Paid" && b.serviceId && (
  <button
    onClick={() => navigate(`/service/${b.serviceId}`)}
    style={{
      padding: "0.5rem 1rem",
      backgroundColor: "#FF9B33",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Rate Service
  </button>
)}


            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
