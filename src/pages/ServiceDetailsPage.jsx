import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/ServiceDetailsPage.css';
import { CalendarCheck, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { allCategories } from '../data/categoriesData';
import axios from 'axios';
import { useUser } from '../context/UserContext';
// ✨ Import the separated skeleton component
import ServiceDetailsSkeleton from '../components/ServiceDetailsSkeleton';


// --- ✨ NEW ADAPTIVE Image Carousel Component ---
const ImageCarousel = ({ images, serviceName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // --- Swipe Logic ---
  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset touch end position
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    // Reset touch positions
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return <img src={images[0]} alt={serviceName} className="main-image static-image" />;
  }

  return (
    <div className="carousel-container">
      <div
        className="carousel-main-image-wrapper"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Image slides with transition */}
        <div className="carousel-slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${serviceName} - Image ${index + 1}`}
              className="main-image"
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <button onClick={goToPrevious} className="carousel-nav-btn prev"><ChevronLeft size={28} /></button>
        <button onClick={goToNext} className="carousel-nav-btn next"><ChevronRight size={28} /></button>
      </div>

      {/* Desktop Thumbnail Gallery */}
      <div className="carousel-thumbnails">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${serviceName} thumbnail ${index + 1}`}
            className={`thumbnail ${currentIndex === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Mobile Dot Indicators */}
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};
// --- StarRating and getCategoryName functions (No changes) ---
const StarRating = ({ rating = 0 }) => {
  // ... code is identical
  const totalStars = 5;
  const filledStars = Math.round(rating);
  return (
    <div className="star-rating">
      {[...Array(totalStars)].map((_, i) => (<span key={i} className={`star ${i < filledStars ? 'filled' : ''}`}>★</span>))}
    </div>
  );
};
function getCategoryName(id) {
  // ... code is identical
  const cat = allCategories.find((c) => c.id === id);
  return cat ? cat.name : 'Unknown';
}


export default function ServiceDetailsPage() {
  // The rest of your ServiceDetailsPage component logic is exactly the same.
  // No changes are needed here.
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useUser();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchServiceAndReviews = async () => {
      if (!id) return;
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const serviceRes = await axios.get('https://anand-u.vercel.app/provider/allservices');
        const allServices = Array.isArray(serviceRes.data) ? serviceRes.data : [];
        const selectedService = allServices.find((s) => s._id === id);
        setService(selectedService);
        const reviewRes = await axios.get(`https://anand-u.vercel.app/review/serviceReview/${id}`);
        if (reviewRes.data.success) {
          setReviews(reviewRes.data.reviews || []);
          setAvgRating(reviewRes.data.averageRating || 0);
        }
      } catch (err) {
        console.error('❌ Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceAndReviews();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) { alert('Please login to submit a review.'); return; }
    if (!ratingValue) { alert('Please select a rating before submitting.'); return; }
    try {
      setSubmitting(true);
      const res = await axios.post(`https://anand-u.vercel.app/review/givereview`, { serviceId: id, rating: ratingValue, review: reviewText }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        alert(res.data.msg);
        setReviewText('');
        setRatingValue(0);
        setIsReviewFormOpen(false);
        const reviewRes = await axios.get(`https://anand-u.vercel.app/review/serviceReview/${id}`);
        if (reviewRes.data.success) {
          setReviews(reviewRes.data.reviews || []);
          setAvgRating(reviewRes.data.averageRating || 0);
        }
      } else { alert(res.data.msg || 'Failed to submit review'); }
    } catch (err) { console.error('❌ Error submitting review:', err); alert('Error submitting review'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <ServiceDetailsSkeleton />;
  if (!service) return <div className="service-details-page"><p>Service not found.</p></div>;

  const displayRating = avgRating?.toFixed(1) || service.avgRating?.toFixed(1) || 'N/A';

  return (
    <div className="service-details-page">
      <div className={`details-card ${!service.images?.length ? 'no-image' : ''}`}>
        <ImageCarousel images={service.images} serviceName={service.name} />
        <div className="service-info">
          <div className="meta-info">
            <span className="category-tag">
              {service.categories?.name || getCategoryName(service.categoryId || service.category)}
            </span>
            <div className="rating-display">
              <span className="star-icon">★</span>
              <span>{displayRating} ({reviews.length} reviews)</span>
            </div>
          </div>
          <h1>{service.name}</h1>
          <p className="description">{service.description}</p>
          <div className="price-and-cta">
            <p className="price">
              ₹{service.priceInfo?.amount || 0}
              <span>{service.priceInfo?.unit && `/ ${service.priceInfo.unit}`}</span>
            </p>
            <div className="cta-buttons-wrapper">
              <button
                className="cta-button primary"
                onClick={() => {
                  if (!user || !token) {
                    alert("Please login to book this service.");
                    navigate("/login");
                    return;
                  }
                  navigate(`/book/${service._id}`);
                }}
              >
                <CalendarCheck size={20} />
                <span>Book Service</span>
              </button>

              <button className="cta-button secondary" onClick={async () => {
                if (!user || !token) { alert("Please login to start a chat."); return; }
                if (!service?.providers) { alert("Provider info not available."); return; }
                try {
                  const res = await axios.post("https://anand-u.vercel.app/convo/", { providerId: service.providers._id }, { headers: { Authorization: `Bearer ${token}` } });
                  if (res.data && res.data._id) {
                    navigate(`/chat/${res.data._id}`);
                  } else { alert('Could not initiate chat.'); }
                } catch (err) { console.error('Failed to start chat:', err.response?.data || err.message); alert('An error occurred while starting the chat.'); }
              }}>
                <MessageSquare size={20} />
                <span>Chat with Provider</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2 className="reviews-title">Customer Reviews & Ratings</h2>
        {user ? (
          <div className="review-form-container">
            <button onClick={() => setIsReviewFormOpen(!isReviewFormOpen)} className="write-review-toggle-btn">
              {isReviewFormOpen ? 'Cancel' : 'Write a Review'}
            </button>
            <div className={`review-form-collapsible ${isReviewFormOpen ? 'open' : ''}`}>
              <form onSubmit={handleSubmitReview} className="review-form">
                <h3>Share Your Experience</h3>
                <div className="rating-input">
                  {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return <span key={starValue} className={`star ${starValue <= ratingValue ? 'filled' : ''}`} onClick={() => setRatingValue(starValue)}>★</span>;
                  })}
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="What did you like or dislike?" className="review-textarea" required />
                <button type="submit" className="submit-review-btn" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="login-prompt">
            <p>You must be logged in to leave a review.</p>
            <button onClick={() => navigate('/auth')}>Login to Review</button>
          </div>
        )}

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-header">
                  <span className="review-author">{r.user?.fullName || 'Anonymous'}</span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="review-comment">"{r.review}"</p>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <p>🌟</p>
              <h3>No reviews yet.</h3>
              <span>Be the first to share your experience!</span>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}