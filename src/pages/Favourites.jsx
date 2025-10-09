// src/pages/Favourites.jsx

import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import ServiceCard from "../components/ServiceCard";
import "../css/Favourites.css";
import axios from "axios";

// ✨ CORRECTED SKELETON LOADER
// This now matches the structure styled in your ServiceCard.css file,
// so the shimmer animation and dark mode colors will work correctly.
const ServiceCardSkeleton = () => (
  <div className="service-card-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-line small"></div>
      <div className="skeleton-line title"></div>
      <div className="skeleton-line price"></div>
    </div>
  </div>
);

export default function Favourites() {
  const { user, favourites, token } = useUser();
  const [favouriteServices, setFavouriteServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favourites.length > 0 && token) {
      const fetchFavouriteServices = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            "https://anand-u.vercel.app/provider/allservices",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const allServices = res.data;
          const favServices = allServices.filter((s) =>
            favourites.includes(s._id)
          );
          setFavouriteServices(favServices);
        } catch (err) {
          console.error("Failed to fetch favourite services:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchFavouriteServices();
    } else {
      setFavouriteServices([]);
      setLoading(false);
    }
  }, [favourites, token]);

  if (!user) {
    return <p className="favourites-message">Please log in to see your favourites.</p>;
  }

  return (
    <div className="favourites-page">
      <div className="favourites-header">
        <h2>My Favourites</h2>
      </div>

      {loading ? (
        <div className="service-grid">
          {[...Array(favourites.length || 4)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : favouriteServices.length === 0 ? (
        <p className="favourites-message">You have no favourites yet.</p>
      ) : (
        <div className="service-grid">
          {favouriteServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}