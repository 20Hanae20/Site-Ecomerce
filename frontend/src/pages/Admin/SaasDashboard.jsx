import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    Building2, DollarSign, Users, ShoppingBag, Package,
    TrendingUp, Search, Filter, Power, Trash2, Play,
    AlertCircle, CheckCircle
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const SaasDashboard = () => {
    const [dashData, setDashData] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const [dashRes, tenantsRes] = await Promise.all([
                api.get('/admin/saas/dashboard'),
                api.get('/admin/saas/tenants'),
            ]);
            setDashData(dashRes.data.data);
            setTenants(tenantsRes.data.data || []);
        } catch (err) {
            console.error('SaaS dashboard fetch failed', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
        if (!stored || !token) { navigate('/admin/login'); return; }
        const user = JSON.parse(stored);
        if (user.role !== 'super_admin') { navigate('/admin/dashboard'); return; }
        fetchData();
    }, [navigate, fetchData]);

    const handleTenantAction = async (id, action) => {
        if (action === 'delete' && !window.confirm('Supprimer ce tenant définitivement ? Cette action est irréversible.')) return;
        setActionLoading(`${id}-${action}`);
        try {
            await api.put(`/admin/saas/tenants/${id}/status`, { action });
            await fetchData();
        } catch (err) {
            console.error('Tenant action failed', err);
        } finally {
            setActionLoading('');
        }
    };

    const filteredTenants = tenants.filter(t => {
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.domain.toLowerCase().includes(search.toLowerCase());
        const matchPlan = !planFilter || t.plan === planFilter;
        return matchSearch && matchPlan;
    });

    if (loading) return <div className="analytics-loader"><div className="loader-spinner" /><p>Chargement du tableau SaaS...</p></div>;

    const kpis = dashData?.kpis || {};

    return (
        <div className="analytics-full-page">
            {/* Header */}
            <div className="analytics-header">
                <div>
                    <h1>🏢 Super Admin SaaS</h1>
                    <p>Gestion centralisée de la plateforme multi-tenant</p>
                </div>
            </div>

            {/* Global KPIs */}
            <div className="analytics-kpi-grid">
                <div className="analytics-kpi-card">
                    <div className="kpi-icon gold"><DollarSign size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">MRR</span>
                        <span className="kpi-value">{(kpis.mrr || 0).toLocaleString('fr-FR')} €</span>
                    </div>
                </div>
                <div className="analytics-kpi-card">
                    <div className="kpi-icon blue"><TrendingUp size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">ARR</span>
                        <span className="kpi-value">{(kpis.arr || 0).toLocaleString('fr-FR')} €</span>
                    </div>
                </div>
                <div className="analytics-kpi-card">
                    <div className="kpi-icon green"><Building2 size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Tenants Actifs</span>
                        <span className="kpi-value">{kpis.active_tenants || 0} / {kpis.total_tenants || 0}</span>
                    </div>
                </div>
                <div className="analytics-kpi-card">
                    <div className="kpi-icon purple"><Users size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Utilisateurs</span>
                        <span className="kpi-value">{kpis.total_users || 0}</span>
                    </div>
                </div>
                <div className="analytics-kpi-card">
                    <div className="kpi-icon cyan"><ShoppingBag size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Commandes</span>
                        <span className="kpi-value">{kpis.total_orders || 0}</span>
                    </div>
                </div>
                <div className="analytics-kpi-card">
                    <div className="kpi-icon orange"><AlertCircle size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Churn Rate</span>
                        <span className="kpi-value">{kpis.churn_rate || 0}%</span>
                    </div>
                </div>
            </div>

            {/* MRR Trend Chart */}
            <div className="analytics-charts-grid">
                <div className="chart-card wide">
                    <div className="chart-header">
                        <h3>Évolution MRR</h3>
                        <span className="chart-badge">6 derniers mois</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={dashData?.mrr_trend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip formatter={(val) => [`${Number(val).toLocaleString('fr-FR')} €`, 'MRR']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            <Line type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue per Tenant */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Revenus par Tenant</h3>
                        <span className="chart-badge">Top tenants</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={tenants.sort((a, b) => (b.stats?.revenue || 0) - (a.stats?.revenue || 0)).slice(0, 6)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <Tooltip formatter={(val) => [`${Number(val).toLocaleString('fr-FR')} €`, 'Revenus']} contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="stats.revenue" radius={[6, 6, 0, 0]}>
                                {tenants.slice(0, 6).map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tenants List */}
            <div className="table-card">
                <div className="table-header">
                    <h3><Building2 size={18} /> Gestion des Tenants</h3>
                    <div className="table-actions">
                        <div className="search-box">
                            <Search size={16} />
                            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="filter-select" value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
                            <option value="">Tous les plans</option>
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="business">Business</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Domaine</th>
                                <th>Plan</th>
                                <th>Statut</th>
                                <th>Users</th>
                                <th>Commandes</th>
                                <th>Revenus</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.length > 0 ? filteredTenants.map(t => (
                                <tr key={t.id}>
                                    <td className="tenant-name-cell">
                                        <strong>{t.name}</strong>
                                        <small>{t.contact_email}</small>
                                    </td>
                                    <td><code className="domain-code">{t.domain}</code></td>
                                    <td><span className={`badge badge-plan ${t.plan}`}>{t.plan}</span></td>
                                    <td>
                                        {t.is_active
                                            ? <span className="status-dot online"><CheckCircle size={14} /> Actif</span>
                                            : <span className="status-dot offline"><AlertCircle size={14} /> Suspendu</span>
                                        }
                                    </td>
                                    <td>{t.stats?.users || 0}</td>
                                    <td>{t.stats?.orders || 0}</td>
                                    <td><strong>{(t.stats?.revenue || 0).toLocaleString('fr-FR')} €</strong></td>
                                    <td className="action-cell">
                                        {t.is_active ? (
                                            <button className="btn-action suspend" onClick={() => handleTenantAction(t.id, 'suspend')} disabled={actionLoading === `${t.id}-suspend`} title="Suspendre">
                                                <Power size={14} />
                                            </button>
                                        ) : (
                                            <button className="btn-action activate" onClick={() => handleTenantAction(t.id, 'activate')} disabled={actionLoading === `${t.id}-activate`} title="Activer">
                                                <Play size={14} />
                                            </button>
                                        )}
                                        <button className="btn-action delete" onClick={() => handleTenantAction(t.id, 'delete')} disabled={actionLoading === `${t.id}-delete`} title="Supprimer">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="empty-cell">Aucun tenant trouvé</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SaasDashboard;
