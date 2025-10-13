import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

import { performSearch } from '../utils/searchApi';
import ServiceCard from '../components/ServiceCard';
import Filters from '../components/Filters';
import SearchCategoryCard from '../components/SearchCategoryCard';
import '../css/SearchResultsPage.css';

const defaultPriceRange = { label: 'Any Price', min: 0, max: Infinity };

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');

    const [activeFilters, setActiveFilters] = useState({
        categories: [],
        price: defaultPriceRange,
        rating: 0,
    });

    useEffect(() => {
        if (!query) { setResults([]); setLoading(false); return; }
        const fetchData = async () => {
            setLoading(true); setError(null);
            try {
                const searchResults = await performSearch(query);
                const items = searchResults.map(res => res.item);
                setResults(items);
                setActiveFilters({ categories: [], price: defaultPriceRange, rating: 0 });
            } catch (err) {
                setError("Could not fetch search results.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [query]);

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
            case 'price-asc': processedServices.sort((a, b) => (a.priceInfo?.amount || Infinity) - (b.priceInfo?.amount || Infinity)); break;
            case 'price-desc': processedServices.sort((a, b) => (b.priceInfo?.amount || -Infinity) - (a.priceInfo?.amount || -Infinity)); break;
            case 'rating-desc': processedServices.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)); break;
            default: break;
        }
        return processedServices;
    }, [services, activeFilters, sortBy]);

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        if (isFilterOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => { document.body.style.overflow = originalStyle; };
    }, [isFilterOpen]);

    const sortOptions = { relevance: "Relevance", 'price-asc': "Price: Low to High", 'price-desc': "Price: High to Low", 'rating-desc': "Rating" };

    const handleRemoveFilter = (filterType, valueToRemove = null) => {
        setActiveFilters(prev => {
            if (filterType === 'category') {
                return { ...prev, categories: prev.categories.filter(cat => cat !== valueToRemove) };
            }
            if (filterType === 'price') {
                return { ...prev, price: defaultPriceRange };
            }
            if (filterType === 'rating') {
                return { ...prev, rating: 0 };
            }
            return prev;
        });
    };

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
                <h1>Search Results</h1>
                {query && <p>Showing results for "{query}"</p>}
            </header>
            <div className="srp-controls">
                <button className="srp-filter-toggle" onClick={() => setIsFilterOpen(true)}>
                    <SlidersHorizontal size={20} /><span>Filters</span>
                </button>
                <div className="srp-custom-dropdown">
                    <div className="srp-dropdown-toggle">
                        <span>Sort by: <strong>{sortOptions[sortBy]}</strong></span>
                        <ChevronDown size={16} />
                    </div>
                    <ul className="srp-dropdown-menu">
                        {Object.entries(sortOptions).map(([value, label]) => (
                            <li key={value} className={sortBy === value ? 'active' : ''} onClick={() => setSortBy(value)}>
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="srp-active-filters">
                {activeFilters.categories.map(cat => (
                    <div key={cat} className="srp-filter-pill">
                        <span>{cat}</span>
                        <button onClick={() => handleRemoveFilter('category', cat)}><X size={14} /></button>
                    </div>
                ))}
                {activeFilters.price.label !== 'Any Price' && (
                    <div className="srp-filter-pill">
                        <span>{activeFilters.price.label}</span>
                        <button onClick={() => handleRemoveFilter('price')}><X size={14} /></button>
                    </div>
                )}
                {activeFilters.rating > 0 && (
                    <div className="srp-filter-pill">
                        <span>{activeFilters.rating} ★ & up</span>
                        <button onClick={() => handleRemoveFilter('rating')}><X size={14} /></button>
                    </div>
                )}
            </div>
            <main className="srp-main-content">
                {loading ? (<div className="srp-message-box"><h3>Loading...</h3></div>) :
                    error ? (<div className="srp-message-box"><h3>Error</h3><p>{error}</p></div>) :
                        (<>
                            {categories.length > 0 && (
                                <section className="srp-section">
                                    <h2 className="srp-section-title">Related Categories</h2>
                                    <div className="srp-category-scroller">
                                        <div className="srp-category-grid-horizontal">
                                            {categories.map(cat => (
                                                <SearchCategoryCard key={cat.name} category={cat} />
                                            ))}
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
                        </>)
                }
            </main>
        </div>
    );
}