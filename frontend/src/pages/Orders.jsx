import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params = filter ? `?status=${filter}` : '';
            const response = await api.get(`/orders${params}`);
            setOrders(response.data.data);
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError('Impossible de charger les commandes.');
        } finally {
            setIsLoading(false);
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
            day: 'numeric'
        });
    };

    if (isLoading) return <div className="loader">Chargement...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="page-container orders-page">
            <div className="page-header">
                <h1>Mes Commandes</h1>
                <div className="hero-divider"></div>
                <p>Suivez l'état de vos achats</p>
            </div>

            <div className="orders-filters">
                <button
                    className={filter === '' ? 'active' : ''}
                    onClick={() => setFilter('')}
                >
                    Toutes
                </button>
                <button
                    className={filter === 'pending' ? 'active' : ''}
                    onClick={() => setFilter('pending')}
                >
                    En attente
                </button>
                <button
                    className={filter === 'paid' ? 'active' : ''}
                    onClick={() => setFilter('paid')}
                >
                    Payées
                </button>
                <button
                    className={filter === 'delivered' ? 'active' : ''}
                    onClick={() => setFilter('delivered')}
                >
                    Livrées
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="no-results">
                    <p>Aucune commande trouvée.</p>
                    <Link to="/catalogue" className="submit-btn" style={{ maxWidth: '300px', margin: '2rem auto' }}>
                        Découvrir nos parfums
                    </Link>
                </div>
            ) : (
                <div className="orders-grid">
                    {orders.map(order => (
                        <Link
                            key={order.id}
                            to={`/orders/${order.id}`}
                            className="order-card-link"
                        >
                            <div className="order-card">
                                <div className="order-header">
                                    <div>
                                        <span className="order-number">{order.order_number}</span>
                                        <span className="order-date">{formatDate(order.created_at)}</span>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="order-items-preview">
                                    <span className="items-count">
                                        {order.items?.length || 0} article{order.items?.length > 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="order-footer">
                                    <span className="order-total">{order.total} €</span>
                                    <span className="view-details">Voir détails →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
