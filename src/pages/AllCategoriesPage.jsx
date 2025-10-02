// src/pages/AllCategoriesPage.js

import { Link } from 'react-router-dom';
import { allCategories } from '../data/categoriesData';
import "../css/CategoryStyles.css";

export default function AllCategoriesPage() {
    return (
        <section className="categories">
            <h3 className="section-title">All Categories</h3>
            <div className="category-grid">
                {allCategories.map(cat => (
                    <Link
                        to="/services"
                        state={{ preSelectedCategoryId: cat.id }}
                        key={cat.id}
                        className="category-card"
                    >
                        <img src={cat.image} className="card-background-image" alt={cat.name} />
                        <div className="category-card-overlay">
                            <p className="card-title">{cat.name}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}