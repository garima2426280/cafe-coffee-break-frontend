import React, { useState } from 'react';
import axios from '../api/axios';

export default function FeedbackModal({ onClose, userPhone, userName, orderId }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/feedback', {
        phone: userPhone,
        name: userName,
        rating,
        comment,
        orderId,
        date: new Date().toLocaleString(),
      });
      setSubmitted(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-overlay">
      <div className="feedback-modal">

        {submitted ? (
          <div className="feedback-success">
            <div className="feedback-success-icon">🎉</div>
            <h3>Thank you for your feedback!</h3>
            <p>Your response helps us improve.</p>
          </div>
        ) : (
          <>
            <div className="feedback-header">
              <h2 className="feedback-title">Rate Your Experience</h2>
              <p className="feedback-subtitle">How was your order today?</p>
              <button className="feedback-close" onClick={onClose}>×</button>
            </div>

            <div className="feedback-divider" />

            {/* STAR RATING */}
            <div className="feedback-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`feedback-star ${star <= (hover || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </span>
              ))}
            </div>

            <p className="feedback-rating-label">
              {rating === 1 && 'Poor 😞'}
              {rating === 2 && 'Fair 😐'}
              {rating === 3 && 'Good 🙂'}
              {rating === 4 && 'Very Good 😊'}
              {rating === 5 && 'Excellent! 🤩'}
            </p>

            {/* COMMENT */}
            <label className="feedback-label">Comments (optional)</label>
            <textarea
              className="feedback-textarea"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />

            {error && <p className="feedback-error">{error}</p>}

            <div className="feedback-actions">
              <button className="feedback-skip" onClick={onClose}>
                Skip
              </button>
              <button
                className="feedback-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}