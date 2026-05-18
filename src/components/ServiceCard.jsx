// src/components/ServiceCard.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useUser } from "../context/UserContext";
import { allCategories } from "../data/categoriesData";
import "../css/ServiceCard.css";

const categoryImageMap = allCategories.reduce((map, category) => {
  map[category.name.toLowerCase()] = category.image;
  return map;
}, {});

export default function ServiceCard({ service }) {
  const { favourites, toggleFavourite } = useUser();
  const isFavorited = favourites.includes(service._id);

  // --- ✨ Helper: Safely Extract URL from Data ---
  const getSafeUrl = (imgData) => {
    if (!imgData) return null;

    // 1. If it's a simple string URL
    if (typeof imgData === "string") return imgData;

    // 2. If it's a Cloudinary object (based on your JSON)
    if (imgData.url && typeof imgData.url === "string") return imgData.url;

    // 3. If it's the corrupted data {"0":"h", ...}, return null so fallback happens
    return null;
  };

  // --- Image Logic Variables ---
  const primaryImageRaw = service.images?.[0];
  const primaryImage = getSafeUrl(primaryImageRaw); // ✨ Use the helper

  const categoryImage = service.categories?.name
    ? categoryImageMap[service.categories.name.toLowerCase()]
    : null;

  // Function to determine where to START
  const getInitialImage = () => {
    if (primaryImage) return primaryImage;
    if (categoryImage) return categoryImage;
    return null;
  };

  const [currentImageSrc, setCurrentImageSrc] = useState(getInitialImage);

  // Reset state if the service object changes
  useEffect(() => {
    setCurrentImageSrc(getInitialImage());
  }, [service._id, primaryImage]);

  // --- Error Handler ---
  const handleImageError = () => {
    if (currentImageSrc === primaryImage) {
      // If Primary fails, try Category
      if (categoryImage) {
        setCurrentImageSrc(categoryImage);
      } else {
        setCurrentImageSrc(null); // Go to Gradient
      }
    }
    else if (currentImageSrc === categoryImage) {
      // If Category fails, go to Gradient
      setCurrentImageSrc(null);
    }
  };

  // --- Standard Helpers ---
  const serviceName = service.name || "Service Name";
  const serviceCategory = service.categories?.name || "General";
  const priceAmount = service.priceInfo?.amount;
  const priceUnit = service.priceInfo?.unit || "package";
  const MAX_DISPLAY_PRICE = 100000000;
  const rating = service.avgRating > 0 ? service.avgRating.toFixed(1) : "--";

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(service._id);
  };

  return (
    <Link to={`/service/${service._id}`} className="service-card-link">
      <div className="service-card">
        <div className="card-image-container">

          {currentImageSrc ? (
            <img
              src={currentImageSrc}
              className="card-image"
              alt={serviceName}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="card-image-fallback-gradient"></div>
          )}

          <div className="service-rating-tag">
            <Star size={14} fill="currentColor" /> {rating}
          </div>

          <button
            className={`wishlist-btn ${isFavorited ? "active" : ""}`}
            onClick={handleFavoriteClick}
            aria-label="Toggle Favorite"
          >
            <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="card-info-container">
          <div className="info-header">
            <span className="service-category-tag">{serviceCategory}</span>
            <h4 className="service-name">{serviceName}</h4>
          </div>

          <div className="card-footer">
            <p className="service-price">
              {typeof priceAmount === "number" && priceAmount < MAX_DISPLAY_PRICE
                ? `₹${new Intl.NumberFormat("en-IN").format(priceAmount)}`
                : "Contact for Price"}
              {typeof priceAmount === "number" && priceAmount < MAX_DISPLAY_PRICE && (
                <span> / {priceUnit}</span>
              )}
            </p>
            <button className="booking-btn">Book Now</button>
          </div>
        </div>
      </div>
    </Link>
  );
}