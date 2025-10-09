// src/pages/MyReviewsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Star } from 'lucide-react';
import { useUser } from '../context/UserContext';
import '../css/MyReviewPage.css';

const ReviewSkeleton = () => (
  <div className="review-item skeleton-card">
    <div className="review-header">
      <div className="skeleton-line" style={{ width: '40%', height: '1.5rem' }}></div>
      <div className="skeleton-line" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
    </div>
    <div className="skeleton-line" style={{ width: '80%', height: '1rem' }}></div>
    <div className="skeleton-line" style={{ width: '60%', height: '0.8rem' }}></div>
  </div>
);

export default function MyReviewsPage() {
  const { token } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ Fetch user's reviews
  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://anand-u.vercel.app/review/userReview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setReviews(res.data.reviews);
    } catch (err) {
      console.error('❌ Failed to fetch user reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyReviews();
  }, [token]);

  // 🗑️ Delete review from user's review list
  const handleDeleteReview = async (reviewId) => {
    if (!token) {
      alert('Please login to delete your review.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      setDeletingId(reviewId);
      const res = await axios.delete(
        `https://anand-u.vercel.app/review/removereview/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        alert(res.data.msg);
        await fetchMyReviews(); // Refresh list
      } else {
        alert(res.data.msg || 'Failed to delete review');
      }
    } catch (err) {
      console.error('❌ Error deleting review:', err);
      alert('Error deleting review');
    } finally {
      setDeletingId(null);
    }
  };

  // ✨ 2. Render the new skeleton component while loading
  if (loading) {
    return (
      <div className="my-reviews-page">
        <h2>My Reviews</h2>
        <div className="reviews-list">
          {/* Show a few skeleton cards */}
          <ReviewSkeleton />
          <ReviewSkeleton />
          <ReviewSkeleton />
        </div>
      </div>
    );
  }
  return (
    <div className="my-reviews-page">
      <h2>My Reviews</h2>
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r._id} className="review-item">
              <div className="review-header">
                <h3 className="review-service-name">{r.service?.name || 'Deleted Service'}</h3>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteReview(r._id)}
                  disabled={deletingId === r._id}
                  title="Delete review"
                >
                  {deletingId === r._id ? '...' : <Trash2 size={18} />}
                </button>
              </div>
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < r.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="review-text">{r.review}</p>
              <small className="review-date">{new Date(r.createdAt).toLocaleDateString()}</small>
            </div>
          ))
        ) : (
          <div className="no-reviews-placeholder">
            <p>You haven't written any reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
