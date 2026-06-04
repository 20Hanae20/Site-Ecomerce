import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tag, Plus, Edit2, Trash2, Calendar, Percent, Euro, X, Check, Search, RefreshCw } from 'lucide-react';

const TenantPromotions = () => {
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
            setPromotions(response.data || []);
        } catch (err) {
            console.error("Fetch promotions failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                value: parseFloat(formData.value)
            };
            if (editData) {
                await api.put(`/admin/promotions/${editData.id}`, payload);
                setMessage({ text: 'Promotion mise à jour avec succès.', type: 'success' });
            } else {
                await api.post('/admin/promotions', payload);
                setMessage({ text: 'Campagne promotionnelle créée avec succès !', type: 'success' });
            }
            setShowForm(false);
            fetchPromotions();
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error("Save promotion failed", err);
            setMessage({ text: 'Erreur lors de l\'enregistrement de la promotion.', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Retirer cette offre promotionnelle définitivement ?")) return;
        try {
            await api.delete(`/admin/promotions/${id}`);
            setPromotions(promotions.filter(p => p.id !== id));
            setMessage({ text: 'Offre retirée avec succès.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error("Delete promotion failed", err);
            setMessage({ text: 'Impossible de supprimer la promotion.', type: 'error' });
        }
    };

    const handleToggleActive = async (promo) => {
        try {
            const newStatus = !promo.is_active;
            await api.put(`/admin/promotions/${promo.id}`, { ...promo, is_active: newStatus });
            setPromotions(promotions.map(p => p.id === promo.id ? { ...p, is_active: newStatus } : p));
        } catch (err) {
            console.error("Toggle promotion failed", err);
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

    const now = new Date();
    const stats = {
        total: promotions.length,
        active: promotions.filter(p => p.is_active && (!p.end_date || new Date(p.end_date) > now)).length,
        expired: promotions.filter(p => p.end_date && new Date(p.end_date) < now).length
    };

    return (
        <div className="tenant-promotions-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Configurez les codes promotionnels et remises pour votre Espace Client.</p>
                <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Créer un coupon
                </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <div className="glass-premium" style={{ padding: '1.25rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Campagnes</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>{stats.total}</div>
                </div>
                <div className="glass-premium" style={{ padding: '1.25rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Coupons Actifs</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{stats.active}</div>
                </div>
                <div className="glass-premium" style={{ padding: '1.25rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Coupons Clôturés</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{stats.expired}</div>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                    {message.text}
                </div>
            )}

            {/* Promotions Table */}
            {isLoading ? (
                <div className="analytics-loader"><div className="loader-spinner" /><p>Chargement des offres...</p></div>
            ) : promotions.length === 0 ? (
                <div className="glass-premium" style={{ padding: '4rem', textAlign: 'center', background: '#fff' }}>
                    <Tag size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aucune promotion active</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Lancez votre première campagne marketing en créant un coupon de réduction.</p>
                </div>
            ) : (
                <div className="glass-premium" style={{ borderRadius: '20px', padding: '1rem', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Nom Campagne</th>
                                    <th>Code Privilège</th>
                                    <th>Réduction</th>
                                    <th>Validité</th>
                                    <th>Statut</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.map(promo => (
                                    <tr key={promo.id}>
                                        <td><strong>{promo.name}</strong></td>
                                        <td>
                                            <code style={{ fontSize: '0.85rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                                                {promo.code}
                                            </code>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700 }}>
                                                {promo.type === 'percentage' ? `${promo.value}%` : `${parseFloat(promo.value).toFixed(2)} €`}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                du {promo.start_date ? new Date(promo.start_date).toLocaleDateString('fr-FR') : 'Immédiat'}<br />
                                                au {promo.end_date ? new Date(promo.end_date).toLocaleDateString('fr-FR') : 'Indéfini'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleToggleActive(promo)}
                                                className={`btn btn-sm ${promo.is_active ? 'btn-primary' : 'btn-secondary'}`}
                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                            >
                                                {promo.is_active ? <Check size={12} /> : <X size={12} />}
                                                {promo.is_active ? 'Actif' : 'Désactivé'}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-action activate" onClick={() => openEdit(promo)} style={{ marginRight: '0.5rem' }} title="Modifier">
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="btn-action delete" onClick={() => handleDelete(promo.id)} title="Retirer">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add / Edit Form Modal */}
            {showForm && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', zIndex: 1000 }}>
                    <div className="glass-premium" style={{ margin: 'auto', width: '90%', maxWidth: '550px', background: '#fff', padding: '2.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                                {editData ? 'Modifier l\'Offre' : 'Créer un Code Coupon'}
                            </h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label>Nom de la campagne</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={formData.name} 
                                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                    placeholder="ex: Offre Privilège Eté" 
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>Code Coupon</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={formData.code} 
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                                    placeholder="ex: PRIVILEGE20" 
                                    required 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Type de réduction</label>
                                    <select className="form-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="percentage">Pourcentage (%)</option>
                                        <option value="fixed">Montant fixe (€)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Valeur de réduction</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="form-input" 
                                        value={formData.value} 
                                        onChange={e => setFormData({ ...formData, value: e.target.value })} 
                                        placeholder="ex: 15" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Date de début</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        value={formData.start_date} 
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date de fin</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        value={formData.end_date} 
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary w-full" onClick={() => setShowForm(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary w-full">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantPromotions;
