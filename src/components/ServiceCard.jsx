import React from 'react';
import { Heart, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allCategories } from '../data/categoriesData';
import { useUser } from '../context/UserContext';  // ✅ import user context

function getCategoryName(id) {
    const cat = allCategories.find(c => c.id === id);
    return cat ? cat.name : "Unknown";
}

export default function ServiceCard({ service }) {
    const { user, toggleFavourite } = useUser();  // ✅ get user + function from context
    const isFav = user?.favourites?.includes(service.id);

    return (
        <div className="service-card-wrapper">
            {/* keep link for main content but not for heart (prevent navigation when clicking heart) */}
            <Link to={`/service/${service.id}`} className="service-card-link">
                <div className="service-card">
                    <img src={service.images[0]} className="card-background-image" alt={service.name} />

                    <span className="service-category-tag">
                        {service.category || getCategoryName(service.categoryId)}
                    </span>

                    <div className="card-content-overlay">
                        <div className="card-top-section">
                            <h4 className="service-name">{service.name}</h4>

                            {/* ❤️ Toggle Button */}
                            <button
                                className="wishlist-btn"
                                aria-label="Shortlist Service"
                                onClick={(e) => {
                                    e.preventDefault(); // ✅ stop Link navigation when clicking heart
                                    toggleFavourite(service.id);
                                }}
                            >
                                <Heart
                                    size={18}
                                    fill={isFav ? "red" : "none"}  // filled if favourite
                                    color={isFav ? "red" : "currentColor"}
                                />
                            </button>
                        </div>

                        <div className="card-bottom-section">
                            <p className="service-price">{service.priceInfo}</p>
                            <button className="booking-btn">
                                <CalendarCheck size={16} />
                                <span>Book Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
