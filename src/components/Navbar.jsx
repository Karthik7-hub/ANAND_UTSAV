import React, { useState, useEffect } from 'react';
import { User, ShoppingCart, Menu, Search, Heart, X, LogOut, UserCircle } from 'lucide-react';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import "../css/Navbar.css";

// --- Glass Modal Component ---
const GlassModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
                {children}
            </div>
        </div>
    );
};

// --- Main Navbar Component ---
export default function AnandUtsavNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false); // Close modal
        navigate('/'); // Redirect to home
    };

    // ✅ favourites count
    const favCount = user?.favourites?.length || 0;

    return (
        <>
            <header className={`navbar-container ${isScrolled ? 'scrolled' : ''}`}>
                <div className="navbar-content">
                    {/* Left Section */}
                    <div className="navbar-left">
                        <button className="menu-toggle" onClick={toggleMobileMenu}><Menu className="menu-icon" /></button>
                        <Link to="/" className="logo-link"><h1 className="logo">AnandUtsav</h1></Link>
                    </div>

                    {/* Center Section */}
                    <nav className="navbar-center">
                        <NavLink to="/categories" className="nav-link">Categories</NavLink>
                        <NavLink to="/services" className="nav-link">Services</NavLink>
                    </nav>

                    {/* Right Section */}
                    <div className="navbar-right">
                        <button className="icon-button" onClick={() => setIsSearchOpen(true)}><Search /></button>

                        {/* ❤️ Favourites with count */}
                        <Link to="/favourites" className="icon-button favourites-btn">
                            <Heart />
                            {favCount > 0 && <span className="badge">{favCount}</span>}
                        </Link>

                        <button className="icon-button"><ShoppingCart /></button>
                        {user ? (
                            <button className="icon-button user-icon-link" onClick={() => setIsProfileOpen(true)}>
                                <User />
                            </button>
                        ) : (
                            <Link to="/login" className="icon-button user-icon-link">
                                <User />
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
                <button className="close-menu-btn" onClick={toggleMobileMenu}><X size={30} /></button>
                <nav className="mobile-nav-links">
                    <NavLink to="/" onClick={toggleMobileMenu}>Home</NavLink>
                    {/* ... other mobile links */}
                    {user ? (
                        <NavLink to="/account" onClick={toggleMobileMenu}>My Account</NavLink>
                    ) : (
                        <NavLink to="/login" onClick={toggleMobileMenu}>Login / Register</NavLink>
                    )}
                </nav>
            </div>

            {/* Search Modal */}
            <GlassModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}>
                <div className="search-modal-content">
                    <h2>Search Products</h2>
                    <div className="search-input-wrapper">
                        <Search className="search-modal-icon" />
                        <input type="text" placeholder="Search for sarees, gifts & more..." />
                    </div>
                    <div className="search-suggestions">
                        <p>Trending:</p>
                        <span>Banarasi Saree</span>
                        <span>Wedding Gifts</span>
                        <span>Kurta for Men</span>
                    </div>
                </div>
            </GlassModal>

            {/* Profile Modal */}
            <GlassModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}>
                <div className="profile-modal-content">
                    <h2>My Account</h2>
                    <p className="user-email">{user?.email}</p>
                    <div className="profile-actions">
                        <button className="profile-action-btn"><UserCircle /> View Profile</button>
                        <button onClick={handleLogout} className="profile-action-btn logout-btn"><LogOut /> Logout</button>
                    </div>
                </div>
            </GlassModal>
        </>
    );
}