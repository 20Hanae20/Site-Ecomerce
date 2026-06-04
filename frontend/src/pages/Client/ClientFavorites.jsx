import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/useCart';
import api, { API_HOST } from '../../services/api';
import { Heart, ShoppingCart, Trash2, Box, Compass } from 'lucide-react';

const getPerfumeImage = (perfume) => {
    if (perfume.image_url) {
        if (perfume.image_url.startsWith('http://') || perfume.image_url.startsWith('https://')) {
            return perfume.image_url;
        }
        return `${API_HOST}${perfume.image_url}`;
    }
    return null;
};

const ClientFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [addingIds, setAddingIds] = useState(new Set());

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                // Fetch mock favorites (just query top 3 perfumes as default favorites for demonstration)
                const response = await api.get('/perfumes?per_page=3');
                setFavorites(response.data.data || []);
            } catch (err) {
                console.error("Error fetching favorites", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const handleRemoveFavorite = (id) => {
        setFavorites(favorites.filter(fav => fav.id !== id));
    };

    const handleAddToCart = async (perfumeId) => {
        setAddingIds(prev => new Set(prev).add(perfumeId));
        await addToCart(perfumeId, 1);
        setAddingIds(prev => {
            const next = new Set(prev);
            next.delete(perfumeId);
            return next;
        });
    };

    if (loading) {
        return (
            <div className="analytics-loader">
                <div className="loader-spinner" />
                <p>Extraction de vos coups de cœur...</p>
            </div>
        );
    }

    return (
        <div className="client-favorites" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>{favorites.length} parfums enregistrés dans vos coups de cœur.</p>
            </div>

            {favorites.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {favorites.map(perfume => (
                        <div key={perfume.id} className="glass-premium" style={{ display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden', padding: '1rem', background: '#fff', border: '1px solid var(--border-light)' }}>
                            <div style={{ height: '220px', background: 'var(--bg-alt)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyCenter: 'center', overflow: 'hidden', position: 'relative' }}>
                                {getPerfumeImage(perfume) ? (
                                    <img src={getPerfumeImage(perfume)} alt={perfume.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <Compass size={40} style={{ color: 'var(--primary)', opacity: 0.2 }} />
                                )}
                                <button
                                    onClick={() => handleRemoveFavorite(perfume.id)}
                                    style={{ position: 'absolute', top: '10px', right: '10px', border: 'none', background: '#fff', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}
                                >
                                    <Heart size={16} fill="#ef4444" />
                                </button>
                            </div>
                            <div style={{ padding: '1rem 0 0', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{perfume.brand}</div>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{perfume.name}</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{perfume.category?.name || 'Fragrance d\'Exception'}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{parseFloat(perfume.price).toFixed(2)} €</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleRemoveFavorite(perfume.id)}
                                            className="btn btn-secondary btn-sm"
                                            style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                            title="Retirer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleAddToCart(perfume.id)}
                                            disabled={addingIds.has(perfume.id) || perfume.stock_quantity === 0}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <ShoppingCart size={14} />
                                            {addingIds.has(perfume.id) ? '...' : (perfume.stock_quantity === 0 ? 'Rupture' : 'Prendre')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-premium" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <Heart size={48} style={{ color: 'var(--text-muted)', opacity: 0.2 }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Votre liste est vide</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Enregistrez vos essences coups de cœur dans le catalogue pour les retrouver facilement ici.</p>
                    <Link to="/client/catalog" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Découvrir le Catalogue</Link>
                </div>
            )}
        </div>
    );
};

export default ClientFavorites;
