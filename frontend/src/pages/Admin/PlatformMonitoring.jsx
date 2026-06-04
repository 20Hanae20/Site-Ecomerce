import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Server, Database, Cpu, Wifi, WifiOff,
    RefreshCw, Clock, CheckCircle, AlertTriangle, XCircle
} from 'lucide-react';

const STATUS_CONFIG = {
    online: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle, label: 'En ligne' },
    warning: { color: '#f59e0b', bg: '#fef3c7', icon: AlertTriangle, label: 'Dégradé' },
    offline: { color: '#ef4444', bg: '#fee2e2', icon: XCircle, label: 'Hors ligne' },
};

const StatusCard = ({ check }) => {
    const config = STATUS_CONFIG[check.status] || STATUS_CONFIG.offline;
    const StatusIcon = config.icon;

    return (
        <div className="monitor-card" style={{ borderLeftColor: config.color }}>
            <div className="monitor-card-header">
                <div className="monitor-status-badge" style={{ background: config.bg, color: config.color }}>
                    <StatusIcon size={16} />
                    <span>{config.label}</span>
                </div>
                {check.latency && <span className="monitor-latency">{check.latency}</span>}
            </div>
            <h3 className="monitor-name">{check.name}</h3>
            <div className="monitor-details">
                {check.version && <div className="monitor-detail"><span>Version:</span> <strong>{check.version}</strong></div>}
                {check.driver && <div className="monitor-detail"><span>Driver:</span> <strong>{check.driver}</strong></div>}
                {check.tables !== undefined && <div className="monitor-detail"><span>Tables:</span> <strong>{check.tables}</strong></div>}
                {check.configured !== undefined && <div className="monitor-detail"><span>Configuré:</span> <strong>{check.configured ? 'Oui' : 'Non'}</strong></div>}
                {check.webhook_configured !== undefined && <div className="monitor-detail"><span>Webhook:</span> <strong>{check.webhook_configured ? 'Oui' : 'Non'}</strong></div>}
                {check.url && <div className="monitor-detail"><span>URL:</span> <code>{check.url}</code></div>}
                {check.error && <div className="monitor-detail error"><span>Erreur:</span> <strong>{check.error}</strong></div>}
            </div>
            <div className="monitor-pulse-bar">
                <div className="pulse-fill" style={{ width: check.status === 'online' ? '100%' : check.status === 'warning' ? '60%' : '0%', background: config.color }} />
            </div>
        </div>
    );
};

const PlatformMonitoring = () => {
    const [monitorData, setMonitorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);
    const navigate = useNavigate();

    const fetchMonitoring = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const api = (await import('../../services/api')).default;
            const res = await api.get('/admin/saas/monitoring');
            setMonitorData(res.data.data);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Monitoring fetch failed', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
        if (!stored || !token) { navigate('/admin/login'); return; }
        const user = JSON.parse(stored);
        if (!['admin', 'super_admin'].includes(user.role)) { navigate('/'); return; }
        fetchMonitoring();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => fetchMonitoring(true), 30000);
        return () => clearInterval(interval);
    }, [navigate, fetchMonitoring]);

    if (loading) return <div className="analytics-loader"><div className="loader-spinner" /><p>Vérification des services...</p></div>;

    const overallConfig = {
        healthy: { color: '#10b981', label: '✅ Plateforme Opérationnelle', bg: '#d1fae5' },
        degraded: { color: '#f59e0b', label: '⚠️ Performance Dégradée', bg: '#fef3c7' },
        unhealthy: { color: '#ef4444', label: '🔴 Services Hors Ligne', bg: '#fee2e2' },
    };

    const overall = overallConfig[monitorData?.overall] || overallConfig.unhealthy;
    const checks = monitorData?.checks || {};

    return (
        <div className="analytics-full-page">
            <div className="analytics-header">
                <div>
                    <h1>🔧 Monitoring Plateforme</h1>
                    <p>État en temps réel de tous les services</p>
                </div>
                <div className="monitoring-actions">
                    <button className={`btn-refresh ${refreshing ? 'spinning' : ''}`} onClick={() => fetchMonitoring(true)} disabled={refreshing}>
                        <RefreshCw size={16} />
                        {refreshing ? 'Actualisation...' : 'Rafraîchir'}
                    </button>
                    {lastRefresh && (
                        <span className="last-refresh">
                            <Clock size={14} />
                            {lastRefresh.toLocaleTimeString('fr-FR')}
                        </span>
                    )}
                </div>
            </div>

            {/* Overall Status Banner */}
            <div className="overall-status-banner" style={{ background: overall.bg, borderColor: overall.color }}>
                <span className="overall-dot" style={{ background: overall.color }} />
                <span className="overall-label" style={{ color: overall.color }}>{overall.label}</span>
                <span className="overall-time">Vérifié à {monitorData?.timestamp ? new Date(monitorData.timestamp).toLocaleTimeString('fr-FR') : 'N/A'}</span>
            </div>

            {/* Status Cards Grid */}
            <div className="monitor-grid">
                {Object.entries(checks).map(([key, check]) => (
                    <StatusCard key={key} check={check} />
                ))}
            </div>

            {/* Legend */}
            <div className="monitor-legend">
                <div className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /> En ligne - Service opérationnel</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /> Warning - Performance dégradée</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> Offline - Service indisponible</div>
            </div>
        </div>
    );
};

export default PlatformMonitoring;
