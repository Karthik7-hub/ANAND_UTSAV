import "../css/Footer.css";
import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* ABOUT US */}
                <ul className="footer-column">
                    <li className="title">ABOUT US</li>
                    <li><Link to="/about">Who are we</Link></li>
                    <li><Link to="/blog">Blog</Link></li>
                    <li><Link to="/careers">Work with us</Link></li>
                    <li><Link to="/investor-relations">Investor Relations</Link></li>
                    <li><Link to="/report-fraud">Report fraud</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                </ul>

                {/* ALL OUR APPS */}
                <ul className="footer-column">
                    <li className="title">ALL OUR APPS</li>
                    <li><Link to="/corporate">Anand Utsav Corporate</Link></li>
                    <li><Link to="/careers">Careers</Link></li>
                    <li><Link to="/team">Team</Link></li>
                </ul>

                {/* LEARN MORE */}
                <ul className="footer-column">
                    <li className="title">LEARN MORE ABOUT ANAND UTSAV</li>
                    <li><Link to="/security">Security</Link></li>
                    <li><Link to="/piracy">Piracy</Link></li>
                    <li><Link to="/terms">Terms and Conditions</Link></li>
                    <li><Link to="/refund-policy">Refund Policy</Link></li>
                </ul>

                {/* SOCIAL MEDIA */}
                <ul className="footer-column footer-social">
                    <li title="Instagram"><a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a></li>
                    <li title="Facebook"><a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a></li>
                    <li title="Twitter"><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a></li>
                    <li title="LinkedIn"><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a></li>
                    <li title="YouTube"><a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a></li>
                </ul>
            </div>

            {/* Footer bottom text */}
            <div className="footer-bottom">
                By continuing past this page, you agree to our <Link to="/terms">Terms of Service</Link>, <Link to="/cookie-policy">Cookie Policy</Link>, <Link to="/privacy">Privacy Policy</Link> and <Link to="/content-policies">Content Policies</Link>.
                All trademarks are properties of their respective owners. 2008-2025 © Anand Utsav™ Ltd. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
