import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Star,
    AlertCircle,
    DollarSign,
    ShoppingBag,
    MessageSquare,
    Users as CustomersIcon,
    ShieldAlert,
    Clock,
    Building2,
    CreditCard,
    BarChart3,
    Zap
} from 'lucide-react';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [subscription, setSubscription] = useState(null);
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
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

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
        fetchTenantInfo();
        fetchSubscriptionInfo();
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

    const fetchTenantInfo = async () => {
        try {
            const api = (await import('../../services/api')).default;
            const response = await api.get('/tenant/current');
            setTenant(response.data);
        } catch (err) {
            console.error("Failed to fetch tenant info", err);
        }
    };

    const fetchSubscriptionInfo = async () => {
        try {
            const api = (await import('../../services/api')).default;
            const response = await api.get('/subscription/current');
            setSubscription(response.data);
        } catch (err) {
            console.error("Failed to fetch subscription info", err);
        }
    };

    if (!user) return <div className="loader">Initialisation de la Maison...</div>;

    return (
        <div className="dashboard-content-wrapper">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Bonjour, <span className="gradient-text-gold">{user.name.split(' ')[0]}</span></h1>
                    <p>Voici l'état de votre plateforme SaaS B2B aujourd'hui.</p>
                </div>
                <div className="header-actions">
                    {tenant && (
                        <div className="tenant-badge">
                            <Building2 size={16} />
                            <span>{tenant.name || 'Tenant'}</span>
                        </div>
                    )}
                    {subscription && (
                        <div className="subscription-badge">
                            <CreditCard size={16} />
                            <span>{subscription.plan || 'Plan Standard'}</span>
                        </div>
                    )}
                    <div className="date-display">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                </div>
            </header>

            {/* SaaS B2B Info Cards */}
            <div className="stats-mosaic">
                <div className="premium-stat-card glow-aura">
                    <div className="card-icon gold"><DollarSign size={24} /></div>
                    <div className="card-data">
                        <span className="label">Ventes Totales</span>
                        <span className="value">{stats.sales}</span>
                    </div>
                    <TrendingUp size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon blue"><ShoppingBag size={24} /></div>
                    <div className="card-data">
                        <span className="label">Commandes</span>
                        <span className="value">{stats.orders}</span>
                    </div>
                    <ShoppingBag size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon green"><CustomersIcon size={24} /></div>
                    <div className="card-data">
                        <span className="label">Clients</span>
                        <span className="value">{stats.customers}</span>
                    </div>
                    <CustomersIcon size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon purple"><MessageSquare size={24} /></div>
                    <div className="card-data">
                        <span className="label">Avis</span>
                        <span className="value">{stats.reviews}</span>
                    </div>
                    <MessageSquare size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon orange"><AlertCircle size={24} /></div>
                    <div className="card-data">
                        <span className="label">Stock Faible</span>
                        <span className="value">{stats.low_stock}</span>
                    </div>
                    <AlertCircle size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon red"><Zap size={24} /></div>
                    <div className="card-data">
                        <span className="label">IA Analytics</span>
                        <span className="value">Actif</span>
                    </div>
                    <Zap size={40} className="card-bg-icon" />
                </div>
            </div>

            {/* SaaS B2B Features */}
            <div className="dashboard-grid">
                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><BarChart3 size={18} className="gold" /> Analytics IA</h3>
                        <span>Métriques Machine Learning</span>
                    </div>
                    <div className="analytics-cta">
                        <p>Accédez au dashboard IA complet avec KPIs ML, segmentation clients et performance des modèles.</p>
                        <button onClick={() => navigate('/admin/analytics')} className="btn-premium">
                            Voir Analytics IA <Zap size={16} />
                        </button>
                    </div>
                </section>

                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><Building2 size={18} /> Gestion Multi-Tenant</h3>
                        <span>Architecture SaaS</span>
                    </div>
                    <div className="tenant-info">
                        {tenant ? (
                            <>
                                <div className="info-row">
                                    <span className="info-label">Nom du Tenant:</span>
                                    <span className="info-value">{tenant.name || 'Non configuré'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Domaine:</span>
                                    <span className="info-value">{tenant.domain || 'localhost'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Statut:</span>
                                    <span className="info-value active">Actif</span>
                                </div>
                            </>
                        ) : (
                            <p className="loading-text">Chargement des informations tenant...</p>
                        )}
                    </div>
                </section>

                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><CreditCard size={18} /> Abonnement</h3>
                        <span>Plans SaaS</span>
                    </div>
                    <div className="subscription-info">
                        {subscription ? (
                            <>
                                <div className="info-row">
                                    <span className="info-label">Plan Actuel:</span>
                                    <span className="info-value">{subscription.plan || 'Standard'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Statut:</span>
                                    <span className="info-value active">{subscription.status || 'Actif'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Fonctionnalités IA:</span>
                                    <span className="info-value">{subscription.has_ai_features ? 'Incluses' : 'Non incluses'}</span>
                                </div>
                            </>
                        ) : (
                            <p className="loading-text">Chargement des informations abonnement...</p>
                        )}
                    </div>
                </section>
            </div>

            {/* Navigation vers les autres sections admin */}
            <div className="dashboard-grid">
                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><ShoppingBag size={18} /> Gestion des Commandes</h3>
                        <span>Administration</span>
                    </div>
                    <div className="admin-cta">
                        <p>Gérez toutes les commandes, suivez les livraisons et gérez les retours.</p>
                        <button onClick={() => navigate('/admin/orders')} className="btn-premium">
                            Gérer les Commandes
                        </button>
                    </div>
                </section>

                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><CustomersIcon size={18} /> Gestion des Utilisateurs</h3>
                        <span>Administration</span>
                    </div>
                    <div className="admin-cta">
                        <p>Gérez les comptes utilisateurs, les rôles et les permissions.</p>
                        <button onClick={() => navigate('/admin/users')} className="btn-premium">
                            Gérer les Utilisateurs
                        </button>
                    </div>
                </section>

                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><Star size={18} /> Gestion des Produits</h3>
                        <span>Catalogue</span>
                    </div>
                    <div className="admin-cta">
                        <p>Ajoutez, modifiez et gérez votre catalogue de parfums.</p>
                        <button onClick={() => navigate('/admin/categories')} className="btn-premium">
                            Gérer le Catalogue
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
