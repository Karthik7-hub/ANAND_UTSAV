import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/BookServicePage.css";
import { useUser } from "../context/UserContext";

export default function BookServicePage() {
  const { id } = useParams(); // service id
  const navigate = useNavigate();
  const { user, token } = useUser();

  const [date, setDate] = useState("");
  const [minp, setMinp] = useState("");
  const [maxp, setMaxp] = useState("");
  const [venue, setVenue] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);

  React.useEffect(() => {
    // fetch service info to display basic details
    const fetchService = async () => {
      try {
        const res = await axios.get("https://anand-u.vercel.app/provider/allservices");
        const all = Array.isArray(res.data) ? res.data : [];
        const selected = all.find((s) => s._id === id);
        setService(selected);
      } catch (err) {
        console.error("Service fetch failed:", err);
      }
    };
    fetchService();
  }, [id]);

  const handleCheckAvailability = async () => {
  if (!date || !minp || !maxp) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    setLoading(true);
    const res = await axios.post("https://anand-u.vercel.app/booking/availabilty", {
      minp: Number(minp),
      maxp: Number(maxp),
      date,
      serviceId: id,
    });

    if (res.data.success) {
      alert("✅ Service available! Proceeding to booking...");
      setStep(2);
    } else {
      alert(res.data.msg || "Service unavailable.");
    }
  } catch (err) {
    console.error(err);
    alert("Error checking availability.");
  } finally {
    setLoading(false);
  }
};


  const handleConfirmBooking = async () => {
    if (!venue) {
      alert("Please enter the venue address.");
      return;
    }

    try {
      setLoading(true);
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
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

      if (res.data.success) {
        alert("🎉 Booking successful! Await provider confirmation.");
        navigate(`/service/${id}`);
      } else {
        alert(res.data.msg || "Booking failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-page">
      <h1>Book Service</h1>
      {service && (
        <div className="service-summary">
          <h2>{service.name}</h2>
          <p>{service.description}</p>
          <p className="price">
            ₹{service.priceInfo?.amount || 0}{" "}
            {service.priceInfo?.unit && `/ ${service.priceInfo.unit}`}
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="availability-form">
          <h3>Check Availability</h3>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input
            type="number"
            placeholder="Min guests"
            value={minp}
            onChange={(e) => setMinp(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max guests"
            value={maxp}
            onChange={(e) => setMaxp(e.target.value)}
          />
          <button onClick={handleCheckAvailability} disabled={loading}>
            {loading ? "Checking..." : "Check Availability"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="booking-form">
          <h3>Confirm Booking Details</h3>
          <input
            type="text"
            placeholder="Venue address"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          />
          <textarea
            placeholder="Special requests (optional)"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          />
          <button onClick={handleConfirmBooking} disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}
