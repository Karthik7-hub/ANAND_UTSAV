// src/pages/ServiceDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/ServiceDetailsPage.css';
import { CalendarCheck } from 'lucide-react';
import { allCategories } from '../data/categoriesData';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const StarRating = ({ rating = 0 }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating);
  return (
    <div className="star-rating">
      {[...Array(totalStars)].map((_, i) => (
        <span key={i} className={i < filledStars ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
    </div>
  );
};

function getCategoryName(id) {
  const cat = allCategories.find((c) => c.id === id);
  return cat ? cat.name : 'Unknown';
}

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useUser();
  const [service, setService] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get('https://anand-u.vercel.app/provider/allservices');
        const allServices = Array.isArray(res.data) ? res.data : [];
        const selectedService = allServices.find((s) => s._id === id);
        setService(selectedService);

        if (selectedService?.images?.length > 0) {
          setMainImage(selectedService.images[0]);
        }
      } catch (err) {
        console.error('❌ Failed to fetch service:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  // ✅ Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`https://anand-u.vercel.app/review/serviceReview/${id}`);
      if (res.data.success) {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.averageRating || 0);
      }
    } catch (err) {
      console.error('❌ Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  // ✅ Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to submit a review.');
      return;
    }
    if (!ratingValue) {
      alert('Please select a rating before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `https://anand-u.vercel.app/review/givereview`,
        {
          serviceId: id,
          rating: ratingValue,
          review: reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        alert(res.data.msg);
        setReviewText('');
        setRatingValue(0);
        await fetchReviews();
      } else {
        alert(res.data.msg || 'Failed to submit review');
      }
    } catch (err) {
      console.error('❌ Error submitting review:', err);
      alert('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="service-details-page">
        <p>Loading service...</p>
      </div>
    );
  if (!service)
    return (
      <div className="service-details-page">
        <p>Service not found.</p>
      </div>
    );

  const hasImages = service.images?.length > 0;

  return (
    <div className="service-details-page">
      <div className={`details-card ${!hasImages ? 'no-image' : ''}`}>
        {hasImages && (
          <div className="service-image-container">
            <img src={mainImage} alt={service.name} className="main-image" />
            <div className="thumbnail-gallery">
              {service.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${service.name} ${i}`}
                  className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="service-info">
          <div className="meta-info">
            <span className="category-tag">
              {service.categories?.name ||
                getCategoryName(service.categoryId || service.category)}
            </span>

            <div className="rating-display">
              <span className="star-icon">★</span>
              <span>{avgRating || service.avgRating || 0}</span>
            </div>
          </div>

          <h1>{service.name}</h1>
          <p className="description">{service.description}</p>

          <div className="price-and-cta">
            <p className="price">
              ₹{service.priceInfo?.amount || 0}{' '}
              {service.priceInfo?.unit && `/ ${service.priceInfo.unit}`}
            </p>
            <button className="cta-button">
              <CalendarCheck size={20} />
              <span>Book Service</span>
            </button>

            {/* Added "Message Me" button below Book Service */}
           {/* <button
              className="cta-button message-button"
              onClick={() => {
                if (!user) {
                  alert('Please login to message the provider.');
                  return;
                }
                // Use a fictional provider ID for testing chat navigation
                const providerId = 'fictional-provider-id-123';

                navigate(`/chat/${providerId}`);
              }}
            >
              💬 Message Me
            </button> */}
            {/* <button
              onClick={() => startChatWithProvider(provider._id)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Chat Now 💬
            </button> */}
              <button
                onClick={async () => {
                  if (!user || !token) {
                    alert("Please login to start a chat with the provider.");
                    return;
                  }
                   console.log("Service Object:", service); 
                  // Ensure you have the provider ID from the service object
                  if (!service?.providers) {
                      alert("Provider information is not available for this service.");
                      return;
                  }

                  try {
                    const res = await axios.post(
                      "https://anand-u.vercel.app/convo/",
                      { providerId: service.providers._id },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    // The backend returns the full conversation object (new or existing)
                    if (res.data && res.data._id) {
                      // Navigate to the chat page, passing the specific conversation ID
                      navigate(`/chat/${res.data._id}`);
                    } else {
                      alert('Could not initiate chat. Please try again.');
                    }
                  } catch (err) {
                    console.error('Failed to start chat:', err.response?.data || err.message);
                    alert('An error occurred while starting the chat.');
                  }
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Chat Now 💬
              </button>
          </div>

          {/* ⭐ Review Section */}
          <div className="reviews-section">
            <h2>Customer Reviews</h2>
            <StarRating rating={avgRating} />
            <p className="average-rating">Average Rating: {avgRating} / 5</p>

            {/* Review Form */}
            {user ? (
              <form onSubmit={handleSubmitReview} className="review-form">
                <h3>Leave a Review</h3>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= ratingValue ? 'filled' : ''}`}
                      onClick={() => setRatingValue(star)}
                      style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review..."
                  className="review-textarea"
                />
                <button type="submit" className="submit-review-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <p>Please login to leave a review.</p>
            )}

            {/* Display Reviews */}
            <div className="review-list">
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <div key={r._id} className="review-item">
                    <div className="review-header">
                      <strong>{r.user?.fullName || 'Anonymous'}</strong>
                      <span className="review-rating">★ {r.rating}</span>
                    </div>
                    <p>{r.review}</p>
                    <small>{new Date(r.createdAt).toLocaleString()}</small>
                  </div>
                ))
              ) : (
                <p>No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
