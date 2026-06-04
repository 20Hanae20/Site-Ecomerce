import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, CreditCard, UserPlus, ShoppingBag,
    AlertTriangle, CheckCircle, Clock, Filter, Trash2
} from 'lucide-react';

const NOTIF_TYPES = {
    subscription_expiring: { icon: CreditCard, color: '#f59e0b', bg: '#fef3c7', label: 'Abonnement' },
    payment_failed: { icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2', label: 'Paiement' },
    new_customer: { icon: UserPlus, color: '#10b981', bg: '#d1fae5', label: 'Client' },
    large_order: { icon: ShoppingBag, color: '#3b82f6', bg: '#dbeafe', label: 'Commande' },
};

// Generate simulated notifications based on real tenant data patterns
const generateNotifications = () => {
    const now = new Date();
    return [
        {
            id: 1,
            type: 'new_customer',
            title: 'Nouveau client inscrit',
            message: 'Un nouveau client vient de créer un compte sur votre boutique.',
            time: new Date(now - 1000 * 60 * 15).toISOString(), // 15 min ago
            read: false,
        },
        {
            id: 2,
            type: 'large_order',
            title: 'Commande importante reçue',
            message: 'Une commande de plus de 200€ vient d\'être passée.',
            time: new Date(now - 1000 * 60 * 45).toISOString(),
            read: false,
        },
        {
            id: 3,
            type: 'subscription_expiring',
            title: 'Abonnement expire bientôt',
            message: 'Votre abonnement Business expire dans 7 jours. Pensez à renouveler.',
            time: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
            read: false,
        },
        {
            id: 4,
            type: 'payment_failed',
            title: 'Échec de paiement',
            message: 'Le paiement de la commande #1042 a échoué. Le client a été notifié.',
            time: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
            read: true,
        },
        {
            id: 5,
            type: 'new_customer',
            title: 'Nouveau client VIP',
            message: 'Un client a passé sa 5ème commande et rejoint le segment VIP.',
            time: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
            read: true,
        },
        {
            id: 6,
            type: 'large_order',
            title: 'Pic de commandes',
            message: '12 commandes reçues dans la dernière heure — activité supérieure à la normale.',
            time: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
            read: true,
        },
        {
            id: 7,
            type: 'payment_failed',
            title: 'Tentative de paiement suspecte',
            message: '3 tentatives de paiement échouées depuis la même IP.',
            time: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
            read: true,
        },
        {
            id: 8,
            type: 'subscription_expiring',
            title: 'Mise à jour plan disponible',
            message: 'De nouvelles fonctionnalités sont disponibles avec le plan Enterprise.',
            time: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
            read: true,
        },
    ];
};

const formatTimeAgo = (isoString) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
};

const NotificationsCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
        if (!stored || !token) { navigate('/admin/login'); return; }
        const user = JSON.parse(stored);
        if (!['admin', 'super_admin', 'gestionnaire'].includes(user.role)) { navigate('/'); return; }
        setNotifications(generateNotifications());
    }, [navigate]);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotif = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const filtered = notifications.filter(n => {
        if (filter !== 'all' && n.type !== filter) return false;
        if (statusFilter === 'unread' && n.read) return false;
        if (statusFilter === 'read' && !n.read) return false;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="analytics-full-page">
            <div className="analytics-header">
                <div>
                    <h1>🔔 Centre de Notifications</h1>
                    <p>{unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="notif-header-actions">
                    <button className="btn-mark-all" onClick={markAllRead} disabled={unreadCount === 0}>
                        <CheckCircle size={14} />
                        Tout marquer lu
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="notif-filters">
                <div className="filter-group">
                    <Filter size={16} />
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                        <option value="all">Tous les types</option>
                        <option value="subscription_expiring">Abonnement</option>
                        <option value="payment_failed">Paiement</option>
                        <option value="new_customer">Client</option>
                        <option value="large_order">Commande</option>
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
                        <option value="all">Toutes</option>
                        <option value="unread">Non lues</option>
                        <option value="read">Lues</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="notif-summary-grid">
                {Object.entries(NOTIF_TYPES).map(([key, config]) => {
                    const TypeIcon = config.icon;
                    const count = notifications.filter(n => n.type === key).length;
                    const unread = notifications.filter(n => n.type === key && !n.read).length;
                    return (
                        <div key={key} className="notif-summary-card" style={{ borderLeftColor: config.color }} onClick={() => setFilter(key)}>
                            <div className="summary-icon" style={{ background: config.bg, color: config.color }}><TypeIcon size={20} /></div>
                            <div>
                                <span className="summary-label">{config.label}</span>
                                <span className="summary-count">{count} {unread > 0 && <span className="unread-badge">{unread} new</span>}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Notifications List */}
            <div className="notif-list">
                {filtered.length > 0 ? filtered.map(n => {
                    const config = NOTIF_TYPES[n.type] || NOTIF_TYPES.new_customer;
                    const NotifIcon = config.icon;
                    return (
                        <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`} onClick={() => markAsRead(n.id)}>
                            <div className="notif-icon" style={{ background: config.bg, color: config.color }}>
                                <NotifIcon size={18} />
                            </div>
                            <div className="notif-content">
                                <div className="notif-title-row">
                                    <h4>{n.title}</h4>
                                    {!n.read && <span className="unread-dot" />}
                                </div>
                                <p>{n.message}</p>
                                <span className="notif-time"><Clock size={12} /> {formatTimeAgo(n.time)}</span>
                            </div>
                            <button className="notif-delete" onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} title="Supprimer">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                }) : (
                    <div className="notif-empty">
                        <Bell size={48} />
                        <p>Aucune notification</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsCenter;
