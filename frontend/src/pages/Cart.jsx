import { useState, useEffect } from 'react';
import { useCart } from '../context/useCart';
import { Link, useNavigate } from 'react-router-dom';
import api, { API_HOST } from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag, MapPin, ArrowRight, Sparkles, Compass, ChevronRight } from 'lucide-react';

const Cart = () => {
    const { cart, total, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const navigate = useNavigate();

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        const apiHost = API_HOST.replace(/\/api\/?$/, '');
        return `${apiHost}${imageUrl}`;
    };

    useEffect(() => {
        fetchAddresses();
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await api.get('/recommendations/dashboard');
            setRecommendations(response.data.data.recommendations || []);
        } catch (err) {
            console.error('Error fetching recommendations in cart:', err);
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
        <div className="loader-container-premium">
            <div className="premium-loader"></div>
            <p className="loader-text-luxury">PRÉPARATION DE VOTRE SÉLECTION...</p>
        </div>
    );

    if (error) return <div className="container-premium"><div className="premium-alert error">{error}</div></div>;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container-premium empty-cart-luxury animate-fade-in">
                <div className="empty-icon-luxury glass-premium">
                    <ShoppingBag size={48} className="gold-rose" />
                </div>
                <h1 className="font-serif">Votre Panier est Vide</h1>
                <p>Votre sillage d'exception vous attend dans notre catalogue.</p>
                <Link to="/perfumes" className="btn-premium">DÉCOUVRIR LA COLLECTION</Link>
            </div>
        );
    }

    return (
        <div className="container-premium cart-page-luxury animate-fade-in">
            <header className="cart-header-luxury">
                <h5 className="gradient-text-gold font-serif">VOTRE SÉLECTION</h5>
                <h1 className="font-serif">Le Panier de <span className="gradient-text-gold">Senteurs</span></h1>
            </header>

            <div className="cart-layout-luxury">
                <div className="cart-items-column">
                    {cart.items.map((item) => (
                        <div key={item.id} className="premium-card cart-item-luxury">
                            <div className="item-media-luxury">
                                {getImageUrl(item.perfume.image_url) ? (
                                    <img src={getImageUrl(item.perfume.image_url)} alt={item.perfume.name} />
                                ) : (
                                    <div className="placeholder-luxury small">🌹</div>
                                )}
                            </div>

                            <div className="item-info-luxury">
                                <span className="item-category-luxury">{item.perfume.category?.name || 'Parfum'}</span>
                                <h3 className="item-title-luxury">{item.perfume.name}</h3>
                                <p className="item-price-luxury">{item.perfume.price} €</p>
                            </div>

                            <div className="item-controls-luxury">
                                <div className="quantity-luxury glass-premium">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                        <Minus size={14} />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.perfume.stock}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <button className="btn-remove-luxury" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="item-total-luxury">
                                <span>{(item.perfume.price * item.quantity).toFixed(2)} €</span>
                            </div>
                        </div>
                    ))}

                    <button className="btn-clear-luxury" onClick={clearCart}>
                        <Trash2 size={14} /> VIDER LE PANIER
                    </button>
                </div>

                <aside className="cart-summary-column">
                    <div className="summary-card-luxury glass-premium">
                        <h3 className="font-serif">RÉSUMÉ</h3>
                        <div className="summary-divider-luxury"></div>

                        <div className="summary-row-luxury">
                            <span>SOUS-TOTAL</span>
                            <span>{total.toFixed(2)} €</span>
                        </div>
                        <div className="summary-row-luxury">
                            <span>LIVRAISON</span>
                            <span>OFFERTE</span>
                        </div>

                        <div className="summary-total-luxury">
                            <label>TOTAL</label>
                            <span>{total.toFixed(2)} €</span>
                        </div>

                        {addresses.length > 0 ? (
                            <div className="checkout-actions-luxury">
                                <div className="address-box-luxury">
                                    <label><MapPin size={12} /> LIVRER À :</label>
                                    <select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.street}, {addr.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button className="btn-premium btn-checkout-luxury" onClick={handleCheckout} disabled={isCheckingOut}>
                                    {isCheckingOut ? 'VALIDATION...' : 'COMMANDER MAINTENANT'}
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="address-missing-luxury">
                                <p>Authentifiez votre compte ou ajoutez une adresse pour finaliser.</p>
                                <Link to="/profile" className="btn-premium">AJOUTER UNE ADRESSE</Link>
                            </div>
                        )}
                    </div>

                    <div className="cart-benefits-luxury glass-premium">
                        <div className="benefit-item-luxury">
                            <span className="benefit-icon-luxury">🎁</span>
                            <p>Échantillon offert sur demande</p>
                        </div>
                        <div className="benefit-item-luxury">
                            <span className="benefit-icon-luxury">✨</span>
                            <p>Écrin de luxe biodégradable</p>
                        </div>
                    </div>
                </aside>
            </div>

            {recommendations.length > 0 && (
                <section className="cart-recommendations-luxury animate-fade-in-up">
                    <div className="section-title-luxury">
                        <Sparkles className="gold-icon" size={24} />
                        <h2 className="font-serif">Révélations <span className="gradient-text-gold">Complémentaires</span></h2>
                        <p>Ces essences pourraient parfaire votre signature olfactive.</p>
                    </div>

                    <div className="recommendations-scroll-luxury">
                        {recommendations.slice(0, 4).map((rec, idx) => (
                            <div key={idx} className="rec-card-mini glass-premium">
                                <div className="rec-media-mini">
                                    <img src={getImageUrl(rec.perfume.image_url)} alt={rec.perfume.name} />
                                    <div className="rec-match-mini">
                                        <span>{rec.match_percentage}%</span>
                                    </div>
                                </div>
                                <div className="rec-info-mini">
                                    <h4>{rec.perfume.name}</h4>
                                    <p>{rec.perfume.price} €</p>
                                    <button onClick={() => navigate(`/perfumes/${rec.perfume.id}`)} className="btn-rec-view">
                                        VOIR <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <style>{`
                .cart-page-luxury { padding-top: 4rem; padding-bottom: 8rem; }
                .cart-header-luxury { text-align: center; margin-bottom: 6rem; }
                .cart-header-luxury h5 { letter-spacing: 5px; margin-bottom: 1.5rem; }
                .cart-header-luxury h1 { font-size: 3.5rem; }

                .cart-layout-luxury {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 4rem;
                }

                .cart-items-column { display: flex; flex-direction: column; gap: 1.5rem; }
                
                .cart-item-luxury {
                    display: grid;
                    grid-template-columns: 100px 1fr auto 120px;
                    align-items: center;
                    padding: 1.5rem;
                    gap: 2rem;
                }

                .item-media-luxury { height: 100px; border-radius: 10px; overflow: hidden; background: #000; }
                .item-media-luxury img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
                
                .item-category-luxury { font-size: 0.6rem; letter-spacing: 2px; color: var(--primary); font-weight: 700; opacity: 0.7; }
                .item-title-luxury { font-size: 1.1rem; margin: 0.4rem 0; font-weight: 500; }
                .item-price-luxury { font-size: 0.9rem; opacity: 0.6; }

                .item-controls-luxury { display: flex; align-items: center; gap: 1.5rem; }
                .quantity-luxury {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 0.9rem;
                }
                .quantity-luxury button { background: none; border: none; color: #fff; cursor: pointer; opacity: 0.5; transition: 0.3s; }
                .quantity-luxury button:hover { opacity: 1; color: var(--primary); }
                .quantity-luxury button:disabled { opacity: 0.1; cursor: not-allowed; }

                .btn-remove-luxury { background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.5; transition: 0.3s; }
                .btn-remove-luxury:hover { opacity: 1; transform: scale(1.1); }

                .item-total-luxury { text-align: right; font-weight: 700; font-size: 1.1rem; }

                .btn-clear-luxury {
                    align-self: flex-start;
                    background: none;
                    border: 1px solid var(--glass-border);
                    color: var(--text-secondary);
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    letter-spacing: 2px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 1rem;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .btn-clear-luxury:hover { border-color: #ef4444; color: #ef4444; }

                .summary-card-luxury { padding: 3rem; border-radius: 24px; position: sticky; top: 100px; }
                .summary-card-luxury h3 { font-size: 1.5rem; letter-spacing: 3px; margin-bottom: 2rem; text-align: center; }
                .summary-divider-luxury { height: 1px; background: var(--glass-border); margin-bottom: 2rem; }
                
                .summary-row-luxury { display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.85rem; letter-spacing: 1px; opacity: 0.7; }
                
                .summary-total-luxury {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    margin-bottom: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--glass-border);
                }
                .summary-total-luxury label { font-weight: 700; letter-spacing: 3px; font-size: 0.9rem; }
                .summary-total-luxury span { font-size: 1.8rem; font-weight: 800; color: var(--primary); }

                .address-box-luxury { margin-bottom: 2rem; }
                .address-box-luxury label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.65rem; color: var(--primary); font-weight: 700; margin-bottom: 0.75rem; }
                .address-box-luxury select { width: 100%; background: var(--glass-hover); border: 1px solid var(--glass-border); padding: 0.8rem; border-radius: 8px; color: #fff; font-size: 0.8rem; }
                
                .btn-checkout-luxury { width: 100%; padding: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 1rem; }

                .empty-cart-luxury { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                .empty-icon-luxury { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 3rem; }
                .empty-cart-luxury h1 { font-size: 3rem; margin-bottom: 1rem; }
                .empty-cart-luxury p { opacity: 0.6; margin-bottom: 3rem; }

                .cart-benefits-luxury { margin-top: 2rem; padding: 2rem; border-radius: 20px; display: flex; flex-direction: column; gap: 1.5rem; }
                .benefit-item-luxury { display: flex; align-items: center; gap: 1rem; }
                .benefit-icon-luxury { font-size: 1.5rem; }
                .benefit-item-luxury p { font-size: 0.8rem; opacity: 0.6; }

                @media (max-width: 1024px) {
                    .cart-layout-luxury { grid-template-columns: 1fr; }
                    .cart-summary-column { order: -1; }
                    .summary-card-luxury { position: static; }
                    .cart-item-luxury { grid-template-columns: 80px 1fr 80px; }
                    .item-controls-luxury { grid-column: 1 / -1; justify-content: space-between; border-top: 1px solid var(--glass-border); padding-top: 1rem; }
                }

                .cart-recommendations-luxury { margin-top: 8rem; border-top: 1px solid var(--glass-border); padding-top: 5rem; }
                .cart-recommendations-luxury .section-title-luxury { text-align: center; margin-bottom: 3rem; }
                .cart-recommendations-luxury h2 { font-size: 2.5rem; margin: 1rem 0; }
                .cart-recommendations-luxury p { opacity: 0.5; font-size: 0.9rem; }

                .recommendations-scroll-luxury {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 1.5rem;
                }

                .rec-card-mini {
                    display: flex;
                    gap: 1.25rem;
                    padding: 1.25rem;
                    border-radius: 16px;
                    transition: 0.3s;
                }
                .rec-card-mini:hover { transform: translateY(-5px); border-color: var(--primary); }

                .rec-media-mini { width: 80px; height: 100px; position: relative; border-radius: 10px; overflow: hidden; background: #000; flex-shrink: 0; }
                .rec-media-mini img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
                
                .rec-match-mini {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: var(--grad-gold);
                    color: #000;
                    font-size: 0.6rem;
                    font-weight: 900;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .rec-info-mini { display: flex; flex-direction: column; justify-content: center; gap: 0.4rem; }
                .rec-info-mini h4 { font-size: 0.95rem; font-weight: 500; }
                .rec-info-mini p { color: var(--primary); font-weight: 700; font-size: 0.9rem; }
                
                .btn-rec-view {
                    background: none; border: none; color: rgba(255,255,255,0.4);
                    font-size: 0.65rem; font-weight: 800; letter-spacing: 1px;
                    display: flex; align-items: center; gap: 0.25rem; cursor: pointer;
                    margin-top: 0.5rem; transition: 0.3s;
                }
                .btn-rec-view:hover { color: var(--primary); transform: translateX(3px); }

                .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Cart;

