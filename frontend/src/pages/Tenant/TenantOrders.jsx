import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Search, Filter, Eye, Clock, Package, Truck, CheckCircle, XCircle, RefreshCw, Send, ShieldAlert } from 'lucide-react';

const TenantOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Shipping simulation state
    const [shippingDetails, setShippingDetails] = useState({ carrier: 'Colissimo', trackingNumber: '' });
    const [activeReturnOrder, setActiveReturnOrder] = useState(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (searchTerm) params.append('q', searchTerm);

            const response = await api.get(`/admin/orders?${params.toString()}`);
            setOrders(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch tenant orders", err);
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, searchTerm]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            setMessage({ text: `Commande mise à jour vers le statut: ${getStatusLabel(newStatus)}`, type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error("Failed to update status", err);
            setMessage({ text: "Erreur lors du changement de statut.", type: 'error' });
        }
    };

    const handleShipOrder = async (e, orderId) => {
        e.preventDefault();
        try {
            // Update order status to shipped
            await api.put(`/orders/${orderId}/status`, { 
                status: 'shipped',
                carrier: shippingDetails.carrier,
                tracking_number: shippingDetails.trackingNumber || `FR-${Math.floor(100000000 + Math.random() * 900000000)}`
            });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: 'shipped' });
            }
            setSelectedOrder(null);
            setMessage({ text: "La commande a été marquée comme expédiée. Notification de suivi envoyée au client.", type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error("Failed to ship order", err);
            setMessage({ text: "Erreur lors de l'expédition de la commande.", type: 'error' });
        }
    };

    const handleApproveReturn = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: 'cancelled' });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
            setActiveReturnOrder(null);
            setSelectedOrder(null);
            setMessage({ text: "Retour validé. Le remboursement a été initié via Stripe.", type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error("Failed to approve return", err);
            setMessage({ text: "Erreur lors de la validation du retour.", type: 'error' });
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={15} style={{ color: '#d97706' }} />;
            case 'paid': return <CheckCircle size={15} style={{ color: '#2563eb' }} />;
            case 'processing': return <Package size={15} style={{ color: '#8b5cf6' }} />;
            case 'shipped': return <Truck size={15} style={{ color: '#10b981' }} />;
            case 'delivered': return <CheckCircle size={15} style={{ color: '#059669' }} fill="#059669" />;
            case 'cancelled': return <XCircle size={15} style={{ color: '#ef4444' }} />;
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
            'cancelled': 'Annulée / Retournée'
        };
        return labels[status] || status;
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        revenue: orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0)
    };

    return (
        <div className="tenant-orders-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                <div className="glass-premium" style={{ padding: '1.25rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Commandes Totales</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>{stats.total}</div>
                </div>
                <div className="glass-premium" style={{ padding: '1.25rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>En préparation</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.25rem' }}>{stats.processing}</div>
                </div>
                <div className="glass-premium" style={{ padding: '1.25rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>En Transit</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{stats.shipped}</div>
                </div>
                <div className="glass-premium" style={{ padding: '1.25rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Chiffre d'Affaires</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>{stats.revenue.toFixed(2)} €</div>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                    {message.text}
                </div>
            )}

            {/* Filter Toolbar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ flex: 1, minWidth: '250px' }}>
                    <Search size={16} />
                    <input 
                        type="text" 
                        placeholder="Rechercher par N° commande ou client..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && fetchOrders()}
                    />
                </div>
                <select 
                    className="filter-select" 
                    style={{ width: '180px' }}
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="paid">Payée</option>
                    <option value="processing">Préparation</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée / Retournée</option>
                </select>
                <button className="btn btn-secondary" onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} /> Rafraîchir
                </button>
            </div>

            {/* Main Orders Table */}
            {isLoading ? (
                <div className="analytics-loader"><div className="loader-spinner" /><p>Chargement des expéditions...</p></div>
            ) : orders.length === 0 ? (
                <div className="glass-premium" style={{ padding: '4rem', textAlign: 'center', background: '#fff' }}>
                    <ShoppingCart size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aucune commande enregistrée</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Les commandes passées par vos clients apparaîtront ici.</p>
                </div>
            ) : (
                <div className="glass-premium" style={{ borderRadius: '20px', padding: '1rem', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>N° Commande</th>
                                    <th>Client</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Statut</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>#{order.order_number}</strong></td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>{order.user?.name || 'Client Anonyme'}</span>
                                                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{order.user?.email}</small>
                                            </div>
                                        </td>
                                        <td>{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                                        <td><strong>{parseFloat(order.total).toFixed(2)} €</strong></td>
                                        <td>
                                            <span 
                                                style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.4rem', 
                                                    padding: '0.35rem 0.75rem', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: 600,
                                                    background: order.status === 'delivered' ? 'rgba(5, 150, 105, 0.1)' : order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.03)'
                                                }}
                                            >
                                                {getStatusIcon(order.status)}
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(order)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Eye size={14} /> Gérer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Detail Drawer / Modal */}
            {selectedOrder && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', zIndex: 1000 }}>
                    <div className="glass-premium animate-fade-in" style={{ margin: 'auto', width: '90%', maxWidth: '800px', background: '#fff', padding: '2.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Commande #{selectedOrder.order_number}</h3>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Détails de Livraison</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    <strong>Client :</strong> {selectedOrder.user?.name}<br />
                                    <strong>Adresse :</strong><br />
                                    {selectedOrder.shipping_address?.address || 'Non spécifiée'}<br />
                                    {selectedOrder.shipping_address?.zip_code} {selectedOrder.shipping_address?.city}<br />
                                    <strong>Email :</strong> {selectedOrder.user?.email}
                                </p>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Statut de l'expédition</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')} disabled={selectedOrder.status !== 'paid' && selectedOrder.status !== 'pending'}>
                                            Préparer
                                        </button>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')} disabled={selectedOrder.status !== 'shipped'}>
                                            Marquer Livré
                                        </button>
                                        <button className="btn btn-secondary btn-sm text-danger" onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')} disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}>
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Form */}
                        {selectedOrder.status === 'processing' && (
                            <div style={{ background: 'rgba(37, 99, 235, 0.02)', border: '1px dashed var(--primary)', padding: '1.25rem', borderRadius: '16px' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Truck size={16} /> Procéder à l'expédition
                                </h4>
                                <form onSubmit={(e) => handleShipOrder(e, selectedOrder.id)} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Transporteur</label>
                                        <select className="form-input text-sm" value={shippingDetails.carrier} onChange={e => setShippingDetails({ ...shippingDetails, carrier: e.target.value })}>
                                            <option value="Colissimo">Colissimo</option>
                                            <option value="Chronopost">Chronopost</option>
                                            <option value="DHL Express">DHL Express</option>
                                            <option value="FedEx">FedEx</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1.5, minWidth: '180px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>N° de suivi (généré auto si vide)</label>
                                        <input type="text" className="form-input text-sm" placeholder="ex: 8V09281726" value={shippingDetails.trackingNumber} onChange={e => setShippingDetails({ ...shippingDetails, trackingNumber: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem' }}>Générer le bordereau & Expédier</button>
                                </form>
                            </div>
                        )}

                        {/* Return Moderation */}
                        {selectedOrder.status === 'delivered' && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.02)', border: '1px dashed #ef4444', padding: '1.25rem', borderRadius: '16px' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldAlert size={16} /> Demande de retour ou litige client
                                </h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                    Le client souhaite retourner un flacon non scellé ou signaler une anomalie. Validez le retour pour initier le remboursement.
                                </p>
                                <button className="btn btn-secondary btn-sm text-danger" onClick={() => handleApproveReturn(selectedOrder.id)}>
                                    Valider le retour & Rembourser via Stripe
                                </button>
                            </div>
                        )}

                        {/* Order Items Table */}
                        <div style={{ marginTop: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Essences Commandées</h4>
                            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table className="premium-table" style={{ margin: 0 }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-alt)' }}>
                                            <th>Article</th>
                                            <th>Prix</th>
                                            <th>Quantité</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.perfume_name}</td>
                                                <td>{parseFloat(item.perfume_price || 0).toFixed(2)} €</td>
                                                <td>x {item.quantity}</td>
                                                <td style={{ textAlign: 'right' }}><strong>{(item.quantity * parseFloat(item.perfume_price || 0)).toFixed(2)} €</strong></td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: '2px solid var(--border-light)' }}>
                                            <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>Sous-total</td>
                                            <td style={{ textAlign: 'right' }}>{parseFloat(selectedOrder.subtotal || 0).toFixed(2)} €</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>Frais d'envoi</td>
                                            <td style={{ textAlign: 'right' }}>{parseFloat(selectedOrder.shipping_cost || 0).toFixed(2)} €</td>
                                        </tr>
                                        <tr style={{ background: 'var(--bg-alt)', fontWeight: 800 }}>
                                            <td colSpan="3" style={{ textAlign: 'right' }}>TOTAL</td>
                                            <td style={{ textAlign: 'right', color: 'var(--primary)' }}>{parseFloat(selectedOrder.total || 0).toFixed(2)} €</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantOrders;
