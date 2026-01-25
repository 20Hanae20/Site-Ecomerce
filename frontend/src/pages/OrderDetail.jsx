import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

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
            setError('Impossible de charger la commande.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
            return;
        }

        setCancelling(true);
        try {
            await api.delete(`/orders/${id}/cancel`);
            alert('Commande annulée avec succès');
            navigate('/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'En attente', class: 'status-pending' },
            paid: { label: 'Payée', class: 'status-paid' },
            processing: { label: 'En préparation', class: 'status-processing' },
            shipped: { label: 'Expédiée', class: 'status-shipped' },
            delivered: { label: 'Livrée', class: 'status-delivered' },
            cancelled: { label: 'Annulée', class: 'status-cancelled' },
        };
        const statusInfo = statusMap[status] || { label: status, class: '' };
        return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
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

    if (isLoading) return <div className="loader">Chargement...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!order) return <div className="error-message">Commande introuvable</div>;

    const canCancel = order.status === 'pending' || order.status === 'paid';

    return (
        <div className="page-container order-detail-page">
            <div className="detail-nav">
                <Link to="/orders">← Retour aux commandes</Link>
            </div>

            <div className="order-detail-header">
                <div>
                    <h1>Commande {order.order_number}</h1>
                    <p className="order-date">Passée le {formatDate(order.created_at)}</p>
                </div>
                {getStatusBadge(order.status)}
            </div>

            <div className="order-detail-layout">
                <div className="order-items-section">
                    <h2>Articles commandés</h2>
                    <div className="order-items-list">
                        {order.items.map(item => (
                            <div key={item.id} className="order-item">
                                <div className="item-info">
                                    <h3>{item.perfume_name}</h3>
                                    <p className="item-price">{item.perfume_price} € × {item.quantity}</p>
                                </div>
                                <div className="item-subtotal">
                                    <p>{item.subtotal} €</p>
                                    {order.status === 'delivered' && (
                                        <Link to={`/perfume/${item.perfume_id}`} className="review-btn-small">
                                            Laisser un avis
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <style>{`
                        .review-btn-small {
                            display: inline-block;
                            margin-top: 0.5rem;
                            font-size: 0.8rem;
                            color: var(--primary);
                            text-decoration: underline;
                        }
                    `}</style>

                    <div className="order-summary">
                        <div className="summary-row">
                            <span>Sous-total</span>
                            <span>{order.subtotal} €</span>
                        </div>
                        {order.shipping_cost > 0 && (
                            <div className="summary-row">
                                <span>Frais de livraison</span>
                                <span>{order.shipping_cost} €</span>
                            </div>
                        )}
                        {order.tax > 0 && (
                            <div className="summary-row">
                                <span>Taxes</span>
                                <span>{order.tax} €</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{order.total} €</span>
                        </div>
                    </div>
                </div>

                <div className="order-info-section">
                    <div className="info-card">
                        <h3>Adresse de livraison</h3>
                        {order.shipping_address ? (
                            <div className="address-info">
                                <p>{order.shipping_address.street}</p>
                                <p>{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
                                <p>{order.shipping_address.country}</p>
                            </div>
                        ) : (
                            <p>Aucune adresse</p>
                        )}
                    </div>

                    <div className="info-card">
                        <h3>Paiement</h3>
                        <p>Statut: {order.payment_status}</p>
                        {order.payment_method && <p>Méthode: {order.payment_method}</p>}
                    </div>

                    {order.notes && (
                        <div className="info-card">
                            <h3>Notes</h3>
                            <p>{order.notes}</p>
                        </div>
                    )}

                    {canCancel && (
                        <button
                            className="cancel-order-btn"
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Annulation...' : 'Annuler la commande'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
