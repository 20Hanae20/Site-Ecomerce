import React, { useState } from 'react';
import api from '../../services/api';
import { Star, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const ReviewForm = ({ perfumeId, onReviewAdded }) => {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(null);
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
            setSuccess("VOTRE TÉMOIGNAGE A ÉTÉ ENREGISTRÉ AVEC SUCCÈS.");
            setComment('');
            setRating(5);
            if (onReviewAdded) onReviewAdded(response.data.review);

            // Clear success message after 5 seconds
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error("Error submitting review:", err);
            setError(err.response?.data?.message || "UNE ERREUR EST SURVENUE LORS DE L'ENVOI.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-form-wrapper-luxury">
            <h3 className="form-title-luxury font-serif">Partagez votre expérience</h3>
            <p className="form-subtitle-luxury">Votre avis est précieux pour notre maison.</p>

            <form onSubmit={handleSubmit} className="review-form-luxury">
                <div className="form-group-luxury">
                    <label className="gold-label-luxury">VOTRE NOTE</label>
                    <div className="star-rating-luxury">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="star-btn-luxury"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(null)}
                            >
                                <Star
                                    size={28}
                                    fill={(hover || rating) >= star ? "var(--primary)" : "transparent"}
                                    color={(hover || rating) >= star ? "var(--primary)" : "rgba(255,255,255,0.2)"}
                                    style={{ transition: 'all 0.2s ease' }}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group-luxury">
                    <label htmlFor="comment" className="gold-label-luxury">VOTRE COMMENTAIRE (OPTIONNEL)</label>
                    <textarea
                        id="comment"
                        className="textarea-luxury"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Qu'avez-vous pensé de ce parfum ?"
                        rows="4"
                    ></textarea>
                </div>

                {error && (
                    <div className="message-luxury error animate-fade-in">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="message-luxury success animate-fade-in">
                        <CheckCircle2 size={16} />
                        <span>{success}</span>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-premium btn-submit-luxury"
                    disabled={isSubmitting}
                >
                    <Send size={18} />
                    {isSubmitting ? 'TRANSMISSION...' : 'PUBLIER MON AVIS'}
                </button>
            </form>

            <style>{`
                .review-form-wrapper-luxury {
                    position: relative;
                }

                .form-title-luxury {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }

                .form-subtitle-luxury {
                    font-size: 0.8rem;
                    opacity: 0.5;
                    margin-bottom: 2.5rem;
                    letter-spacing: 0.5px;
                }

                .form-group-luxury {
                    margin-bottom: 2rem;
                }

                .gold-label-luxury {
                    display: block;
                    font-size: 0.65rem;
                    color: var(--primary);
                    letter-spacing: 2px;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }

                .star-rating-luxury {
                    display: flex;
                    gap: 0.5rem;
                }

                .star-btn-luxury {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    outline: none;
                }

                .star-btn-luxury:hover {
                    transform: scale(1.1);
                }

                .textarea-luxury {
                    width: 100%;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 1.2rem;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.95rem;
                    resize: none;
                    transition: all 0.3s ease;
                }

                .textarea-luxury:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(255,255,255,0.05);
                    box-shadow: 0 0 15px var(--glass-glow);
                }

                .btn-submit-luxury {
                    width: 100%;
                    padding: 1rem;
                    gap: 0.8rem;
                    margin-top: 1rem;
                }

                .message-luxury {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                }

                .message-luxury.error {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                .message-luxury.success {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }
            `}</style>
        </div>
    );
};

export default ReviewForm;
