import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tag, Plus, Edit2, Trash2, Calendar, Percent, Euro, X, Check, Search } from 'lucide-react';

const AdminPromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'percentage',
        value: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/promotions');
            setPromotions(response.data);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editData) {
                await api.put(`/admin/promotions/${editData.id}`, formData);
                setMessage({ text: 'Promotion raffinée avec succès', type: 'success' });
            } else {
                await api.post('/admin/promotions', formData);
                setMessage({ text: 'Nouvelle campagne lancée', type: 'success' });
            }
            setShowForm(false);
            fetchPromotions();
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error("Save failed", err);
            setMessage({ text: 'Erreur lors de la création', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment retirer cette offre ?")) return;
        try {
            await api.delete(`/admin/promotions/${id}`);
            setPromotions(promotions.filter(p => p.id !== id));
            setMessage({ text: 'Promotion retirée du catalogue', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleToggleActive = async (promo) => {
        try {
            const newStatus = !promo.is_active;
            await api.put(`/admin/promotions/${promo.id}`, { ...promo, is_active: newStatus });
            setPromotions(promotions.map(p => p.id === promo.id ? { ...p, is_active: newStatus } : p));
        } catch (err) {
            console.error("Toggle failed", err);
        }
    };

    const openEdit = (promo) => {
        setEditData(promo);
        setFormData({
            name: promo.name,
            code: promo.code,
            type: promo.type,
            value: promo.value,
            start_date: promo.start_date ? promo.start_date.split('T')[0] : '',
            end_date: promo.end_date ? promo.end_date.split('T')[0] : '',
            is_active: promo.is_active
        });
        setShowForm(true);
    };

    const openCreate = () => {
        setEditData(null);
        setFormData({
            name: '',
            code: '',
            type: 'percentage',
            value: '',
            start_date: '',
            end_date: '',
            is_active: true
        });
        setShowForm(true);
    };

    if (isLoading && promotions.length === 0) return <div className="loader">Composition des Offres...</div>;

    const now = new Date();
    const stats = {
        total: promotions.length,
        active: promotions.filter(p => p.is_active && (!p.end_date || new Date(p.end_date) > now)).length,
        expired: promotions.filter(p => p.end_date && new Date(p.end_date) < now).length
    };

    return (
        <div className="admin-page-container">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Campagnes <span className="gradient-text-gold">Promotionnelles</span></h1>
                    <p>Sublimez vos ventes avec des offres exclusives et raffinées.</p>
                </div>
                <button className="gold-button" onClick={openCreate} style={{ padding: '0.8rem 1.6rem' }}>
                    <Plus size={18} /> Inspirer une Offre
                </button>
            </header>

            {/* Stats Overview */}
            <div className="admin-stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Campagnes</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: 'white' }}>{stats.total}</div>
                </div>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Offres Actives</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: '#10b981' }}>{stats.active}</div>
                </div>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Clôturées</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: '#ef4444' }}>{stats.expired}</div>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ borderRadius: '14px', marginBottom: '2rem' }}>
                    {message.text}
                </div>
            )}

            <div className="admin-table-container">
                <table className="premium-table-refined">
                    <thead>
                        <tr>
                            <th>Campagne</th>
                            <th>Réduction</th>
                            <th>Validité</th>
                            <th>Statut</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>Aucune campagne en cours de diffusion.</td></tr>
                        ) : (
                            promotions.map(promo => (
                                <tr key={promo.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div className="avatar-refined" style={{ background: 'rgba(212, 175, 55, 0.05)', color: 'var(--primary)', width: '42px', height: '42px' }}>
                                                <Tag size={18} />
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontWeight: '600', color: 'white', fontSize: '0.95rem' }}>{promo.name}</span>
                                                <code style={{
                                                    fontSize: '0.7rem',
                                                    color: 'var(--primary)',
                                                    background: 'rgba(212,175,55,0.08)',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '6px',
                                                    letterSpacing: '1px',
                                                    border: '1px solid rgba(212,175,55,0.1)'
                                                }}>{promo.code}</code>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'white', fontSize: '1.1rem' }}>
                                            {promo.type === 'percentage' ? <><Percent size={16} style={{ opacity: 0.5 }} /> {promo.value}%</> : <><Euro size={16} style={{ opacity: 0.5 }} /> {promo.value}</>}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ opacity: 0.6, fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '4px' }}>
                                                <Calendar size={13} style={{ opacity: 0.4 }} />
                                                <span>{promo.start_date ? new Date(promo.start_date).toLocaleDateString('fr-FR') : 'Immédiat'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{ width: '13px' }} />
                                                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>au {promo.end_date ? new Date(promo.end_date).toLocaleDateString('fr-FR') : 'Indéfini'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div
                                            onClick={() => handleToggleActive(promo)}
                                            style={{
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                color: promo.is_active ? '#10b981' : '#64748b',
                                                background: promo.is_active ? 'rgba(16, 185, 129, 0.05)' : 'rgba(100, 116, 139, 0.05)',
                                                padding: '0.35rem 0.8rem',
                                                borderRadius: '20px',
                                                border: `1px solid ${promo.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)'}`,
                                                width: 'fit-content'
                                            }}
                                        >
                                            {promo.is_active ? <Check size={14} /> : <X size={14} />}
                                            {promo.is_active ? 'Actif' : 'Désactivé'}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="icon-btn" title="Modifier" onClick={() => openEdit(promo)} style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="icon-btn delete" title="Supprimer" onClick={() => handleDelete(promo.id)} style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="overlay-blur" onClick={() => setShowForm(false)} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' }}>
                    <div className="admin-card-glass" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ marginBottom: '2rem', color: 'white', fontWeight: 500 }}>{editData ? 'Affiner l\'Offre' : 'Inspirer une Promotion'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Nom de la campagne</label>
                                <input
                                    className="premium-input-refined"
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="ex: Soldes de Printemps"
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Code Privilège</label>
                                <input
                                    className="premium-input-refined"
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                    placeholder="ex: SPRING2024"
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Nature de l'offre</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(30, 30, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                                    >
                                        <option value="percentage">Pourcentage (%)</option>
                                        <option value="fixed">Montant fixe (€)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Valeur</label>
                                    <input
                                        className="premium-input-refined"
                                        type="number"
                                        step="0.01"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <div className="form-group">
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Date de lancement</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', colorScheme: 'dark' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Date de clôture</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="gold-button inactive" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                                    Annuler
                                </button>
                                <button type="submit" className="gold-button" style={{ padding: '0.8rem 2.5rem' }}>
                                    {editData ? 'Sauvegarder' : 'Lancer la Campagne'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPromotions;
