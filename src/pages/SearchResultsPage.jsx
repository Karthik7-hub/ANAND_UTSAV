import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

import { performSearch } from '../utils/searchApi';
import ServiceCard from '../components/ServiceCard';
import Filters from '../components/Filters';
import SearchCategoryCard from '../components/SearchCategoryCard';
import '../css/SearchResultsPage.css';

const defaultPriceRange = { label: 'Any Price', min: 0, max: Infinity };
const sortOptions = {
    relevance: "Relevance",
    'price-asc': "Price: Low to High",
    'price-desc': "Price: High to Low",
    'rating-desc': "Rating"
};

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [isSortOpen, setIsSortOpen] = useState(false); // State for sort dropdown
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

    const sortDropdownRef = useRef(null); // Ref to detect outside clicks

    const [activeFilters, setActiveFilters] = useState({
        categories: [],
        price: defaultPriceRange,
        rating: 0,
    });

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const searchResults = await performSearch(query);
                const items = searchResults.map(res => res.item);
                setResults(items);
                // Reset filters on new search
                setActiveFilters({ categories: [], price: defaultPriceRange, rating: 0 });
            } catch (err) {
                setError("Could not fetch search results.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [query]);

    // --- Derived State with useMemo for Performance ---
    const categories = useMemo(() => results.filter(item => item.isCategory === true), [results]);
    const services = useMemo(() => results.filter(item => !item.isCategory), [results]);

    const availableCategories = useMemo(() => {
        return Array.from(new Set(services.map(s => s.categories?.name))).filter(Boolean);
    }, [services]);

    const displayedServices = useMemo(() => {
        const { categories, price, rating } = activeFilters;
        let processedServices = [...services]
            .filter(s => categories.length === 0 || categories.includes(s.categories?.name))
            .filter(s => (s.priceInfo?.amount || 0) >= price.min && (s.priceInfo?.amount || 0) <= price.max)
            .filter(s => (s.avgRating || 0) >= rating);

        switch (sortBy) {
            case 'price-asc':
                processedServices.sort((a, b) => (a.priceInfo?.amount || Infinity) - (b.priceInfo?.amount || Infinity));
                break;
            case 'price-desc':
                processedServices.sort((a, b) => (b.priceInfo?.amount || -Infinity) - (a.priceInfo?.amount || -Infinity));
                break;
            case 'rating-desc':
                processedServices.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
                break;
            default: // 'relevance'
                break;
        }
        return processedServices;
    }, [services, activeFilters, sortBy]);


    // --- UI Interaction Effects ---

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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
    const handleRemoveFilter = (filterType, valueToRemove = null) => {
        setActiveFilters(prev => {
            switch (filterType) {
                case 'category':
                    return { ...prev, categories: prev.categories.filter(cat => cat !== valueToRemove) };
                case 'price':
                    return { ...prev, price: defaultPriceRange };
                case 'rating':
                    return { ...prev, rating: 0 };
                default:
                    return prev;
            }
        });
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        setIsSortOpen(false); // Close dropdown on selection
    };

    const renderFilterPills = () => (
        <>
            {activeFilters.categories.map(cat => (
                <div key={cat} className="srp-filter-pill">
                    <span>{cat}</span>
                    <button onClick={() => handleRemoveFilter('category', cat)} aria-label={`Remove ${cat} filter`}><X size={14} /></button>
                </div>
            ))}
            {activeFilters.price.label !== 'Any Price' && (
                <div className="srp-filter-pill">
                    <span>{activeFilters.price.label}</span>
                    <button onClick={() => handleRemoveFilter('price')} aria-label="Remove price filter"><X size={14} /></button>
                </div>
            )}
            {activeFilters.rating > 0 && (
                <div className="srp-filter-pill">
                    <span>{activeFilters.rating} ★ & up</span>
                    <button onClick={() => handleRemoveFilter('rating')} aria-label="Remove rating filter"><X size={14} /></button>
                </div>
            )}
        </>
    );

    return (
        <div className="srp-page">
            <Filters
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                activeFilters={activeFilters}
                availableCategories={availableCategories}
                onApply={setActiveFilters}
            />
            <header className="srp-header">
                {query && <p>Showing results for "<strong>{query}</strong>"</p>}
            </header>

            <div className={`srp-sticky-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
                <div className="srp-controls">
                    <button className="srp-filter-toggle" onClick={() => setIsFilterOpen(true)}>
                        <SlidersHorizontal size={18} /><span>Filters</span>
                    </button>

                    <div className={`srp-custom-dropdown ${isSortOpen ? 'is-open' : ''}`} ref={sortDropdownRef}>
                        <div className="srp-dropdown-toggle" onClick={() => setIsSortOpen(!isSortOpen)}>
                            <div className="srp-dropdown-label">
                                <span>Sort by</span>
                            </div>
                            <ChevronDown size={18} className="srp-dropdown-arrow" />
                        </div>
                        <ul className="srp-dropdown-menu">
                            {Object.entries(sortOptions).map(([value, label]) => (
                                <li key={value} className={sortBy === value ? 'active' : ''} onClick={() => handleSortChange(value)}>
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="srp-active-filters">
                    {renderFilterPills()}
                </div>
            </div>

            <main className="srp-main-content">
                {loading ? (
                    <div className="srp-loader-container"><div className="srp-loader"></div></div>
                ) : error ? (
                    <div className="srp-message-box"><h3>Error</h3><p>{error}</p></div>
                ) : (
                    <>
                        {categories.length > 0 && (
                            <section className="srp-section">
                                <h2 className="srp-section-title">Related Categories</h2>
                                <div className="srp-category-scroller">
                                    <div className="srp-category-grid-horizontal">
                                        {categories.map(cat => <SearchCategoryCard key={cat.name} category={cat} />)}
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="srp-section">
                            <h2 className="srp-section-title">Matching Services</h2>
                            <div className="srp-grid">
                                {displayedServices.length > 0 ? (
                                    displayedServices.map(service => <ServiceCard key={service._id} service={service} />)
                                ) : (
                                    <div className="srp-message-box">
                                        <h3>No Services Match Your Filters</h3>
                                        <p>Try clearing your filters to see more results.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}