import React, { useState } from 'react';
import axios from '../api/axios';

export default function FeedbackPage({ userPhone, userName }) {
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
        name: userName || 'Anonymous',
        rating,
        comment,
        date: new Date().toLocaleString(),
      });
      setSubmitted(true);
      setRating(0);
      setComment('');
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container page active">
      <h2 className="section-title">Share Feedback</h2>

      {submitted ? (
        <div className="feedback-page-success">
          <div className="feedback-success-icon">🎉</div>
          <h3>Thank you for your feedback!</h3>
          <p>Your response helps us serve you better.</p>
          <button
            className="welcome-btn"
            style={{ marginTop: '20px', maxWidth: '200px' }}
            onClick={() => setSubmitted(false)}
          >
            Give More Feedback
          </button>
        </div>
      ) : (
        <div className="feedback-page-card">

          <p className="feedback-page-desc">
            We value your opinion! Rate your experience and help us improve.
          </p>

          <label className="feedback-label" style={{ color: 'white' }}>
            Your Rating *
          </label>

          <div className="feedback-stars feedback-stars-large">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`feedback-star feedback-star-large ${star <= (hover || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </span>
            ))}
          </div>

          <p className="feedback-rating-label" style={{ color: '#ffb347', fontSize: '16px', marginBottom: '20px' }}>
            {rating === 0 && 'Select your rating'}
            {rating === 1 && 'Poor 😞'}
            {rating === 2 && 'Fair 😐'}
            {rating === 3 && 'Good 🙂'}
            {rating === 4 && 'Very Good 😊'}
            {rating === 5 && 'Excellent! 🤩'}
          </p>

          <label className="feedback-label" style={{ color: 'white' }}>
            Your Comments (optional)
          </label>
          <textarea
            className="feedback-textarea feedback-textarea-page"
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={5}
          />

          {error && <p className="feedback-error">{error}</p>}

          <button
            className="welcome-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: '16px' }}
          >
            {loading ? 'Submitting...' : 'Submit Feedback ☕'}
          </button>
        </div>
      )}
    </section>
  );
}