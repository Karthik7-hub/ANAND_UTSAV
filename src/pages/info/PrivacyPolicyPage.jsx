import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUserSecret, FaLock, FaEnvelope } from 'react-icons/fa';
import '../../css/FooterPages.css';

const PrivacyPolicyPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Data Protection</span>
                <h1>Privacy Policy</h1>
                <p>
                    Your privacy and data security are fundamental to Anand Utsav. Learn how we handle your personal information.
                </p>
            </div>

            <div className="info-section">
                <h2>Privacy Principles Summary</h2>
                <div className="feature-grid">
                    <div className="feature-box">
                        <h4><FaShieldAlt /> Necessary Data Only</h4>
                        <p>We collect only the information necessary to provide, manage, and improve our services.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaUserSecret /> Zero Data Selling</h4>
                        <p>User information is strictly confidential and is <strong>never sold</strong> to third parties or advertisers.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaLock /> Secure Processing</h4>
                        <p>Personal data is securely stored using industry-standard encryption protocols.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>1. Information We Collect</h2>
                <p>To facilitate event bookings, user accounts, and provider management on Anand Utsav, we may collect:</p>
                <ul>
                    <li><strong>Account Information:</strong> Name, student/user email address, phone number, and password hashes.</li>
                    <li><strong>Booking & Service Data:</strong> Booked services, dates, user requirements, and review submissions.</li>
                    <li><strong>Technical Data:</strong> IP address, device type, browser information, and session logs for security audit purposes.</li>
                </ul>

                <h2>2. How We Use Your Data</h2>
                <p>We utilize user information solely for the following purposes:</p>
                <ul>
                    <li>Connecting students with event service providers and verifying bookings.</li>
                    <li>Maintaining platform security and preventing fraudulent activities.</li>
                    <li>Sending transactional notifications regarding bookings and account status.</li>
                </ul>

                <h2>3. Data Protection & Security</h2>
                <p>
                    We implement reasonable technical and organizational security measures to protect user data against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h2>4. Your Data Rights & Deletion Requests</h2>
                <p>
                    You have the right to access, update, or request the complete deletion of your personal account data at any time.
                    To request updates or data deletion, please submit your request through our support portal:
                </p>
                <p style={{ marginTop: '0.8rem' }}>
                    <Link to="/contact" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <FaEnvelope /> Contact Support Desk
                    </Link>
                </p>

                <h2>5. Updates to This Policy</h2>
                <p>
                    We may update this Privacy Policy periodically. Continued use of the Anand Utsav platform indicates acceptance of any revised terms.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
