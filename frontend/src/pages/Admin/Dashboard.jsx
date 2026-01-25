import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Star,
    AlertCircle,
    DollarSign,
    ShoppingBag,
    MessageSquare,
    Users as CustomersIcon
} from 'lucide-react';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        sales: '0,00 €',
        orders: 0,
        reviews: 0,
        customers: 0,
        low_stock: 0,
        top_products: [],
        sales_trend: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!storedUser || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const isStaff = ['admin', 'super_admin', 'moderateur', 'gestionnaire'].includes(parsedUser.role);

        if (!isStaff) {
            navigate('/');
            return;
        }

        setUser(parsedUser);
        fetchStats();
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const api = (await import('../../services/api')).default;
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (err) {
            console.error("Failed to fetch admin stats", err);
        }
    };

    if (!user) return <div className="loader">Initialisation de la Maison...</div>;

    return (
        <div className="dashboard-content-wrapper">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Bonjour, <span className="gradient-text-gold">{user.name.split(' ')[0]}</span></h1>
                    <p>Voici l'état de votre Maison aujourd'hui.</p>
                </div>
                <div className="header-actions">
                    <div className="date-display">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                </div>
            </header>

            <div className="stats-mosaic">
                <div className="premium-stat-card glow-aura">
                    <div className="card-icon gold"><DollarSign size={24} /></div>
                    <div className="card-data">
                        <span className="label">Chiffre d'Affaires</span>
                        <span className="value">{stats.sales}</span>
                    </div>
                    <TrendingUp size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon blue"><ShoppingBag size={24} /></div>
                    <div className="card-data">
                        <span className="label">Commandes Totales</span>
                        <span className="value">{stats.orders}</span>
                    </div>
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon green"><CustomersIcon size={24} /></div>
                    <div className="card-data">
                        <span className="label">Clients Fidèles</span>
                        <span className="value">{stats.customers || 0}</span>
                    </div>
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon purple"><MessageSquare size={24} /></div>
                    <div className="card-data">
                        <span className="label">Avis en Attente</span>
                        <span className="value">{stats.reviews}</span>
                    </div>
                </div>

                {stats.low_stock > 0 && (
                    <div className="premium-stat-card warning">
                        <div className="card-icon red"><AlertCircle size={24} /></div>
                        <div className="card-data">
                            <span className="label">Alerte Stock Bas</span>
                            <span className="value">{stats.low_stock} produits</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="dashboard-grid">
                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><Star size={18} className="gold" /> Essence de la Performance</h3>
                        <span>Top ventes</span>
                    </div>
                    <div className="top-sales-list">
                        {stats.top_products?.length > 0 ? stats.top_products.map((p, i) => (
                            <div key={i} className="sales-item">
                                <div className="item-rank">#{i + 1}</div>
                                <div className="item-info">
                                    <span className="p-name">{p.perfume_name}</span>
                                    <div className="p-bar-container">
                                        <div className="p-bar" style={{ width: `${Math.min(p.total_sold * 10, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="item-qty">{p.total_sold} vendus</div>
                            </div>
                        )) : (
                            <div className="empty-state">Aucun mouvement pour le moment.</div>
                        )}
                    </div>
                </section>

                <section className="glass-premium trend-panel">
                    <div className="panel-header">
                        <h3><TrendingUp size={18} /> Sillage des Ventes</h3>
                        <span>Tendance 7 jours</span>
                    </div>
                    <div className="trend-visualization">
                        {stats.sales_trend?.length > 0 ? stats.sales_trend.map((day, i) => (
                            <div key={i} className="trend-column" title={`${day.date}: ${day.total}€`}>
                                <div className="bar-wrapper">
                                    <div
                                        className="bar"
                                        style={{ height: `${Math.min(day.total / 10, 100)}%` }}
                                    >
                                        <div className="bar-glow"></div>
                                    </div>
                                </div>
                                <span className="day-label">{day.date.split('-')[2]}</span>
                            </div>
                        )) : (
                            <div className="empty-state">Données en cours de collecte...</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
