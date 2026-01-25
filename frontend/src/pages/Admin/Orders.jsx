import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Filter, Eye, Printer, X, ShoppingBag, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (searchTerm) params.append('q', searchTerm);

            const response = await api.get(`/admin/orders?${params.toString()}`);
            setOrders(response.data.data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            setMessage({ text: "Statut de la commande mis à jour", type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error("Failed to update status", err);
            setMessage({ text: "Erreur lors de la mise à jour", type: 'error' });
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'paid': return <ShoppingBag size={16} />;
            case 'processing': return <Package size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return null;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'En attente',
            'paid': 'Payée',
            'processing': 'En préparation',
            'shipped': 'Expédiée',
            'delivered': 'Livrée',
            'cancelled': 'Annulée'
        };
        return labels[status] || status;
    };

    if (isLoading && orders.length === 0) return <div className="loader">Suivi des Sillages...</div>;

    return (
        <div className="admin-content-inner">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Gestion des <span className="gradient-text-gold">Commandes</span></h1>
                    <p>Suivez les acquisitions de vos clients avec précision.</p>
                </div>
            </header>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="admin-toolbar glass-premium" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un client, un n° de commande..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchOrders()}
                        style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                    />
                </div>
                <div className="filter-box" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Filter size={18} style={{ opacity: 0.5 }} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--primary)' }}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="paid">Payée</option>
                        <option value="processing">En préparation</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container glass-premium">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Référence</th>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Total</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td><strong style={{ color: 'var(--primary)' }}>#{order.order_number}</strong></td>
                                <td>{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600 }}>{order.user?.name}</span>
                                        <small style={{ opacity: 0.5 }}>{order.user?.email}</small>
                                    </div>
                                </td>
                                <td><span style={{ fontWeight: 700 }}>{order.total} €</span></td>
                                <td>
                                    <span className={`status-badge ${order.status}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}>
                                        {getStatusIcon(order.status)}
                                        {getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="icon-btn" title="Détails" onClick={() => setSelectedOrder(order)}>
                                        <Eye size={18} />
                                    </button>
                                    <select
                                        className="status-select"
                                        value={order.status}
                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                        style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }}
                                    >
                                        <option value="pending">En attente</option>
                                        <option value="paid">Payée</option>
                                        <option value="processing">Préparation</option>
                                        <option value="shipped">Expédiée</option>
                                        <option value="delivered">Livrée</option>
                                        <option value="cancelled">Annuler</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="overlay-blur" onClick={() => setSelectedOrder(null)}>
                    <div className="premium-modal" style={{ width: '800px' }} onClick={e => e.stopPropagation()}>
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <ShoppingBag className="gold-text" size={32} />
                                <div>
                                    <h2 style={{ margin: 0 }}>Commande #{selectedOrder.order_number}</h2>
                                    <span className={`status-badge ${selectedOrder.status}`}>{getStatusLabel(selectedOrder.status)}</span>
                                </div>
                            </div>
                            <button className="icon-btn" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
                        </header>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', margin: '2rem 0' }}>
                            <div className="detail-section glass-premium" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                                <h3 style={{ fontSize: '0.9rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '1.5rem' }}>Destinataire</h3>
                                <p><strong>{selectedOrder.user?.name}</strong></p>
                                <p>{selectedOrder.user?.email}</p>
                                <p style={{ marginTop: '1rem' }}>
                                    {selectedOrder.shipping_address?.address}<br />
                                    {selectedOrder.shipping_address?.zip_code} {selectedOrder.shipping_address?.city}
                                </p>
                            </div>
                            <div className="detail-section glass-premium" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                                <h3 style={{ fontSize: '0.9rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '1.5rem' }}>Résumé</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Sous-total</span>
                                    <span>{selectedOrder.subtotal} €</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Livraison</span>
                                    <span>{selectedOrder.shipping_cost} €</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontWeight: 700 }}>TOTAL</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--primary)' }}>{selectedOrder.total} €</span>
                                </div>
                                <p style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>Méthode: {selectedOrder.payment_method}</p>
                            </div>
                        </div>

                        <div className="items-list-container">
                            <h3 style={{ fontSize: '0.9rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '1rem' }}>Articles commandés</h3>
                            <div className="glass-premium" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                                <table className="premium-table" style={{ fontSize: '0.85rem' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <tr>
                                            <th>Essence</th>
                                            <th>Prix Unit.</th>
                                            <th>Qté</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.perfume_name}</td>
                                                <td>{item.perfume_price} €</td>
                                                <td>{item.quantity}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.subtotal} €</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }} onClick={() => window.print()}>
                                <Printer size={18} /> Imprimer la Facture
                            </button>
                            <button className="gold-button" onClick={() => setSelectedOrder(null)}>Terminer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
