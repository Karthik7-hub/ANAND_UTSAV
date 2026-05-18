import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { User, Menu, Search, Heart, X, LogOut, UserCircle, CalendarCheck, MessageSquare, Sun, Moon, ArrowLeft, MapPin, ChevronDown, Star, ChevronRight, Music, Camera, Utensils, Paintbrush, Home, Gift, Sparkles, Clock } from "lucide-react";
import { useUser } from "../context/UserContext";
import "../css/Navbar.css";
import { useTheme } from "../context/ThemeContext";
import LocationAutocomplete from "./LocationAutocomplete";
import axios from "axios";
import { allCategories } from "../data/categoriesData";
import { fetchAllServices, fetchMLRecommendations, performSearch } from "../api";

const useOutsideAlerter = (ref, callback) => {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
};

export default function AnandUtsavNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [userLocation, setUserLocation] = useState(null);

    const { theme, toggleTheme } = useTheme();
    const { user, logout, favourites } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const lastScrollY = useRef(0);

    const userMenuRef = useRef(null);
    const locationMenuRef = useRef(null);
    const searchDropdownRef = useRef(null);

    const [services, setServices] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [mlRecommendations, setMlRecommendations] = useState([]);

    // Load recent searches on mount
    useEffect(() => {
        const stored = localStorage.getItem("recentSearches");
        if (stored) {
            setRecentSearches(JSON.parse(stored));
        }
    }, []);

    // Sync search input query with URL search parameter 'q' when user is on search results page
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("q");
        if (q !== null) {
            setQuery(q);
        } else if (location.pathname === "/") {
            setQuery("");
        }
    }, [location.search, location.pathname]);

    // Fetch user-specific collaborative filtering recommendations from ML space
    useEffect(() => {
        if (services.length === 0) return;
        
        const loadMLRecommendations = async () => {
            const targetUser = user?.username || user?.email || "Emma";
            const recs = await fetchMLRecommendations(targetUser, 4);
            if (Array.isArray(recs) && recs.length > 0) {
                const recItemIds = recs.map(r => r.item_id || r.itemId);
                const matched = services.filter(s => recItemIds.includes(s._id)).slice(0, 4);
                if (matched.length > 0) {
                    setMlRecommendations(matched);
                    return;
                }
            }
            // Fallback: highly-rated services in local pool
            const sortedFallback = [...services]
                .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
                .slice(0, 4);
            setMlRecommendations(sortedFallback);
        };

        loadMLRecommendations();
    }, [services, user]);

    const saveSearchQuery = (searchQuery) => {
        if (!searchQuery || !searchQuery.trim()) return;
        const trimmed = searchQuery.trim();
        let list = JSON.parse(localStorage.getItem("recentSearches") || "[]");
        list = list.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
        list.unshift(trimmed);
        list = list.slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(list));
        setRecentSearches(list);
    };

    const clearRecentSearches = (e) => {
        e.stopPropagation();
        localStorage.removeItem("recentSearches");
        setRecentSearches([]);
    };

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

    // Load all services for local suggestions
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await fetchAllServices();
                if (Array.isArray(data)) {
                    setServices(data);
                }
            } catch (err) {
                console.error("Failed to load services for navbar search suggestions", err);
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
        const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

        // 1. Filter Categories
        const matchedCats = allCategories.filter((cat) => {
            const name = cat.name.toLowerCase();
            const slug = cat.slug.toLowerCase();
            return queryTokens.every(token => name.includes(token) || slug.includes(token));
        }).slice(0, 3);

        // 2. Filter Services
        const matchedServices = services.filter((service) => {
            const name = service.name?.toLowerCase() || "";
            const desc = service.description?.toLowerCase() || "";
            const catName = service.categories?.name?.toLowerCase() || "";
            return queryTokens.every(token => 
                name.includes(token) || 
                desc.includes(token) || 
                catName.includes(token)
            );
        }).slice(0, 4);

        setFilteredCategories(matchedCats);
        setFilteredServices(matchedServices);
    }, [query, services]);

    // Automatically open dropdown when user types or changes the query text
    useEffect(() => {
        if (query.trim()) {
            setIsSearchDropdownOpen(true);
            setIsSearchFocused(true);
        }
    }, [query]);

    // Debounced real-time semantic search suggestions from ML space as user types
    useEffect(() => {
        if (!query.trim()) {
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const lat = userLocation?.lat;
                const lng = userLocation?.lng;
                const semanticResults = await performSearch(query, lat, lng);
                if (Array.isArray(semanticResults) && semanticResults.length > 0) {
                    const semanticItemIds = semanticResults.map(r => r._id || r.id);
                    const matched = services.filter(s => semanticItemIds.includes(s._id));
                    if (matched.length > 0) {
                        setFilteredServices(prev => {
                            const existingIds = new Set(prev.map(p => p._id));
                            const uniqueSemantic = matched.filter(m => !existingIds.has(m._id));
                            return [...prev, ...uniqueSemantic].slice(0, 5);
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch debounced semantic search recommendations", err);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [query, services, userLocation]);

    // --- Main Scroll Effect ---
    useEffect(() => {
        const isSearchPage = location.pathname === "/search-results" || location.pathname.startsWith("/category/");
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (isSearchPage) {
                setIsNavbarVisible(!(currentScrollY > lastScrollY.current && currentScrollY > 100));
            } else {
                setIsNavbarVisible(true);
            }
            lastScrollY.current = currentScrollY;
            setIsScrolled(currentScrollY > 10);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);

    // --- Outside Click Handlers ---
    useOutsideAlerter(userMenuRef, () => setIsUserMenuOpen(false));
    useOutsideAlerter(locationMenuRef, () => setIsLocationMenuOpen(false));
    useOutsideAlerter(searchDropdownRef, () => {
        setIsSearchDropdownOpen(false);
        setIsSearchFocused(false);
    });

    // --- Location Logic ---
    useEffect(() => {
        const storedLoc = localStorage.getItem("userLocation");
        if (storedLoc) setUserLocation(JSON.parse(storedLoc));
    }, []);

    const captureLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    let locationName = "Current Location";
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await response.json();
                        locationName = data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Current Location";
                    } catch(e) {}
                    const loc = { lat, lng, name: locationName };
                    setUserLocation(loc);
                    localStorage.setItem("userLocation", JSON.stringify(loc));
                    setIsLocationMenuOpen(false);
                },
                () => alert("Could not get location. Please enable permissions.")
            );
        } else {
            alert("Geolocation not supported.");
        }
    };

    const clearLocation = () => {
        setUserLocation(null);
        localStorage.removeItem("userLocation");
        setIsLocationMenuOpen(false);
    };

    // --- Search Logic ---
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            saveSearchQuery(query);
            let searchUrl = `/search-results?q=${encodeURIComponent(query)}`;
            if (userLocation) searchUrl += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
            navigate(searchUrl);
            setIsMobileSearchOpen(false);
            setIsSearchDropdownOpen(false);
            setIsSearchFocused(false);
        }
    };

    const handleSuggestionClick = (type, target) => {
        setIsSearchDropdownOpen(false);
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
        if (type === "category") {
            saveSearchQuery(target.name);
            setQuery("");
            navigate(`/category/${target.slug}`);
        } else if (type === "service") {
            saveSearchQuery(target.name);
            setQuery("");
            navigate(`/service/${target._id}`);
        } else if (type === "popular" || type === "recent") {
            saveSearchQuery(target);
            let searchUrl = `/search-results?q=${encodeURIComponent(target)}`;
            if (userLocation) searchUrl += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
            navigate(searchUrl);
        }
    };

    // --- Body Scroll Lock ---
    useEffect(() => {
        document.body.style.overflow = (isMobileMenuOpen || isMobileSearchOpen) ? "hidden" : "auto";
    }, [isMobileMenuOpen, isMobileSearchOpen]);

    return (
        <>
            <header className={`navbar-container ${isScrolled ? "scrolled" : ""} ${!isNavbarVisible ? "hidden" : ""}`}>
                <div className="navbar-content">
                    {/* Left Section */}
                    <div className="navbar-left">
                        <button className="icon-button menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                        <Link to="/" className="logo-link">
                            <h1 className="logo">AnandUtsav</h1>
                        </Link>

                        {/* Modern Location Selector */}
                        <div className="location-selector-container desktop-icon" ref={locationMenuRef}>
                            <button className="location-dropdown-toggle" onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}>
                                <MapPin size={18} className="location-pin-icon" />
                                <div className="location-text-stack">
                                    <span className="location-label">Location</span>
                                    <span className="location-value">{userLocation ? userLocation.name : "Select Location"}</span>
                                </div>
                                <ChevronDown size={14} className="location-chevron" />
                            </button>

                            {isLocationMenuOpen && (
                                <div className="location-dropdown-menu user-dropdown" style={{ width: '280px', padding: '10px' }}>
                                    <div className="dropdown-header" style={{ borderBottom: 'none', padding: '0 0 10px 0' }}>
                                        <p style={{ fontWeight: 600, color: 'var(--text-color)' }}>Set your location</p>
                                    </div>
                                    <LocationAutocomplete 
                                        value={userLocation ? userLocation.name : ""} 
                                        onLocationSelect={(loc) => {
                                            if (loc.lat && loc.lng) {
                                                setUserLocation(loc);
                                                localStorage.setItem("userLocation", JSON.stringify(loc));
                                                setIsLocationMenuOpen(false);
                                            } else {
                                                clearLocation();
                                            }
                                        }} 
                                        placeholder="Type city or area..."
                                    />
                                    <div style={{ height: '1px', background: 'var(--dropdown-border)', margin: '10px 0' }}></div>
                                    <button onClick={captureLocation} className="dropdown-item" style={{ padding: '8px 10px' }}>
                                        <MapPin size={18} /> Detect my current location
                                    </button>
                                    {userLocation && (
                                        <button onClick={clearLocation} className="dropdown-item logout-btn" style={{ padding: '8px 10px' }}>
                                            <X size={18} /> Clear location
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center Section */}
                    <div className="navbar-center" ref={searchDropdownRef}>
                        <form onSubmit={handleSearchSubmit} className="desktop-search-container" style={{ position: 'relative' }}>
                            <div className="desktop-search-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                                <Search className="desktop-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search for services, gifts..."
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setIsSearchDropdownOpen(true);
                                    }}
                                    onFocus={() => {
                                        setIsSearchFocused(true);
                                        setIsSearchDropdownOpen(true);
                                    }}
                                    onClick={() => {
                                        setIsSearchFocused(true);
                                        setIsSearchDropdownOpen(true);
                                    }}
                                    style={{ paddingRight: query ? '40px' : '20px' }}
                                />
                                {query && (
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setQuery("");
                                            setIsSearchDropdownOpen(true);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: '15px',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-color-light)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 0,
                                            zIndex: 10
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Suggestions Panel */}
                            {isSearchDropdownOpen && isSearchFocused && (
                                <div className="desktop-search-dropdown animate-fade-in">
                                    {query.trim().length === 0 ? (
                                        /* User Recent Searches & Collaborative ML Recommendations */
                                        <>
                                            {/* Recent Searches */}
                                            {recentSearches.length > 0 ? (
                                                <div className="suggestion-section">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingRight: '0.25rem' }}>
                                                        <span className="suggestion-section-label" style={{ marginBottom: 0 }}>Recent Searches</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={clearRecentSearches}
                                                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                                        >
                                                            Clear All
                                                        </button>
                                                    </div>
                                                    <div className="suggestion-list">
                                                        {recentSearches.map((term, index) => (
                                                            <div
                                                                key={`${term}-${index}`}
                                                                className="suggestion-item"
                                                                onClick={() => handleSuggestionClick("recent", term)}
                                                            >
                                                                <div className="suggestion-icon-wrap" style={{ background: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-color-light)' }}>
                                                                    <Clock size={12} />
                                                                </div>
                                                                <div className="suggestion-details">
                                                                    <span className="suggestion-title" style={{ fontWeight: 500 }}>{term}</span>
                                                                </div>
                                                                <ChevronRight size={12} className="suggestion-chevron" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Fallback tag list when history is fresh/clear */
                                                <div className="suggestion-section">
                                                    <span className="suggestion-section-label">Popular Searches</span>
                                                    <div className="navbar-popular-grid">
                                                        {["Wedding DJ", "Luxury Catering", "Floral Decoration", "Cinematic Photography"].map((tag) => (
                                                            <button
                                                                key={tag}
                                                                type="button"
                                                                className="navbar-popular-tag"
                                                                onClick={() => handleSuggestionClick("popular", tag)}
                                                            >
                                                                <Search size={10} />
                                                                <span>{tag}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Collaborative ML Recommendations */}
                                            {mlRecommendations.length > 0 && (
                                                <div className="suggestion-section" style={{ marginTop: recentSearches.length > 0 ? '1rem' : 0 }}>
                                                    <span className="suggestion-section-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Sparkles size={11} style={{ color: 'var(--primary-color)' }} /> Recommended For You (AI-Powered)
                                                    </span>
                                                    <div className="suggestion-list" style={{ marginTop: '0.5rem' }}>
                                                        {mlRecommendations.map((srv) => (
                                                            <div
                                                                key={srv._id}
                                                                className="suggestion-item"
                                                                onClick={() => handleSuggestionClick("service", srv)}
                                                            >
                                                                <div className="suggestion-icon-wrap srv-icon">
                                                                    <Star size={12} />
                                                                </div>
                                                                <div className="suggestion-details">
                                                                    <span className="suggestion-title">{srv.name}</span>
                                                                    <span className="suggestion-subtitle">
                                                                        {srv.categories?.name || "Service"} • ₹{srv.priceInfo?.amount?.toLocaleString("en-IN") || "Quote"}
                                                                    </span>
                                                                </div>
                                                                <ChevronRight size={12} className="suggestion-chevron" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* Filtered Suggestions */
                                        <>
                                            {/* Categories */}
                                            {filteredCategories.length > 0 && (
                                                <div className="suggestion-section">
                                                    <span className="suggestion-section-label">Categories</span>
                                                    <div className="suggestion-list">
                                                        {filteredCategories.map((cat) => {
                                                            const IconComponent = getCategoryIcon(cat.slug);
                                                            return (
                                                                <div
                                                                    key={cat.id}
                                                                    className="suggestion-item"
                                                                    onClick={() => handleSuggestionClick("category", cat)}
                                                                >
                                                                    <div className="suggestion-icon-wrap">
                                                                        <IconComponent size={12} />
                                                                    </div>
                                                                    <div className="suggestion-details">
                                                                        <span className="suggestion-title">{cat.name}</span>
                                                                        <span className="suggestion-subtitle">Browse Category</span>
                                                                    </div>
                                                                    <ChevronRight size={12} className="suggestion-chevron" />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Services */}
                                            {filteredServices.length > 0 && (
                                                <div className="suggestion-section">
                                                    <span className="suggestion-section-label">Top Services</span>
                                                    <div className="suggestion-list">
                                                        {filteredServices.map((srv) => (
                                                            <div
                                                                key={srv._id}
                                                                className="suggestion-item"
                                                                onClick={() => handleSuggestionClick("service", srv)}
                                                            >
                                                                    <div className="suggestion-icon-wrap srv-icon">
                                                                        <Star size={12} />
                                                                    </div>
                                                                    <div className="suggestion-details">
                                                                        <span className="suggestion-title">{srv.name}</span>
                                                                        <span className="suggestion-subtitle">
                                                                            {srv.categories?.name || "Service"} • ₹{srv.priceInfo?.amount?.toLocaleString("en-IN") || "Quote"}
                                                                        </span>
                                                                    </div>
                                                                    <ChevronRight size={12} className="suggestion-chevron" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {filteredCategories.length === 0 && filteredServices.length === 0 && (
                                                <div className="no-match-alert">
                                                    <Sparkles size={16} />
                                                    <span>Search for "{query}" in all services</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right Section */}
                    <div className="navbar-right">
                        <button className="icon-button mobile-search-toggle" onClick={() => setIsMobileSearchOpen(true)}>
                            <Search />
                        </button>
                        <Link to="/chat" className="icon-button messages-btn desktop-icon"><MessageSquare /></Link>
                        <Link to="/favourites" className="icon-button favourites-btn desktop-icon">
                            <Heart />
                            {(favourites?.length || 0) > 0 && <span className="badge">{favourites.length}</span>}
                        </Link>
                        <Link to="/my-bookings" className="icon-button desktop-icon"><CalendarCheck /></Link>

                        <div className="user-menu-container" ref={userMenuRef}>
                            {user ? (
                                <button className="icon-button" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}><User /></button>
                            ) : (
                                <Link to="/login" className="icon-button"><User /></Link>
                            )}
                            {isUserMenuOpen && user && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <p>Signed in as</p>
                                        <strong>{user.username || user.email}</strong>
                                    </div>
                                    <Link to="/dashboard" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}><UserCircle size={20} /> Dashboard</Link>
                                    <Link to="/chat" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}><MessageSquare size={20} /> Chats</Link>
                                    <button className="dropdown-item theme-toggle" onClick={toggleTheme}>
                                        {theme === 'light' ? <><Moon size={20} /> Switch to Dark</> : <><Sun size={20} /> Switch to Light</>}
                                    </button>
                                    <button onClick={() => { logout(); setIsUserMenuOpen(false); navigate("/"); }} className="dropdown-item logout-btn"><LogOut size={20} /> Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Overlays */}
            <div className={`mobile-search-overlay ${isMobileSearchOpen ? 'open' : ''}`}>
                <div className="mobile-search-header">
                    <button className="icon-button" onClick={() => setIsMobileSearchOpen(false)}><ArrowLeft /></button>
                    <form onSubmit={handleSearchSubmit} className="mobile-search-form">
                        <input 
                            type="text" 
                            placeholder="Search for services, gifts..." 
                            autoFocus 
                            value={query} 
                            onChange={(e) => setQuery(e.target.value)} 
                        />
                        {query && <button type="button" className="clear-search-btn" onClick={() => setQuery('')}><X size={20} /></button>}
                    </form>
                </div>
                
                {/* Mobile Search Suggestions List */}
                {isMobileSearchOpen && (
                    <div className="mobile-search-suggestions-container" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-color)', zIndex: 1000 }}>
                        {query.trim().length === 0 ? (
                            <div style={{ padding: '1rem' }}>
                                {/* Recent Searches */}
                                {recentSearches.length > 0 ? (
                                    <div className="suggestion-section" style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span className="suggestion-section-label" style={{ fontSize: '0.8rem', color: 'var(--text-color-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Searches</span>
                                            <button 
                                                type="button" 
                                                onClick={clearRecentSearches}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="suggestion-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {recentSearches.map((term, index) => (
                                                <div
                                                    key={`${term}-${index}`}
                                                    className="suggestion-item"
                                                    onClick={() => handleSuggestionClick("recent", term)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px 14px', borderRadius: '10px', background: 'var(--dropdown-item-hover-bg)', cursor: 'pointer' }}
                                                >
                                                    <div className="suggestion-icon-wrap" style={{ background: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-color-light)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Clock size={16} />
                                                    </div>
                                                    <div className="suggestion-details" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                        <span className="suggestion-title" style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-color)' }}>{term}</span>
                                                    </div>
                                                    <ChevronRight size={16} style={{ color: 'var(--text-color-light)' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="suggestion-section" style={{ marginBottom: '1.5rem' }}>
                                        <span className="suggestion-section-label" style={{ fontSize: '0.8rem', color: 'var(--text-color-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Popular Searches</span>
                                        <div className="navbar-popular-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.85rem' }}>
                                            {["Wedding DJ", "Luxury Catering", "Floral Decoration", "Cinematic Photography"].map((tag) => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    className="navbar-popular-tag"
                                                    onClick={() => handleSuggestionClick("popular", tag)}
                                                    style={{ background: 'var(--dropdown-item-hover-bg)', border: 'none', color: 'var(--text-color)', padding: '10px 18px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
                                                >
                                                    <span>{tag}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ML Recommendations */}
                                {mlRecommendations.length > 0 && (
                                    <div className="suggestion-section">
                                        <span className="suggestion-section-label" style={{ fontSize: '0.8rem', color: 'var(--text-color-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Sparkles size={13} style={{ color: 'var(--primary-color)' }} /> Recommended For You (AI-Powered)
                                        </span>
                                        <div className="suggestion-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.85rem' }}>
                                            {mlRecommendations.map((srv) => (
                                                <div
                                                    key={srv._id}
                                                    className="suggestion-item"
                                                    onClick={() => handleSuggestionClick("service", srv)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px 14px', borderRadius: '10px', background: 'var(--dropdown-item-hover-bg)', cursor: 'pointer' }}
                                                >
                                                    <div className="suggestion-icon-wrap srv-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Star size={16} />
                                                    </div>
                                                    <div className="suggestion-details" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                        <span className="suggestion-title" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-color)' }}>{srv.name}</span>
                                                        <span className="suggestion-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-color-light)' }}>
                                                            {srv.categories?.name || "Service"} • ₹{srv.priceInfo?.amount?.toLocaleString("en-IN") || "Quote"}
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={16} style={{ color: 'var(--text-color-light)' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ padding: '0.75rem' }}>
                                {/* Categories */}
                                {filteredCategories.length > 0 && (
                                    <div className="suggestion-section" style={{ marginBottom: '1.25rem' }}>
                                        <span className="suggestion-section-label" style={{ fontSize: '0.75rem', color: 'var(--text-color-light)', paddingLeft: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categories</span>
                                        <div className="suggestion-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.6rem' }}>
                                            {filteredCategories.map((cat) => {
                                                const IconComponent = getCategoryIcon(cat.slug);
                                                return (
                                                    <div
                                                        key={cat.id}
                                                        className="suggestion-item"
                                                        onClick={() => handleSuggestionClick("category", cat)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px 14px', borderRadius: '10px', background: 'var(--dropdown-item-hover-bg)', cursor: 'pointer' }}
                                                    >
                                                        <div className="suggestion-icon-wrap" style={{ background: 'rgba(255, 103, 31, 0.1)', color: 'var(--primary-color)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <IconComponent size={16} />
                                                        </div>
                                                        <div className="suggestion-details" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                            <span className="suggestion-title" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-color)' }}>{cat.name}</span>
                                                            <span className="suggestion-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-color-light)' }}>Browse Category</span>
                                                        </div>
                                                        <ChevronRight size={16} style={{ color: 'var(--text-color-light)' }} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Services */}
                                {filteredServices.length > 0 && (
                                    <div className="suggestion-section">
                                        <span className="suggestion-section-label" style={{ fontSize: '0.75rem', color: 'var(--text-color-light)', paddingLeft: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Services</span>
                                        <div className="suggestion-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.6rem' }}>
                                            {filteredServices.map((srv) => (
                                                <div
                                                    key={srv._id}
                                                    className="suggestion-item"
                                                    onClick={() => handleSuggestionClick("service", srv)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px 14px', borderRadius: '10px', background: 'var(--dropdown-item-hover-bg)', cursor: 'pointer' }}
                                                >
                                                    <div className="suggestion-icon-wrap srv-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Star size={16} />
                                                    </div>
                                                    <div className="suggestion-details" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                        <span className="suggestion-title" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-color)' }}>{srv.name}</span>
                                                        <span className="suggestion-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-color-light)' }}>
                                                            {srv.categories?.name || "Service"} • ₹{srv.priceInfo?.amount?.toLocaleString("en-IN") || "Quote"}
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={16} style={{ color: 'var(--text-color-light)' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {filteredCategories.length === 0 && filteredServices.length === 0 && (
                                    <div className="no-match-alert" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-color-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                        <Sparkles size={24} style={{ color: 'var(--primary-color)' }} />
                                        <span style={{ fontSize: '0.95rem' }}>Search for "{query}" in all services</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={`mobile-nav-panel ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <h1 className="logo">AnandUtsav</h1>
                    <button className="icon-button" onClick={() => setIsMobileMenuOpen(false)}><X size={26} /></button>
                </div>
                <nav className="mobile-nav-links">
                    <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
                    <hr className="nav-divider" />
                    {user ? (
                        <>
                            <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>My Dashboard</NavLink>
                            <NavLink to="/favourites" onClick={() => setIsMobileMenuOpen(false)}>Favourites</NavLink>
                            <NavLink to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)}>Bookings</NavLink>
                        </>
                    ) : (
                        <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login / Register</NavLink>
                    )}
                </nav>
                <div className="mobile-theme-toggle">
                    <span>Theme:</span>
                    <button onClick={toggleTheme} className="theme-toggle-btn">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
            {isMobileMenuOpen && <div className="mobile-nav-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>}
        </>
    );
}