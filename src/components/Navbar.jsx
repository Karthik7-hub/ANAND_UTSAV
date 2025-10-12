import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { User, Menu, Search, Heart, X, LogOut, UserCircle, CalendarCheck, MessageSquare, Sun, Moon } from 'lucide-react';
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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    

    const { theme, toggleTheme } = useTheme();
    const { user, logout, favourites } = useUser();
    const navigate = useNavigate();

    const userMenuRef = useRef(null);
    const searchContainerRef = useRef(null); // Ref for the new search dropdown

    // --- Close menus on outside click ---
    useOutsideAlerter(userMenuRef, () => setIsUserMenuOpen(false));
    useOutsideAlerter(searchContainerRef, () => setIsSearchOpen(false));

    // --- Effects for scroll, theme, etc. ---
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const favCount = favourites?.length || 0;
    const chatCount = 0;

    return (
        <>
            <header className={`navbar-container ${isScrolled ? 'scrolled' : ''}`}>
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

                    {/* Center (Desktop) */}
                    <nav className="navbar-center">
                        <NavLink to="/categories" className="nav-link">Categories</NavLink>
                        <NavLink to="/services" className="nav-link">Services</NavLink>
                        <NavLink to="/about" className="nav-link">About Us</NavLink>
                    </nav>

                    {/* Right Section */}
                    <div className="navbar-right">
                        {/* NEW Search Dropdown */}
                        <div className="search-container" ref={searchContainerRef}>
                            <button className="icon-button" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                                <Search />
                            </button>
                            {isSearchOpen && (
                                <div className="search-dropdown">
                                    <div className="search-input-wrapper">
                                        <Search className="search-dropdown-icon" />
                                        <input type="text" placeholder="Search for services, gifts..." autoFocus />
                                    </div>
                                    <div className="search-suggestions">
                                        <p>Popular:</p>
                                        <span>Wedding Planners</span>
                                        <span>Catering</span>
                                        <span>Decorators</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/chat" className="icon-button messages-btn desktop-icon">
                            <MessageSquare />
                            {chatCount > 0 && <span className="badge">{chatCount}</span>}
                        </Link>

                        <Link to="/favourites" className="icon-button favourites-btn desktop-icon">
                            <Heart />
                            {favCount > 0 && <span className="badge">{favCount}</span>}
                        </Link>

                        <Link to="/my-bookings" className="icon-button desktop-icon">
  <CalendarCheck />
</Link>


                        {/* User Menu */}
                        <div className="user-menu-container" ref={userMenuRef}>
                            {user ? (
                                <button className="icon-button" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                                    <User />
                                </button>
                            ) : (
                                <Link to="/login" className="icon-button">
                                    <User />
                                </Link>
                            )}
                            {isUserMenuOpen && user && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <p>Signed in as</p>
                                        <strong>{user.username || user.email}</strong>
                                    </div>
                                    <Link to="/dashboard" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                                        <UserCircle size={20} /> Dashboard
                                    </Link>
                                    <Link to="/chat" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                                        <MessageSquare size={20} /> Chats
                                    </Link>
                                    <button className="dropdown-item theme-toggle" onClick={toggleTheme}>
                                        {theme === 'light' ? <><Moon size={20} /> Switch to Dark</> : <><Sun size={20} /> Switch to Light</>}
                                    </button>
                                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                                        <LogOut size={20} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Panel (Slides from left) */}
            <div className={`mobile-nav-panel ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <h1 className="logo">AnandUtsav</h1>
                    <button className="icon-button" onClick={toggleMobileMenu}>
                        <X size={26} />
                    </button>
                </div>
                <nav className="mobile-nav-links">
                    <NavLink to="/" onClick={toggleMobileMenu}>Home</NavLink>
                    <NavLink to="/categories" onClick={toggleMobileMenu}>Categories</NavLink>
                    <NavLink to="/services" onClick={toggleMobileMenu}>Services</NavLink>
                    <NavLink to="/about" onClick={toggleMobileMenu}>About Us</NavLink>
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