import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    Building2, DollarSign, Users, ShoppingBag, Package,
    TrendingUp, Search, Filter, Power, Trash2, Play,
    AlertCircle, CheckCircle, Download
} from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';

// Luxury Burgundy & Gold color scheme for chart segments
const COLORS = ['#7f1d1d', '#d97706', '#991b1b', '#b28844', '#475569', '#8b5cf6'];

const SaasDashboard = () => {
    const [dashData, setDashData] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const [exporting, setExporting] = useState(false);
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

    const handleExportPDF = () => {
        setExporting(true);
        try {
            exportToPDF('saas', filteredTenants);
        } catch (err) {
            console.error('Export failed', err);
            alert('Impossible de générer le rapport PDF.');
        } finally {
            setExporting(false);
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
        <div className="analytics-full-page saas-dashboard-luxury animate-fade-up">
            {/* Header */}
            <div className="analytics-header">
                <div>
                    <h1>🏢 Super Admin SaaS</h1>
                    <p className="subtitle-desc">Gestion centralisée et supervision de la plateforme multi-tenant</p>
                </div>
                <div className="export-buttons">
                    <button className="btn-export-luxury" onClick={handleExportPDF} disabled={exporting}>
                        <Download size={16} />
                        {exporting ? 'Génération...' : 'Rapport PDF'}
                    </button>
                </div>
            </div>

            {/* Global KPIs */}
            <div className="analytics-kpi-grid">
                <div className="analytics-kpi-card luxury-card">
                    <div className="kpi-icon burgundy"><DollarSign size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">MRR</span>
                        <span className="kpi-value">{(kpis.mrr || 0).toLocaleString('fr-FR')} €</span>
                        <span className="kpi-subtext">Revenu mensuel récurrent</span>
                    </div>
                </div>
                <div className="analytics-kpi-card luxury-card">
                    <div className="kpi-icon gold"><TrendingUp size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">ARR</span>
                        <span className="kpi-value">{(kpis.arr || 0).toLocaleString('fr-FR')} €</span>
                        <span className="kpi-subtext">Revenu annuel récurrent</span>
                    </div>
                </div>
                <div className="analytics-kpi-card luxury-card">
                    <div className="kpi-icon slate"><Building2 size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Tenants Actifs</span>
                        <span className="kpi-value">{kpis.active_tenants || 0} / {kpis.total_tenants || 0}</span>
                        <span className="kpi-subtext">Espaces déployés</span>
                    </div>
                </div>
                <div className="analytics-kpi-card luxury-card">
                    <div className="kpi-icon burgundy"><Users size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Utilisateurs</span>
                        <span className="kpi-value">{kpis.total_users || 0}</span>
                        <span className="kpi-subtext">Comptes enregistrés</span>
                    </div>
                </div>
                <div className="analytics-kpi-card luxury-card">
                    <div className="kpi-icon gold"><ShoppingBag size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Commandes</span>
                        <span className="kpi-value">{kpis.total_orders || 0}</span>
                        <span className="kpi-subtext">Transactions totales</span>
                    </div>
                </div>
                <div className="analytics-kpi-card luxury-card">
                    <div className="kpi-icon slate"><AlertCircle size={22} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Churn Rate</span>
                        <span className="kpi-value">{kpis.churn_rate || 0}%</span>
                        <span className="kpi-subtext">Taux d'attrition estimé</span>
                    </div>
                </div>
            </div>

            {/* MRR Trend Chart */}
            <div className="analytics-charts-grid">
                <div className="chart-card wide luxury-chart-card">
                    <div className="chart-header">
                        <h3>Évolution MRR</h3>
                        <span className="chart-badge luxury-badge">6 derniers mois</span>
                    </div>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <LineChart data={dashData?.mrr_trend || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                                <Tooltip formatter={(val) => [`${Number(val).toLocaleString('fr-FR')} €`, 'MRR']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }} />
                                <Line type="monotone" dataKey="mrr" stroke="#7f1d1d" strokeWidth={3} dot={{ r: 5, fill: '#d97706', stroke: '#7f1d1d', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue per Tenant */}
                <div className="chart-card wide luxury-chart-card">
                    <div className="chart-header">
                        <h3>Revenus par Tenant</h3>
                        <span className="chart-badge luxury-badge">Classement Top 6</span>
                    </div>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={[...tenants].sort((a, b) => (b.stats?.revenue || 0) - (a.stats?.revenue || 0)).slice(0, 6)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                                <Tooltip formatter={(val) => [`${Number(val).toLocaleString('fr-FR')} €`, 'Revenus']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }} />
                                <Bar dataKey="stats.revenue" radius={[6, 6, 0, 0]}>
                                    {[...tenants].sort((a, b) => (b.stats?.revenue || 0) - (a.stats?.revenue || 0)).slice(0, 6).map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tenants List */}
            <div className="table-card luxury-table-card">
                <div className="table-header">
                    <h3><Building2 size={18} className="luxury-icon" /> Gestion des Tenants</h3>
                    <div className="table-actions">
                        <div className="search-box luxury-search">
                            <Search size={16} />
                            <input type="text" placeholder="Rechercher un tenant..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="filter-select luxury-filter" value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
                            <option value="">Tous les plans</option>
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="business">Business</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="premium-table luxury-table">
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Domaine</th>
                                <th>Plan</th>
                                <th>Statut</th>
                                <th>Membres</th>
                                <th>Commandes</th>
                                <th>Chiffre d'Affaires</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.length > 0 ? filteredTenants.map(t => (
                                <tr key={t.id}>
                                    <td className="tenant-name-cell">
                                        <strong>{t.name}</strong>
                                        <span className="tenant-email">{t.contact_email}</span>
                                    </td>
                                    <td><code className="domain-code-luxury">{t.domain}</code></td>
                                    <td><span className={`badge badge-plan ${t.plan}`}>{t.plan}</span></td>
                                    <td>
                                        {t.is_active
                                            ? <span className="status-dot online"><CheckCircle size={14} /> Actif</span>
                                            : <span className="status-dot offline"><AlertCircle size={14} /> Suspendu</span>
                                        }
                                    </td>
                                    <td>{t.stats?.users || 0}</td>
                                    <td>{t.stats?.orders || 0}</td>
                                    <td><strong className="revenue-text">{(t.stats?.revenue || 0).toLocaleString('fr-FR')} €</strong></td>
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

            {/* Custom Embedded Premium Styles */}
            <style>{`
                .saas-dashboard-luxury {
                    font-family: 'Inter', system-ui, sans-serif;
                }

                .subtitle-desc {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    margin-top: 0.25rem;
                }

                /* Luxury Export Button */
                .btn-export-luxury {
                    background: #7f1d1d;
                    color: #ffffff;
                    border: 1px solid #7f1d1d;
                    border-radius: var(--radius-md);
                    padding: 0.6rem 1.2rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    box-shadow: 0 4px 12px rgba(127, 29, 29, 0.15);
                }

                .btn-export-luxury:hover {
                    background: #991b1b;
                    border-color: #991b1b;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(127, 29, 29, 0.25);
                }

                .btn-export-luxury:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Luxury KPI Cards */
                .luxury-card {
                    background: #ffffff;
                    border: 1px solid #f1f5f9;
                    border-radius: var(--radius-lg);
                    transition: all var(--transition-smooth);
                }

                .luxury-card:hover {
                    transform: translateY(-4px);
                    border-color: #d97706; /* Gold accent on hover */
                    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
                }

                .kpi-icon.burgundy {
                    background: rgba(127, 29, 29, 0.08);
                    color: #7f1d1d;
                }

                .kpi-icon.gold {
                    background: rgba(217, 119, 6, 0.08);
                    color: #d97706;
                }

                .kpi-icon.slate {
                    background: rgba(71, 85, 105, 0.08);
                    color: #475569;
                }

                .kpi-subtext {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    margin-top: 0.1rem;
                }

                /* Luxury Charts */
                .luxury-chart-card {
                    background: #ffffff;
                    border: 1px solid #f1f5f9;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    transition: all var(--transition-smooth);
                }

                .luxury-chart-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
                    border-color: #f1f5f9;
                }

                .luxury-badge {
                    background: rgba(217, 119, 6, 0.08);
                    color: #d97706;
                    font-weight: 600;
                }

                /* Table Styling */
                .luxury-table-card {
                    background: #ffffff;
                    border: 1px solid #f1f5f9;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                }

                .luxury-icon {
                    color: #7f1d1d;
                }

                .luxury-search input {
                    border: 1px solid #cbd5e1;
                    padding-left: 2.25rem !important;
                }

                .luxury-search input:focus {
                    border-color: #7f1d1d;
                    box-shadow: 0 0 0 3px rgba(127, 29, 29, 0.1);
                }

                .luxury-filter {
                    border: 1px solid #cbd5e1;
                }

                .luxury-filter:focus {
                    border-color: #7f1d1d;
                    outline: none;
                }

                .luxury-table th {
                    border-bottom: 2px solid #f1f5f9;
                    color: #475569;
                    font-weight: 600;
                    background: #fafbfd;
                }

                .luxury-table tbody tr {
                    background: #ffffff;
                    border-bottom: 1px solid #f1f5f9;
                    box-shadow: none;
                    border-radius: 0;
                }

                .luxury-table tbody tr:hover {
                    background: #fafbfd;
                    transform: none;
                    box-shadow: none;
                }

                .tenant-email {
                    display: block;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    margin-top: 0.15rem;
                }

                .domain-code-luxury {
                    font-family: monospace;
                    background: #f1f5f9;
                    color: #334155;
                    padding: 0.2rem 0.5rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                }

                .revenue-text {
                    color: #7f1d1d;
                    font-size: 0.95rem;
                }
            `}</style>
        </div>
    );
};

export default SaasDashboard;
