import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Shield, ShieldAlert, Key, Activity, Monitor, Globe, Clock, ShieldCheck, ShieldX } from 'lucide-react';

const AdminLogs = () => {
    const [loginLogs, setLoginLogs] = useState([]);
    const [actionLogs, setActionLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('login');
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        if (activeTab === 'login') fetchLoginLogs();
        else fetchActionLogs();
    }, [activeTab]);

    const fetchLoginLogs = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await api.get('/admin/logs');
            setLoginLogs(response.data.data);
        } catch (err) {
            console.error(err);
            setApiError('Impossible de récupérer les logs de connexion. Vérifiez vos permissions ou réessayez plus tard.');
        } finally { setIsLoading(false); }
    };

    const fetchActionLogs = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await api.get('/admin/action-logs');
            setActionLogs(response.data.data);
        } catch (err) {
            console.error(err);
            setApiError('Impossible de récupérer les actions administratives. Vérifiez vos permissions ou réessayez plus tard.');
        } finally { setIsLoading(false); }
    };

    return (
        <div className="admin-page-container">
            <header className="premium-header">
                <div className="welcome-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.5rem' }}>
                        <h1 style={{ margin: 0 }}>Sillage de <span className="gradient-text-gold">Sécurité</span></h1>
                        <span className="badge-oversight" style={{ fontSize: '0.55rem' }}>FULL OVERSIGHT</span>
                    </div>
                    <p>Gardez un œil sur l'intégrité et les mouvements secrets de votre Maison.</p>
                </div>
                <div className="admin-toolbar-refined" style={{ padding: '0.4rem', gap: '0.4rem', marginBottom: 0, background: 'var(--admin-bg-base)', border: '1px solid var(--admin-border)', borderRadius: '12px' }}>
                    <button
                        className={`gold-button ${activeTab === 'login' ? '' : 'inactive'}`}
                        onClick={() => setActiveTab('login')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            background: activeTab === 'login' ? 'var(--grad-gold)' : 'transparent',
                            color: activeTab === 'login' ? '#000' : 'var(--admin-text-secondary)',
                            border: 'none',
                            fontWeight: 600
                        }}
                    >
                        <Key size={16} /> Connexions
                    </button>
                    <button
                        className={`gold-button ${activeTab === 'action' ? '' : 'inactive'}`}
                        onClick={() => setActiveTab('action')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            background: activeTab === 'action' ? 'var(--grad-gold)' : 'transparent',
                            color: activeTab === 'action' ? '#000' : 'var(--admin-text-secondary)',
                            border: 'none',
                            fontWeight: 600
                        }}
                    >
                        <Activity size={16} /> Actions Admin
                    </button>
                </div>
            </header>

            {isLoading ? <div className="loader">Décryptage des Archives...</div> : (
                <div className="admin-table-container">
                    {apiError && (
                        <div className="saas-card error-card" style={{ marginBottom: '1.5rem', padding: '1rem', borderLeft: '4px solid var(--danger)' }}>
                            <strong>Erreur :</strong> {apiError}
                        </div>
                    )}
                    {activeTab === 'login' ? (
                        <table className="premium-table-refined">
                            <thead>
                                <tr>
                                    <th>Identité</th>
                                    <th>Source / Client</th>
                                    <th>État</th>
                                    <th>Instant</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loginLogs.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="avatar-refined" style={{ background: 'var(--admin-primary-soft)', border: '1px solid var(--admin-border)', color: 'var(--admin-primary)', width: '38px', height: '38px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                    {log.user?.name ? log.user.name[0].toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <span style={{ display: 'block', fontWeight: '600', color: 'var(--admin-text-primary)', fontSize: '0.9rem' }}>{log.user?.name || 'Inconnu'}</span>
                                                    <span style={{ display: 'block', color: 'var(--admin-text-secondary)', opacity: 0.7, fontSize: '0.75rem' }}>{log.user?.email || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                                                    <Globe size={14} style={{ color: 'var(--primary)', opacity: 0.5 }} /> {log.ip_address}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.7rem', opacity: 0.3 }}>
                                                    <Monitor size={12} /> {log.user_agent?.substring(0, 45)}...
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.6rem',
                                                fontSize: '0.75rem',
                                                color: log.status === 'success' ? '#22c55e' : '#ef4444',
                                                background: log.status === 'success' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '20px',
                                                width: 'fit-content',
                                                border: `1px solid ${log.status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
                                            }}>
                                                {log.status === 'success' ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                                                {log.status === 'success' ? 'Succès' : 'Échec'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, fontSize: '0.85rem' }}>
                                                <Clock size={14} />
                                                <span>{new Date(log.logged_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="premium-table-refined">
                            <thead>
                                <tr>
                                    <th>Administrateur</th>
                                    <th>Geste</th>
                                    <th>Cible</th>
                                    <th>Origine</th>
                                    <th style={{ textAlign: 'right' }}>Chronologie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actionLogs.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="avatar-refined" style={{ width: '38px', height: '38px', background: 'var(--grad-gold)', color: '#000', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {log.user?.name ? log.user.name[0].toUpperCase() : '?'}
                                                </div>
                                                <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>{log.user?.name || 'Inconnu'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                fontSize: '0.7rem',
                                                color: 'var(--admin-primary)',
                                                letterSpacing: '1px',
                                                background: 'var(--admin-primary-soft)',
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '6px'
                                            }}>{log.action}</span>
                                        </td>
                                        <td>
                                            <code style={{
                                                background: 'var(--admin-bg-base)',
                                                padding: '0.3rem 0.6rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                border: '1px solid var(--admin-border)',
                                                color: 'var(--admin-text-primary)',
                                                opacity: 0.9
                                            }}>
                                                {log.target_type}
                                            </code>
                                        </td>
                                        <td><small style={{ color: 'var(--admin-text-secondary)', opacity: 0.8, fontSize: '0.8rem' }}>{log.ip_address}</small></td>
                                        <td style={{ textAlign: 'right', opacity: 0.5, fontSize: '0.85rem' }}>
                                            {new Date(log.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminLogs;
