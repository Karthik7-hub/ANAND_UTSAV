import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaShieldAlt, FaKey, FaEnvelope } from 'react-icons/fa';
import '../../css/FooterPages.css';

const SecurityPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Platform Security</span>
                <h1>Security Practices & Commitments</h1>
                <p>
                    How Anand Utsav safeguards user passwords, sensitive communication, and booking records.
                </p>
            </div>

            <div className="info-section">
                <h2>Our Security Architecture</h2>
                <div className="feature-grid">
                    <div className="feature-box">
                        <h4><FaLock /> Encrypted Authentication</h4>
                        <p>User credentials and authentication tokens are secured using modern cryptographic algorithms.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaShieldAlt /> Secure API Endpoints</h4>
                        <p>Strict CORS rules, rate-limiting, and validation controls protect backend servers against common vulnerabilities.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>Reporting Security Issues</h2>
                <p>
                    If you discover a security vulnerability or potential bug on Anand Utsav, please disclose it responsibly by contacting our developer security team:
                </p>
                <p style={{ marginTop: '0.8rem' }}>
                    <Link to="/contact" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <FaEnvelope /> Report Security Issue
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SecurityPage;
