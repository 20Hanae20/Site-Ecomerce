import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
    Clock,
    CheckCircle2,
    Package,
    Truck,
    XCircle,
    ChevronRight,
    Calendar,
    Hash,
    ShoppingBag,
    CreditCard
} from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = filter ? `?status=${filter}` : '';
            const response = await api.get(`/orders${params}`);
            setOrders(response.data.data);
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError('L\'HISTOIRE DE VOS ACQUISITIONS EST MOMENTANÉMENT INDISPONIBLE.');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    const getStatusConfig = (status) => {
        const configs = {
            pending: { label: 'EN ATTENTE', color: '#f59e0b', icon: <Clock size={14} />, class: 'pending' },
            paid: { label: 'PAYÉE', color: '#10b981', icon: <CreditCard size={14} />, class: 'paid' },
            processing: { label: 'EN PRÉPARATION', color: '#3b82f6', icon: <Package size={14} />, class: 'processing' },
            shipped: { label: 'EXPÉDIÉE', color: '#8b5cf6', icon: <Truck size={14} />, class: 'shipped' },
            delivered: { label: 'LIVRÉE', color: '#22c55e', icon: <CheckCircle2 size={14} />, class: 'delivered' },
            cancelled: { label: 'ANNULÉE', color: '#ef4444', icon: <XCircle size={14} />, class: 'cancelled' },
        };
        return configs[status] || { label: status, color: '#94a3b8', icon: <Package size={14} />, class: '' };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) return (
        <div className="loader-container-premium">
            <div className="premium-loader"></div>
            <p className="loader-text-luxury">RÉCUPÉRATION DE VOS TRÉSORS...</p>
        </div>
    );

    if (error) return (
        <div className="container-premium error-state-luxury animate-fade-in">
            <h1 className="font-serif">{error}</h1>
            <Link to="/profile" className="btn-premium">RETOUR AU PROFIL</Link>
        </div>
    );

    return (
        <div className="container-premium orders-page-luxury animate-fade-in">
            <header className="page-header-luxury">
                <h5 className="gradient-text-gold font-serif">HISTORIQUE</h5>
                <h1 className="font-serif">Mes <span className="gradient-text-gold">Commandes</span></h1>
                <p className="aesthetic-hint">Suivez le voyage de vos fragrances d'exception.</p>
            </header>

            <div className="orders-filters-luxury glass-premium">
                {[
                    { val: '', label: 'TOUTES' },
                    { val: 'pending', label: 'EN ATTENTE' },
                    { val: 'paid', label: 'PAYÉES' },
                    { val: 'delivered', label: 'LIVRÉES' }
                ].map(opt => (
                    <button
                        key={opt.val}
                        className={`filter-btn-luxury ${filter === opt.val ? 'active' : ''}`}
                        onClick={() => setFilter(opt.val)}
                    >
                        {opt.label}
                    </button>

                ))}
            </div>

            {orders.length === 0 ? (
                <div className="no-order-luxury glass-premium">
                    <ShoppingBag size={48} className="gold-icon op-3" />
                    <p>Votre sillage est encore discret. Aucune commande n'a été trouvée.</p>
                    <Link to="/perfumes" className="btn-premium">DÉCOUVRIR LE CATALOGUE</Link>
                </div>
            ) : (
                <div className="orders-list-luxury">
                    {orders.map(order => {
                        const status = getStatusConfig(order.status);
                        return (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className="order-link-wrapper"
                            >
                                <div className="order-card-luxury glass-premium">
                                    <div className="order-main-info">
                                        <div className="order-id-section">
                                            <div className="icon-box-luxury">
                                                <Hash size={18} />
                                            </div>
                                            <div>
                                                <span className="order-number-luxury">{order.order_number}</span>
                                                <div className="order-date-row">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(order.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="order-status-section">
                                            <div className={`status-pill-luxury ${status.class}`}>
                                                {status.icon}
                                                <span>{status.label}</span>
                                            </div>
                                        </div>

                                        <div className="order-meta-section">
                                            <div className="meta-item">
                                                <Package size={14} />
                                                <span>{order.items?.length || 0} article{order.items?.length > 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="order-price-luxury">
                                                {order.total} €
                                            </div>
                                        </div>

                                        <div className="order-action-section">
                                            <span className="details-text">VOIR DÉTAILS</span>
                                            <ChevronRight size={18} className="gold-icon" />
                                        </div>
                                    </div>
                                    <div className="order-card-glow"></div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            <style>{`
                .orders-page-luxury { padding-top: 4rem; padding-bottom: 8rem; }
                .page-header-luxury { text-align: center; margin-bottom: 5rem; }
                .page-header-luxury h5 { letter-spacing: 5px; margin-bottom: 1rem; }
                .page-header-luxury h1 { font-size: 3.5rem; }

                .orders-filters-luxury {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    padding: 0.5rem;
                    border-radius: 50px;
                    max-width: fit-content;
                    margin: 0 auto 5rem auto;
                }

                .filter-btn-luxury {
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.5);
                    padding: 0.8rem 2rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .filter-btn-luxury.active {
                    background: var(--grad-gold);
                    color: #000;
                    box-shadow: 0 5px 15px var(--primary-glow);
                }

                .orders-list-luxury {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .order-link-wrapper { text-decoration: none; color: inherit; }

                .order-card-luxury {
                    padding: 2.5rem;
                    border-radius: 20px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.4s ease;
                }

                .order-card-luxury:hover {
                    transform: translateX(15px);
                    border-color: var(--primary);
                }

                .order-main-info {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr 120px;
                    align-items: center;
                    gap: 2rem;
                    position: relative;
                    z-index: 2;
                }

                .order-id-section { display: flex; gap: 1.5rem; align-items: center; }
                .icon-box-luxury {
                    width: 45px;
                    height: 45px;
                    border-radius: 12px;
                    background: var(--glass-hover);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                }

                .order-number-luxury { font-weight: 700; letter-spacing: 1px; font-size: 1.1rem; display: block; margin-bottom: 0.25rem; }
                .order-date-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; opacity: 0.4; }

                .status-pill-luxury {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.5rem 1.25rem;
                    border-radius: 50px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                    border: 1px solid transparent;
                }

                .status-pill-luxury.pending { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
                .status-pill-luxury.paid { color: #10b981; border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05); }
                .status-pill-luxury.delivered { color: #22c55e; border-color: rgba(34, 197, 94, 0.3); background: rgba(34, 197, 94, 0.05); }
                .status-pill-luxury.cancelled { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }

                .order-meta-section { display: flex; flex-direction: column; gap: 0.5rem; }
                .meta-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; opacity: 0.5; }
                .order-price-luxury { font-size: 1.4rem; font-weight: 800; color: #fff; }

                .order-action-section { display: flex; align-items: center; gap: 0.75rem; justify-content: flex-end; }
                .details-text { font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; color: var(--primary); opacity: 0; transition: 0.4s; }
                .order-card-luxury:hover .details-text { opacity: 1; transform: translateX(-5px); }

                .order-card-glow {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.03), transparent);
                    transform: translateX(-100%);
                    transition: 0.6s;
                }
                .order-card-luxury:hover .order-card-glow { transform: translateX(100%); }

                .no-order-luxury {
                    padding: 8rem;
                    text-align: center;
                    border-radius: 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                }
                .op-3 { opacity: 0.3; }

                @media (max-width: 900px) {
                    .order-main-info { grid-template-columns: 1fr 1fr; gap: 2rem; }
                    .order-action-section { display: none; }
                }

                @media (max-width: 600px) {
                    .order-main-info { grid-template-columns: 1fr; }
                    .order-status-section { order: -1; }
                }
            `}</style>
        </div>
    );
};

export default Orders;
