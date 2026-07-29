import React from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaGlassCheers, FaBullhorn, FaEnvelope } from 'react-icons/fa';
import '../../css/FooterPages.css';

const CorporatePage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Enterprise & Events</span>
                <h1>Anand Utsav Corporate</h1>
                <p>
                    Tailored event management solutions, corporate sponsorships, and campus festival partnerships.
                </p>
            </div>

            <div className="info-section">
                <h2>Corporate Services</h2>
                <p>
                    Anand Utsav connects corporate brands, sponsors, and professional event vendors directly with university festivals and major campus events.
                </p>

                <div className="feature-grid">
                    <div className="feature-box">
                        <h4><FaBuilding /> Corporate Gathering Bookings</h4>
                        <p>Access top-tier verified caterers, decorators, stage managers, and performers for corporate functions.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaBullhorn /> Campus Fest Brand Sponsorships</h4>
                        <p>Connect your brand with thousands of students during annual cultural and technical festivals.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>Partner With Us</h2>
                <p>
                    Interested in corporate partnerships or sponsoring campus events? Reach out to our corporate outreach team:
                </p>
                <p style={{ marginTop: '0.8rem' }}>
                    <Link to="/contact" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <FaEnvelope /> Contact Corporate Team
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default CorporatePage;
