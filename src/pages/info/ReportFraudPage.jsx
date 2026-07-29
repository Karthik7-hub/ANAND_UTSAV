import React, { useState } from 'react';
import { FaExclamationTriangle, FaShieldAlt, FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { submitFraudReport } from '../../api';
import '../../css/FooterPages.css';

const ReportFraudPage = () => {
    const [report, setReport] = useState({
        reporterName: '',
        reporterEmail: '',
        fraudType: 'fake_listing',
        targetName: '',
        description: '',
        proofUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [isError, setIsError] = useState(false);

    const handleChange = (e) => {
        setReport({ ...report, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);
        setIsError(false);

        try {
            const res = await submitFraudReport(report);
            if (res.success) {
                setStatusMessage(res.message || 'Your fraud report has been submitted securely. Our moderation team will investigate promptly.');
                setReport({ reporterName: '', reporterEmail: '', fraudType: 'fake_listing', targetName: '', description: '', proofUrl: '' });
            } else {
                setIsError(true);
                setStatusMessage(res.message || res.msg || 'Failed to submit fraud report. Please try again.');
            }
        } catch (err) {
            setIsError(true);
            setStatusMessage('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="info-page-container">
            <div className="info-hero" style={{ background: 'linear-gradient(135deg, #2c0e0e 0%, #6a1b1b 50%, #e65100 100%)' }}>
                <span className="info-badge" style={{ color: '#ff8a80', background: 'rgba(255, 255, 255, 0.15)' }}>Safety & Integrity</span>
                <h1>Report Fraud or Misconduct</h1>
                <p>
                    Help us maintain a safe, honest, and trusted campus marketplace. Report fake listings, payment scams, or abusive behavior securely.
                </p>
            </div>

            <div className="info-section">
                <h2>Our Zero Tolerance Fraud Policy</h2>
                <p>
                    At <strong>Anand Utsav</strong>, we take safety and trust very seriously. Any form of scam, fraudulent provider listing, impersonation, unfulfilled services, or illegal activity is strictly prohibited.
                </p>
                <div className="feature-grid">
                    <div className="feature-box">
                        <h4 style={{ color: '#d32f2f' }}><FaExclamationTriangle /> Immediate Review</h4>
                        <p>All reported listings and profiles undergo swift investigation by our admin team.</p>
                    </div>
                    <div className="feature-box">
                        <h4 style={{ color: '#d32f2f' }}><FaShieldAlt /> Account Suspension</h4>
                        <p>Accounts violating community safety guidelines face permanent termination.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>Fraud Reporting Form</h2>
                <p>All reports are sent directly to our moderation team via our secure backend portal.</p>

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
                            <label>Your Name (Optional)</label>
                            <input 
                                type="text" 
                                name="reporterName" 
                                placeholder="Leave blank to report anonymously" 
                                value={report.reporterName}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Your Contact Email (Optional)</label>
                            <input 
                                type="email" 
                                name="reporterEmail" 
                                placeholder="For status updates on your report" 
                                value={report.reporterEmail}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Fraud / Abuse Category *</label>
                            <select name="fraudType" value={report.fraudType} onChange={handleChange} disabled={loading}>
                                <option value="fake_listing">Fake Service / Event Listing</option>
                                <option value="payment_scam">Payment Scam / Overcharging</option>
                                <option value="unfulfilled_service">Service Booked but Unfulfilled</option>
                                <option value="impersonation">Identity Theft / Impersonation</option>
                                <option value="other_violation">Other Terms Violation</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Reported Service / Person Name *</label>
                            <input 
                                type="text" 
                                name="targetName" 
                                required 
                                placeholder="Name of provider or service title" 
                                value={report.targetName}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Service URL / Screenshot Link (If applicable)</label>
                        <input 
                            type="text" 
                            name="proofUrl" 
                            placeholder="Link to listing or cloud screenshot" 
                            value={report.proofUrl}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Detailed Description of Incident *</label>
                        <textarea 
                            name="description" 
                            rows="5" 
                            required 
                            placeholder="Provide timestamps, transaction details, or conversation summary..." 
                            value={report.description}
                            onChange={handleChange}
                            disabled={loading}
                        ></textarea>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading} style={{ background: 'linear-gradient(90deg, #d32f2f 0%, #b71c1c 100%)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        {loading ? <><FaSpinner className="fa-spin" /> Submitting...</> : <><FaPaperPlane /> Submit Fraud Report</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportFraudPage;
