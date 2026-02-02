import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Check, X, Layers } from 'lucide-react';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/categories?admin=1');
            setCategories(response.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
            setMessage({ text: 'Erreur lors du chargement des catégories', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const response = await api.patch(`/admin/categories/${id}/toggle-active`);
            setCategories(categories.map(cat =>
                cat.id === id ? { ...cat, is_active: response.data.is_active } : cat
            ));
        } catch (err) {
            console.error("Toggle error", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette catégorie ? Cela peut affecter les produits liés.")) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            setCategories(categories.filter(cat => cat.id !== id));
            setMessage({ text: 'Catégorie supprimée', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Erreur lors de la suppression', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/admin/categories/${currentId}`, formData);
                setMessage({ text: 'Catégorie mise à jour', type: 'success' });
            } else {
                await api.post('/admin/categories', formData);
                setMessage({ text: 'Catégorie créée', type: 'success' });
            }
            setShowForm(false);
            fetchCategories();
            setFormData({ name: '', description: '', is_active: true });
        } catch (err) {
            console.error("Submit error", err);
            setMessage({ text: 'Erreur lors de l\'enregistrement', type: 'error' });
        }
    };

    const startEdit = (cat) => {
        setFormData({ name: cat.name, description: cat.description || '', is_active: cat.is_active });
        setCurrentId(cat.id);
        setEditMode(true);
        setShowForm(true);
    };

    const openCreate = () => {
        setFormData({ name: '', description: '', is_active: true });
        setEditMode(false);
        setShowForm(true);
    };

    if (isLoading) return <div className="loader">Extraction des Essences...</div>;

    const stats = {
        total: categories.length,
        active: categories.filter(c => c.is_active).length,
        hidden: categories.filter(c => !c.is_active).length
    };

    return (
        <div className="admin-page-container">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Gestion des <span className="gradient-text-gold">Catégories</span></h1>
                    <p>Organisez vos collections olfactives avec une élégance absolue.</p>
                </div>
                <button className="gold-button" onClick={openCreate} style={{ padding: '0.8rem 1.5rem' }}>
                    <Plus size={18} /> Nouvelle Collection
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
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Collections</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: 'white' }}>{stats.total}</div>
                </div>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Visibles</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: '#10b981' }}>{stats.active}</div>
                </div>
                <div className="admin-card-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Masquées</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: 'var(--primary)' }}>{stats.hidden}</div>
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
                            <th>Identité de la Collection</th>
                            <th>Description Olfactive</th>
                            <th>Statut</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>Aucune essence enregistrée pour le moment.</td></tr>
                        ) : (
                            categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="avatar-refined" style={{ width: '40px', height: '40px', background: 'rgba(212, 175, 55, 0.05)', color: 'var(--primary)' }}>
                                                <Layers size={18} />
                                            </div>
                                            <strong style={{ color: 'white', letterSpacing: '0.5px' }}>{cat.name}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            {cat.description || "L'essence de cette collection n'a pas encore été décrite."}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`status-chip ${cat.is_active ? 'active' : 'inactive'}`}
                                            onClick={() => handleToggleActive(cat.id)}
                                            style={{
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: 'fit-content',
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                background: cat.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                color: cat.is_active ? '#10b981' : 'rgba(255,255,255,0.4)'
                                            }}
                                        >
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                            {cat.is_active ? 'Visible' : 'Masquée'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="icon-btn" title="Éditer" onClick={() => startEdit(cat)} style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="icon-btn" title="Supprimer" onClick={() => handleDelete(cat.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
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
                <div className="overlay-blur" onClick={() => setShowForm(false)} style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.7)' }}>
                    <div className="admin-card-glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 500, marginBottom: '2rem', textAlign: 'center' }}>
                            {editMode ? 'Raffiner la ' : 'Inspirer une '} <span className="gradient-text-gold">Collection</span>
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Nom de l'Essence</label>
                                <input
                                    className="premium-input-refined"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="ex: Oud Royal & Ambre Gris"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.6rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Description Olfactive</label>
                                <textarea
                                    className="premium-input-refined"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                    placeholder="Décrivez l'univers sensoriel de cette collection..."
                                    style={{ width: '100%', resize: 'none' }}
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    style={{
                                        width: '40px',
                                        height: '24px',
                                        borderRadius: '20px',
                                        background: formData.is_active ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        position: 'absolute',
                                        top: '3px',
                                        left: formData.is_active ? '19px' : '3px',
                                        transition: 'all 0.3s ease'
                                    }}></div>
                                </div>
                                <label style={{ marginBottom: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                    Rendre cette collection publique sur le site
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="gold-button inactive" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>Annuler</button>
                                <button type="submit" className="gold-button" style={{ flex: 1.5 }}>
                                    {editMode ? 'Sauvegarder les Nouveaux Traits' : 'Révéler la Collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
