import React, { useState } from 'react';
import api from '../../services/api';

const ReviewForm = ({ perfumeId, onReviewAdded }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post(`/perfumes/${perfumeId}/reviews`, {
                rating,
                comment
            });
            setSuccess(response.data.message);
            setComment('');
            setRating(5);
            if (onReviewAdded) onReviewAdded(response.data.review);
        } catch (err) {
            console.error("Error submitting review:", err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'envoi de votre avis.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-form-container">
            <h3>Partagez votre expérience</h3>
            <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                    <label>Votre Note</label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= rating ? 'active' : ''}`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="comment">Votre Commentaire (optionnel)</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Qu'avez-vous pensé de ce parfum ?"
                        rows="4"
                    ></textarea>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button
                    type="submit"
                    className="luxury-btn submit-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Envoi en cours...' : 'Publier mon avis'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
