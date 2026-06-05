import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
    DollarSign, ShoppingBag, Users, TrendingUp, Package,
    Download, AlertTriangle, Star, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const KpiCard = ({ icon: Icon, label, value, subtitle, color = 'blue', trend }) => (
    <div className="analytics-kpi-card">
        <div className={`kpi-icon ${color}`}><Icon size={22} /></div>
        <div className="kpi-content">
            <span className="kpi-label">{label}</span>
            <span className="kpi-value">{value}</span>
            {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
        </div>
        {trend !== undefined && (
            <div className={`kpi-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
                {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(trend)}%
            </div>
        )}
    </div>
);

const AnalyticsDashboardFull = () => {
    const [data, setData] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState('');
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const [dashRes, kpiRes] = await Promise.all([
                api.get('/admin/analytics/dashboard'),
                api.get('/admin/analytics/kpis'),
            ]);
            setData(dashRes.data.data);
            setKpis(kpiRes.data.data);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
        if (!stored || !token) { navigate('/admin/login'); return; }
        const user = JSON.parse(stored);
        if (!['admin', 'super_admin', 'gestionnaire'].includes(user.role)) { navigate('/'); return; }
        fetchData();
    }, [navigate, fetchData]);

    const handleExport = async (type) => {
        setExporting(type);
        try {
            const response = await api.get(`/admin/analytics/export/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setExporting('');
        }
    };

    if (loading) return <div className="analytics-loader"><div className="loader-spinner" /><p>Chargement des analytics...</p></div>;
    if (!data) return <div className="analytics-loader"><p>Aucune donnée disponible</p></div>;

    const { revenue, orders, products, customers } = data;

    return (
        <div className="analytics-full-page">
            {/* Header */}
            <div className="analytics-header">
                <div>
                    <h1>📊 Analytics Dashboard</h1>
                    <p>Vue complète des performances de votre boutique</p>
                </div>
                <div className="export-buttons">
                    {['orders', 'customers', 'products', 'analytics'].map(type => (
                        <button key={type} className="btn-export" onClick={() => handleExport(type)} disabled={exporting === type}>
                            <Download size={14} />
                            {exporting === type ? '...' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="analytics-kpi-grid">
                <KpiCard icon={DollarSign} label="Chiffre d'affaires" value={`${(revenue.total || 0).toLocaleString('fr-FR')} €`} subtitle={`Ce mois: ${(revenue.monthly || 0).toLocaleString('fr-FR')} €`} color="gold" trend={kpis?.growth_rate} />
                <KpiCard icon={ShoppingBag} label="Commandes" value={orders.total} subtitle={`Ce mois: ${orders.monthly}`} color="blue" />
                <KpiCard icon={TrendingUp} label="Panier moyen" value={`${orders.avg_basket} €`} color="green" />
                <KpiCard icon={Users} label="Clients actifs" value={customers.active} subtitle={`Nouveaux: ${customers.new}`} color="purple" />
                <KpiCard icon={Package} label="Produits actifs" value={products.total} subtitle={`Rupture: ${products.out_of_stock}`} color="cyan" />
                <KpiCard icon={Star} label="Conversion" value={`${kpis?.conversion_rate || 0}%`} color="orange" />
            </div>

            {/* Charts Grid */}
            <div className="analytics-charts-grid">
                {/* Revenue Trend - LineChart */}
                <div className="chart-card wide">
                    <div className="chart-header">
                        <h3>Tendance des revenus</h3>
                        <span className="chart-badge">12 derniers mois</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenue.trend || []}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip formatter={(val) => [`${Number(val).toLocaleString('fr-FR')} €`, 'Revenus']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Selling Products - BarChart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Top Produits Vendus</h3>
                        <span className="chart-badge">Par quantité</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={(products.top_selling || []).slice(0, 6)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis dataKey="perfume_name" type="category" width={120} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            <Bar dataKey="total_sold" radius={[0, 6, 6, 0]}>
                                {(products.top_selling || []).slice(0, 6).map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status Distribution - PieChart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Statuts Commandes</h3>
                        <span className="chart-badge">Répartition</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={orders.statuses || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${status} (${count})`}>
                                {(orders.statuses || []).map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* New Customers Trend - AreaChart */}
                <div className="chart-card wide">
                    <div className="chart-header">
                        <h3>Nouveaux Clients</h3>
                        <span className="chart-badge">6 derniers mois</span>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={customers.trend || []}>
                            <defs>
                                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} fill="url(#colorCustomers)" name="Nouveaux clients" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tables Section */}
            <div className="analytics-tables-grid">
                {/* Low Stock Alert */}
                <div className="table-card">
                    <div className="table-header">
                        <h3><AlertTriangle size={18} className="text-warning" /> Produits en Rupture / Stock Faible</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr><th>Produit</th><th>Stock</th><th>Prix</th></tr>
                            </thead>
                            <tbody>
                                {products.top_rated?.length > 0 ? products.top_rated.map(p => (
                                    <tr key={p.id}>
                                        <td className="product-cell">
                                            {p.image_url && <img src={p.image_url} alt={p.name} className="table-thumb" />}
                                            {p.name}
                                        </td>
                                        <td><span className="badge badge-warning">{p.stock_quantity ?? '?'}</span></td>
                                        <td>{p.price} €</td>
                                    </tr>
                                )) : <tr><td colSpan="3" className="empty-cell">Aucun produit en rupture</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Rated */}
                <div className="table-card">
                    <div className="table-header">
                        <h3><Star size={18} className="text-gold" /> Produits les Mieux Notés</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr><th>Produit</th><th>Note</th><th>Avis</th></tr>
                            </thead>
                            <tbody>
                                {products.top_rated?.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td><span className="rating-display">⭐ {Number(p.rating_avg).toFixed(1)}</span></td>
                                        <td>{p.rating_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* KPI SaaS Section */}
            {kpis && (
                <div className="saas-kpis-section">
                    <h2>📈 KPIs SaaS</h2>
                    <div className="saas-kpi-grid">
                        <div className="saas-kpi"><span className="saas-kpi-val">{kpis.mrr?.toLocaleString('fr-FR')} €</span><span className="saas-kpi-label">MRR</span></div>
                        <div className="saas-kpi"><span className="saas-kpi-val">{kpis.arr?.toLocaleString('fr-FR')} €</span><span className="saas-kpi-label">ARR</span></div>
                        <div className="saas-kpi"><span className="saas-kpi-val">{kpis.arpu?.toLocaleString('fr-FR')} €</span><span className="saas-kpi-label">ARPU</span></div>
                        <div className="saas-kpi"><span className="saas-kpi-val">{kpis.ltv?.toLocaleString('fr-FR')} €</span><span className="saas-kpi-label">LTV</span></div>
                        <div className="saas-kpi"><span className="saas-kpi-val">{kpis.churn_rate}%</span><span className="saas-kpi-label">Churn Rate</span></div>
                        <div className="saas-kpi"><span className="saas-kpi-val">{kpis.conversion_rate}%</span><span className="saas-kpi-label">Conversion</span></div>
                        <div className="saas-kpi"><span className="saas-kpi-val">{kpis.growth_rate}%</span><span className="saas-kpi-label">Croissance</span></div>
                        <div className="saas-kpi"><span className="saas-kpi-val">{kpis.total_customers}</span><span className="saas-kpi-label">Clients</span></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboardFull;
