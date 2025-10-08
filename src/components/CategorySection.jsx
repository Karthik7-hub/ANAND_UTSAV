import React from 'react';
import { Link } from 'react-router-dom';
import { allCategories } from '../data/categoriesData.js';
import "../css/CategoryStyles.css";

export default function CategorySection() {

    // This function is called if an image fails to load
    const handleImageError = (e) => {
        // Hide the broken image icon
        e.target.style.display = 'none';
        // Add a 'has-error' class to the parent wrapper to show a gradient
        e.target.parentElement.classList.add('has-error');
    };

    return (
        <section className="categories-section">
            <div className="carousel-wrapper">
                <div className="category-carousel">
                    {allCategories.map(cat => (
                        <Link to={`/category/${cat.id}`} key={cat.id} className="category-card">
                            <div className="category-image-wrapper">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="category-image"
                                    onError={handleImageError}
                                />
                            </div>
                            <p className="card-title">{cat.name}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}