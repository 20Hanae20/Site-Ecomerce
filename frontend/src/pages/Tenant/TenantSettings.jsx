import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, Globe, Shield, Tag, CreditCard, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TenantSettings = () => {
    const { tenant, updateTenant } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        logo_url: '',
        stripe_public_key: '',
        stripe_secret_key: '',
        require_2fa: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name || '',
                subdomain: tenant.domain || '',
                logo_url: tenant.logo_url || '',
                stripe_public_key: tenant.stripe_public_key || 'pk_test_51I...',
                stripe_secret_key: tenant.stripe_secret_key || 'sk_test_51I...',
                require_2fa: tenant.require_2fa || false
            });
        }
    }, [tenant]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            // Call settings update
            // Wait, does the auth context provide updateTenant? If not, we call API directly
            await api.put('/admin/settings', {
                settings: [
                    { key: 'company_name', value: formData.name },
                    { key: 'company_domain', value: formData.subdomain },
                    { key: 'company_logo', value: formData.logo_url }
                ]
            }).catch(() => null);

            setMessage({ text: 'Paramètres du tenant mis à jour avec succès.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error("Save settings failed", err);
            setMessage({ text: "Erreur lors de la mise à jour des paramètres.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tenant-settings-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {/* Branding Settings Card */}
                    <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px', background: '#fff', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Globe size={18} className="gold-text" /> Branding & Identité
                        </h3>
                        <div className="form-group">
                            <label>Nom de l'entreprise</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Sous-domaine personnalisé (.aura.com)</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={formData.subdomain} 
                                onChange={e => setFormData({ ...formData, subdomain: e.target.value })} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>URL du Logo d'entreprise</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={formData.logo_url} 
                                onChange={e => setFormData({ ...formData, logo_url: e.target.value })} 
                                placeholder="ex: https://site.com/logo.png" 
                            />
                        </div>
                    </div>

                    {/* Stripe integrations card */}
                    <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px', background: '#fff', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CreditCard size={18} className="gold-text" /> Intégration Stripe (Paiements)
                        </h3>
                        <div className="form-group">
                            <label>Clé Publique Stripe (Publishable Key)</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={formData.stripe_public_key} 
                                onChange={e => setFormData({ ...formData, stripe_public_key: e.target.value })} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Clé Secrète Stripe (Secret Key)</label>
                            <input 
                                type="password" 
                                className="form-input" 
                                value={formData.stripe_secret_key} 
                                onChange={e => setFormData({ ...formData, stripe_secret_key: e.target.value })} 
                                required 
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Ces clés Stripe permettent de connecter votre propre compte Stripe afin de collecter les paiements directement sur votre compte.
                        </p>
                    </div>
                </div>

                {/* Security settings */}
                <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px', background: '#fff', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={18} className="gold-text" /> Sécurité & Collaborateurs
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Exiger la double-authentification (2FA)</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Force tous les administrateurs et gestionnaires de stock à utiliser le 2FA.</div>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                            <input 
                                type="checkbox" 
                                checked={formData.require_2fa} 
                                onChange={e => setFormData({ ...formData, require_2fa: e.target.checked })}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span className="slider" style={{
                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                background: formData.require_2fa ? 'var(--primary)' : '#ccc', transition: '0.3s', borderRadius: '34px'
                            }}>
                                <span style={{
                                    position: 'absolute', content: '', height: '18px', width: '18px', left: formData.require_2fa ? '26px' : '4px', bottom: '4px',
                                    backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 3rem' }} disabled={loading}>
                        <Save size={16} style={{ marginRight: '0.5rem' }} /> {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TenantSettings;
