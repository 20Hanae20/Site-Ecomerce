import React, { useState, useEffect, useCallback } from 'react';
import api, { API_HOST } from '../../services/api';
import { Plus, Search, Filter, Edit2, Trash2, Download, Upload, Box, ShieldAlert } from 'lucide-react';

const TenantProducts = () => {
    const [perfumes, setPerfumes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [page, setPage] = useState(1);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: '', brand: '', price: '', stock_quantity: '', notes: '', category_id: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (err) {
            console.error('Error fetching categories', err);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('q', search);
            if (catFilter) params.append('category_id', catFilter);
            params.append('page', page);
            
            const res = await api.get(`/perfumes?${params.toString()}`);
            setPerfumes(res.data.data || []);
            setPagination({
                current_page: res.data.current_page || 1,
                last_page: res.data.last_page || 1
            });
        } catch (err) {
            console.error('Error fetching products', err);
        } finally {
            setIsLoading(false);
        }
    }, [search, catFilter, page]);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchCategories, fetchProducts]);

    const handleOpenAdd = () => {
        setModalMode('add');
        setFormData({ name: '', brand: '', price: '', stock_quantity: '', notes: '', category_id: categories[0]?.id || '' });
        setErrorMsg('');
        setShowModal(true);
    };

    const handleOpenEdit = (perfume) => {
        setModalMode('edit');
        setCurrentId(perfume.id);
        setFormData({
            name: perfume.name || '',
            brand: perfume.brand || '',
            price: perfume.price || '',
            stock_quantity: perfume.stock_quantity || '0',
            notes: perfume.notes || '',
            category_id: perfume.category_id || categories[0]?.id || ''
        });
        setErrorMsg('');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce parfum définitivement ?')) return;
        try {
            await api.delete(`/admin/perfumes/${id}`);
            fetchProducts();
        } catch (err) {
            console.error('Failed to delete product', err);
            alert('Impossible de supprimer ce produit. Assurez-vous que vous disposez des droits nécessaires.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setErrorMsg('');
        try {
            const payload = {
                name: formData.name,
                brand: formData.brand,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
                notes: formData.notes,
                category_id: parseInt(formData.category_id),
                is_active: true
            };

            if (modalMode === 'add') {
                await api.post('/admin/perfumes', payload);
            } else {
                await api.put(`/admin/perfumes/${currentId}`, payload);
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            console.error('Failed to save product', err);
            setErrorMsg(err.response?.data?.message || 'Erreur lors de la sauvegarde du produit.');
        } finally {
            setActionLoading(false);
        }
    };

    // Native CSV Export
    const handleExportCSV = () => {
        // Stream the CSV using the backend route
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
        window.open(`${API_HOST}/api/admin/analytics/export/products?token=${token}`, '_blank');
    };

    // Simulated CSV Import
    const handleImportCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n');
                alert(`${lines.length - 2} produits identifiés dans le CSV. Simulation de l'intégration réussie !`);
                fetchProducts();
            } catch (err) {
                alert('Erreur lors du traitement du fichier CSV.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="tenant-products-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '500px' }}>
                    <div className="search-box" style={{ flex: 1 }}>
                        <Search size={16} />
                        <input type="text" placeholder="Rechercher un parfum..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <select className="filter-select" style={{ width: '180px' }} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
                        <option value="">Toutes les catégories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> Exporter CSV
                    </button>
                    <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Upload size={16} /> Importer CSV
                        <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                    </label>
                    <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={16} /> Ajouter Essence
                    </button>
                </div>
            </div>

            {/* Main Grid / Table */}
            {isLoading ? (
                <div className="analytics-loader"><div className="loader-spinner" /><p>Chargement des collections...</p></div>
            ) : perfumes.length === 0 ? (
                <div className="glass-premium" style={{ padding: '4rem', textAlign: 'center' }}>
                    <Box size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aucune essence de parfum trouvée</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Créez votre première référence olfactive dès maintenant.</p>
                    <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={handleOpenAdd}>Ajouter un parfum</button>
                </div>
            ) : (
                <div className="glass-premium" style={{ borderRadius: '20px', padding: '1rem', background: '#fff' }}>
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Marque</th>
                                    <th>Catégorie</th>
                                    <th>Prix</th>
                                    <th>Stock</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {perfumes.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.name}</strong></td>
                                        <td>{p.brand}</td>
                                        <td><span className="badge badge-secondary">{p.category?.name || 'Général'}</span></td>
                                        <td>{parseFloat(p.price).toFixed(2)} €</td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: p.stock_quantity === 0 ? 'var(--danger)' : p.stock_quantity < 5 ? 'var(--warning)' : 'inherit' }}>
                                                {p.stock_quantity}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-action activate" onClick={() => handleOpenEdit(p)} style={{ marginRight: '0.5rem' }} title="Modifier">
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="btn-action delete" onClick={() => handleDelete(p.id)} title="Supprimer">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button>
                            {[...Array(pagination.last_page).keys()].map(p => (
                                <button key={p + 1} className={`btn btn-sm ${page === p + 1 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPage(p + 1)}>{p + 1}</button>
                            ))}
                            <button className="btn btn-secondary btn-sm" disabled={page === pagination.last_page} onClick={() => setPage(page + 1)}>Suivant</button>
                        </div>
                    )}
                </div>
            )}

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', zIndex: 1000 }}>
                    <div className="glass-premium" style={{ margin: 'auto', width: '90%', maxWidth: '600px', background: '#fff', padding: '2.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{modalMode === 'add' ? 'Créer une Essence' : 'Modifier l\'Essence'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Nom du parfum</label>
                                    <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Maison / Marque</label>
                                    <input type="text" className="form-input" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Prix de vente (€)</label>
                                    <input type="number" step="0.01" className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Stock initial</label>
                                    <input type="number" className="form-input" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Catégorie</label>
                                <select className="form-input" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Pyramide Olfactive / Notes</label>
                                <input type="text" className="form-input" placeholder="ex: Jasmin, Oud, Vanille..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-secondary w-full" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary w-full" disabled={actionLoading}>
                                    {actionLoading ? 'Sauvegarde...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantProducts;
