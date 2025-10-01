import React from "react";
import { Heart, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../css/Favourites.css";

export default function FavouriteSlide({ services }) {
  const { toggleFavourite, user } = useUser();

  return (
    <div className="slide-view">
      {services.map((service) => {
        const isFavourite = user?.favourites.includes(service.id);

        return (
          <div key={service.id} className="service-card">
            {/* Background Image */}
            <Link to={`/service/${service.id}`} className="service-card-link">
              <img
                src={service.images[0]}
                alt={service.name}
                className="card-background-image"
              />
            </Link>

            {/* White Overlay Box */}
            <div className="card-content-overlay">
              {/* --- Top row: Name + Heart --- */}
              <div className="card-top-section">
                <h4 className="service-name">{service.name}</h4>
                <button
                  className={`wishlist-btn ${isFavourite ? "active" : ""}`}
                  onClick={() => toggleFavourite(service.id)}
                  aria-label="Toggle Favourite"
                >
                  <Heart
                    fill={isFavourite ? "red" : "none"}
                    color={isFavourite ? "red" : "#ff671f"}
                    size={18}
                  />
                </button>
              </div>

              {/* --- Price under name --- */}
              <p className="service-price">{service.priceInfo}</p>

              {/* --- Bottom row: Book Now --- */}
              <div className="card-bottom-section">
                <button className="booking-btn">
                  <CalendarCheck size={18} />
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
