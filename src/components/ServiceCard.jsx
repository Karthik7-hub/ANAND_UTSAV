// src/components/ServiceCard.jsx

import React, { useState, useEffect } from "react"; // ✨ Import useState and useEffect
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

  // --- Image Fallback Logic ---
  const primaryImage = service.images?.[0];
  const categoryImage = service.categories?.name ? categoryImageMap[service.categories.name.toLowerCase()] : null;

  // ✨ 1. Create a state to hold the current image source
  const [currentImageSrc, setCurrentImageSrc] = useState(primaryImage);

  // This effect resets the image when the service prop changes
  useEffect(() => {
    setCurrentImageSrc(service.images?.[0]);
  }, [service.images]);

  // ✨ 2. Create an error handler to switch to the next fallback
  const handleImageError = () => {
    // If the primary image failed, try the category image
    if (currentImageSrc === primaryImage) {
      setCurrentImageSrc(categoryImage);
    }
    // If the category image also failed, set the source to null to trigger the gradient
    else {
      setCurrentImageSrc(null);
    }
  };

  // --- Other helper variables ---
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
          {/* ✨ 3. Render based on the state */}
          {currentImageSrc ? (
            <img
              src={currentImageSrc}
              className="card-image"
              alt={serviceName}
              onError={handleImageError} // This is the crucial part
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