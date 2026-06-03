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
            setError('Impossible de charger vos commandes.');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    const getStatusConfig = (status) => {
        const configs = {
            pending:    { label: 'En attente',      icon: <Clock size={14} />,        cls: 'status-warning' },
            paid:       { label: 'Payée',           icon: <CreditCard size={14} />,   cls: 'status-success' },
            processing: { label: 'En préparation',  icon: <Package size={14} />,       cls: 'status-info' },
            shipped:    { label: 'Expédiée',        icon: <Truck size={14} />,         cls: 'status-primary' },
            delivered:  { label: 'Livrée',          icon: <CheckCircle2 size={14} />,  cls: 'status-success' },
            cancelled:  { label: 'Annulée',         icon: <XCircle size={14} />,       cls: 'status-danger' },
        };
        return configs[status] || { label: status, icon: <Package size={14} />, cls: '' };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) return (
        <div className="container py-5 text-center">
            <div className="orders-spinner"></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Chargement de vos commandes...</p>
        </div>
    );

    if (error) return (
        <div className="container py-5">
            <div className="saas-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger)' }}>
                <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
                <Link to="/profile" className="btn btn-secondary">Retour au profil</Link>
            </div>
        </div>
    );

    const filterOptions = [
        { val: '', label: 'Toutes' },
        { val: 'pending', label: 'En attente' },
        { val: 'paid', label: 'Payées' },
        { val: 'delivered', label: 'Livrées' }
    ];

    return (
        <div className="container orders-page py-5">
            <header className="orders-header">
                <div>
                    <h1>Mes commandes</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Suivez le statut de toutes vos commandes.</p>
                </div>
            </header>

            {/* Filters */}
            <div className="orders-filters">
                {filterOptions.map(opt => (
                    <button
                        key={opt.val}
                        className={`filter-btn ${filter === opt.val ? 'active' : ''}`}
                        onClick={() => setFilter(opt.val)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="saas-card empty-orders">
                    <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <h3>Aucune commande trouvée</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Parcourez notre catalogue pour passer votre première commande.</p>
                    <Link to="/perfumes" className="btn btn-primary">Découvrir le catalogue</Link>
                </div>
            ) : (
                <div className="orders-list">
                    {/* Table Header */}
                    <div className="order-row order-row-header">
                        <span>Commande</span>
                        <span>Date</span>
                        <span>Statut</span>
                        <span>Articles</span>
                        <span>Total</span>
                        <span></span>
                    </div>

                    {orders.map(order => {
                        const status = getStatusConfig(order.status);
                        return (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className="order-row order-row-data saas-card"
                            >
                                <span className="order-number">#{order.order_number}</span>
                                <span className="order-date">
                                    <Calendar size={14} style={{ marginRight: '0.25rem', opacity: 0.5 }} />
                                    {formatDate(order.created_at)}
                                </span>
                                <span>
                                    <span className={`order-status-badge ${status.cls}`}>
                                        {status.icon}
                                        {status.label}
                                    </span>
                                </span>
                                <span className="order-items-count">
                                    {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                                </span>
                                <span className="order-total">{order.total} €</span>
                                <span className="order-arrow">
                                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}

            <style>{`
                .orders-page { padding-bottom: 6rem; }

                .orders-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-light);
                }
                .orders-header h1 { font-size: 1.875rem; margin-bottom: 0.25rem; }

                .orders-filters {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                }
                .filter-btn {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border-light);
                    background: var(--bg-surface);
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    font-weight: 500;
                    border-radius: var(--radius-full);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                .filter-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .filter-btn.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .orders-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .order-row {
                    display: grid;
                    grid-template-columns: 1.2fr 1.2fr 1fr 0.8fr 0.8fr 40px;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    text-decoration: none;
                    color: var(--text-main);
                }

                .order-row-header {
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    background: none;
                    border: none;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid var(--border-light);
                }

                .order-row-data {
                    border-radius: var(--radius-md);
                    transition: all var(--transition-fast);
                }
                .order-row-data:hover {
                    border-color: var(--primary);
                    box-shadow: var(--shadow-md);
                }

                .order-number {
                    font-weight: 700;
                    font-size: 0.95rem;
                }
                .order-date {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                }

                .order-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.3rem 0.75rem;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .status-warning { background: var(--warning-bg); color: var(--warning); }
                .status-success { background: var(--success-bg); color: var(--success); }
                .status-danger { background: var(--danger-bg); color: var(--danger); }
                .status-info { background: #dbeafe; color: #3b82f6; }
                .status-primary { background: var(--primary-light); color: var(--primary); }

                .order-items-count {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                .order-total {
                    font-weight: 700;
                    font-size: 1rem;
                }
                .order-arrow {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .empty-orders {
                    padding: 5rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .orders-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--border-light);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: ordersSpin 1s linear infinite;
                    margin: 3rem auto;
                }
                @keyframes ordersSpin { to { transform: rotate(360deg); } }

                @media (max-width: 900px) {
                    .order-row { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                    .order-row-header { display: none; }
                    .order-arrow { display: none; }
                }

                @media (max-width: 600px) {
                    .order-row { grid-template-columns: 1fr; }
                    .orders-filters { flex-wrap: wrap; }
                }
            `}</style>
        </div>
    );
};

export default Orders;
