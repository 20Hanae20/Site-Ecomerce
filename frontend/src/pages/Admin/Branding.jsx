import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Branding = () => {
    const [theme, setTheme] = useState({ primary_color: '#7f1d1d', logo: '' });
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTenant();
    }, []);

    // Apply live primary color preview to document root for immediate feedback
    useEffect(() => {
        if (!theme || !theme.primary_color) return;
        document.documentElement.style.setProperty('--primary', theme.primary_color);
        return () => {
            // Optionally reset if needed
        };
    }, [theme]);

    const fetchTenant = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tenant/current');
            if (res.data) {
                setTheme(res.data.theme || { primary_color: '#7f1d1d', logo: '' });
                setName(res.data.name || '');
            }
        } catch (err) {
            console.error('Unable to fetch tenant', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let logoUrl = theme.logo;
            if (file) {
                const form = new FormData();
                form.append('logo', file);
                const res = await api.post('/admin/upload-logo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                logoUrl = res.data.url;
            }

            await api.put('/tenant', { name, theme: { ...theme, logo: logoUrl } });
            alert('Thème enregistré.');
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
    };

    return (
        <div className="admin-page-container">
            <h2>Branding & Thème</h2>
                    {loading ? <div>Chargement...</div> : (
                <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem', maxWidth: '640px' }}>
                    <label>Nom de la boutique</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="premium-input-refined" />

                    <label>Couleur principale</label>
                    <input type="color" value={theme.primary_color} onChange={e => setTheme({ ...theme, primary_color: e.target.value })} />

                    <label>Logo (URL)</label>
                    <input value={theme.logo} onChange={e => setTheme({ ...theme, logo: e.target.value })} className="premium-input-refined" />
                    <label style={{ marginTop: '0.5rem' }}>Ou téléverser un logo</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {previewUrl && (
                        <div style={{ marginTop: '1rem' }}>
                            <p>Aperçu :</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 80, height: 80, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={previewUrl} alt="preview" style={{ maxWidth: '72px', maxHeight: '72px', borderRadius: 6 }} />
                                </div>
                                <div>
                                    <img src={previewUrl} alt="preview" style={{ maxWidth: '200px', borderRadius: '6px' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '1rem' }}>
                        <button className="gold-button" disabled={saving} type="submit">{saving ? 'Sauvegarde...' : 'Sauvegarder'} </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Branding;
