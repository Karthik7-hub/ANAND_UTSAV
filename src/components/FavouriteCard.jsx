import React from "react";
import { Heart, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom"; // <- import Link
import { useUser } from "../context/UserContext";
import "../css/Favourites.css";

export default function FavouriteCard({ service }) {
  const { toggleFavourite, user } = useUser();
  const isFavourite = user?.favourites.includes(service.id);

  return (
    <div className="fullwidth-card">
      {/* Wrap card image and content in Link */}
      <Link to={`/service/${service.id}`} className="fullwidth-image-link">
        <div className="fullwidth-image">
          <img src={service.images[0]} alt={service.name} />
        </div>
      </Link>

      <div className="fullwidth-content">
        <div>
          <h4>{service.name}</h4>
          <p>{service.priceInfo}</p>
        </div>
        <div className="fullwidth-actions">
          <button onClick={() => toggleFavourite(service.id)}>
            <Heart color={isFavourite ? "red" : "black"} />
          </button>
          <button className="book-now">
            <CalendarCheck />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

