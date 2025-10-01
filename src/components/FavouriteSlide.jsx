import React from "react";
import { Heart, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom"; // <- import Link
import { useUser } from "../context/UserContext";
import "../css/Favourites.css";

export default function FavouriteSlide({ services }) {
  const { toggleFavourite, user } = useUser();

  return (
    <div className="slide-container">
      {services.map(service => {
        const isFavourite = user?.favourites.includes(service.id);
        return (
          <div key={service.id} className="slide-card">
            {/* Wrap image in Link */}
            <Link to={`/service/${service.id}`} className="slide-image-link">
              <img src={service.images[0]} alt={service.name} />
            </Link>

            <div className="slide-content">
              <h4>{service.name}</h4>
              <p>{service.priceInfo}</p>
              <div className="slide-actions">
                <button
                  onClick={() => toggleFavourite(service.id)}
                  aria-label="Toggle Favourite"
                >
                  <Heart color={isFavourite ? "red" : "white"} />
                </button>
                <button>
                  <CalendarCheck />
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

