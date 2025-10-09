import React from 'react';
import '../css/ServiceDetailsPage.css';

export default function ServiceDetailsSkeleton() {
    return (
        <div className="service-details-page">
            <div className="details-card">
                {/* ✨ Skeleton now matches the Carousel layout */}
                <div className="carousel-container">
                    <div className="skeleton-box main-image-skel"></div>
                    <div className="carousel-thumbnails">
                        <div className="skeleton-box thumbnail-skel"></div>
                        <div className="skeleton-box thumbnail-skel"></div>
                        <div className="skeleton-box thumbnail-skel"></div>
                        <div className="skeleton-box thumbnail-skel"></div>
                        <div className="skeleton-box thumbnail-skel"></div>
                    </div>
                </div>

                {/* ✨ Skeleton now matches the new info and CTA layout */}
                <div className="service-info">
                    <div className="meta-info">
                        <div className="skeleton-box skel-tag"></div>
                        <div className="skeleton-box skel-rating-display"></div>
                    </div>
                    <div className="skeleton-box skel-h1"></div>
                    <div className="skeleton-box skel-p"></div>
                    <div className="skeleton-box skel-p" style={{ width: '80%' }}></div>

                    <div className="price-and-cta">
                        <div className="skeleton-box skel-price"></div>
                        <div className="cta-buttons-wrapper">
                            <div className="skeleton-box skel-button"></div>
                            <div className="skeleton-box skel-button"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="reviews-section">
                <div className="skeleton-box reviews-title-skel"></div>
                <div className="skeleton-box review-toggle-skel"></div>
                <div className="reviews-list">
                    <div className="review-card-skel">
                        <div className="skeleton-box skel-p" style={{ width: '50%', height: '20px' }}></div>
                        <div className="skeleton-box skel-p" style={{ marginTop: '1rem' }}></div>
                    </div>
                    <div className="review-card-skel">
                        <div className="skeleton-box skel-p" style={{ width: '50%', height: '20px' }}></div>
                        <div className="skeleton-box skel-p" style={{ marginTop: '1rem' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}