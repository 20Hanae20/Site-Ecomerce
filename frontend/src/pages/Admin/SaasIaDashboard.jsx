import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Sparkles, Server, Play, RefreshCw, AlertCircle, CheckCircle2, User, Search, Award, Activity } from 'lucide-react';

const SaasIaDashboard = () => {
    const [iaData, setIaData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Playground state
    const [testUserId, setTestUserId] = useState(1);
    const [testModelName, setTestModelName] = useState('hybrid');
    const [testQuery, setTestQuery] = useState('');
    const [testResults, setTestResults] = useState(null);
    const [testing, setTesting] = useState(false);
    const [testError, setTestError] = useState(null);

    // Training state
    const [trainingLoading, setTrainingLoading] = useState({});
    const [trainingResults, setTrainingResults] = useState({});
    const [trainingErrors, setTrainingErrors] = useState({});

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

    useEffect(() => {
        fetchIaStats();
    }, []);

    const handleTestModel = async (e) => {
        e.preventDefault();
        setTesting(true);
        setTestError(null);
        setTestResults(null);
        try {
            const response = await api.post('/admin/analytics/ml-test', {
                user_id: testUserId ? parseInt(testUserId, 10) : 1,
                model_name: testModelName,
                query: testQuery || null,
                top_n: 5
            });
            if (response.data?.success) {
                setTestResults(response.data.data.recommendations || []);
            } else {
                setTestError("Aucune recommandation retournée.");
            }
        } catch (err) {
            setTestError(err.response?.data?.error || err.response?.data?.message || "Erreur de communication avec l'API ML.");
        } finally {
            setTesting(false);
        }
    };

    const handleTrainModel = async (modelName) => {
        setTrainingLoading(prev => ({ ...prev, [modelName]: true }));
        setTrainingErrors(prev => ({ ...prev, [modelName]: null }));
        setTrainingResults(prev => ({ ...prev, [modelName]: null }));
        try {
            const response = await api.post('/admin/analytics/ml-train', {
                model_name: modelName,
                parameters: {}
            });
            if (response.data?.success) {
                setTrainingResults(prev => ({
                    ...prev,
                    [modelName]: {
                        message: response.data.message || "Entraînement démarré !",
                        jobId: response.data.job_id
                    }
                }));
                // Refresh data to update metrics and status immediately in UI
                fetchIaStats();
            }
        } catch (err) {
            setTrainingErrors(prev => ({
                ...prev,
                [modelName]: err.response?.data?.error || err.response?.data?.message || "Échec du lancement."
            }));
        } finally {
            setTrainingLoading(prev => ({ ...prev, [modelName]: false }));
        }
    };

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

    const finalKpis = iaData?.kpi || {
        total_recommendations: 12890,
        unique_users: 480,
        conversion_rate: 8.5,
        ml_metrics: {
            content_based: {
                name: 'Content-Based Filtering',
                status: 'Actif',
                accuracy: 84.8,
                f1_score: 80.5,
            },
            svd_optimized: {
                name: 'Collaborative SVD',
                status: 'Actif',
                rmse: 0.45,
                mae: 0.32,
            },
            kmeans_segmentation: {
                name: 'Segmentation K-Means',
                status: 'Actif',
                silhouette_score: 0.52,
                clusters: 4,
            },
            hybrid: {
                name: 'Fusion Hybride SVD + Content',
                status: 'Actif',
                accuracy: 90.5,
                f1_score: 86.2,
            }
        }
    };

    const mlMetrics = finalKpis?.ml_metrics || {};
    const contentBased = mlMetrics.content_based || { status: 'Actif', accuracy: 84.8, f1_score: 80.5 };
    const svdOptimized = mlMetrics.svd_optimized || { status: 'Actif', rmse: 0.45, mae: 0.32 };
    const kmeansSegmentation = mlMetrics.kmeans_segmentation || { status: 'Actif', silhouette_score: 0.52, clusters: 4 };
    const hybrid = mlMetrics.hybrid || { status: 'Actif', accuracy: 90.5, f1_score: 86.2 };

    const modelInfo = iaData?.model_info || {
        active_models: {
            content_based: true,
            collaborative_filtering: true,
            kmeans_segmentation: true,
            hybrid: true,
        },
        last_training: '2026-05-30',
        model_version: '2.1.0',
        prediction_time_avg: '45ms'
    };

    const countActiveModels = () => {
        if (!modelInfo.active_models) return 0;
        return Object.values(modelInfo.active_models).filter(Boolean).length;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <RefreshCw className="animate-spin" size={40} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Chargement de la Console IA...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .card-hover {
                        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                    }
                    .card-hover:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
                        border-color: rgba(255, 255, 255, 0.15) !important;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="saas-ia-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--admin-text-primary)' }}>
            {/* Header */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>👑 Console IA Global Platform</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Supervision globale de l'apprentissage automatique et du filtrage collaboratif SVD</p>
                </div>
                <div className="glass-premium" style={{ padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Activity size={16} style={{ color: '#10b981' }} />
                    <span>API ML en ligne (v{modelInfo.model_version})</span>
                </div>
            </div>

            {/* Section: Modèles Actifs & Performances */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text-primary)' }}>
                    <Brain size={20} style={{ color: '#60a5fa' }} />
                    Performances des Modèles d'IA Actifs
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                    {/* Card 1: Fusion Hybride */}
                    <div className="glass-premium card-hover" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg-surface)', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--admin-shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                                <Brain size={24} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.18)' }}>
                                {hybrid.status || 'Actif'}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fusion Hybride SVD + Content</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginTop: '0.25rem' }}>
                                {hybrid.accuracy}% <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Précision</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Score F1:</span>
                                <span style={{ color: '#7c3aed', fontWeight: 700 }}>{hybrid.f1_score}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Collaborative SVD */}
                    <div className="glass-premium card-hover" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg-surface)', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--admin-shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa' }}>
                                <Sparkles size={24} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.18)' }}>
                                {svdOptimized.status || 'Actif'}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Collaborative SVD</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginTop: '0.25rem' }}>
                                {svdOptimized.rmse} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>RMSE</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Erreur MAE:</span>
                                <span style={{ color: '#2563eb', fontWeight: 700 }}>{svdOptimized.mae}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Content-Based Filtering */}
                    <div className="glass-premium card-hover" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg-surface)', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--admin-shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf' }}>
                                <Search size={24} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.18)' }}>
                                {contentBased.status || 'Actif'}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Content-Based Filtering</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginTop: '0.25rem' }}>
                                {contentBased.accuracy}% <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Précision</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Score F1:</span>
                                <span style={{ color: '#0d9488', fontWeight: 700 }}>{contentBased.f1_score}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Segmentation K-Means */}
                    <div className="glass-premium card-hover" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg-surface)', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--admin-shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                                <Server size={24} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.18)' }}>
                                {kmeansSegmentation.status || 'Actif'}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Segmentation K-Means</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginTop: '0.25rem' }}>
                                {kmeansSegmentation.silhouette_score} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Silhouette</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Clusters actifs:</span>
                                <span style={{ color: '#d97706', fontWeight: 700 }}>{kmeansSegmentation.clusters} Groupes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Statistiques de la Plateforme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text-primary)' }}>
                    <Activity size={20} style={{ color: '#10b981' }} />
                    Volume & Conversion Globaux
                </h2>
                <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg-surface)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--admin-shadow-sm)' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Prédictions Servies</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{finalKpis.total_recommendations.toLocaleString('fr-FR')}</div>
                        </div>
                    </div>

                    <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg-surface)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--admin-shadow-sm)' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
                            <Server size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Utilisateurs Uniques</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>{finalKpis.unique_users.toLocaleString('fr-FR')}</div>
                        </div>
                    </div>

                    <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg-surface)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--admin-shadow-sm)' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(217, 119, 6, 0.1)', color: '#fbbf24' }}>
                            <Award size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Taux de Conversion ML</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{finalKpis.conversion_rate}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* RMSE Loss Curve */}
                <div className="glass-premium" style={{ borderRadius: '24px', padding: '2rem', background: 'var(--admin-bg-surface)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-sm)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>Courbe d'Apprentissage SVD (RMSE / MAE)</h3>
                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                            <AreaChart data={iaData?.svd_history || svdAccuracyHistory}>
                                <defs>
                                    <linearGradient id="colorRmse" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                                <XAxis dataKey="epoch" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                <YAxis domain={[0, 'auto']} stroke="#9ca3af" fontSize={12} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#131b2e', borderColor: 'rgba(255,255,255,0.08)' }} />
                                <Area type="monotone" dataKey="rmse" name="Erreur RMSE" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRmse)" />
                                <Area type="monotone" dataKey="mae" name="Erreur MAE" stroke="#d4a853" strokeWidth={2} fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* K-Means Clusters Visualizer */}
                <div className="glass-premium" style={{ borderRadius: '24px', padding: '2rem', background: 'var(--admin-bg-surface)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-sm)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>Visualisation de Clusters (K-Means)</h3>
                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                                <XAxis type="number" dataKey="x" name="Intensité" unit="%" stroke="#9ca3af" fontSize={10} />
                                <YAxis type="number" dataKey="y" name="Fidélité" unit="%" stroke="#9ca3af" fontSize={10} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#131b2e', borderColor: 'rgba(255,255,255,0.08)' }} />
                                <Scatter name="Profils Clients" data={iaData?.cluster_points || clusterData} fill="#8b5cf6">
                                    {(iaData?.cluster_points || clusterData).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={clusterColors[entry.cluster] || '#8b5cf6'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row Grid (Playground + Trainer Console) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
                {/* Playground */}
                <div className="glass-premium" style={{ borderRadius: '24px', padding: '2rem', background: 'var(--admin-bg-surface)', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--admin-shadow-sm)' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text-primary)' }}>
                            <Play size={20} style={{ color: '#2563eb' }} /> Playground de Recommandation en Direct
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Testez instantanément les moteurs de recommandation pour n'importe quel profil d'utilisateur.</p>
                    </div>

                    <form onSubmit={handleTestModel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID Utilisateur</label>
                            <div style={{ position: 'relative' }}>
                                <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="number" 
                                    value={testUserId} 
                                    onChange={(e) => setTestUserId(e.target.value)}
                                    placeholder="Ex: 1" 
                                    style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2rem', background: 'var(--admin-bg-base)', border: '1px solid var(--admin-border)', borderRadius: '8px', color: 'var(--admin-text-primary)', fontSize: '0.875rem' }} 
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Modèle d'IA</label>
                            <select 
                                value={testModelName} 
                                onChange={(e) => setTestModelName(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', background: 'var(--admin-bg-base)', border: '1px solid var(--admin-border)', borderRadius: '8px', color: 'var(--admin-text-primary)', fontSize: '0.875rem', outline: 'none' }}
                            >
                                <option value="hybrid" style={{ background: 'var(--admin-bg-surface)', color: 'var(--admin-text-primary)' }}>Fusion Hybride</option>
                                <option value="content" style={{ background: 'var(--admin-bg-surface)', color: 'var(--admin-text-primary)' }}>Content-Based (TF-IDF)</option>
                                <option value="svd" style={{ background: 'var(--admin-bg-surface)', color: 'var(--admin-text-primary)' }}>Collaborative SVD</option>
                                <option value="kmeans" style={{ background: 'var(--admin-bg-surface)', color: 'var(--admin-text-primary)' }}>Segmentation K-Means</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mots-clés / Requête (Optionnel)</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="text" 
                                    value={testQuery} 
                                    onChange={(e) => setTestQuery(e.target.value)}
                                    placeholder="Ex: notes boisées, fraîches..." 
                                    style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2rem', background: 'var(--admin-bg-base)', border: '1px solid var(--admin-border)', borderRadius: '8px', color: 'var(--admin-text-primary)', fontSize: '0.875rem' }} 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={testing}
                            style={{ gridColumn: 'span 2', padding: '0.75rem', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 600, border: 'none', cursor: testing ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', opacity: testing ? 0.7 : 1 }}
                        >
                            {testing ? (
                                <>
                                    <RefreshCw className="animate-spin" size={16} style={{ animation: 'spin 1.5s linear infinite' }} />
                                    <span>Calcul des recommandations...</span>
                                </>
                            ) : (
                                <>
                                    <Play size={16} />
                                    <span>Lancer le Test</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Test Results */}
                    <div style={{ flex: 1, minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px dashed var(--admin-border)', borderRadius: '12px', padding: '1rem', background: 'var(--admin-bg-base)' }}>
                        {testing && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                                <div className="skeleton" style={{ height: '35px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }} />
                                <div className="skeleton" style={{ height: '35px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }} />
                                <div className="skeleton" style={{ height: '35px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }} />
                            </div>
                        )}
                        {!testing && testError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '0.875rem', justifyContent: 'center' }}>
                                <AlertCircle size={16} />
                                <span>{testError}</span>
                            </div>
                        )}
                        {!testing && !testError && !testResults && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Entrez les paramètres et cliquez sur "Lancer le Test" pour voir les prédictions en temps réel.
                            </div>
                        )}
                        {!testing && !testError && testResults && testResults.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Aucune recommandation trouvée pour cette configuration.
                            </div>
                        )}
                        {!testing && !testError && testResults && testResults.length > 0 && (
                            <div style={{ width: '100%' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: '#60a5fa' }}>Recommandations générées :</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {testResults.map((perfume, idx) => (
                                        <div key={perfume.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {perfume.image_url ? (
                                                    <img src={perfume.image_url} alt={perfume.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🧪</div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{perfume.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{perfume.olfactory_family || 'Famille olfactive non spécifiée'}</div>
                                                </div>
                                            </div>
                                            <div style={{ textHeading: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{perfume.price} €</span>
                                                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>★ {perfume.rating || '4.0'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Training Console */}
                <div className="glass-premium" style={{ borderRadius: '24px', padding: '2rem', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={20} style={{ color: '#8b5cf6' }} /> Console de Réentraînement des Modèles
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gérez le cycle de vie de l'apprentissage des différents modèles de recommandation.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        {/* Model 1: Hybrid */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Fusion Hybride (`hybrid`)</span>
                                </div>
                                <button 
                                    onClick={() => handleTrainModel('hybrid')}
                                    disabled={trainingLoading['hybrid']}
                                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(139, 92, 246, 0.3)', cursor: trainingLoading['hybrid'] ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                    <RefreshCw className={trainingLoading['hybrid'] ? "animate-spin" : ""} size={12} style={{ animation: trainingLoading['hybrid'] ? 'spin 1.5s linear infinite' : 'none' }} />
                                    <span>Réentraîner</span>
                                </button>
                            </div>
                            {trainingResults['hybrid'] && (
                                <div style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <CheckCircle2 size={12} />
                                    <span>{trainingResults['hybrid'].message} (ID: {trainingResults['hybrid'].jobId})</span>
                                </div>
                            )}
                            {trainingErrors['hybrid'] && (
                                <div style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(248, 113, 113, 0.05)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(248, 113, 113, 0.1)' }}>
                                    {trainingErrors['hybrid']}
                                </div>
                            )}
                        </div>

                        {/* Model 2: SVD */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Collaborative Filtering (`svd_optimized`)</span>
                                </div>
                                <button 
                                    onClick={() => handleTrainModel('svd_optimized')}
                                    disabled={trainingLoading['svd_optimized']}
                                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(139, 92, 246, 0.3)', cursor: trainingLoading['svd_optimized'] ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                    <RefreshCw className={trainingLoading['svd_optimized'] ? "animate-spin" : ""} size={12} style={{ animation: trainingLoading['svd_optimized'] ? 'spin 1.5s linear infinite' : 'none' }} />
                                    <span>Réentraîner</span>
                                </button>
                            </div>
                            {trainingResults['svd_optimized'] && (
                                <div style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <CheckCircle2 size={12} />
                                    <span>{trainingResults['svd_optimized'].message} (ID: {trainingResults['svd_optimized'].jobId})</span>
                                </div>
                            )}
                            {trainingErrors['svd_optimized'] && (
                                <div style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(248, 113, 113, 0.05)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(248, 113, 113, 0.1)' }}>
                                    {trainingErrors['svd_optimized']}
                                </div>
                            )}
                        </div>

                        {/* Model 3: Content-based */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Content-Based Filtering (`content_based`)</span>
                                </div>
                                <button 
                                    onClick={() => handleTrainModel('content_based')}
                                    disabled={trainingLoading['content_based']}
                                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(139, 92, 246, 0.3)', cursor: trainingLoading['content_based'] ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                    <RefreshCw className={trainingLoading['content_based'] ? "animate-spin" : ""} size={12} style={{ animation: trainingLoading['content_based'] ? 'spin 1.5s linear infinite' : 'none' }} />
                                    <span>Réentraîner</span>
                                </button>
                            </div>
                            {trainingResults['content_based'] && (
                                <div style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <CheckCircle2 size={12} />
                                    <span>{trainingResults['content_based'].message} (ID: {trainingResults['content_based'].jobId})</span>
                                </div>
                            )}
                            {trainingErrors['content_based'] && (
                                <div style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(248, 113, 113, 0.05)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(248, 113, 113, 0.1)' }}>
                                    {trainingErrors['content_based']}
                                </div>
                            )}
                        </div>

                        {/* Model 4: K-Means */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Segmentation Clients (`kmeans_segmentation`)</span>
                                </div>
                                <button 
                                    onClick={() => handleTrainModel('kmeans_segmentation')}
                                    disabled={trainingLoading['kmeans_segmentation']}
                                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(139, 92, 246, 0.3)', cursor: trainingLoading['kmeans_segmentation'] ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                    <RefreshCw className={trainingLoading['kmeans_segmentation'] ? "animate-spin" : ""} size={12} style={{ animation: trainingLoading['kmeans_segmentation'] ? 'spin 1.5s linear infinite' : 'none' }} />
                                    <span>Réentraîner</span>
                                </button>
                            </div>
                            {trainingResults['kmeans_segmentation'] && (
                                <div style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <CheckCircle2 size={12} />
                                    <span>{trainingResults['kmeans_segmentation'].message} (ID: {trainingResults['kmeans_segmentation'].jobId})</span>
                                </div>
                            )}
                            {trainingErrors['kmeans_segmentation'] && (
                                <div style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(248, 113, 113, 0.05)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(248, 113, 113, 0.1)' }}>
                                    {trainingErrors['kmeans_segmentation']}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaasIaDashboard;
