import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MessageSquare, Check, X, Trash2, Star, User, Package } from 'lucide-react';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await api.get('/admin/reviews');
            setReviews(response.data.data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleApproval = async (review) => {
        try {
            const response = await api.patch(`/reviews/${review.id}/toggle-approval`);
            setReviews(reviews.map(r => r.id === review.id ? { ...r, is_approved: response.data.is_approved } : r));
            setMessage({ text: response.data.message, type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error("Failed to toggle approval", err);
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm("Action définitive : Supprimer cet avis de la Maison ?")) return;
        try {
            await api.delete(`/reviews/${id}`);
            setReviews(reviews.filter(r => r.id !== id));
            setMessage({ text: "Avis retiré avec succès", type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error("Failed to delete review", err);
        }
    };

    if (isLoading) return <div className="loader">Lecture des Murmures...</div>;

    const stats = {
        total: reviews.length,
        pending: reviews.filter(r => !r.is_approved).length,
        public: reviews.filter(r => r.is_approved).length
    };

    return (
        <div className="admin-page-container">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Modération des <span className="gradient-text-gold">Avis</span></h1>
                    <p>Veillez à l'élégance des retours de votre clientèle avec discernement.</p>
                </div>
            </header>

            {/* Stats Row */}
            <div className="admin-stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Témoignages</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: 'white' }}>{stats.total}</div>
                </div>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>En Examen</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: '#f59e0b' }}>{stats.pending}</div>
                </div>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Publiés</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: '#10b981' }}>{stats.public}</div>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ borderRadius: '14px', marginBottom: '2rem' }}>
                    {message.text}
                </div>
            )}

            <div className="admin-table-container">
                <table className="premium-table-refined">
                    <thead>
                        <tr>
                            <th>Auteur / Date</th>
                            <th>Fragrance</th>
                            <th>Commentaire</th>
                            <th>Note</th>
                            <th>Statut</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>Aucun avis à modérer pour le moment.</td></tr>
                        ) : (
                            reviews.map(review => (
                                <tr key={review.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="avatar-refined" style={{ width: '38px', height: '38px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)' }}>
                                                {review.user?.name[0] || <User size={14} />}
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontWeight: '600', color: 'white', fontSize: '0.9rem' }}>{review.user?.name}</span>
                                                <span style={{ display: 'block', opacity: 0.4, fontSize: '0.75rem' }}>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontSize: '0.85rem' }}>
                                            <Package size={14} style={{ opacity: 0.6 }} />
                                            <span style={{ fontWeight: '500' }}>{review.perfume?.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{
                                            maxWidth: '350px',
                                            fontSize: '0.85rem',
                                            color: 'rgba(255,255,255,0.6)',
                                            fontStyle: 'italic',
                                            lineHeight: '1.5'
                                        }}>
                                            "{review.comment}"
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    fill={i < review.rating ? "var(--primary)" : "none"}
                                                    stroke={i < review.rating ? "var(--primary)" : "rgba(255,255,255,0.1)"}
                                                    style={{ opacity: i < review.rating ? 1 : 0.4 }}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            color: review.is_approved ? '#10b981' : '#f59e0b',
                                            background: review.is_approved ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                            padding: '0.3rem 0.75rem',
                                            borderRadius: '20px',
                                            border: `1px solid ${review.is_approved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'}`,
                                            width: 'fit-content'
                                        }}>
                                            {review.is_approved ? <Check size={12} /> : <MessageSquare size={12} />}
                                            {review.is_approved ? 'Public' : 'Examen'}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                className={`icon-btn ${review.is_approved ? '' : 'active'}`}
                                                title={review.is_approved ? 'Suspendre' : 'Approuver'}
                                                onClick={() => toggleApproval(review)}
                                                style={{
                                                    background: !review.is_approved ? 'var(--grad-gold)' : 'rgba(255,255,255,0.03)',
                                                    color: !review.is_approved ? 'black' : 'white',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                {review.is_approved ? <X size={16} /> : <Check size={16} />}
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                title="Supprimer"
                                                onClick={() => deleteReview(review.id)}
                                                style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReviews;
