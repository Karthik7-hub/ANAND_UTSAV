import React from 'react';
import { FaBookOpen, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import '../../css/FooterPages.css';

const ContentPoliciesPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Community Guidelines</span>
                <h1>Content Policies</h1>
                <p>
                    Standards for service descriptions, reviews, listings, and communications on Anand Utsav.
                </p>
            </div>

            <div className="info-section">
                <h2>Listing & Review Standards</h2>
                <div className="feature-grid">
                    <div className="feature-box">
                        <h4><FaCheckCircle /> Authenticity</h4>
                        <p>All service images, descriptions, pricing, and user reviews must reflect real experience and accurate pricing.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaExclamationTriangle /> Respectful Communication</h4>
                        <p>Profanity, hate speech, harassment, or abusive content in chat and reviews will result in moderation enforcement.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>Prohibited Content</h2>
                <ul>
                    <li>Misleading or deceptive marketing material.</li>
                    <li>Offensive, illegal, or age-restricted content.</li>
                    <li>Unsolicited spam messages to providers or users.</li>
                </ul>
            </div>
        </div>
    );
};

export default ContentPoliciesPage;
