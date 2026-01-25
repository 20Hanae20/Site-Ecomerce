import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Shield, ShieldAlert, Key, Activity, Monitor, Globe, Clock, ShieldCheck, ShieldX } from 'lucide-react';

const AdminLogs = () => {
    const [loginLogs, setLoginLogs] = useState([]);
    const [actionLogs, setActionLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('login');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'login') fetchLoginLogs();
        else fetchActionLogs();
    }, [activeTab]);

    const fetchLoginLogs = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/logs');
            setLoginLogs(response.data.data);
        } catch (err) {
            console.error(err);
        } finally { setIsLoading(false); }
    };

    const fetchActionLogs = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/action-logs');
            setActionLogs(response.data.data);
        } catch (err) {
            console.error(err);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="admin-content-inner">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Sillage de <span className="gradient-text-gold">Sécurité</span></h1>
                    <p>Gardez un œil sur l'intégrité et les mouvements secrets de votre Maison.</p>
                </div>
                <div className="glass-premium" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderRadius: '15px' }}>
                    <button
                        className={`gold-button ${activeTab === 'login' ? '' : 'inactive'}`}
                        onClick={() => setActiveTab('login')}
                        style={activeTab !== 'login' ? { background: 'transparent', color: 'white' } : {}}
                    >
                        <Key size={18} /> Connexions
                    </button>
                    <button
                        className={`gold-button ${activeTab === 'action' ? '' : 'inactive'}`}
                        onClick={() => setActiveTab('action')}
                        style={activeTab !== 'action' ? { background: 'transparent', color: 'white' } : {}}
                    >
                        <Activity size={18} /> Actions Admin
                    </button>
                </div>
            </header>

            {isLoading ? <div className="loader">Décryptage des Archives...</div> : (
                <div className="admin-table-container glass-premium">
                    {activeTab === 'login' ? (
                        <table className="premium-table">
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div className="avatar" style={{ width: '32px', height: '32px' }}>{log.user?.name[0] || '?'}</div>
                                                <div>
                                                    <strong style={{ display: 'block' }}>{log.user?.name || 'Inconnu'}</strong>
                                                    <small style={{ opacity: 0.5 }}>{log.user?.email || '-'}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                                    <Globe size={14} style={{ opacity: 0.5 }} /> {log.ip_address}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', opacity: 0.4 }}>
                                                    <Monitor size={12} /> {log.user_agent?.substring(0, 30)}...
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${log.status === 'success' ? 'active' : 'inactive'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}>
                                                {log.status === 'success' ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                                                {log.status === 'success' ? 'Succès' : 'Échec'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }}>
                                                <Clock size={14} />
                                                <span>{new Date(log.logged_at).toLocaleString('fr-FR')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Administrateur</th>
                                    <th>Geste</th>
                                    <th>Cible</th>
                                    <th>Source</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actionLogs.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div className="avatar" style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'black' }}>{log.user?.name[0]}</div>
                                                <strong>{log.user?.name}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--primary)' }}>{log.action}</span>
                                        </td>
                                        <td>
                                            <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                {log.target_type}
                                            </code>
                                        </td>
                                        <td><small style={{ opacity: 0.5 }}>{log.ip_address}</small></td>
                                        <td>{new Date(log.created_at).toLocaleString('fr-FR')}</td>
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
