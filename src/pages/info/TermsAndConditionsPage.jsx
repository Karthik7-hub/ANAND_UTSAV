import React from 'react';
import { FaFileContract, FaGavel, FaBan, FaSyncAlt } from 'react-icons/fa';
import '../../css/FooterPages.css';

const TermsAndConditionsPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">User Agreement</span>
                <h1>Terms & Conditions</h1>
                <p>
                    Please read these Terms & Conditions carefully before using the Anand Utsav platform and services.
                </p>
            </div>

            <div className="info-section">
                <h2>Summary of Key Terms</h2>
                <div className="feature-grid">
                    <div className="feature-box">
                        <h4><FaFileContract /> Accurate Details</h4>
                        <p>Users are responsible for ensuring the accuracy of all information, bookings, and listings they provide.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaBan /> Prohibited Conduct</h4>
                        <p>Fraudulent, abusive, deceptive, or illegal activities are strictly prohibited and punishable.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaGavel /> Account Suspension</h4>
                        <p>We reserve the right to suspend or terminate accounts that violate our community policies.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using Anand Utsav, you agree to be bound by these Terms and Conditions and all applicable laws and regulations of NIT Raipur and Indian jurisdiction.
                </p>

                <h2>2. User Responsibilities</h2>
                <ul>
                    <li>Users must provide truthful, current, and complete registration details.</li>
                    <li>Service providers must honor their service listings, descriptions, and booking agreements in good faith.</li>
                    <li>Users must comply with all applicable campus and institutional guidelines.</li>
                </ul>

                <h2>3. Prohibited Activities</h2>
                <p>You agree not to engage in any of the following activities on the platform:</p>
                <ul>
                    <li>Posting false, misleading, defamatory, or fraudulent event/service listings.</li>
                    <li>Using automated bots, scrapers, or unauthorized APIs to access user data.</li>
                    <li>Harassing, threatening, or defrauding other platform members or event providers.</li>
                </ul>

                <h2>4. Account Termination & Moderation</h2>
                <p>
                    Anand Utsav reserves the right, in its sole discretion, to modify, suspend, or terminate user or provider accounts found violating these terms without prior warning.
                </p>

                <h2>5. Policy Revisions</h2>
                <p>
                    The platform may update these policies periodically. Users are encouraged to review this page regularly to stay informed of any changes.
                </p>
            </div>
        </div>
    );
};

export default TermsAndConditionsPage;
