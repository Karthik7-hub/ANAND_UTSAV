import React from 'react';
import { Link } from 'react-router-dom';
import { FaCopyright, FaBan, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import '../../css/FooterPages.css';

const PiracyPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">IP Protection</span>
                <h1>Anti-Piracy & Copyright Policy</h1>
                <p>
                    Protecting intellectual property, event media, and digital content across Anand Utsav.
                </p>
            </div>

            <div className="info-section">
                <h2>Intellectual Property Statement</h2>
                <p>
                    All branding, graphics, website source code, software designs, and logos associated with <strong>Anand Utsav™</strong> are protected trademarks and intellectual property of the development team and NIT Raipur student initiative.
                </p>

                <h2>Prohibited Use</h2>
                <ul>
                    <li>Unauthorized copying, redistribution, or mirroring of service listings and media assets.</li>
                    <li>Using pirated software or unauthorized tools to scrape platform data.</li>
                    <li>Infringing upon third-party copyrights, logos, or media assets when creating provider listings.</li>
                </ul>

                <h2>DMCA & Copyright Take-Down Requests</h2>
                <p>
                    If you believe your copyrighted material is being used without authorization on our platform, submit a notice to our team:
                </p>
                <p style={{ marginTop: '0.8rem' }}>
                    <Link to="/contact" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <FaEnvelope /> Submit Take-Down Request
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default PiracyPage;
