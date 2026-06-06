import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { exportInvoicePDF } from '../utils/pdfExport';
import {
    ChevronLeft,
    Clock,
    CreditCard,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    MapPin,
    Info,
    Star
} from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const fetchOrder = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
        } catch (err) {
            console.error('Fetch order error:', err);
            setError('Impossible de charger cette commande.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleCancelOrder = async () => {
        if (!globalThis.confirm('Souhaitez-vous vraiment annuler cette commande ?')) {
            return;
        }

        setCancelling(true);
        try {
            await api.delete(`/orders/${id}/cancel`);
            navigate('/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l\'annulation.');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending:    { label: 'En attente',      icon: <Clock size={16} />,         cls: 'status-warning' },
            paid:       { label: 'Payée',           icon: <CreditCard size={16} />,    cls: 'status-success' },
            processing: { label: 'En préparation',  icon: <Package size={16} />,        cls: 'status-info' },
            shipped:    { label: 'Expédiée',        icon: <Truck size={16} />,          cls: 'status-primary' },
            delivered:  { label: 'Livrée',          icon: <CheckCircle2 size={16} />,   cls: 'status-success' },
            cancelled:  { label: 'Annulée',         icon: <XCircle size={16} />,        cls: 'status-danger' },
        };
        return configs[status] || { label: status, icon: <Info size={16} />, cls: '' };
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
        <div className="container py-5 text-center">
            <div className="od-spinner"></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Chargement de la commande...</p>
        </div>
    );

    if (error || !order) return (
        <div className="container py-5">
            <div className="saas-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Info size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h2>{error || 'Commande introuvable'}</h2>
                <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Retour aux commandes</Link>
            </div>
        </div>
    );

    const statusInfo = getStatusConfig(order.status);
    const canCancel = order.status === 'pending' || order.status === 'paid';

    return (
        <div className="container od-page py-5">
            {/* Back Link */}
            <Link to="/orders" className="od-back-link">
                <ChevronLeft size={16} /> Retour aux commandes
            </Link>

            {/* Header */}
            <header className="od-header">
                <div>
                    <h1>Commande #{order.order_number}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Passée le {formatDate(order.created_at)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => exportInvoicePDF(order)}
                        className="btn btn-secondary flex items-center gap-2"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        <Package size={14} /> Télécharger Facture
                    </button>
                    <span className={`order-status-badge-lg ${statusInfo.cls}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                    </span>
                </div>
            </header>

            <div className="od-grid">
                {/* Main Content */}
                <main className="od-main">
                    {/* Items */}
                    <div className="saas-card od-items-card">
                        <h3 className="od-card-title"><Package size={18} style={{ color: 'var(--primary)' }} /> Articles commandés</h3>

                        <div className="od-items-list">
                            {order.items.map(item => (
                                <div key={item.id} className="od-item-row">
                                    <div className="od-item-icon">
                                        <Package size={20} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                    <div className="od-item-info">
                                        <h4>{item.perfume_name}</h4>
                                        <span className="od-item-meta">Qté: {item.quantity} × {item.perfume_price} €</span>
                                        {order.status === 'delivered' && (
                                            <Link to={`/perfumes/${item.perfume_id}`} className="od-review-link">
                                                <Star size={12} /> Laisser un avis
                                            </Link>
                                        )}
                                    </div>
                                    <div className="od-item-total">{item.subtotal} €</div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="od-summary">
                            <div className="od-summary-row">
                                <span>Sous-total</span>
                                <span>{order.subtotal} €</span>
                            </div>
                            {order.shipping_cost > 0 && (
                                <div className="od-summary-row">
                                    <span>Livraison</span>
                                    <span>{order.shipping_cost} €</span>
                                </div>
                            )}
                            <div className="od-summary-row od-total-row">
                                <span>Total</span>
                                <span className="od-total-value">{order.total} €</span>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="od-sidebar">
                    {/* Shipping Address */}
                    <div className="saas-card od-sidebar-card">
                        <h3 className="od-card-title"><MapPin size={18} style={{ color: 'var(--primary)' }} /> Adresse de livraison</h3>
                        {order.shipping_address ? (
                            <div className="od-address">
                                <p className="od-address-street">{order.shipping_address.street || order.shipping_address.full_address}</p>
                                <p>{order.shipping_address.city}, {order.shipping_address.postal_code || order.shipping_address.zip_code}</p>
                                <p>{order.shipping_address.country || 'Maroc'}</p>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Adresse non renseignée.</p>
                        )}
                    </div>

                    {/* Payment */}
                    <div className="saas-card od-sidebar-card">
                        <h3 className="od-card-title"><CreditCard size={18} style={{ color: 'var(--primary)' }} /> Paiement</h3>
                        <div className="od-payment-info">
                            <div className="od-payment-row">
                                <span className="od-payment-label">Statut</span>
                                <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                    {order.payment_status || '-'}
                                </span>
                            </div>
                            {order.payment_method && (
                                <div className="od-payment-row">
                                    <span className="od-payment-label">Méthode</span>
                                    <span>{order.payment_method}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cancel */}
                    {canCancel && (
                        <button
                            className="btn btn-cancel-order"
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Annulation...' : 'Annuler cette commande'}
                        </button>
                    )}
                </aside>
            </div>

            <style>{`
                .od-page { padding-bottom: 6rem; }

                .od-back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    color: var(--primary);
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: 2rem;
                    transition: opacity var(--transition-fast);
                }
                .od-back-link:hover { opacity: 0.7; }

                .od-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-light);
                }
                .od-header h1 { font-size: 1.875rem; margin-bottom: 0.25rem; }

                .order-status-badge-lg {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1.25rem;
                    border-radius: var(--radius-full);
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .status-warning { background: var(--warning-bg); color: var(--warning); }
                .status-success { background: var(--success-bg); color: var(--success); }
                .status-danger { background: var(--danger-bg); color: var(--danger); }
                .status-info { background: #dbeafe; color: #3b82f6; }
                .status-primary { background: var(--primary-light); color: var(--primary); }

                .od-grid {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: 2rem;
                    align-items: start;
                }

                .od-items-card, .od-sidebar-card {
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }

                .od-card-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-light);
                }

                .od-items-list {
                    display: flex;
                    flex-direction: column;
                }

                .od-item-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 0;
                    border-bottom: 1px solid var(--border-light);
                }
                .od-item-row:last-child { border-bottom: none; }

                .od-item-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-md);
                    background: var(--bg-alt);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .od-item-info { flex: 1; }
                .od-item-info h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.25rem; }
                .od-item-meta { font-size: 0.8rem; color: var(--text-muted); }

                .od-review-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 500;
                    margin-top: 0.375rem;
                }
                .od-review-link:hover { text-decoration: underline; }

                .od-item-total { font-weight: 700; font-size: 0.95rem; }

                .od-summary {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 2px solid var(--border-light);
                }
                .od-summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }
                .od-total-row {
                    margin-top: 0.5rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid var(--border-light);
                    color: var(--text-main);
                    font-weight: 600;
                }
                .od-total-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--primary);
                }

                .od-address p {
                    font-size: 0.9rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                }
                .od-address-street {
                    font-weight: 600;
                    color: var(--text-main) !important;
                }

                .od-payment-info {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .od-payment-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .od-payment-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .btn-cancel-order {
                    width: 100%;
                    padding: 0.75rem;
                    background: transparent;
                    border: 1px solid var(--danger);
                    color: var(--danger);
                    font-weight: 600;
                    font-size: 0.875rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                .btn-cancel-order:hover {
                    background: var(--danger-bg);
                }

                .od-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--border-light);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: odSpin 1s linear infinite;
                    margin: 3rem auto;
                }
                @keyframes odSpin { to { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .od-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .od-grid { grid-template-columns: 1fr; }
                    .od-sidebar { order: -1; }
                }
            `}</style>
        </div>
    );
};

export default OrderDetail;
