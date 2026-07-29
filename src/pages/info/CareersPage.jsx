import React from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaGraduationCap, FaRocket, FaEnvelope } from 'react-icons/fa';
import '../../css/FooterPages.css';

const CareersPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Join The Team</span>
                <h1>Work With Us / Careers</h1>
                <p>
                    Are you an NIT Raipur student or tech enthusiast eager to build real-world products? Join Anand Utsav!
                </p>
            </div>

            <div className="info-section">
                <h2>Why Work With Anand Utsav?</h2>
                <div className="feature-grid">
                    <div className="feature-box">
                        <h4><FaRocket /> High-Impact Projects</h4>
                        <p>Build scalable full-stack web applications, machine learning models, and real-time messaging systems.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaGraduationCap /> Peer Mentorship</h4>
                        <p>Collaborate directly with experienced student developers and mentors at NIT Raipur.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>Open Contributor Roles</h2>
                <ul>
                    <li><strong>Full Stack Web Developer (React + Node.js):</strong> Help build new features and improve UI/UX performance.</li>
                    <li><strong>UI/UX Designer:</strong> Craft beautiful festive themes, accessibility standards, and responsive layouts.</li>
                    <li><strong>Campus Ambassador & Marketing Lead:</strong> Drive student outreach, event partnerships, and vendor onboarding.</li>
                </ul>

                <h3>How to Apply</h3>
                <p>
                    Submit your application, resume details, or portfolio link through our contact team portal:
                </p>
                <p style={{ marginTop: '0.8rem' }}>
                    <Link to="/contact" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <FaEnvelope /> Apply via Contact Desk
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default CareersPage;
