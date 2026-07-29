import React from 'react';
import { FaCookieBite, FaShieldAlt } from 'react-icons/fa';
import '../../css/FooterPages.css';

const CookiePolicyPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Web Storage</span>
                <h1>Cookie & Local Storage Policy</h1>
                <p>
                    Understanding how Anand Utsav uses cookies and local storage to provide a seamless user session.
                </p>
            </div>

            <div className="info-section">
                <h2>What Are Cookies & Local Storage?</h2>
                <p>
                    Cookies and Local Storage are small text files or key-value pairs stored on your web browser when you visit websites.
                </p>

                <h2>How We Use Web Storage</h2>
                <ul>
                    <li><strong>Essential Authentication Tokens:</strong> Storing JWT tokens to keep you securely logged in across page reloads.</li>
                    <li><strong>Theme & UI Preferences:</strong> Remembering light/dark mode settings and search preferences.</li>
                    <li><strong>Session Security:</strong> Protecting against CSRF attacks and maintaining active booking state.</li>
                </ul>

                <h2>Managing Your Preferences</h2>
                <p>
                    You can clear your browser storage or cookies at any time via your browser settings. Note that disabling essential storage may require you to log in again on subsequent visits.
                </p>
            </div>
        </div>
    );
};

export default CookiePolicyPage;
