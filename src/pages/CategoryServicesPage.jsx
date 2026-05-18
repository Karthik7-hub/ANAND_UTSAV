import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchServicesByCategory } from '../api';
import ServiceCard from '../components/ServiceCard';
import { SlidersHorizontal, X, ChevronDown, Tag, Star } from 'lucide-react';
import '../css/CategoryServicesPage.css'; // Import the new CSS file

// --- Constants based on SearchResultsPage ---

const defaultPriceRange = { label: 'Any Price', min: 0, max: Infinity };

// Price options for the filter panel
const priceRanges = [
    defaultPriceRange,
    { label: 'Under ₹1,000', min: 0, max: 1000 },
    { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
    { label: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
    { label: '₹15,000 & Over', min: 15000, max: Infinity },
];

// Rating options for the filter panel
const ratingOptions = [4.5, 4.0, 3.5, 3.0];

// Sort options
const sortOptions = {
    'popularity': "Popularity", // Changed 'relevance' to 'popularity' for this context
    'price-asc': "Price: Low to High",
    'price-desc': "Price: High to Low",
    'rating-desc': "Rating"
};

export default function CategoryServicesPage() {
    const { slug } = useParams(); // slug from URL
    const [category, setCategory] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State from SearchResultsPage ---
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('popularity');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
    const sortDropdownRef = useRef(null);

    // Single state object for all active filters
    const [activeFilters, setActiveFilters] = useState({
        price: defaultPriceRange,
        rating: 0,
    });

    // State for filters *within* the slide-out panel, before applying
    const [tempFilters, setTempFilters] = useState(activeFilters);

    // --- Data Fetching Effect ---
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchServicesByCategory(slug);
                setServices(Array.isArray(data) ? data : []);

                // Set category name from slug
                setCategory({ name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) });

                // Reset filters on new category load
                setActiveFilters({ price: defaultPriceRange, rating: 0 });
                setTempFilters({ price: defaultPriceRange, rating: 0 });

            } catch (err) {
                console.error(err);
                setError("Failed to load category services.");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [slug]);

    // --- Derived State with useMemo for Performance ---
    const displayedServices = useMemo(() => {
        const { price, rating } = activeFilters;

        let processedServices = [...services]
            .filter(s => (s.priceInfo?.amount || 0) >= price.min && (s.priceInfo?.amount || 0) <= price.max)
            .filter(s => (s.avgRating || 0) >= rating);

        switch (sortBy) {
            case 'price-asc':
                processedServices.sort((a, b) => (a.priceInfo?.amount || Infinity) - (b.priceInfo?.amount || Infinity));
                break;
            case 'price-desc':
                processedServices.sort((a, b) => (b.priceInfo?.amount || -Infinity) - (a.priceInfo?.amount || Infinity));
                break;
            case 'rating-desc':
                processedServices.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
                break;
            default: // 'popularity' - use default API order
                break;
        }
        return processedServices;
    }, [services, activeFilters, sortBy]);


    // --- UI Interaction Effects ---

    // Open filter panel
    const openFilterPanel = () => {
        setTempFilters(activeFilters); // Sync temp filters with active ones
        setIsFilterOpen(true);
    };

    // Close filter panel
    const closeFilterPanel = () => {
        setIsFilterOpen(false);
    };

    // Apply filters from panel
    const applyFilters = () => {
        setActiveFilters(tempFilters);
        closeFilterPanel();
    };

    // Clear all filters
    const clearFilters = () => {
        const defaultFilters = { price: defaultPriceRange, rating: 0 };
        setTempFilters(defaultFilters); // Clear temp
        setActiveFilters(defaultFilters); // Clear active
        closeFilterPanel(); // Close panel after clearing
    };

    // Lock body scroll when filter panel is open
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = isFilterOpen ? 'hidden' : originalStyle;
        return () => { document.body.style.overflow = originalStyle; };
    }, [isFilterOpen]);

    // Close sort dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Add shadow to sticky header on scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsHeaderScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    // --- Event Handlers ---
    const handleRemoveFilter = (filterType) => {
        setActiveFilters(prev => {
            const newFilters = { ...prev };
            if (filterType === 'price') {
                newFilters.price = defaultPriceRange;
            } else if (filterType === 'rating') {
                newFilters.rating = 0;
            }
            setTempFilters(newFilters); // Keep temp in sync
            return newFilters;
        });
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        setIsSortOpen(false); // Close dropdown on selection
    };

    // --- Render Functions ---
    const renderFilterPills = () => (
        <>
            {activeFilters.price.label !== 'Any Price' && (
                <div className="csp-filter-pill">
                    <span>{activeFilters.price.label}</span>
                    <button onClick={() => handleRemoveFilter('price')} aria-label="Remove price filter"><X size={14} /></button>
                </div>
            )}
            {activeFilters.rating > 0 && (
                <div className="csp-filter-pill">
                    <span>{activeFilters.rating} ★ & up</span>
                    <button onClick={() => handleRemoveFilter('rating')} aria-label="Remove rating filter"><X size={14} /></button>
                </div>
            )}
        </>
    );

    // --- Main Render ---
    if (error) return <div className="csp-message-box" style={{ margin: '2rem auto' }}><h3>Error</h3><p>{error}</p></div>;

    return (
        <div className="csp-page">

            {/* --- Filter Panel (based on srp- CSS) --- */}
            <div className={`csp-filter-container ${isFilterOpen ? 'is-open' : ''}`}>
                <div className="csp-filter-backdrop" onClick={closeFilterPanel}></div>
                <div className="csp-filter-panel">
                    <div className="csp-filter-header">
                        <h3>Filters</h3>
                        <button className="csp-filter-close-btn" onClick={closeFilterPanel} aria-label="Close filters"><X size={24} /></button>
                    </div>
                    <div className="csp-filter-body">
                        {/* Price Filter */}
                        <div className="csp-filter-group">
                            <h4 className="csp-filter-title"><Tag size={16} /> Price Range</h4>
                            <div className="csp-price-options">
                                {priceRanges.map(range => (
                                    <button
                                        key={range.label}
                                        className={`csp-price-pill ${tempFilters.price.label === range.label ? 'active' : ''}`}
                                        onClick={() => setTempFilters(prev => ({ ...prev, price: range }))}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="csp-filter-group">
                            <h4 className="csp-filter-title"><Star size={16} /> Rating</h4>
                            <div className="csp-rating-options">
                                {ratingOptions.map(rating => (
                                    <button
                                        key={rating}
                                        className={`csp-rating-pill ${tempFilters.rating === rating ? 'active' : ''}`}
                                        onClick={() => setTempFilters(prev => ({ ...prev, rating: prev.rating === rating ? 0 : rating }))}
                                    >
                                        {rating} ★ & up
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="csp-filter-footer">
                        <button className="csp-clear-filters-btn" onClick={clearFilters}>Clear All</button>
                        <button className="csp-apply-btn" onClick={applyFilters}>Apply</button>
                    </div>
                </div>
            </div>

            {/* --- Page Header --- */}
            <header className="csp-header">
                <h1>{category ? category.name : "Services"}</h1>
            </header>

            {/* --- Sticky Controls Header --- */}
            <div className={`csp-sticky-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
                <div className="csp-controls">
                    <button className="csp-filter-toggle" onClick={openFilterPanel}>
                        <SlidersHorizontal size={18} /><span>Filters</span>
                    </button>

                    <div className={`csp-custom-dropdown ${isSortOpen ? 'is-open' : ''}`} ref={sortDropdownRef}>
                        <div className="csp-dropdown-toggle" onClick={() => setIsSortOpen(!isSortOpen)}>
                            <div className="csp-dropdown-label">
                                <span>Sort by</span>
                            </div>
                            <ChevronDown size={18} className="csp-dropdown-arrow" />
                        </div>
                        <ul className="csp-dropdown-menu">
                            {Object.entries(sortOptions).map(([value, label]) => (
                                <li key={value} className={sortBy === value ? 'active' : ''} onClick={() => handleSortChange(value)}>
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="csp-active-filters">
                    {renderFilterPills()}
                </div>
            </div>

            {/* --- Main Content --- */}
            <main className="csp-main-content">
                <section className="csp-section">
                    <h2 className="csp-section-title">All Services in {category ? category.name : "..."}</h2>
                    {loading ? (
                        <div className="csp-loader-container"><div className="csp-loader"></div></div>
                    ) : (
                        <div className="csp-grid">
                            {displayedServices.length > 0 ? (
                                displayedServices.map(service => <ServiceCard key={service._id} service={service} />)
                            ) : (
                                <div className="csp-message-box">
                                    <h3>No Services Match Your Filters</h3>
                                    <p>Try clearing your filters to see more results.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}