import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, Shield, Globe, Mail, AlertTriangle, Monitor } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/settings');
            setSettings(response.data);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleValueChange = (group, key, value) => {
        const updatedGroup = settings[group].map(s =>
            s.key === key ? { ...s, value } : s
        );
        setSettings({ ...settings, [group]: updatedGroup });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const flattened = Object.values(settings).flat().map(s => ({
                key: s.key,
                value: s.value
            }));
            await api.put('/admin/settings', { settings: flattened });
            setMessage({ text: 'Les secrets de la Maison ont été mis à jour', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch {
            setMessage({ text: 'Échec de la synchronisation des paramètres', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const getGroupIcon = (group) => {
        switch (group.toLowerCase()) {
            case 'general': return <Globe size={20} />;
            case 'email': return <Mail size={20} />;
            case 'security': return <Shield size={20} />;
            default: return <Settings size={20} />;
        }
    };

    if (isLoading) return <div className="loader">Calibration des Alambics...</div>;

    return (
        <div className="admin-page-container">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Configuration du <span className="gradient-text-gold">Système</span></h1>
                    <p>Ajustez les rouages invisibles de votre Maison de Parfum avec précision.</p>
                </div>
                <div className="header-actions">
                    <div className="date-display" style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                        <Monitor size={14} style={{ marginRight: '0.5rem' }} /> Console de Gestion
                    </div>
                </div>
            </header>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ borderRadius: '14px', marginBottom: '2.5rem' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    {Object.keys(settings).map(group => (
                        <div key={group} className="admin-card-glass">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '1.25rem' }}>
                                <div style={{ color: 'var(--primary)', opacity: 0.8 }}>{getGroupIcon(group)}</div>
                                <h2 style={{ fontSize: '1rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '500', color: 'white' }}>{group}</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {settings[group].map(setting => (
                                    <div key={setting.key} className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.4, marginBottom: '0.75rem', display: 'block', fontWeight: '600', letterSpacing: '1px' }}>
                                            {setting.key.replace(/_/g, ' ').toUpperCase()}
                                        </label>

                                        {setting.key === 'maintenance_mode' ? (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                background: 'rgba(255,255,255,0.02)',
                                                padding: '1.25rem',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: setting.value === '1' ? '#f59e0b' : '#10b981' }}>
                                                    {setting.value === '1' ? <AlertTriangle size={20} className="pulse" /> : <Monitor size={20} />}
                                                    <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                                        {setting.value === '1' ? 'Maison en Travaux' : 'Boutique Ouverte'}
                                                    </span>
                                                </div>
                                                <div
                                                    onClick={() => handleValueChange(group, setting.key, setting.value === '1' ? '0' : '1')}
                                                    style={{
                                                        width: '50px',
                                                        height: '26px',
                                                        background: setting.value === '1' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                                        borderRadius: '20px',
                                                        position: 'relative',
                                                        cursor: 'pointer',
                                                        transition: '0.3s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        background: setting.value === '1' ? '#000' : '#fff',
                                                        borderRadius: '50%',
                                                        position: 'absolute',
                                                        top: '3px',
                                                        left: setting.value === '1' ? '27px' : '3px',
                                                        transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                                    }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                className="premium-input-refined"
                                                value={setting.value || ''}
                                                onChange={(e) => handleValueChange(group, setting.key, e.target.value)}
                                                style={{ paddingLeft: '1.5rem' }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '4rem',
                    padding: '1.5rem',
                    background: 'rgba(5, 7, 10, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    position: 'sticky',
                    bottom: '0',
                    zIndex: 10,
                    margin: '0 -1.5rem -1.5rem -1.5rem',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <button type="submit" className="gold-button" disabled={isSaving} style={{ padding: '1.1rem 4rem', fontSize: '0.85rem' }}>
                        <Save size={18} />
                        {isSaving ? 'Synchronisation...' : 'Sceller les Paramètres'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
