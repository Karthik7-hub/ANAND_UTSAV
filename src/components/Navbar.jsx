import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { User, Menu, Search, Heart, X, LogOut, UserCircle, CalendarCheck, MessageSquare, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import "../css/Navbar.css";
import { useTheme } from '../context/ThemeContext';

// --- Custom Hook for detecting outside clicks ---
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

// --- Main Navbar ---
export default function AnandUtsavNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // Only for mobile overlay
    const [query, setQuery] = useState('');
    const { theme, toggleTheme } = useTheme();
    const { user, logout, favourites } = useUser();
    const navigate = useNavigate();

    const [isNavbarVisible, setIsNavbarVisible] = useState(true); // NEW: Controls visibility
    const lastScrollY = useRef(0); // NEW: Tracks last scroll position
    const location = useLocation(); // NEW: Get the current page location

    const userMenuRef = useRef(null);

    useEffect(() => {
        const isSearchPage = location.pathname === '/search-results';

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // ONLY apply hide/show logic on the search page
            if (isSearchPage) {
                if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                    setIsNavbarVisible(false);
                } else {
                    setIsNavbarVisible(true);
                }
            } else {
                // On all other pages, the navbar is always visible
                setIsNavbarVisible(true);
            }

            lastScrollY.current = currentScrollY;
            setIsScrolled(currentScrollY > 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]); // NEW: Re-run this effect if the page changes

    // --- Close user menu on outside click ---
    useOutsideAlerter(userMenuRef, () => setIsUserMenuOpen(false));

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search-results?q=${encodeURIComponent(query)}`);
            setIsMobileSearchOpen(false); // Close mobile overlay if open
            setQuery('');
        }
    };

    // --- Effects for scroll, theme, etc. ---
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Block scroll when mobile menu OR mobile search overlay is open
        document.body.style.overflow = (isMobileMenuOpen || isMobileSearchOpen) ? 'hidden' : 'auto';
    }, [isMobileMenuOpen, isMobileSearchOpen]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const handleSuggestionClick = (searchTerm) => {
        navigate(`/search-results?q=${encodeURIComponent(searchTerm)}`);
        setIsMobileSearchOpen(false);
        setQuery('');
    };

    const favCount = favourites?.length || 0;
    const chatCount = 0;

    const SearchSuggestions = () => (
        <div className="search-suggestions">
            <p>Popular:</p>
            <span onClick={() => handleSuggestionClick('Wedding Planners')}>Wedding Planners</span>
            <span onClick={() => handleSuggestionClick('Catering')}>Catering</span>
            <span onClick={() => handleSuggestionClick('Decorators')}>Decorators</span>
        </div>
    );

    return (
        <>
            <header
                className={`
                navbar-container 
                ${isScrolled ? 'scrolled' : ''} 
                ${!isNavbarVisible && location.pathname === '/search-results' ? 'hidden' : ''}
              `}
            >
                <div className="navbar-content">
                    {/* Left Section */}
                    <div className="navbar-left">
                        <button className="icon-button menu-toggle" onClick={toggleMobileMenu}>
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                        <Link to="/" className="logo-link">
                            <h1 className="logo">AnandUtsav</h1>
                        </Link>
                    </div>

                    {/* Center (Desktop Search) - NO DROPDOWN */}
                    <div className="navbar-center">
                        <form onSubmit={handleSearchSubmit} className="desktop-search-container">
                            <div className="desktop-search-wrapper">
                                <Search className="desktop-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search for services, gifts..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
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
                            {favCount > 0 && <span className="badge">{favCount}</span>}
                        </Link>
                        <Link to="/my-bookings" className="icon-button desktop-icon"><CalendarCheck /></Link>

                        {/* User Menu */}
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
                                    <button onClick={handleLogout} className="dropdown-item logout-btn"><LogOut size={20} /> Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Search Overlay */}
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
                <div className="mobile-search-body"><SearchSuggestions /></div>
            </div>

            {/* Mobile Menu Panel */}
            <div className={`mobile-nav-panel ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <h1 className="logo">AnandUtsav</h1>
                    <button className="icon-button" onClick={toggleMobileMenu}><X size={26} /></button>
                </div>
                <nav className="mobile-nav-links">
                    <NavLink to="/" onClick={toggleMobileMenu}>Home</NavLink>
                    <hr className="nav-divider" />
                    {user ? (
                        <>
                            <NavLink to="/dashboard" onClick={toggleMobileMenu}>My Dashboard</NavLink>
                            <NavLink to="/favourites" onClick={toggleMobileMenu}>Favourites</NavLink>
                            <NavLink to="/my-bookings" onClick={toggleMobileMenu}>Bookings</NavLink>
                        </>
                    ) : (
                        <NavLink to="/login" onClick={toggleMobileMenu}>Login / Register</NavLink>
                    )}
                </nav>
                <div className="mobile-theme-toggle">
                    <span>Theme:</span>
                    <button onClick={toggleTheme} className="theme-toggle-btn">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
            {isMobileMenuOpen && <div className="mobile-nav-backdrop" onClick={toggleMobileMenu}></div>}
        </>
    );
}