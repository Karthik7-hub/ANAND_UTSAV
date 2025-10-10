import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';
import { LayoutGrid, List, Search, ChevronDown } from 'lucide-react';
import "../css/AllServicesPage.css"; // same styling

export default function CategoryServicesPage() {
    const { slug } = useParams(); // slug from URL
    const [category, setCategory] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [viewMode, setViewMode] = useState('grid');
    const [price, setPrice] = useState(0);
const [maxPrice, setMaxPrice] = useState(0);

    const [selectedRating, setSelectedRating] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOpen, setSortOpen] = useState(false);
    const [sortOption, setSortOption] = useState('Popularity');

    const sortOptions = ['Popularity', 'Rating', 'Price: Low to High', 'Price: High to Low'];

    useEffect(() => {
    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`https://anand-u.vercel.app/category/services/${slug}`);
            console.log("Fetched services:", res.data); // debug

            setServices(res.data);

            // Set max price dynamically
            if (res.data.length > 0) {
                const highest = Math.max(...res.data.map(s => s.priceInfo?.amount || 0));
                setMaxPrice(highest);
                setPrice(highest); // initially show all services
            }

            setCategory({ name: slug.replace(/-/g, ' ') });
        } catch (err) {
            console.error(err);
            setError("Failed to load category services.");
        } finally {
            setLoading(false);
        }
    };

    fetchServices();
}, [slug]);

    const clearFilters = () => {
        setPrice(maxPrice);
    setSelectedRating(null);
    setSearchQuery("");
};


    let filteredServices = [...services];

if (services.length > 0) {
    filteredServices = filteredServices
        .filter(s => !price || (s.priceInfo?.amount <= price))
        .filter(s => !selectedRating || (s.avgRating >= selectedRating))
        .filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
}




if (sortOption === 'Rating') {
    filteredServices.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
} else if (sortOption === 'Price: Low to High') {
    filteredServices.sort((a, b) => (a.priceInfo?.amount || 0) - (b.priceInfo?.amount || 0));
} else if (sortOption === 'Price: High to Low') {
    filteredServices.sort((a, b) => (b.priceInfo?.amount || 0) - (a.priceInfo?.amount || 0));
}


    if (loading) return <p className="loading">Loading services...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="services-page-container">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
                <h3>Filters</h3>

                <details className="filter-group" open>
                    <summary>Price Range <ChevronDown size={16} /></summary>
                    <div className="price-slider-container">
                        <div className="price-value">Up to ₹{Number(price).toLocaleString('en-IN')}</div>
                        <input
                            type="range" min="0" max={maxPrice || 100000} step={Math.max(Math.round(maxPrice / 20), 1)}
                            value={price} onChange={(e) => setPrice(Number(e.target.value))}
                            className="price-slider"
                        />
                    </div>
                </details>

                <details className="filter-group" open>
                    <summary>Rating <ChevronDown size={16} /></summary>
                    <div className="rating-options">
                        {[4.5, 4.0, 3.5].map(r => (
                            <button
                                key={r}
                                className={`rating-pill ${selectedRating === r ? 'active' : ''}`}
                                onClick={() => setSelectedRating(r)}
                            >
                                {r} ★ & up
                            </button>
                        ))}
                    </div>
                </details>

                <button className="clear-filters-btn" onClick={clearFilters}>Clear All</button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="page-header">
                    <div className="header-left">
                        <h1>{category ? category.name : "Category"}</h1>
                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="custom-dropdown">
                            <button className={`dropdown-toggle ${sortOpen ? 'active' : ''}`} onClick={() => setSortOpen(!sortOpen)}>
                                <span>Sort by: <strong>{sortOption}</strong></span>
                                <ChevronDown size={16} className={`chevron-icon ${sortOpen ? 'open' : ''}`} />
                            </button>
                            {sortOpen && (
                                <ul className="dropdown-menu">
                                    {sortOptions.map(option => (
                                        <li
                                            key={option}
                                            className={sortOption === option ? 'active' : ''}
                                            onClick={() => { setSortOption(option); setSortOpen(false); }}
                                        >
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="view-toggle">
                            <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><LayoutGrid /></button>
                            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><List /></button>
                        </div>
                    </div>
                </header>

                {/* Services Display */}
                <div className={viewMode === 'grid' ? 'service-grid-view' : 'service-list-view'}>
                    {filteredServices.length > 0 ? (
                        filteredServices.map(service => <ServiceCard key={service._id} service={service} />)
                    ) : (
                        <p className="no-results">No services match your filters.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
