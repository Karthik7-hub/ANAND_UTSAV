import React, { useState, useEffect } from 'react';
import { X, DollarSign, Star, Tag } from 'lucide-react';

const priceRanges = [
    { label: 'Any Price', min: 0, max: Infinity },
    { label: 'Under ₹5,000', min: 0, max: 5000 },
    { label: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
    { label: '₹15,000 - ₹30,000', min: 15000, max: 30000 },
    { label: 'Over ₹30,000', min: 30000, max: Infinity },
];

export default function Filters({
    isOpen,
    onClose,
    activeFilters,
    availableCategories,
    onApply,
}) {
    const [draftCategories, setDraftCategories] = useState(activeFilters.categories);
    const [draftPrice, setDraftPrice] = useState(activeFilters.price);
    const [draftRating, setDraftRating] = useState(activeFilters.rating);

    useEffect(() => {
        setDraftCategories(activeFilters.categories);
        setDraftPrice(activeFilters.price);
        setDraftRating(activeFilters.rating);
    }, [isOpen, activeFilters]);

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setDraftCategories(prev =>
            checked ? [...prev, value] : prev.filter(cat => cat !== value)
        );
    };

    const handleClear = () => {
        setDraftCategories([]);
        setDraftPrice(priceRanges[0]);
        setDraftRating(0);
    };

    const handleApply = () => {
        onApply({
            categories: draftCategories,
            price: draftPrice,
            rating: draftRating
        });
        onClose();
    };

    return (
        <div className={`srp-filter-container ${isOpen ? 'is-open' : ''}`}>
            <div className="srp-filter-backdrop" onClick={onClose} />
            <aside className="srp-filter-panel">
                <header className="srp-filter-header">
                    <h3>Filters</h3>
                    <button onClick={onClose} className="srp-filter-close-btn"><X /></button>
                </header>
                <main className="srp-filter-body">
                    {availableCategories.length > 0 && (
                        <div className="srp-filter-group">
                            <h4 className="srp-filter-title"><Tag size={18} /> Category</h4>
                            <div className="srp-checkbox-list">
                                {availableCategories.map((catName) => (
                                    <label key={catName} className="srp-checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={catName}
                                            checked={draftCategories.includes(catName)}
                                            onChange={handleCategoryChange}
                                        />
                                        <span className="srp-custom-checkbox"></span>
                                        {catName}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="srp-filter-group">
                        <h4 className="srp-filter-title"><DollarSign size={18} /> Price Range</h4>
                        <div className="srp-price-options">
                            {priceRanges.map(range => (
                                <button
                                    key={range.label}
                                    className={`srp-price-pill ${draftPrice.label === range.label ? 'active' : ''}`}
                                    onClick={() => setDraftPrice(range)}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="srp-filter-group">
                        <h4 className="srp-filter-title"><Star size={18} /> Rating</h4>
                        <div className="srp-rating-options">
                            <button className={`srp-rating-pill ${draftRating === 4 ? 'active' : ''}`} onClick={() => setDraftRating(4)}>4 ★ & above</button>
                            <button className={`srp-rating-pill ${draftRating === 3 ? 'active' : ''}`} onClick={() => setDraftRating(3)}>3 ★ & above</button>
                            <button className={`srp-rating-pill ${draftRating === 2 ? 'active' : ''}`} onClick={() => setDraftRating(2)}>2 ★ & above</button>
                        </div>
                    </div>
                </main>
                <footer className="srp-filter-footer">
                    <button onClick={handleClear} className="srp-clear-filters-btn">Clear All</button>
                    <button onClick={handleApply} className="srp-apply-btn">Apply Filters</button>
                </footer>
            </aside>
        </div>
    );
}