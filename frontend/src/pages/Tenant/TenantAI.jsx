import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Cpu, BarChart3, Star, Percent } from 'lucide-react';

const TenantAI = () => {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMlMetrics = async () => {
            try {
                const response = await api.get('/admin/analytics/ml-performance').catch(() => null);
                if (response) setPerformance(response.data);
            } catch (err) {
                console.error("Error fetching ML performance metrics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMlMetrics();
    }, []);

    // Mock data fallbacks for AI KPIs
    const metrics = performance || {
        rmse: 0.85,
        mae: 0.62,
        ctr: 14.5,
        precision: 89.2,
        clusters_count: 4,
        silhouette_score: 0.72
    };

    const ctrHistory = [
        { day: 'Lun', ctr: 12.4 },
        { day: 'Mar', ctr: 13.8 },
        { day: 'Mer', ctr: 15.2 },
        { day: 'Jeu', ctr: 14.1 },
        { day: 'Ven', ctr: 16.5 },
        { day: 'Sam', ctr: 18.0 },
        { day: 'Dim', ctr: 17.5 }
    ];

    const modelComparison = [
        { model: 'Collaborative SVD', precision: 89.2, latency: 12 },
        { model: 'Content-Based KNN', precision: 82.4, latency: 8 },
        { model: 'Popularity Baseline', precision: 54.1, latency: 2 }
    ];

    return (
        <div className="tenant-ai-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* ML KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                        <Brain size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RMSE SVD (Erreur)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics.rmse.toFixed(3)}</div>
                    </div>
                </div>

                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Percent size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Taux de Clic (CTR)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{metrics.ctr}%</div>
                    </div>
                </div>

                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <Cpu size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Score Silhouette (K-Means)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics.silhouette_score}</div>
                    </div>
                </div>
            </div>

            {/* CTR Over Time Area Chart */}
            <div className="glass-premium" style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Taux de clic (CTR) sur les Suggestions IA</h3>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <AreaChart data={ctrHistory}>
                            <defs>
                                <linearGradient id="colorCtr" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                            <Tooltip formatter={(value) => `${value}% CTR`} />
                            <Area type="monotone" dataKey="ctr" name="Taux de Clic" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCtr)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Model Precision comparison */}
            <div className="glass-premium" style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Précision des Modèles Prédictifs</h3>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <BarChart data={modelComparison} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                            <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                            <YAxis dataKey="model" type="category" stroke="#9ca3af" fontSize={12} width={130} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="precision" name="Précision" fill="#2563eb" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TenantAI;
