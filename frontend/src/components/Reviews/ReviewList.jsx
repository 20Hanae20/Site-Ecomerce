import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ReviewList = ({ perfumeId }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [perfumeId, page]);

    const fetchReviews = async () => {
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
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (isLoading && page === 1) return <div className="reviews-loader">Chargement des avis...</div>;

    return (
        <div className="reviews-section">
            <h2 className="section-title">Avis des Clients ({pagination?.total || 0})</h2>

            {reviews.length === 0 ? (
                <div className="no-reviews">
                    <p>Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
                </div>
            ) : (
                <div className="reviews-container">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <span className="reviewer-name">{review.user?.name}</span>
                                    {review.is_verified_purchase && (
                                        <span className="verified-badge">✓ Achat Vérifié</span>
                                    )}
                                </div>
                                <div className="review-rating">
                                    <span className="stars">{renderStars(review.rating)}</span>
                                    <span className="review-date">
                                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                            <div className="review-body">
                                <p className="review-comment">{review.comment}</p>
                            </div>
                        </div>
                    ))}

                    {pagination && pagination.last_page > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="pagination-btn"
                            >
                                Précédent
                            </button>
                            <span className="page-info">Page {page} sur {pagination.last_page}</span>
                            <button
                                disabled={page === pagination.last_page}
                                onClick={() => setPage(page + 1)}
                                className="pagination-btn"
                            >
                                Suivant
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewList;
