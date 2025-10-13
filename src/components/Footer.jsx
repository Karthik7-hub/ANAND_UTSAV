import "../css/Footer.css";

import React from 'react';
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* ABOUT US */}
                <ul className="footer-column">
                    <li className="title">ABOUT US</li>
                    <li>Who are we</li>
                    <li>Blog</li>
                    <li>Work with us</li>
                    <li>Investor Relations</li>
                    <li>Report fraud</li>
                    <li>Contact Us</li>
                </ul>

                {/* ALL OUR APPS */}
                <ul className="footer-column">
                    <li className="title">ALL OUR APPS</li>
                    <li>Anand Utsav Corporate</li>
                    <li>Careers</li>
                    <li>Team</li>
                </ul>

                {/* LEARN MORE */}
                <ul className="footer-column">
                    <li className="title">LEARN MORE ABOUT BILLBITES</li>
                    <li>Security</li>
                    <li>Piracy</li>
                    <li>Terms and Conditions</li>
                </ul>

                {/* SOCIAL MEDIA */}
                <ul className="footer-column footer-social">
                    <li><FaInstagram /></li>
                    <li><FaFacebook /></li>
                    <li><FaTwitter /></li>
                    <li><FaLinkedin /></li>
                    <li><FaYoutube /></li>
                </ul>
            </div>

            {/* Footer bottom text */}
            <div className="footer-bottom">
                By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies.
                All trademarks are properties of their respective owners. 2008-2025 © Anand Utsav™ Ltd. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
