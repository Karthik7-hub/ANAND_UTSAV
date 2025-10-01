import { Link } from 'react-router-dom';
import { allCategories } from '../data/categoriesData.js';// Import from central data file
import "../css/CategoryStyles.css"; // Use the shared CSS file

// We'll show the first 5 categories on the homepage.
const previewCategories = allCategories.slice(0, 5);

export default function CategorySection() {
    return (
        <section className="categories">
            <h3 className="section-title">Shop by Category</h3>
            <div className="category-grid">
                {previewCategories.map(cat => (
                    <Link to={`/category/${cat.id}`} key={cat.id} className="category-card">
                        <img src={cat.image} className="card-background-image" alt={cat.name} />
                        <div className="category-card-overlay">
                            <p className="card-title">{cat.name}</p>
                        </div>
                    </Link>
                ))}

                {/* ✨ NEW: The card that links to the full category page */}
                <Link to="/categories" className="category-card more-categories-card">
                    <span className="arrow-icon">→</span>
                    <span>More Categories</span>
                </Link>
            </div>
        </section>
    );
}