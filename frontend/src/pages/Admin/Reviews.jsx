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

    return (
        <div className="admin-content-inner">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Modération des <span className="gradient-text-gold">Avis</span></h1>
                    <p>Veillez à l'élégance des retours de votre clientèle.</p>
                </div>
            </header>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="admin-table-container glass-premium">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Auteur / Date</th>
                            <th>Fragrance</th>
                            <th>Expérience</th>
                            <th>Note</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>Aucun avis à modérer pour le moment.</td></tr>
                        ) : (
                            reviews.map(review => (
                                <tr key={review.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div className="avatar" style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', color: 'white' }}><User size={14} /></div>
                                            <div>
                                                <strong style={{ display: 'block' }}>{review.user?.name}</strong>
                                                <small style={{ opacity: 0.5 }}>{new Date(review.created_at).toLocaleDateString('fr-FR')}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                            <Package size={14} />
                                            <span>{review.perfume?.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '300px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                                            "{review.comment}"
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', color: 'var(--primary)' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "var(--primary)" : "none"} opacity={i < review.rating ? 1 : 0.2} />
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${review.is_approved ? 'active' : 'inactive'}`}>
                                            {review.is_approved ? 'Public' : 'En examen'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className={`icon-btn ${review.is_approved ? '' : 'active'}`}
                                            title={review.is_approved ? 'Masquer' : 'Approuver'}
                                            onClick={() => toggleApproval(review)}
                                            style={!review.is_approved ? { background: 'var(--primary)', color: 'black' } : {}}
                                        >
                                            {review.is_approved ? <X size={16} /> : <Check size={16} />}
                                        </button>
                                        <button className="icon-btn delete" title="Supprimer" onClick={() => deleteReview(review.id)}>
                                            <Trash2 size={16} />
                                        </button>
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
