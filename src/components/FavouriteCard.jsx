import React from "react";
import { Heart, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../css/Favourites.css";

export default function FavouriteCard({ service }) {
  const { toggleFavourite, user } = useUser();
  const isFavourite = user?.favourites.includes(service.id);

  return (
    <div className="fullwidth-card">
      {/* Image */}
      <Link to={`/service/${service.id}`} className="fullwidth-image-link">
        <div className="fullwidth-image">
          <img src={service.images[0]} alt={service.name} />
        </div>
      </Link>

      {/* Overlay */}
      <div className="fullwidth-overlay">
        {/* Left: name + price */}
        <div className="overlay-left">
          <h4 className="service-name">{service.name}</h4>
          <p className="service-price">{service.priceInfo}</p>
        </div>

        {/* Right: heart + book now */}
        <div className="overlay-right">
          <button
            className="wishlist-btn"
            onClick={() => toggleFavourite(service.id)}
          >
            <Heart
              fill={isFavourite ? "red" : "none"}
              color={isFavourite ? "red" : "#ff671f"}
              size={18}
            />
          </button>


          <button className="booking-btn">
            <CalendarCheck size={18} />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
