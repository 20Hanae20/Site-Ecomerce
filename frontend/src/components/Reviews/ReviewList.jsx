import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Star, CheckCircle, Quote } from 'lucide-react';

const ReviewList = ({ perfumeId }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchReviews = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/perfumes/${perfumeId}/reviews?page=${page}`);
            setReviews(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setIsLoading(false);
        }
    }, [perfumeId, page]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                fill={i < rating ? "var(--primary)" : "transparent"}
                color={i < rating ? "var(--primary)" : "rgba(255,255,255,0.2)"}
            />
        ));
    };

    if (isLoading && page === 1) return (
        <div className="reviews-loader-luxury">
            <div className="premium-loader thin"></div>
            <span>LECTURE DES TÉMOIGNAGES...</span>
        </div>
    );

    return (
        <div className="reviews-wrapper-luxury">
            <h2 className="reviews-title-luxury font-serif">
                Avis des Clients <span className="count">({pagination?.total || 0})</span>
            </h2>

            {reviews.length === 0 ? (
                <div className="no-reviews-luxury glass-premium">
                    <Quote className="quote-icon" size={24} />
                    <p>Aucun avis pour le moment. Soyez le premier à partager votre expérience d'exception.</p>
                </div>
            ) : (
                <div className="reviews-list-container">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card-luxury glass-premium animate-fade-in">
                            <div className="review-card-header">
                                <div className="reviewer-meta">
                                    <div className="reviewer-avatar-luxury">
                                        {review.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="reviewer-details">
                                        <div className="reviewer-name-row">
                                            <span className="reviewer-name">{review.user?.name}</span>
                                            {review.is_approved && (
                                                <span className="verified-badge-luxury">
                                                    <CheckCircle size={12} />
                                                    ACHAT VÉRIFIÉ
                                                </span>
                                            )}
                                        </div>
                                        <div className="review-stars-row">
                                            {renderStars(review.rating)}
                                            <span className="review-date-luxury">
                                                {new Date(review.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="review-card-body">
                                <p className="review-comment-luxury">{review.comment}</p>
                            </div>
                        </div>
                    ))}

                    {pagination && pagination.last_page > 1 && (
                        <div className="pagination-luxury">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="btn-pagination-luxury"
                            >
                                PRÉCÉDENT
                            </button>
                            <span className="page-indicator-luxury">{page} / {pagination.last_page}</span>
                            <button
                                disabled={page === pagination.last_page}
                                onClick={() => setPage(page + 1)}
                                className="btn-pagination-luxury"
                            >
                                SUIVANT
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .reviews-wrapper-luxury {
                    margin-bottom: 2rem;
                }

                .reviews-title-luxury {
                    font-size: 1.8rem;
                    margin-bottom: 2.5rem;
                    letter-spacing: 1px;
                }

                .reviews-title-luxury .count {
                    font-size: 0.9rem;
                    opacity: 0.5;
                    font-family: 'Inter', sans-serif;
                    margin-left: 0.5rem;
                }

                .review-card-luxury {
                    padding: 2.5rem;
                    border-radius: 20px;
                    margin-bottom: 1.5rem;
                    transition: all 0.4s ease;
                }

                .review-card-luxury:hover {
                    transform: translateX(10px);
                    border-color: var(--primary);
                }

                .reviewer-meta {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }

                .reviewer-avatar-luxury {
                    width: 50px;
                    height: 50px;
                    background: var(--grad-gold);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #000;
                    font-weight: 800;
                    font-size: 1.2rem;
                    box-shadow: 0 0 15px var(--primary-glow);
                }

                .reviewer-details {
                    flex: 1;
                }

                .reviewer-name-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.4rem;
                }

                .reviewer-name {
                    font-weight: 600;
                    font-size: 0.95rem;
                    letter-spacing: 0.5px;
                }

                .verified-badge-luxury {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.65rem;
                    color: var(--primary);
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .review-stars-row {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }

                .review-date-luxury {
                    font-size: 0.75rem;
                    opacity: 0.4;
                    font-weight: 500;
                }

                .review-comment-luxury {
                    margin-top: 1.5rem;
                    font-size: 1rem;
                    line-height: 1.6;
                    opacity: 0.85;
                    font-style: italic;
                    color: rgba(255,255,255,0.9);
                }

                .no-reviews-luxury {
                    padding: 4rem;
                    text-align: center;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }

                .quote-icon {
                    color: var(--primary);
                    opacity: 0.5;
                }

                .pagination-luxury {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    margin-top: 3rem;
                }

                .btn-pagination-luxury {
                    background: transparent;
                    border: 1px solid var(--glass-border);
                    color: #fff;
                    padding: 0.6rem 1.5rem;
                    border-radius: 5px;
                    font-size: 0.7rem;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-pagination-luxury:hover:not(:disabled) {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: rgba(212, 175, 55, 0.05);
                }

                .page-indicator-luxury {
                    font-size: 0.8rem;
                    opacity: 0.6;
                }

                .reviews-loader-luxury {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 4rem;
                }

                .thin { border-width: 2px; width: 30px; height: 30px; }
            `}</style>
        </div>
    );
};

export default ReviewList;
