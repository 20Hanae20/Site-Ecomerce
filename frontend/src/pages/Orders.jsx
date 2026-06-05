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

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = filter ? `?status=${filter}` : '';
            const response = await api.get(`/orders${params}`);
            const data = response.data?.data || response.data || [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError('Impossible de charger vos commandes.');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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

    // Calculate metrics
    const totalOrders = orders.length;
    const totalSpent = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
        .toFixed(2);
    const pendingOrders = orders.filter(o => ['pending', 'paid', 'processing', 'shipped'].includes(o.status)).length;

    if (isLoading) return (
        <div className="container py-5 text-center loading-container">
            <div className="premium-loader">
                <div className="loader-ring"></div>
                <ShoppingBag size={24} className="loader-icon" />
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', fontWeight: 500, letterSpacing: '0.02em' }}>
                Chargement de vos commandes...
            </p>
        </div>
    );

    if (error) return (
        <div className="container py-5">
            <div className="error-card saas-card">
                <div className="error-badge">!</div>
                <h3>Erreur de chargement</h3>
                <p>{error}</p>
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
                    <h1>Vos Commandes</h1>
                    <p className="subtitle">Consultez l'historique et suivez le statut de vos expéditions en temps réel.</p>
                </div>
            </header>

            {/* Stats Dashboard Grid */}
            <div className="orders-stats-grid">
                <div className="stat-card saas-card">
                    <div className="stat-icon-wrapper blue">
                        <ShoppingBag size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Commandes</span>
                        <h3 className="stat-value">{totalOrders}</h3>
                    </div>
                </div>
                <div className="stat-card saas-card">
                    <div className="stat-icon-wrapper green">
                        <CreditCard size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Montant Total</span>
                        <h3 className="stat-value">{totalSpent} €</h3>
                    </div>
                </div>
                <div className="stat-card saas-card">
                    <div className="stat-icon-wrapper purple">
                        <Clock size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">En Cours de Livraison</span>
                        <h3 className="stat-value">{pendingOrders}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="orders-filters-container">
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
            </div>

            {orders.length === 0 ? (
                <div className="saas-card empty-orders">
                    <div className="empty-icon-container">
                        <ShoppingBag size={32} />
                    </div>
                    <h3>Aucune commande trouvée</h3>
                    <p>Découvrez notre catalogue de parfums exclusifs et commencez votre voyage olfactif.</p>
                    <Link to="/perfumes" className="btn btn-primary">Découvrir le catalogue</Link>
                </div>
            ) : (
                <div className="orders-list saas-card">
                    {/* Table Header */}
                    <div className="order-row order-row-header">
                        <span>Référence</span>
                        <span>Date</span>
                        <span>Statut</span>
                        <span>Articles</span>
                        <span style={{ textAlign: 'right', paddingRight: '1rem' }}>Total</span>
                        <span></span>
                    </div>

                    {orders.map(order => {
                        const status = getStatusConfig(order.status);
                        return (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className="order-row order-row-data"
                            >
                                <span className="order-number">#{order.order_number}</span>
                                <span className="order-date">
                                    <Calendar size={14} style={{ marginRight: '0.35rem', opacity: 0.6 }} />
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
                                <span className="order-total" style={{ textAlign: 'right', paddingRight: '1rem' }}>
                                    {parseFloat(order.total || 0).toFixed(2)} €
                                </span>
                                <span className="order-arrow">
                                    <ChevronRight size={18} />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}

            <style>{`
                .orders-page {
                    padding-bottom: 6rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .orders-header {
                    margin-bottom: 2.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-light, #eaeaea);
                }
                .orders-header h1 {
                    font-size: 2.25rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    color: var(--text-main, #111);
                    margin-bottom: 0.5rem;
                }
                .orders-header .subtitle {
                    color: var(--text-muted, #666);
                    font-size: 1rem;
                }

                /* Stats Dashboard Grid */
                .orders-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.5rem;
                    background: var(--bg-surface, #fff);
                    border: 1px solid var(--border-light, #eaeaea);
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.04);
                }
                .stat-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                }
                .stat-icon-wrapper.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .stat-icon-wrapper.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .stat-icon-wrapper.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .stat-label {
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: var(--text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-main, #111);
                    margin: 0;
                }

                /* Filters styling */
                .orders-filters-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .orders-filters {
                    display: flex;
                    gap: 0.5rem;
                    background: var(--bg-surface-alt, #f7f7f7);
                    padding: 0.25rem;
                    border-radius: 30px;
                    border: 1px solid var(--border-light, #eaeaea);
                }
                .filter-btn {
                    padding: 0.5rem 1.25rem;
                    border: none;
                    background: transparent;
                    color: var(--text-muted, #666);
                    font-size: 0.875rem;
                    font-weight: 600;
                    border-radius: 30px;
                    cursor: pointer;
                    transition: all var(--transition-fast, 0.2s);
                }
                .filter-btn:hover {
                    color: var(--text-main, #111);
                }
                .filter-btn.active {
                    background: var(--bg-surface, #fff);
                    color: var(--primary, #000);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }

                /* Orders List Container */
                .orders-list {
                    background: var(--bg-surface, #fff);
                    border: 1px solid var(--border-light, #eaeaea);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }

                .order-row {
                    display: grid;
                    grid-template-columns: 1.2fr 1.5fr 1.2fr 1fr 1fr 40px;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem 1.75rem;
                    text-decoration: none;
                    color: var(--text-main, #111);
                    border-bottom: 1px solid var(--border-light, #eaeaea);
                    transition: background 0.2s ease;
                }
                .order-row:last-child {
                    border-bottom: none;
                }

                .order-row-header {
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted, #666);
                    background: var(--bg-surface-alt, #fafafa);
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                }

                .order-row-data:hover {
                    background: var(--bg-surface-hover, #fafafa);
                }

                .order-number {
                    font-weight: 700;
                    color: var(--primary, #000);
                    font-size: 0.95rem;
                }
                .order-date {
                    font-size: 0.875rem;
                    color: var(--text-muted, #666);
                    display: flex;
                    align-items: center;
                }

                .order-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.35rem 0.85rem;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .status-warning { background: #fef3c7; color: #d97706; }
                .status-success { background: #d1fae5; color: #059669; }
                .status-danger { background: #fee2e2; color: #dc2626; }
                .status-info { background: #dbeafe; color: #2563eb; }
                .status-primary { background: #f3e8ff; color: #7c3aed; }

                .order-items-count {
                    font-size: 0.875rem;
                    color: var(--text-muted, #666);
                }
                .order-total {
                    font-weight: 800;
                    font-size: 1.05rem;
                    color: var(--text-main, #111);
                }
                .order-arrow {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted, #aaa);
                    transition: transform 0.2s ease, color 0.2s ease;
                }
                .order-row-data:hover .order-arrow {
                    transform: translateX(3px);
                    color: var(--primary, #000);
                }

                /* Empty state design */
                .empty-orders {
                    padding: 5rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border-radius: 16px;
                    background: var(--bg-surface, #fff);
                    border: 1px solid var(--border-light, #eaeaea);
                }
                .empty-icon-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 72px;
                    height: 72px;
                    background: var(--bg-surface-alt, #fafafa);
                    border-radius: 50%;
                    color: var(--text-muted, #999);
                    margin-bottom: 1.5rem;
                }
                .empty-orders h3 {
                    font-size: 1.35rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .empty-orders p {
                    color: var(--text-muted, #666);
                    max-width: 400px;
                    margin-bottom: 2rem;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                /* Premium Loader */
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                }
                .premium-loader {
                    position: relative;
                    width: 64px;
                    height: 64px;
                }
                .loader-ring {
                    width: 100%;
                    height: 100%;
                    border: 4px solid var(--border-light, #f3f3f3);
                    border-top: 4px solid var(--primary, #000);
                    border-radius: 50%;
                    animation: spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
                }
                .loader-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: var(--primary, #000);
                    animation: pulse 1.5s ease-in-out infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

                /* Error Card */
                .error-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 3rem 2rem;
                    text-align: center;
                    border-radius: 16px;
                    border-left: 4px solid var(--danger, #dc2626);
                }
                .error-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #fee2e2;
                    color: #dc2626;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }
                .error-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
                .error-card p { color: var(--text-muted, #666); margin-bottom: 1.5rem; }

                @media (max-width: 900px) {
                    .order-row { grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1.25rem; }
                    .order-row-header { display: none; }
                    .order-arrow { display: none; }
                    .order-total { text-align: left !important; }
                }

                @media (max-width: 600px) {
                    .order-row { grid-template-columns: 1fr; gap: 0.5rem; }
                    .orders-filters-container { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .orders-filters { width: 100%; justify-content: space-between; }
                    .stat-card { padding: 1rem; }
                }
            `}</style>
        </div>
    );
};

export default Orders;
