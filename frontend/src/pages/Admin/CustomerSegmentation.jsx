import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, Crown, Star, UserPlus, ShoppingBag } from 'lucide-react';

const SEGMENT_COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981'];
const SEGMENT_ICONS = { VIP: Crown, Premium: Star, Occasionnel: ShoppingBag, Nouveau: UserPlus };

const CustomerSegmentation = () => {
    const [segments, setSegments] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/admin/analytics/customers');
            setSegments(res.data.data.segments || []);
            setTotal(res.data.data.total || 0);
        } catch (err) {
            console.error('Failed to fetch segmentation', err);
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

    if (loading) return <div className="analytics-loader"><div className="loader-spinner" /><p>Analyse de la segmentation...</p></div>;

    const pieData = segments.map(s => ({ name: s.label, value: s.count }));

    return (
        <div className="analytics-full-page">
            <div className="analytics-header">
                <div>
                    <h1>🧠 Segmentation K-Means</h1>
                    <p>Analyse et classification automatique des clients ({total} clients)</p>
                </div>
            </div>

            <div className="segmentation-layout">
                {/* Pie Chart */}
                <div className="chart-card segmentation-chart">
                    <div className="chart-header">
                        <h3>Répartition des Segments</h3>
                        <span className="chart-badge">K-Means Clustering</span>
                    </div>
                    <ResponsiveContainer width="100%" height={380}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={140}
                                innerRadius={70}
                                paddingAngle={3}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Segment Cards */}
                <div className="segment-cards-grid">
                    {segments.map((seg, i) => {
                        const SegIcon = SEGMENT_ICONS[seg.label] || Users;
                        return (
                            <div key={i} className="segment-card" style={{ borderLeftColor: SEGMENT_COLORS[i] }}>
                                <div className="segment-card-header">
                                    <div className="segment-icon" style={{ background: `${SEGMENT_COLORS[i]}15`, color: SEGMENT_COLORS[i] }}>
                                        <SegIcon size={22} />
                                    </div>
                                    <div>
                                        <h4>{seg.label}</h4>
                                        <span className="segment-count">{seg.count} clients</span>
                                    </div>
                                </div>
                                <div className="segment-metrics">
                                    <div className="segment-metric">
                                        <span className="metric-label">Panier moyen</span>
                                        <span className="metric-value">{seg.avg_basket.toLocaleString('fr-FR')} €</span>
                                    </div>
                                    <div className="segment-metric">
                                        <span className="metric-label">Dépense totale</span>
                                        <span className="metric-value">{seg.total_spent.toLocaleString('fr-FR')} €</span>
                                    </div>
                                    <div className="segment-metric">
                                        <span className="metric-label">Valeur vie client (LTV)</span>
                                        <span className="metric-value highlight">{seg.ltv.toLocaleString('fr-FR')} €</span>
                                    </div>
                                </div>
                                <div className="segment-bar">
                                    <div className="segment-bar-fill" style={{ width: `${total > 0 ? (seg.count / total) * 100 : 0}%`, background: SEGMENT_COLORS[i] }} />
                                </div>
                                <span className="segment-pct">{total > 0 ? ((seg.count / total) * 100).toFixed(1) : 0}% de la base clients</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CustomerSegmentation;
