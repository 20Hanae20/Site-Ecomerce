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

    return (
        <div className="admin-content-inner">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Gestion des <span className="gradient-text-gold">Catégories</span></h1>
                    <p>Organisez vos collections olfactives avec élégance.</p>
                </div>
                <button className="gold-button" onClick={openCreate}>
                    <Plus size={18} /> Nouvelle Catégorie
                </button>
            </header>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="admin-table-container glass-premium">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Identité</th>
                            <th>Description</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="avatar" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)' }}>
                                            <Layers size={18} />
                                        </div>
                                        <strong style={{ fontSize: '1rem' }}>{cat.name}</strong>
                                    </div>
                                </td>
                                <td style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '300px' }}>
                                    {cat.description || "Aucune description fournie."}
                                </td>
                                <td>
                                    <span
                                        className={`status-badge ${cat.is_active ? 'active' : 'inactive'}`}
                                        onClick={() => handleToggleActive(cat.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {cat.is_active ? 'Visible' : 'Masquée'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="icon-btn" title="Éditer" onClick={() => startEdit(cat)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="icon-btn delete" title="Supprimer" onClick={() => handleDelete(cat.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="overlay-blur">
                    <div className="premium-modal">
                        <h2>{editMode ? 'Raffiner la Catégorie' : 'Inspirer une Catégorie'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nom de la Collection</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="ex: Oud & Orient"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description Olfactive</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                    placeholder="Décrivez l'univers de cette collection..."
                                />
                            </div>
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="checkbox"
                                    id="active-check"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label htmlFor="active-check" style={{ marginBottom: 0 }}>Rendre cette collection publique</label>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Annuler</button>
                                <button type="submit" className="gold-button">
                                    {editMode ? 'Sauvegarder' : 'Créer'}
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
