import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import ServiceCard from "../components/ServiceCard";
import { Heart, Lock, LogIn, ArrowRight } from "lucide-react";
import "../css/Favourites.css";
import { fetchAllServices } from "../api";

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavouriteServices = async () => {
      if (!token || favourites.length === 0) {
        setFavouriteServices([]);
        return;
      }

      try {
        const data = await fetchAllServices();
        if (Array.isArray(data)) {
          const favServices = data.filter((s) =>
            favourites.includes(s._id)
          );
          setFavouriteServices(favServices);
        }
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
      <div className="favourites-page">
        <div className="favourites-header">
          <h2>My Favourites</h2>
        </div>
        <div className="favourites-empty-container">
          <div className="favourites-prompt-card">
            <div className="favourites-prompt-icon-wrapper">
              <Lock size={36} />
            </div>
            <h3 className="favourites-prompt-title">Please Log In to View Favourites</h3>
            <p className="favourites-prompt-text">
              You must be logged in to view your saved caterers, decorators, venues, and DJs. Sign in to your account to start managing your dream event!
            </p>
            <button className="favourites-prompt-btn" onClick={() => navigate("/login")}>
              <span>Log In or Register</span>
              <LogIn size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favourites-page">
      <div className="favourites-header">
        <h2>My Favourites</h2>
      </div>

      {favouriteServices.length === 0 ? (
        <div className="favourites-empty-container">
          <div className="favourites-prompt-card">
            <div className="favourites-prompt-icon-wrapper">
              <Heart size={36} />
            </div>
            <h3 className="favourites-prompt-title">No Favourites Yet</h3>
            <p className="favourites-prompt-text">
              Explore top-rated services, DJs, decorators, caterers, and photographers, and tap the heart icon to start curating your dream event!
            </p>
            <button className="favourites-prompt-btn" onClick={() => navigate("/")}>
              <span>Discover Services</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
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
