import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaHandshake, FaGraduationCap, FaEnvelope } from 'react-icons/fa';
import '../../css/FooterPages.css';

const InvestorRelationsPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Growth & Partnership</span>
                <h1>Investor Relations & Grants</h1>
                <p>
                    Supporting student innovation, campus marketplaces, and scaling university event ecosystem infrastructure.
                </p>
            </div>

            <div className="info-section">
                <h2>About the Initiative</h2>
                <p>
                    <strong>Anand Utsav</strong> is a student-founded platform developed by students of <strong>National Institute of Technology (NIT) Raipur</strong>. 
                    We are dedicated to solving core logistical and discovery challenges in campus event management.
                </p>

                <div className="feature-grid">
                    <div className="feature-box">
                        <h4><FaChartLine /> Scalable Architecture</h4>
                        <p>Built with modern React, Vite, Node.js, and ML capabilities designed for campus-wide scale.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaHandshake /> Institutional Collaboration</h4>
                        <p>Partnering with student bodies, incubation centers, and university event committees.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>Sponsorships & Incubation Inquiries</h2>
                <p>
                    We welcome inquiries from incubator funds, educational sponsors, and alumni networks interested in supporting student startups.
                </p>
                <p style={{ marginTop: '0.8rem' }}>
                    <Link to="/contact" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <FaEnvelope /> Get In Touch
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default InvestorRelationsPage;
