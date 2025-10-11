import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import ServiceCard from "../components/ServiceCard";
import "../css/Favourites.css";
import axios from "axios";

// ✨ Skeleton loader (matches ServiceCard layout)
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
  const { user, favourites, token, loading } = useUser(); // ✅ using global loading
  const [favouriteServices, setFavouriteServices] = useState([]);

  useEffect(() => {
    const fetchFavouriteServices = async () => {
      if (!token || favourites.length === 0) {
        setFavouriteServices([]);
        return;
      }

      try {
        const res = await axios.get(
          "https://anand-u.vercel.app/provider/allservices",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const allServices = res.data;
        const favServices = allServices.filter((s) =>
          favourites.includes(s._id)
        );
        setFavouriteServices(favServices);
      } catch (err) {
        console.error("Failed to fetch favourite services:", err);
      }
    };

    fetchFavouriteServices();
  }, [favourites, token]);

  if (loading) {
    return (
      <div className="favourites-page">
        <div className="favourites-header">
          <h2>My Favourites</h2>
        </div>
        <div className="service-grid">
          {[...Array(favourites.length || 4)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="favourites-message">
        Please log in to see your favourites.
      </p>
    );
  }

  return (
    <div className="favourites-page">
      <div className="favourites-header">
        <h2>My Favourites</h2>
      </div>

      {favouriteServices.length === 0 ? (
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
