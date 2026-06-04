import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Star, Package, Heart, Sparkles, Tag, ArrowRight, Compass } from 'lucide-react';
import api from '../../services/api';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [orders, setOrders] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, recsRes] = await Promise.all([
                    api.get('/orders'),
                    api.get('/recommendations/dashboard').catch(() => ({ data: { data: { recommendations: [] } } }))
                ]);
                
                setOrders(ordersRes.data.data || []);
                setRecommendations(recsRes.data.data?.recommendations?.slice(0, 3) || []);
                
                // Fetch mock favorites or products
                const perfumesRes = await api.get('/perfumes?per_page=3');
                setFavorites(perfumesRes.data.data || []);
            } catch (err) {
                console.error("Error fetching client dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Calculate spent
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const loyaltyPoints = Math.round(totalSpent * 0.1); // 1 point per 10€

    if (loading) {
        return (
            <div className="analytics-loader">
                <div className="loader-spinner" />
                <p>Création de votre cocon olfactif...</p>
            </div>
        );
    }

    const coupons = [
        { code: 'AURA15', discount: '15%', desc: 'Sur toute la collection', expiry: '30/06/2026' },
        { code: 'NOCTURNE20', discount: '20%', desc: 'Sur la gamme Oud & Cèdre', expiry: '15/07/2026' }
    ];

    return (
        <div className="client-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Welcome Banner */}
            <div className="glass-premium" style={{ padding: '2.5rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            Bonjour, <span className="gradient-text-gold">{user.name?.split(' ')[0]}</span> ✨
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ravi de vous revoir. Votre signature olfactive vous attend.</p>
                    </div>
                    <Link to="/client/quiz" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <Sparkles size={16} /> Faire le Quiz Parfum
                    </Link>
                </div>
            </div>

            {/* KPIs */}
            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="kpi-card" style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                        <Package size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Commandes passées</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{orders.length}</div>
                    </div>
                </div>

                <div className="kpi-card" style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Montant dépensé</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalSpent.toFixed(2)} €</div>
                    </div>
                </div>

                <div className="kpi-card" style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <Star size={24} fill="#f59e0b" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Points fidélité</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{loyaltyPoints} pts</div>
                    </div>
                </div>
            </div>

            {/* Main Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Recommendations Section */}
                    <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={18} className="gold-text" /> Révélations IA
                            </h3>
                            <Link to="/client/recommendations" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                Voir tout <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
                            </Link>
                        </div>

                        {recommendations.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                {recommendations.map((rec, idx) => (
                                    <div key={idx} style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ height: '140px', background: 'var(--bg-alt)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                            {rec.perfume.image_url ? (
                                                <img src={rec.perfume.image_url} alt={rec.perfume.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <Compass size={32} style={{ color: 'var(--primary)', opacity: 0.3 }} />
                                            )}
                                            <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '20px', fontWeight: 700 }}>
                                                {rec.match_percentage}% Match
                                            </span>
                                        </div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.75rem', color: 'var(--text-main)' }}>{rec.perfume.name}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem' }}>{rec.perfume.brand}</p>
                                        <Link to={`/client/catalog`} className="btn btn-secondary btn-sm" style={{ width: '100%', textDecoration: 'none', display: 'inline-block' }}>Commander</Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '16px' }}>
                                <p style={{ color: 'var(--text-muted)' }}>Faites le quiz pour débloquer vos recommandations personnalisées.</p>
                                <Link to="/client/quiz" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem', textDecoration: 'none', display: 'inline-block' }}>Démarrer le voyage</Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Orders */}
                    <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package size={18} /> Commandes Récentes
                            </h3>
                            <Link to="/client/orders" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                Tout voir <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
                            </Link>
                        </div>

                        {orders.length > 0 ? (
                            <div className="table-responsive">
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>N° Commande</th>
                                            <th>Total</th>
                                            <th>Statut</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.slice(0, 4).map((order) => (
                                            <tr key={order.id}>
                                                <td><strong>#{order.order_number}</strong></td>
                                                <td>{parseFloat(order.total).toFixed(2)} €</td>
                                                <td>
                                                    <span className={`badge ${order.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Aucune commande récente.</p>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Coupons Section */}
                    <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Tag size={18} /> Offres & Coupons
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {coupons.map((coupon, idx) => (
                                <div key={idx} style={{ border: '1px dashed var(--primary)', background: 'rgba(37, 99, 235, 0.02)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Réduction de {coupon.discount}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.25rem 0' }}>{coupon.code}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{coupon.desc}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Expire le<br /><strong>{coupon.expiry}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Favorites Section */}
                    <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Heart size={18} /> Mes Favoris
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {favorites.slice(0, 3).map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'var(--bg-alt)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Compass size={20} style={{ color: 'var(--primary)' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.brand}</div>
                                    </div>
                                    <div>
                                        <strong>{parseFloat(item.price).toFixed(2)} €</strong>
                                    </div>
                                </div>
                            ))}
                            <Link to="/client/favorites" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}>
                                Gérer ma liste <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
