import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    ChevronLeft,
    Clock,
    CreditCard,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    MapPin,
    ShoppingBag,
    Info,
    ArrowRight,
    Star
} from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
        } catch (err) {
            console.error('Fetch order error:', err);
            setError('NOUS N\'AVONS PU RETROUVER CETTE TRANSACTION.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Souhaitez-vous réellement annuler cette acquisition d\'exception ?')) {
            return;
        }

        setCancelling(true);
        try {
            await api.delete(`/orders/${id}/cancel`);
            navigate('/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Une interruption est survenue.');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: { label: 'EN ATTENTE', color: '#f59e0b', icon: <Clock size={16} />, class: 'pending' },
            paid: { label: 'PAYÉE', color: '#10b981', icon: <CreditCard size={16} />, class: 'paid' },
            processing: { label: 'EN PRÉPARATION', color: '#3b82f6', icon: <Package size={16} />, class: 'processing' },
            shipped: { label: 'EXPÉDIÉE', color: '#8b5cf6', icon: <Truck size={16} />, class: 'shipped' },
            delivered: { label: 'LIVRÉE', color: '#22c55e', icon: <CheckCircle2 size={16} />, class: 'delivered' },
            cancelled: { label: 'ANNULÉE', color: '#ef4444', icon: <XCircle size={16} />, class: 'cancelled' },
        };
        return configs[status] || { label: status, color: '#94a3b8', icon: <Info size={16} />, class: '' };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) return (
        <div className="loader-container-premium">
            <div className="premium-loader"></div>
            <p className="loader-text-luxury">INSPECTION DE VOTRE DOSSIER...</p>
        </div>
    );

    if (error || !order) return (
        <div className="container-premium error-state-luxury animate-fade-in">
            <div className="error-card glass-premium">
                <Info size={48} className="gold-icon m-b-2" />
                <h1 className="font-serif">{error || 'COMMANDE INTROUVABLE'}</h1>
                <Link to="/orders" className="btn-premium m-t-2">RETOUR À L'HISTORIQUE</Link>
            </div>
        </div>
    );

    const statusInfo = getStatusConfig(order.status);
    const canCancel = order.status === 'pending' || order.status === 'paid';

    return (
        <div className="container-premium order-detail-luxury animate-fade-in">
            <header className="detail-header-luxury">
                <Link to="/orders" className="back-link-luxury">
                    <ChevronLeft size={18} />
                    <span>RETOUR À L'HISTORIQUE</span>
                </Link>

                <div className="header-main-content">
                    <div className="title-section">
                        <h5 className="gradient-text-gold font-serif">DÉTAILS DU SILLAGE</h5>
                        <h1 className="font-serif">Commande <span className="gradient-text-gold">{order.order_number}</span></h1>
                        <p className="aesthetic-hint">Transmise le {formatDate(order.created_at)}</p>
                    </div>

                    <div className={`status-seal-luxury ${statusInfo.class}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                    </div>
                </div>
            </header>

            <div className="detail-grid-luxury">
                <main className="detail-main-info">
                    <section className="detail-card-luxury glass-premium animate-fade-in-up">
                        <div className="card-header-luxury">
                            <ShoppingBag size={18} className="gold-icon" />
                            <h3 className="font-serif uppercase-tracking">Composition de l'acquisition</h3>
                        </div>

                        <div className="order-items-luxury">
                            {order.items.map((item, idx) => (
                                <div key={item.id} className="item-row-luxury" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div className="item-image-placeholder glass-premium">
                                        <Package size={24} className="op-2" />
                                    </div>
                                    <div className="item-details-luxury">
                                        <h4>{item.perfume_name}</h4>
                                        <p className="item-meta-luxury">Quantité: {item.quantity} — {item.perfume_price} € l'unité</p>

                                        {order.status === 'delivered' && (
                                            <Link to={`/perfumes/${item.perfume_id}`} className="review-link-luxury">
                                                <Star size={12} />
                                                PARTAGER VOTRE RESSENTI
                                            </Link>
                                        )}
                                    </div>
                                    <div className="item-total-luxury">
                                        {item.subtotal} €
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-summary-luxury">
                            <div className="summary-line">
                                <span>SOUS-TOTAL</span>
                                <span>{order.subtotal} €</span>
                            </div>
                            {order.shipping_cost > 0 && (
                                <div className="summary-line">
                                    <span>LOGISTIQUE & LIVRAISON</span>
                                    <span>{order.shipping_cost} €</span>
                                </div>
                            )}
                            <div className="summary-line total-line">
                                <span>MONTANT TOTAL D'EXCEPTION</span>
                                <span className="total-amount-luxury">{order.total} €</span>
                            </div>
                        </div>
                    </section>
                </main>

                <aside className="detail-side-info">
                    <section className="detail-card-luxury glass-premium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="card-header-luxury">
                            <MapPin size={18} className="gold-icon" />
                            <h3 className="font-serif uppercase-tracking">Destination</h3>
                        </div>
                        {order.shipping_address ? (
                            <div className="address-display-luxury">
                                <p className="address-street">{order.shipping_address.street || order.shipping_address.full_address}</p>
                                <p className="address-city">{order.shipping_address.city}, {order.shipping_address.postal_code || order.shipping_address.zip_code}</p>
                                <p className="address-country">{order.shipping_address.country || 'Maroc'}</p>
                            </div>
                        ) : (
                            <p className="aesthetic-hint small">Informations de livraison non renseignées.</p>
                        )}
                    </section>

                    <section className="detail-card-luxury glass-premium animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="card-header-luxury">
                            <CreditCard size={18} className="gold-icon" />
                            <h3 className="font-serif uppercase-tracking">Transaction</h3>
                        </div>
                        <div className="payment-display-luxury">
                            <div className="payment-status-row">
                                <span className="label">Statut du règlement</span>
                                <span className={`value status-${order.payment_status?.toLowerCase()}`}>{order.payment_status?.toUpperCase() || '-'}</span>
                            </div>
                            {order.payment_method && (
                                <div className="payment-status-row">
                                    <span className="label">Méthode employée</span>
                                    <span className="value">{order.payment_method}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {canCancel && (
                        <button
                            className="btn-premium btn-cancel-luxury w-full animate-fade-in-up"
                            style={{ animationDelay: '0.4s' }}
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? 'INTERRUPTION...' : 'ANNULER CETTE ACQUISITION'}
                        </button>
                    )}
                </aside>
            </div>

            <style>{`
                .order-detail-luxury { padding-top: 4rem; padding-bottom: 8rem; }
                
                .detail-header-luxury { margin-bottom: 5rem; }
                
                .back-link-luxury {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--primary);
                    text-decoration: none;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    margin-bottom: 3rem;
                    transition: 0.3s;
                }
                .back-link-luxury:hover { transform: translateX(-5px); opacity: 0.8; }

                .header-main-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 2rem;
                }

                .title-section h5 { letter-spacing: 5px; margin-bottom: 1rem; }
                .title-section h1 { font-size: 3.5rem; margin-bottom: 1rem; }

                .status-seal-luxury {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 2rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    border: 1px solid var(--glass-border);
                }
                .status-seal-luxury.pending { color: #f59e0b; border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
                .status-seal-luxury.paid { color: #10b981; border-color: #10b981; background: rgba(16, 185, 129, 0.05); }
                .status-seal-luxury.delivered { color: #22c55e; border-color: #22c55e; background: rgba(34, 197, 94, 0.05); }
                .status-seal-luxury.cancelled { color: #ef4444; border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }

                .detail-grid-luxury {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 3rem;
                    align-items: start;
                }

                .detail-card-luxury { padding: 3rem; border-radius: 24px; margin-bottom: 2rem; }
                .card-header-luxury { display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; }
                .uppercase-tracking { text-transform: uppercase; letter-spacing: 2px; font-size: 1rem; }

                .item-row-luxury {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    padding: 1.5rem 0;
                    border-bottom: 1px solid var(--glass-border);
                }
                .item-row-luxury:last-child { border-bottom: none; }

                .item-image-placeholder {
                    width: 70px;
                    height: 70px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                }
                .op-2 { opacity: 0.2; }

                .item-details-luxury { flex: 1; }
                .item-details-luxury h4 { font-size: 1.1rem; margin-bottom: 0.5rem; letter-spacing: 1px; }
                .item-meta-luxury { font-size: 0.8rem; opacity: 0.5; margin-bottom: 1rem; }

                .review-link-luxury {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--primary);
                    text-decoration: none;
                    letter-spacing: 1px;
                }
                .review-link-luxury:hover { text-decoration: underline; }

                .item-total-luxury { font-size: 1.25rem; font-weight: 700; color: #fff; }

                .order-summary-luxury {
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 2px solid var(--glass-border);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .summary-line { display: flex; justify-content: space-between; font-size: 0.85rem; opacity: 0.6; font-weight: 600; letter-spacing: 1px; }
                .total-line { margin-top: 1rem; opacity: 1; color: #fff; }
                .total-amount-luxury { font-size: 2rem; font-weight: 900; color: var(--primary); }

                .address-display-luxury { line-height: 1.8; }
                .address-street { font-weight: 700; color: #fff; }
                .address-city, .address-country { opacity: 0.6; font-size: 0.9rem; }

                .payment-display-luxury { display: flex; flex-direction: column; gap: 1.5rem; }
                .payment-status-row { display: flex; flex-direction: column; gap: 0.5rem; }
                .payment-status-row .label { font-size: 0.65rem; font-weight: 800; letter-spacing: 1.5px; opacity: 0.4; }
                .payment-status-row .value { font-weight: 700; }
                .value.status-paid { color: #10b981; }

                .btn-cancel-luxury {
                    background: transparent;
                    border: 1px solid #ef4444;
                    color: #ef4444;
                }
                .btn-cancel-luxury:hover { background: rgba(239, 68, 68, 0.05); border-color: #fff; color: #fff; }

                @media (max-width: 1024px) {
                    .header-main-content { flex-direction: column; align-items: flex-start; }
                    .detail-grid-luxury { grid-template-columns: 1fr; }
                    .detail-side-info { order: -1; }
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default OrderDetail;
