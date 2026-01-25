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

    return (
        <div className="admin-content-inner">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Campagnes <span className="gradient-text-gold">Promotionnelles</span></h1>
                    <p>Sublimez vos ventes avec des offres exclusives.</p>
                </div>
                <button className="gold-button" onClick={openCreate}>
                    <Plus size={18} /> Créer une Offre
                </button>
            </header>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="admin-table-container glass-premium">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Campagne</th>
                            <th>Réduction</th>
                            <th>Validité</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map(promo => (
                            <tr key={promo.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="avatar" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)' }}>
                                            <Tag size={18} />
                                        </div>
                                        <div>
                                            <strong style={{ display: 'block' }}>{promo.name}</strong>
                                            <code style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(212,175,55,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{promo.code}</code>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                        {promo.type === 'percentage' ? <><Percent size={16} /> {promo.value}%</> : <><Euro size={16} /> {promo.value}</>}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem', opacity: 0.7 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={14} />
                                            <span>Du: {promo.start_date ? new Date(promo.start_date).toLocaleDateString('fr-FR') : 'Immédiat'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={14} />
                                            <span>Au: {promo.end_date ? new Date(promo.end_date).toLocaleDateString('fr-FR') : 'Indéfini'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className={`status-badge ${promo.is_active ? 'active' : 'inactive'}`}
                                        onClick={() => handleToggleActive(promo)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {promo.is_active ? 'Active' : 'Désactivée'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="icon-btn" title="Modifier" onClick={() => openEdit(promo)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="icon-btn delete" title="Supprimer" onClick={() => handleDelete(promo.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="overlay-blur" onClick={() => setShowForm(false)}>
                    <div className="premium-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editData ? 'Affiner l\'Offre' : 'Inspirer une Promotion'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nom de la campagne</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="ex: Soldes de Printemps"
                                />
                            </div>
                            <div className="form-group">
                                <label>Code Privilège</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                    placeholder="ex: SPRING2024"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Nature de l'offre</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="percentage">Pourcentage (%)</option>
                                        <option value="fixed">Montant fixe (€)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Valeur</label>
                                    <input type="number" step="0.01" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Date de lancement</label>
                                    <input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Date de clôture</label>
                                    <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Annuler</button>
                                <button type="submit" className="gold-button">
                                    {editData ? 'Sauvegarder' : 'Lancer'}
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
