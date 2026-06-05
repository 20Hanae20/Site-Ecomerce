import { useState, useEffect } from 'react';
import { useCart } from '../context/useCart';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getImageUrl } from '../utils/getImageUrl';
import { Trash2, Plus, Minus, ShoppingBag, MapPin, ArrowRight, Sparkles, Compass, Gift, Shield, ChevronRight } from 'lucide-react';

const Cart = () => {
    const { cart, total, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationsUnavailable, setRecommendationsUnavailable] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAddresses();
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await api.get('/recommendations/dashboard');
            setRecommendations(response.data.data?.recommendations || []);
        } catch (err) {
            if (err.response?.status === 403) {
                setRecommendations([]);
                setRecommendationsUnavailable(true);
                return;
            }
            console.error('Error fetching recommendations in cart:', err);
            setRecommendations([]);
        }
    };

    const fetchAddresses = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
            if (response.data.length > 0) {
                setSelectedAddress(response.data[0].id);
            }
        } catch (err) {
            console.error('Fetch addresses error:', err);
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddress) {
            alert('Veuillez sélectionner une adresse de livraison');
            return;
        }

        setIsCheckingOut(true);
        const token = localStorage.getItem('token');
        try {
            const response = await api.post('/orders', { shipping_address_id: selectedAddress });

            navigate('/checkout', { state: { orderId: response.data.order.id } });
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la création de la commande');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (loading) return (
        <div className="container py-5 text-center">
            <div className="cart-spinner"></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Chargement du panier...</p>
        </div>
    );

    if (error) return (
        <div className="container py-5">
            <div className="saas-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger)' }}>
                <p style={{ color: 'var(--danger)' }}>{error}</p>
            </div>
        </div>
    );

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container cart-empty-state py-5">
                <div className="saas-card empty-card">
                    <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
                    <h2>Votre panier est vide</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Parcourez notre catalogue pour découvrir nos produits.</p>
                    <Link to="/perfumes" className="btn btn-primary">
                        Explorer le catalogue <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container cart-page py-5">
            <header className="cart-header">
                <h1>Panier</h1>
                <span className="badge badge-primary">{cart.items.length} article{cart.items.length > 1 ? 's' : ''}</span>
            </header>

            <div className="cart-layout">
                {/* Items Column */}
                <div className="cart-items-col">
                    {cart.items.map((item) => (
                        <div key={item.id} className="saas-card cart-item">
                            <div className="item-image">
                                {getImageUrl(item.perfume.image_url) ? (
                                    <img src={getImageUrl(item.perfume.image_url)} alt={item.perfume.name} />
                                ) : (
                                    <div className="item-placeholder">
                                        <Package size={24} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                )}
                            </div>

                            <div className="item-details">
                                <span className="item-cat">{item.perfume.category?.name || 'Parfum'}</span>
                                <h3 className="item-name">{item.perfume.name}</h3>
                                <span className="item-unit-price">{item.perfume.price} € / unité</span>
                            </div>

                            <div className="item-actions">
                                <div className="qty-control">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                        <Minus size={14} />
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.perfume.stock}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <button className="btn-remove" onClick={() => removeFromCart(item.id)} title="Supprimer">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="item-line-total">
                                <span>{(item.perfume.price * item.quantity).toFixed(2)} €</span>
                            </div>
                        </div>
                    ))}

                    <button className="btn btn-secondary btn-sm" onClick={clearCart} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                        <Trash2 size={14} /> Vider le panier
                    </button>
                </div>

                {/* Summary Sidebar */}
                <aside className="cart-summary-col">
                    <div className="saas-card summary-card">
                        <h3>Résumé de la commande</h3>
                        <div className="summary-line">
                            <span>Sous-total</span>
                            <span>{total.toFixed(2)} €</span>
                        </div>
                        <div className="summary-line">
                            <span>Livraison</span>
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Offerte</span>
                        </div>

                        <div className="summary-total">
                            <span>Total</span>
                            <span className="total-amount">{total.toFixed(2)} €</span>
                        </div>

                        {addresses.length > 0 ? (
                            <div className="checkout-section">
                                <div className="form-group">
                                    <label className="form-label">
                                        <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                        Adresse de livraison
                                    </label>
                                    <select className="form-input" value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.street}, {addr.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} onClick={handleCheckout} disabled={isCheckingOut}>
                                    {isCheckingOut ? 'Validation...' : 'Passer la commande'}
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="no-address-section">
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    Connectez-vous ou ajoutez une adresse pour passer commande.
                                </p>
                                <Link to="/profile" className="btn btn-secondary" style={{ width: '100%' }}>
                                    Ajouter une adresse
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="saas-card benefits-card">
                        <div className="benefit-item">
                            <Gift size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <span>Échantillon offert sur demande</span>
                        </div>
                        <div className="benefit-item">
                            <Shield size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <span>Emballage soigné et sécurisé</span>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <section className="cart-recs">
                    <h2>Vous pourriez aussi aimer</h2>
                    <div className="recs-grid">
                        {recommendations.slice(0, 4).map((rec, idx) => (
                            <div key={idx} className="saas-card rec-card" onClick={() => navigate(`/perfumes/${rec.perfume.id}`)} style={{ cursor: 'pointer' }}>
                                <div className="rec-img">
                                    <img src={getImageUrl(rec.perfume.image_url)} alt={rec.perfume.name} />
                                    <span className="badge badge-primary" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                                        {rec.match_percentage}% match
                                    </span>
                                </div>
                                <div className="rec-info">
                                    <h4>{rec.perfume.name}</h4>
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{rec.perfume.price} €</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {recommendationsUnavailable && (
                <section className="cart-recs-unavailable">
                    <div className="saas-card rec-unavailable-card">
                        <h2>Recommandations indisponibles</h2>
                        <p>Votre compte ne dispose pas de l’accès aux recommandations pour le moment.</p>
                    </div>
                </section>
            )}

            <style>{`
                .cart-page { padding-bottom: 6rem; }

                .cart-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-light);
                }
                .cart-header h1 { font-size: 1.875rem; }

                .cart-layout {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 2rem;
                    align-items: start;
                }

                .cart-items-col {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .cart-item {
                    display: grid;
                    grid-template-columns: 90px 1fr auto 100px;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.25rem;
                }

                .item-image {
                    width: 90px;
                    height: 90px;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    background: var(--bg-alt);
                }
                .item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .item-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .item-cat {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--primary);
                    font-weight: 600;
                }
                .item-name {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0.25rem 0;
                }
                .item-unit-price {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .item-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .qty-control {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }
                .qty-control button {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-surface);
                    border: none;
                    cursor: pointer;
                    color: var(--text-main);
                    transition: background var(--transition-fast);
                }
                .qty-control button:hover:not(:disabled) {
                    background: var(--bg-alt);
                }
                .qty-control button:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .qty-value {
                    width: 32px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                    border-left: 1px solid var(--border-light);
                    border-right: 1px solid var(--border-light);
                    line-height: 32px;
                }

                .btn-remove {
                    background: none;
                    border: none;
                    color: var(--danger);
                    cursor: pointer;
                    opacity: 0.5;
                    transition: opacity var(--transition-fast);
                    padding: 0.25rem;
                }
                .btn-remove:hover { opacity: 1; }

                .item-line-total {
                    text-align: right;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .summary-card {
                    padding: 1.5rem;
                    position: sticky;
                    top: 1rem;
                }
                .summary-card h3 {
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-light);
                }

                .summary-line {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .summary-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-light);
                    margin-bottom: 1.5rem;
                }
                .summary-total span:first-child { font-weight: 600; }
                .total-amount {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--primary);
                }

                .benefits-card {
                    margin-top: 1rem;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .benefit-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .cart-empty-state {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .empty-card {
                    padding: 4rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    max-width: 480px;
                    margin: 0 auto;
                }
                .empty-card h2 {
                    margin-bottom: 0.5rem;
                }

                .cart-recs {
                    margin-top: 4rem;
                    padding-top: 3rem;
                    border-top: 1px solid var(--border-light);
                }
                .cart-recs h2 {
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .recs-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                }

                .rec-card { padding: 0; }
                .rec-img {
                    position: relative;
                    height: 160px;
                    overflow: hidden;
                }
                .rec-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }
                .rec-card:hover .rec-img img { transform: scale(1.05); }
                .rec-info {
                    padding: 1rem;
                }
                .rec-info h4 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .cart-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--border-light);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: cartSpin 1s linear infinite;
                    margin: 3rem auto;
                }
                @keyframes cartSpin { to { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .cart-layout { grid-template-columns: 1fr; }
                    .cart-summary-col { order: -1; }
                    .summary-card { position: static; }
                    .recs-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    .cart-item { grid-template-columns: 70px 1fr; gap: 1rem; }
                    .item-actions { grid-column: 1 / -1; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid var(--border-light); }
                    .item-line-total { grid-column: 1 / -1; text-align: left; }
                    .recs-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Cart;
