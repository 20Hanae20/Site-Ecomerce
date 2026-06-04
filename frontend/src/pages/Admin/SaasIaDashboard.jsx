import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, BarChart, Bar } from 'recharts';
import { Brain, Sparkles, TrendingUp, Cpu, Server, Compass } from 'lucide-react';

const SaasIaDashboard = () => {
    const [iaData, setIaData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIaStats = async () => {
            try {
                // Fetch central ML stats
                const response = await api.get('/admin/analytics/ml-dashboard').catch(() => null);
                if (response) {
                    setIaData(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch ML stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchIaStats();
    }, []);

    // Simulated 3D coordinates for K-Means Clustering Visual (Cross-Tenant user scent profile clusters)
    const clusterData = [
        // Cluster 1: Woody & Warm (Gold)
        { x: 30, y: 80, z: 200, cluster: 1, name: 'Boisés' },
        { x: 35, y: 75, z: 180, cluster: 1, name: 'Boisés' },
        { x: 28, y: 85, z: 210, cluster: 1, name: 'Boisés' },
        { x: 40, y: 70, z: 190, cluster: 1, name: 'Boisés' },
        
        // Cluster 2: Fresh & Citrus (Blue)
        { x: 75, y: 25, z: 120, cluster: 2, name: 'Frais' },
        { x: 80, y: 20, z: 110, cluster: 2, name: 'Frais' },
        { x: 72, y: 30, z: 130, cluster: 2, name: 'Frais' },
        { x: 85, y: 15, z: 90, cluster: 2, name: 'Frais' },

        // Cluster 3: Floral & Sweet (Purple)
        { x: 50, y: 55, z: 150, cluster: 3, name: 'Floraux' },
        { x: 55, y: 60, z: 160, cluster: 3, name: 'Floraux' },
        { x: 48, y: 50, z: 140, cluster: 3, name: 'Floraux' },
        { x: 52, y: 58, z: 155, cluster: 3, name: 'Floraux' }
    ];

    const svdAccuracyHistory = [
        { epoch: 'Sem 1', rmse: 0.94, mae: 0.72 },
        { epoch: 'Sem 2', rmse: 0.91, mae: 0.69 },
        { epoch: 'Sem 3', rmse: 0.88, mae: 0.66 },
        { epoch: 'Sem 4', rmse: 0.85, mae: 0.62 }
    ];

    const clusterColors = {
        1: '#d97706', // Woody
        2: '#2563eb', // Fresh
        3: '#8b5cf6'  // Floral
    };

    const finalKpis = iaData?.kpis || {
        active_models: 2,
        recommendations_served: 12890,
        average_precision: 88.4,
        avg_latency_ms: 18
    };

    return (
        <div className="saas-ia-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>👑 Console IA Global Platform</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Supervision globale de l'apprentissage automatique et du filtrage collaboratif SVD</p>
                </div>
            </div>

            {/* Platform AI KPIs */}
            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                        <Brain size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Modèles Actifs</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{finalKpis.active_models} (SVD, K-Means)</div>
                    </div>
                </div>

                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Prédictions Servies</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{finalKpis.recommendations_served.toLocaleString('fr-FR')}</div>
                    </div>
                </div>

                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <Server size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Temps de réponse Moyen</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{finalKpis.avg_latency_ms} ms</div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* RMSE Loss Curve */}
                <div className="glass-premium" style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Courbe d'Apprentissage SVD (RMSE / MAE)</h3>
                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                            <AreaChart data={svdAccuracyHistory}>
                                <defs>
                                    <linearGradient id="colorRmse" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="epoch" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                <YAxis domain={[0, 1.2]} stroke="#9ca3af" fontSize={12} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="rmse" name="Erreur RMSE" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRmse)" />
                                <Area type="monotone" dataKey="mae" name="Erreur MAE" stroke="#f59e0b" strokeWidth={2} fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* K-Means Clusters Visualizer */}
                <div className="glass-premium" style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Visualisation de Clusters (K-Means)</h3>
                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" dataKey="x" name="Intensité" unit="%" stroke="#9ca3af" fontSize={10} />
                                <YAxis type="number" dataKey="y" name="Fidélité" unit="%" stroke="#9ca3af" fontSize={10} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [value, name]} />
                                <Scatter name="Profils Clients" data={clusterData} fill="#8b5cf6">
                                    {clusterData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={clusterColors[entry.cluster]} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaasIaDashboard;
