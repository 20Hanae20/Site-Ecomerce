import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain,
    TrendingUp,
    Target,
    Zap,
    BarChart3,
    PieChart,
    Activity,
    Clock,
    Users,
    Star,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

const AnalyticsDashboard = () => {
    const [user, setUser] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

        if (!storedUser || !token) {
            navigate('/admin/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const isStaff = ['admin', 'super_admin', 'moderateur', 'gestionnaire'].includes(parsedUser.role);

        if (!isStaff) {
            navigate('/');
            return;
        }

        setUser(parsedUser);
        fetchAnalyticsData();
    }, [navigate]);

    const fetchAnalyticsData = async () => {
        try {
            const api = (await import('../../services/api')).default;
            
            const [mlResponse, perfResponse] = await Promise.all([
                api.get('/admin/analytics/ml-dashboard'),
                api.get('/admin/analytics/ml-performance?timeframe=7d')
            ]);

            setAnalyticsData(mlResponse.data.data);
            setPerformanceData(perfResponse.data.data);
        } catch (err) {
            console.error("Failed to fetch analytics data", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loader">Chargement des Analytics IA...</div>;
    if (!user) return null;

    const kpi = analyticsData?.kpi || {};
    const mlMetrics = kpi.ml_metrics || {};

    return (
        <div className="dashboard-content-wrapper">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1><Brain size={28} className="gold" /> Dashboard IA</h1>
                    <p>Analytics et Performance des Modèles Machine Learning</p>
                </div>
                <div className="header-actions">
                    <div className="date-display">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                </div>
            </header>

            {/* ML KPI Cards */}
            <div className="stats-mosaic">
                <div className="premium-stat-card glow-aura">
                    <div className="card-icon gold"><Target size={24} /></div>
                    <div className="card-data">
                        <span className="label">Recommandations</span>
                        <span className="value">{kpi.total_recommendations || 0}</span>
                    </div>
                    <Target size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon blue"><Users size={24} /></div>
                    <div className="card-data">
                        <span className="label">Utilisateurs Uniques</span>
                        <span className="value">{kpi.unique_users || 0}</span>
                    </div>
                    <Users size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon green"><TrendingUp size={24} /></div>
                    <div className="card-data">
                        <span className="label">Taux Conversion</span>
                        <span className="value">{kpi.conversion_rate || 0}%</span>
                    </div>
                    <TrendingUp size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon purple"><Star size={24} /></div>
                    <div className="card-data">
                        <span className="label">Accuracy</span>
                        <span className="value">{mlMetrics.accuracy || 0}%</span>
                    </div>
                    <Star size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon orange"><Zap size={24} /></div>
                    <div className="card-data">
                        <span className="label">F1 Score</span>
                        <span className="value">{mlMetrics.f1_score || 0}%</span>
                    </div>
                    <Zap size={40} className="card-bg-icon" />
                </div>

                <div className="premium-stat-card">
                    <div className="card-icon red"><Activity size={24} /></div>
                    <div className="card-data">
                        <span className="label">RMSE</span>
                        <span className="value">{mlMetrics.rmse || 0}</span>
                    </div>
                    <Activity size={40} className="card-bg-icon" />
                </div>
            </div>

            <div className="dashboard-grid">
                {/* ML Model Performance */}
                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><BarChart3 size={18} className="gold" /> Performance Modèles</h3>
                        <span>Métriques détaillées</span>
                    </div>
                    <div className="ml-metrics-grid">
                        {performanceData?.metrics && Object.entries(performanceData.metrics).map(([model, metrics]) => (
                            <div key={model} className="metric-card">
                                <h4>{model.replace('_', ' ').toUpperCase()}</h4>
                                <div className="metric-details">
                                    {Object.entries(metrics).map(([key, value]) => (
                                        <div key={key} className="metric-item">
                                            <span className="metric-label">{key.replace('_', ' ')}</span>
                                            <span className="metric-value">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Cluster Distribution */}
                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><PieChart size={18} /> Segmentation Clients</h3>
                        <span>K-Means Clustering</span>
                    </div>
                    <div className="cluster-distribution">
                        {analyticsData?.cluster_distribution?.map((cluster, i) => (
                            <div key={i} className="cluster-item">
                                <div className="cluster-info">
                                    <span className="cluster-name">{cluster.cluster}</span>
                                    <span className="cluster-count">{cluster.count} utilisateurs</span>
                                </div>
                                <div className="cluster-bar-container">
                                    <div 
                                        className="cluster-bar" 
                                        style={{ width: `${cluster.percentage}%` }}
                                    ></div>
                                </div>
                                <span className="cluster-percentage">{cluster.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Recommended Products */}
                <section className="glass-premium chart-panel full-width">
                    <div className="panel-header">
                        <h3><Star size={18} className="gold" /> Top Produits Recommandés</h3>
                        <span>Performance recommandations</span>
                    </div>
                    <div className="top-recommended-list">
                        {analyticsData?.top_recommended?.length > 0 ? analyticsData.top_recommended.map((product, i) => (
                            <div key={i} className="recommended-item">
                                <div className="item-rank">#{i + 1}</div>
                                <div className="item-info">
                                    <span className="p-name">{product.name}</span>
                                    <span className="p-price">{product.price} €</span>
                                </div>
                                <div className="item-metrics">
                                    <span className="rec-count">{product.recommendation_count} recs</span>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">Aucune donnée de recommandation disponible.</div>
                        )}
                    </div>
                </section>

                {/* Model Information */}
                <section className="glass-premium chart-panel">
                    <div className="panel-header">
                        <h3><Brain size={18} className="gold" /> Informations Modèles</h3>
                        <span>Configuration IA</span>
                    </div>
                    <div className="model-info">
                        {analyticsData?.model_info && (
                            <>
                                <div className="info-row">
                                    <span className="info-label">Version Modèle:</span>
                                    <span className="info-value">{analyticsData.model_info.model_version}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Dernier Entraînement:</span>
                                    <span className="info-value">{analyticsData.model_info.last_training}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Temps Prédiction Moyen:</span>
                                    <span className="info-value">{analyticsData.model_info.prediction_time_avg}</span>
                                </div>
                                <div className="active-models">
                                    <span className="info-label">Modèles Actifs:</span>
                                    <div className="models-list">
                                        {Object.entries(analyticsData.model_info.active_models).map(([model, active]) => (
                                            <span key={model} className={`model-badge ${active ? 'active' : 'inactive'}`}>
                                                {model.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
