import React from 'react';
import { Link } from 'react-router-dom';
import { FaUndo, FaReceipt, FaEnvelope } from 'react-icons/fa';
import '../../css/FooterPages.css';

const RefundPolicyPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Booking Guarantees</span>
                <h1>Refund & Cancellation Policy</h1>
                <p>
                    Clear and fair guidelines for booking cancellations and refund eligibility on Anand Utsav.
                </p>
            </div>

            <div className="info-section">
                <h2>Policy Overview</h2>
                <p>
                    At <strong>Anand Utsav</strong>, we strive to ensure a smooth booking experience for both clients and service providers. Refunds, when applicable, are governed by event-specific and service-specific terms set at the time of booking.
                </p>

                <div className="feature-grid">
                    <div className="feature-box">
                        <h4><FaReceipt /> Service-Specific Rules</h4>
                        <p>Refund eligibility is determined based on individual provider terms and cancellation timelines.</p>
                    </div>
                    <div className="feature-box">
                        <h4><FaUndo /> Case-by-Case Review</h4>
                        <p>Special cancellation requests or service disputes are reviewed fairly on a case-by-case basis.</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <h2>1. Cancellation Timelines</h2>
                <ul>
                    <li><strong>Advance Cancellations:</strong> Cancellations made well in advance of the scheduled event date may be eligible for full or partial refunds according to the provider's terms.</li>
                    <li><strong>Last-Minute Cancellations:</strong> Cancellations made within 24–48 hours of the event may incur non-refundable deposit fees to compensate service providers for reserved slots.</li>
                </ul>

                <h2>2. Non-Fulfilment by Provider</h2>
                <p>
                    If a service provider fails to deliver the agreed services or cancels a confirmed booking, the customer is entitled to a <strong>full refund</strong> or alternative provider assignment.
                </p>

                <h2>3. Requesting a Refund</h2>
                <p>
                    To submit a refund request or report a disputed booking, please reach out to our support team:
                </p>
                <p style={{ marginTop: '0.8rem' }}>
                    <Link to="/contact" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <FaEnvelope /> Contact Support Portal
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
