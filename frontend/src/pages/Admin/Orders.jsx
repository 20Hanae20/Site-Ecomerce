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

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        revenue: orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0).toFixed(2)
    };

    return (
        <div className="admin-page-container">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Gestion des <span className="gradient-text-gold">Commandes</span></h1>
                    <p>Suivez les acquisitions de votre clientèle avec une précision absolue.</p>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="admin-stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Commandes</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: 'white' }}>{stats.total}</div>
                </div>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>En Attente</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: 'var(--primary)' }}>{stats.pending}</div>
                </div>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Livrées</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: '#10b981' }}>{stats.delivered}</div>
                </div>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Chiffre d'Affaires</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: 'white' }}>{stats.revenue} €</div>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ borderRadius: '14px', marginBottom: '2rem' }}>
                    {message.text}
                </div>
            )}

            <div className="admin-toolbar-refined" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem' }}>
                <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
                    <input
                        className="premium-input-refined"
                        type="text"
                        placeholder="Rechercher une référence ou un client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchOrders()}
                        style={{ width: '100%', paddingLeft: '3rem' }}
                    />
                </div>
                <div className="filter-box" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <select
                        className="premium-input-refined"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ minWidth: '180px', color: filterStatus ? 'var(--primary)' : 'rgba(255,255,255,0.5)' }}
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

            <div className="admin-table-container">
                <table className="premium-table-refined">
                    <thead>
                        <tr>
                            <th>Référence</th>
                            <th>Client / Date</th>
                            <th>Total</th>
                            <th>Statut</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>Aucun sillage enregistré pour le moment.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="avatar-refined" style={{ width: '40px', height: '40px', background: 'rgba(212, 175, 55, 0.05)', color: 'var(--primary)' }}>
                                                <Package size={18} />
                                            </div>
                                            <strong style={{ color: 'var(--primary)', letterSpacing: '1px' }}>#{order.order_number}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="avatar-refined" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                {order.user?.name?.charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600, color: 'white' }}>{order.user?.name}</span>
                                                <small style={{ opacity: 0.4, fontSize: '0.75rem' }}>{new Date(order.created_at).toLocaleDateString('fr-FR')}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ fontWeight: 700, color: 'white' }}>{order.total} €</span></td>
                                    <td>
                                        <div
                                            className={`status-chip ${order.status}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: 'fit-content',
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                background: `rgba(255,255,255,0.03)`,
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <span style={{ opacity: 0.7 }}>{getStatusIcon(order.status)}</span>
                                            {getStatusLabel(order.status)}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <select
                                                className="premium-input-refined"
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px', width: 'auto' }}
                                            >
                                                <option value="pending">En attente</option>
                                                <option value="paid">Payée</option>
                                                <option value="processing">Préparation</option>
                                                <option value="shipped">Expédiée</option>
                                                <option value="delivered">Livrée</option>
                                                <option value="cancelled">Annuler</option>
                                            </select>
                                            <button className="icon-btn" title="Détails" onClick={() => setSelectedOrder(order)} style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)' }}>
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="overlay-blur" onClick={() => setSelectedOrder(null)} style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.7)' }}>
                    <div className="admin-card-glass" style={{ width: '90%', maxWidth: '900px', padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div className="avatar-refined" style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)' }}>
                                    <ShoppingBag size={28} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 500 }}>Commande <span className="gradient-text-gold">#{selectedOrder.order_number}</span></h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.4rem' }}>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(selectedOrder.created_at).toLocaleString('fr-FR')}</span>
                                        <span className={`status-badge ${selectedOrder.status}`} style={{ fontSize: '0.7rem' }}>{getStatusLabel(selectedOrder.status)}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="icon-btn" onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.05)' }}><X size={20} /></button>
                        </header>

                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                <div className="admin-card-glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                                    <h3 style={{ fontSize: '0.75rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Informations Client</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div className="avatar-refined" style={{ width: '42px', height: '42px' }}>{selectedOrder.user?.name?.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'white' }}>{selectedOrder.user?.name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{selectedOrder.user?.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                                            <Truck size={16} style={{ marginTop: '3px', opacity: 0.5 }} />
                                            <div>
                                                {selectedOrder.shipping_address?.address}<br />
                                                {selectedOrder.shipping_address?.zip_code} {selectedOrder.shipping_address?.city}<br />
                                                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Méthode de livraison: Standard</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-card-glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                                    <h3 style={{ fontSize: '0.75rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Résumé Financier</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ opacity: 0.6 }}>Sous-total</span>
                                            <span style={{ color: 'white' }}>{selectedOrder.subtotal} €</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ opacity: 0.6 }}>Frais de port</span>
                                            <span style={{ color: 'white' }}>{selectedOrder.shipping_cost} €</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span style={{ fontWeight: 500, color: 'white' }}>TOTAL TTC</span>
                                            <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--primary)' }}>{selectedOrder.total} €</span>
                                        </div>
                                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
                                            <CheckCircle size={14} />
                                            Paiement par {selectedOrder.payment_method}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="items-list-container">
                                <h3 style={{ fontSize: '0.75rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.25rem' }}>Articles de la Sélection</h3>
                                <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table className="premium-table-refined" style={{ margin: 0 }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <tr>
                                                <th>Fragrance</th>
                                                <th>Prix Unit.</th>
                                                <th style={{ textAlign: 'center' }}>Qté</th>
                                                <th style={{ textAlign: 'right' }}>Sous-total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items?.map(item => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.5 }}></div>
                                                            <span style={{ fontWeight: 500, color: 'white' }}>{item.perfume_name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ opacity: 0.7 }}>{item.perfume_price} €</td>
                                                    <td style={{ textAlign: 'center' }}>x {item.quantity}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'white' }}>{item.subtotal} €</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <footer style={{ padding: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button className="gold-button inactive" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} onClick={() => window.print()}>
                                <Printer size={18} /> Imprimer
                            </button>
                            <button className="gold-button" style={{ padding: '0.8rem 2.5rem' }} onClick={() => setSelectedOrder(null)}>Terminer</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
