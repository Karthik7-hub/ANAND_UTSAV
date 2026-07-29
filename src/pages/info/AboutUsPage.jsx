import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaShieldAlt, FaUsers, FaLightbulb, FaHeart, FaArrowRight } from 'react-icons/fa';
import '../../css/FooterPages.css';

const AboutUsPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Student Initiative</span>
                <h1>About Anand Utsav</h1>
                <p>
                    Connecting campus communities, empowering student creators, and building a seamless marketplace for campus events, services, and celebrations.
                </p>
            </div>

            <div className="info-section">
                <h2>Who We Are</h2>
                <p>
                    <strong>Anand Utsav</strong> is a student-led initiative proudly developed by the passionate students of 
                    <strong> National Institute of Technology (NIT) Raipur</strong>. 
                    Our goal is to provide a secure, transparent, and user-friendly platform for booking services, buying, selling, 
                    and participating in campus events and cultural activities.
                </p>
                <p>
                    We focus on creating a trusted ecosystem for the student community while ensuring fairness, reliability, and an exceptional digital experience for both users and event service providers.
                </p>

                <div className="feature-grid">
                    <div className="feature-box">
                        <h4><FaGraduationCap /> NIT Raipur Born</h4>
                        <p>Conceptualized, designed, and built by students who understand campus needs firsthand.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaShieldAlt /> Trust & Security</h4>
                        <p>Verified service listings, transparent pricing, and robust fraud prevention standards.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaUsers /> Community First</h4>
                        <p>Empowering student entrepreneurs, event planners, performers, and local vendors.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>Our Mission & Vision</h2>
                <h3>Our Mission</h3>
                <p>
                    To revolutionize campus event management and service bookings by offering an all-in-one platform where students, organizations, and vendors collaborate effortlessly.
                </p>
                <h3>Our Vision</h3>
                <p>
                    To become the standard digital hub for university events and student celebrations across India, driving innovation, trust, and joy in every celebration.
                </p>
            </div>

            <div className="info-section info-cta-section" style={{ textAlign: 'center' }}>
                <h2 style={{ border: 'none', padding: 0 }}>Meet the Minds Behind Anand Utsav</h2>
                <p>Discover the talented developers and team members from NIT Raipur who brought this platform to life.</p>
                <Link to="/team" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', textDecoration: 'none' }}>
                    View Our Team <FaArrowRight />
                </Link>
            </div>
        </div>
    );
};

export default AboutUsPage;
