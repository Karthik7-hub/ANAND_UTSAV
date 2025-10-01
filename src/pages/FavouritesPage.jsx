import React, { useState } from "react";
import { allServices } from "../data/servicesData";
import { useUser } from "../context/UserContext";
import FavouriteSlide from "../components/FavouriteSlide";
import FavouriteCard from "../components/FavouriteCard";
import { LayoutGrid, LayoutList } from "lucide-react";
import "../css/Favourites.css";

export default function Favourites() {
  const { user } = useUser();
  const [viewMode, setViewMode] = useState("slide"); // "slide" or "card"

  if (!user) return <p>Please login to see your favourites.</p>;

  const favouriteServices = allServices.filter(service =>
    user.favourites?.includes(service.id)
  );

  return (
    <div className="favourites-page">
      <div className="favourites-header">
        <h2>My Favourites</h2>
        <div className="view-toggle">
          <button
            className={viewMode === "slide" ? "active" : ""}
            onClick={() => setViewMode("slide")}
            aria-label="Slide View"
          >
            <LayoutGrid size={24} />
          </button>
          <button
            className={viewMode === "card" ? "active" : ""}
            onClick={() => setViewMode("card")}
            aria-label="Card View"
          >
            <LayoutList size={24} />
          </button>
        </div>
      </div>

      {favouriteServices.length === 0 ? (
        <p>You have no favourites yet.</p>
      ) : viewMode === "slide" ? (
        <FavouriteSlide services={favouriteServices} />
      ) : (
        <div className="favourite-cards-grid">
          {favouriteServices.map(service => (
            <FavouriteCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
