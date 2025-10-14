import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/ServiceDetailsPage.css';
import { CalendarCheck, MessageSquare, ChevronLeft, ChevronRight, User as UserIcon, MapPin, Briefcase } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import ServiceDetailsSkeleton from '../components/ServiceDetailsSkeleton';

// --- Reusable Components within this file ---

const ImageCarousel = ({ images, serviceName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
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

  const goToSlide = (index) => setCurrentIndex(index);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) goToNext();
    else if (isRightSwipe) goToPrevious();
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return <img src={images[0]} alt={serviceName} className="main-image static-image" />;
  }

  return (
    <div className="carousel-container">
      <div className="carousel-main-image-wrapper" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className="carousel-slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((img, index) => (
            <img key={index} src={img} alt={`${serviceName} - Image ${index + 1}`} className="main-image" />
          ))}
        </div>
        <button onClick={goToPrevious} className="carousel-nav-btn prev"><ChevronLeft size={28} /></button>
        <button onClick={goToNext} className="carousel-nav-btn next"><ChevronRight size={28} /></button>
      </div>
      <div className="carousel-thumbnails">
        {images.map((img, index) => (
          <img key={index} src={img} alt={`${serviceName} thumbnail ${index + 1}`} className={`thumbnail ${currentIndex === index ? 'active' : ''}`} onClick={() => goToSlide(index)} />
        ))}
      </div>
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button key={index} className={`dot ${currentIndex === index ? 'active' : ''}`} onClick={() => goToSlide(index)} />
        ))}
      </div>
    </div>
  );
};

const ProviderInfoCard = ({ provider }) => {
  if (!provider) return null;
  const totalServices = provider.services?.length || 0;
  const totalBookings = [...(provider.completedBookings || []), ...(provider.newBookings || []), ...(provider.upComingBookings || [])].length;

  return (
    <div className="provider-info-card">
      <div className="provider-header">
        <UserIcon size={32} className="provider-icon" />
        <div className="provider-title">
          <h2>Provider Information</h2>
          <span>Meet the professional behind the service.</span>
        </div>
      </div>
      <div className="provider-details">
        <h3>{provider.name}</h3>
        <div className="provider-meta">
          <span className="meta-item"><MapPin size={16} /> {provider.location}</span>
          <span className="meta-item"><Briefcase size={16} /> {totalServices} services listed</span>
          <span className="meta-item"><CalendarCheck size={16} /> {totalBookings} bookings handled</span>
        </div>
      </div>
    </div>
  );
};

const StarRating = ({ rating = 0 }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating);
  return (
    <div className="star-rating">
      {[...Array(totalStars)].map((_, i) => (<span key={i} className={`star ${i < filledStars ? 'filled' : ''}`}>★</span>))}
    </div>
  );
};

// Helper to correctly parse the images array from the API
// --- Reusable Components (ImageCarousel, ProviderInfoCard, etc.) ---
// ... (These are unchanged)

// ✅ REPLACE the old parseImages function with this new, robust version.
const parseImages = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }
  const parsed = images.map(img => {
    if (typeof img === 'string') {
      return img;
    }
    if (typeof img === 'object' && img !== null && typeof img.url === 'string') {
      return img.url;
    }
    if (typeof img === 'object' && img !== null && typeof img['0'] === 'string') {
      return Object.keys(img)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .map(key => img[key])
        .join('');
    }
    return null;
  });
  return parsed.filter(Boolean);
};

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useUser();
  const { showDialog } = useTheme();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  useEffect(() => {
    const fetchServiceAndReviews = async () => {
      if (!id) return;
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        const serviceRes = await axios.get(`https://anand-u.vercel.app/provider/getServiceById/${id}`);
        if (serviceRes.data && serviceRes.data.service) {
          setService(serviceRes.data.service);
        }
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
    if (!token) {
      showDialog({ title: 'Login Required', message: 'Please log in to submit a review.', type: 'warning' });
      return;
    }
    if (!ratingValue) {
      showDialog({ title: 'Rating Required', message: 'Please select a star rating before submitting.', type: 'warning' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(`https://anand-u.vercel.app/review/givereview`, { serviceId: id, rating: ratingValue, review: reviewText }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        showDialog({ title: 'Success!', message: res.data.msg, type: 'success' });
        setReviewText('');
        setRatingValue(0);
        setIsReviewFormOpen(false);
        const reviewRes = await axios.get(`https://anand-u.vercel.app/review/serviceReview/${id}`);
        if (reviewRes.data.success) {
          setReviews(reviewRes.data.reviews || []);
          setAvgRating(reviewRes.data.averageRating || 0);
        }
      } else {
        showDialog({ title: 'Submission Failed', message: res.data.msg || 'Failed to submit review', type: 'error' });
      }
    } catch (err) {
      console.error('❌ Error submitting review:', err);
      showDialog({ title: 'Error', message: 'An unexpected error occurred while submitting your review.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ServiceDetailsSkeleton />;
  if (!service) return <div className="service-details-page"><p>Service not found.</p></div>;

  const parsedImages = parseImages(service.images);
  const displayRating = avgRating?.toFixed(1) || service.avgRating?.toFixed(1) || 'N/A';
  const categoryName = service.categories?.name || 'Uncategorized';

  return (
    <div className="service-details-page">
      <div className={`details-card ${!parsedImages.length ? 'no-image' : ''}`}>
        <ImageCarousel images={parsedImages} serviceName={service.name} />
        <div className="service-info">
          <div className="meta-info">
            <span className="category-tag">{categoryName}</span>
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
              <button className="cta-button primary" onClick={() => {
                if (!user) {
                  showDialog({ title: "Login Required", message: "You need to be logged in to book a service.", confirmText: "Go to Login", onConfirm: () => navigate('/login') });
                  return;
                }
                navigate(`/book/${service._id}`);
              }}>
                <CalendarCheck size={20} />
                <span>Book Service</span>
              </button>
              <button className="cta-button secondary" onClick={async () => {
                if (!user) {
                  showDialog({ title: "Login Required", message: "Please log in to start a chat with the provider.", confirmText: "Go to Login", onConfirm: () => navigate('/login') });
                  return;
                }
                if (!service?.providers?._id) {
                  showDialog({ title: "Unavailable", message: "Provider information is not available for chat.", type: 'info' });
                  return;
                }
                try {
                  const res = await axios.post("https://anand-u.vercel.app/convo/", { providerId: service.providers._id }, { headers: { Authorization: `Bearer ${token}` } });
                  if (res.data && res.data._id) {
                    navigate(`/chat/${res.data._id}`);
                  } else {
                    showDialog({ title: "Failed", message: "Could not initiate chat.", type: 'error' });
                  }
                } catch (err) {
                  console.error('Failed to start chat:', err.response?.data || err.message);
                  showDialog({ title: "Error", message: "An error occurred while starting the chat.", type: 'error' });
                }
              }}>
                <MessageSquare size={20} />
                <span>Chat with Provider</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProviderInfoCard provider={service.providers} />

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
            <button onClick={() => navigate('/login')}>Login to Review</button>
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