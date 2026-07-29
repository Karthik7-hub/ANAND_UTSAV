import React, { useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { submitContactForm } from '../../api';
import '../../css/FooterPages.css';

const ContactUsPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [isError, setIsError] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);
        setIsError(false);

        try {
            const res = await submitContactForm(formData);
            if (res.success) {
                setStatusMessage(res.message || 'Your message has been sent successfully! Our team will respond shortly.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setIsError(true);
                setStatusMessage(res.message || res.msg || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            setIsError(true);
            setStatusMessage('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Get In Touch</span>
                <h1>Contact Anand Utsav Support</h1>
                <p>
                    Have questions about booking services, listing events, or collaborating? Submit your inquiry below!
                </p>
            </div>

            <div className="contact-grid">
                <div className="contact-card">
                    <div className="contact-icon"><FaEnvelope /></div>
                    <div className="contact-card-content">
                        <h4>Online Support Desk</h4>
                        <p>Submit inquiries directly via our secure contact portal for quick assistance from our team.</p>
                    </div>
                </div>

                <div className="contact-card">
                    <div className="contact-icon"><FaMapMarkerAlt /></div>
                    <div className="contact-card-content">
                        <h4>Our Location</h4>
                        <p>National Institute of Technology (NIT) Raipur</p>
                        <p>Raipur, Chhattisgarh, India</p>
                    </div>
                </div>

                <div className="contact-card">
                    <div className="contact-icon"><FaClock /></div>
                    <div className="contact-card-content">
                        <h4>Support Hours</h4>
                        <p><strong>Mon – Fri:</strong> 9:00 AM – 6:00 PM IST</p>
                        <p><strong>Saturday:</strong> 10:00 AM – 2:00 PM IST</p>
                        <p><strong>Sunday:</strong> Closed</p>
                    </div>
                </div>
            </div>

            <div className="info-section" style={{ marginTop: '2.5rem' }}>
                <h2>Send Us a Message</h2>
                <p>Fill out the form below to reach out directly to the Anand Utsav support team.</p>

                {statusMessage && (
                    <div className={isError ? 'alert-error' : 'alert-success'} style={{
                        padding: '1rem 1.2rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontWeight: '500',
                        background: isError ? 'rgba(211, 47, 47, 0.12)' : 'rgba(76, 175, 80, 0.15)',
                        color: isError ? '#d32f2f' : '#2e7d32',
                        borderLeft: `4px solid ${isError ? '#d32f2f' : '#4caf50'}`
                    }}>
                        {isError ? <FaExclamationCircle /> : <FaCheckCircle />}
                        <span>{statusMessage}</span>
                    </div>
                )}

                <form className="info-form" onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Your Name *</label>
                            <input 
                                type="text" 
                                name="name" 
                                required 
                                placeholder="Enter your full name" 
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Your Email *</label>
                            <input 
                                type="email" 
                                name="email" 
                                required 
                                placeholder="name@example.com" 
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Subject *</label>
                        <input 
                            type="text" 
                            name="subject" 
                            required 
                            placeholder="e.g. Service Inquiry, Event Booking, Feedback" 
                            value={formData.subject}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Message *</label>
                        <textarea 
                            name="message" 
                            rows="5" 
                            required 
                            placeholder="Type your detailed message here..." 
                            value={formData.message}
                            onChange={handleChange}
                            disabled={loading}
                        ></textarea>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        {loading ? <><FaSpinner className="fa-spin" /> Sending...</> : <><FaPaperPlane /> Send Message</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactUsPage;
