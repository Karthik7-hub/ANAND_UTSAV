import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, ChevronRight, Music, Camera, Utensils, Paintbrush, Home, Gift, Star, Eye } from "lucide-react";
import axios from "axios";
import { allCategories } from "../data/categoriesData";
import "../css/HomeSearchBar.css";

// Category slug to Lucide Icon mapping
const getCategoryIcon = (slug) => {
  const lower = slug.toLowerCase();
  if (lower.includes("dj")) return Music;
  if (lower.includes("photo") || lower.includes("video")) return Camera;
  if (lower.includes("cater")) return Utensils;
  if (lower.includes("decor") || lower.includes("flor")) return Paintbrush;
  if (lower.includes("venue")) return Home;
  if (lower.includes("gift") || lower.includes("jewel")) return Gift;
  return Sparkles;
};

export default function HomeSearchBar() {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Load all services for local suggestions
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://anand-u.vercel.app";
        const res = await axios.get(`${baseUrl}/provider/allservices`);
        if (Array.isArray(res.data)) {
          setServices(res.data);
        }
      } catch (err) {
        console.error("Failed to load services for search suggestions", err);
      }
    };
    fetchServices();
  }, []);

  // Filter categories and services as user types
  useEffect(() => {
    if (!query.trim()) {
      setFilteredCategories([]);
      setFilteredServices([]);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();

    // 1. Filter Categories
    const matchedCats = allCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(cleanQuery) ||
        cat.slug.toLowerCase().includes(cleanQuery)
    ).slice(0, 3); // Limit to top 3 categories

    // 2. Filter Services
    const matchedServices = services.filter(
      (service) =>
        service.name?.toLowerCase().includes(cleanQuery) ||
        service.description?.toLowerCase().includes(cleanQuery) ||
        service.categories?.name?.toLowerCase().includes(cleanQuery)
    ).slice(0, 5); // Limit to top 5 services

    setFilteredCategories(matchedCats);
    setFilteredServices(matchedServices);
  }, [query, services]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/search-results?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (type, target) => {
    setIsOpen(false);
    if (type === "category") {
      navigate(`/category/${target.slug}`);
    } else if (type === "service") {
      navigate(`/service/${target._id}`);
    } else if (type === "popular") {
      setQuery(target);
      navigate(`/search-results?q=${encodeURIComponent(target)}`);
    }
  };

  const popularSearches = [
    "Wedding DJ",
    "Luxury Catering",
    "Floral Decoration",
    "Cinematic Photography",
  ];

  const showSuggestions = isFocused && (query.trim().length > 0 || popularSearches.length > 0);

  return (
    <div className="home-search-container" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="home-search-form-wrapper">
        <div className="home-search-input-field">
          <Search className="home-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search for DJs, Caterers, Venues, Photographers..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(true);
            }}
          />
        </div>
        <button type="submit" className="home-search-button">
          <span>Search</span>
          <Search size={16} />
        </button>
      </form>

      {/* Suggestion Dropdown Panel */}
      {isOpen && showSuggestions && (
        <div className="home-search-dropdown animate-fade-in">
          {query.trim().length === 0 ? (
            /* Popular Searches (Default View) */
            <div className="search-suggestion-section">
              <span className="section-label">Popular Searches</span>
              <div className="popular-tags-grid">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="popular-search-tag"
                    onClick={() => handleSuggestionClick("popular", tag)}
                  >
                    <Search size={12} />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Filtered Search Results */
            <>
              {/* Category Suggestions */}
              {filteredCategories.length > 0 && (
                <div className="search-suggestion-section">
                  <span className="section-label">Categories</span>
                  <div className="suggestion-items-list">
                    {filteredCategories.map((cat) => {
                      const IconComponent = getCategoryIcon(cat.slug);
                      return (
                        <div
                          key={cat.id}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick("category", cat)}
                        >
                          <div className="suggestion-item-icon-wrapper cat-icon">
                            <IconComponent size={14} />
                          </div>
                          <div className="suggestion-item-details">
                            <span className="suggestion-item-title">{cat.name}</span>
                            <span className="suggestion-item-subtitle">Browse all services</span>
                          </div>
                          <ChevronRight size={14} className="chevron" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Service Suggestions */}
              {filteredServices.length > 0 && (
                <div className="search-suggestion-section">
                  <span className="section-label">Top Services</span>
                  <div className="suggestion-items-list">
                    {filteredServices.map((srv) => (
                      <div
                        key={srv._id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick("service", srv)}
                      >
                        <div className="suggestion-item-icon-wrapper srv-icon">
                          <Star size={14} />
                        </div>
                        <div className="suggestion-item-details">
                          <span className="suggestion-item-title">{srv.name}</span>
                          <span className="suggestion-item-subtitle">
                            {srv.categories?.name || "Service"} • ₹
                            {srv.priceInfo?.amount?.toLocaleString("en-IN") || "Quote"}
                          </span>
                        </div>
                        <ChevronRight size={14} className="chevron" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredCategories.length === 0 && filteredServices.length === 0 && (
                <div className="search-no-suggestions">
                  <Sparkles size={20} className="sparkle-icon" />
                  <span>Search for "{query}" in all services</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
