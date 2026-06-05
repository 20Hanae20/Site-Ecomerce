import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getImageUrl } from '../../utils/getImageUrl';
import { Plus, Search, Edit2, Trash2, Box, Upload, Image as ImageIcon } from 'lucide-react';

const AdminProducts = () => {
    const [perfumes, setPerfumes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: '', brand: '', description: '', price: '', stock_quantity: '', notes: '', category_id: '', image_url: '' });
    const [imageType, setImageType] = useState('file');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (err) {
            console.error('Erreur récupération catégories', err);
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
                last_page: res.data.last_page || 1,
            });
        } catch (err) {
            console.error('Erreur récupération produits', err);
        } finally {
            setIsLoading(false);
        }
    }, [search, catFilter, page]);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchCategories, fetchProducts]);

    const openAddModal = () => {
        setModalMode('add');
        setCurrentId(null);
        setFormData({ name: '', brand: '', description: '', price: '', stock_quantity: '', notes: '', category_id: categories[0]?.id || '', image_url: '' });
        setImageType('file');
        setImageFile(null);
        setImagePreview(null);
        setErrorMsg('');
        setShowModal(true);
    };

    const openEditModal = (perfume) => {
        setModalMode('edit');
        setCurrentId(perfume.id);
        setFormData({
            name: perfume.name || '',
            brand: perfume.brand || '',
            description: perfume.description || '',
            price: perfume.price || '',
            stock_quantity: perfume.stock_quantity?.toString() || '0',
            notes: perfume.notes || '',
            category_id: perfume.category_id?.toString() || categories[0]?.id || '',
            image_url: perfume.image_url || '',
        });
        setImageType(perfume.image_url ? 'url' : 'file');
        setImageFile(null);
        setImagePreview(perfume.image_url ? getImageUrl(perfume.image_url) : null);
        setErrorMsg('');
        setShowModal(true);
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageType('file');
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setFormData({ ...formData, image_url: url });
        setImageType('url');
        setImageFile(null);
        setImagePreview(url);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
        try {
            await api.delete(`/perfumes/${id}`);
            setSuccessMsg('Produit supprimé avec succès.');
            fetchProducts();
        } catch (err) {
            console.error('Erreur suppression produit', err);
            setErrorMsg('Impossible de supprimer ce produit. Vérifiez vos droits ou réessayez plus tard.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('brand', formData.brand);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock_quantity', formData.stock_quantity);
        data.append('notes', formData.notes);
        if (formData.category_id) {
            data.append('category_id', formData.category_id);
        }
        data.append('is_active', '1');

        if (imageType === 'file' && imageFile) {
            data.append('image', imageFile);
        } else if (imageType === 'url' && formData.image_url) {
            data.append('image_url', formData.image_url);
        }

        try {
            if (modalMode === 'add') {
                await api.post('/perfumes', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                setSuccessMsg('Produit créé avec succès.');
            } else {
                await api.put(`/perfumes/${currentId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                setSuccessMsg('Produit mis à jour avec succès.');
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            console.error('Erreur sauvegarde produit', err);
            setErrorMsg(err.response?.data?.message || "Impossible d'enregistrer le produit.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="admin-content-inner">
            <header className="premium-header">
                <div className="welcome-section">
                    <h1>Gestion des <span className="gradient-text-gold">Produits</span></h1>
                    <p>Ajoutez, modifiez et supprimez les parfums directement depuis l'espace admin.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="gold-button" onClick={openAddModal}>
                        <Plus size={16} /> Ajouter un produit
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/products/add')}>
                        <Plus size={16} /> Page ajout complète
                    </button>
                </div>
            </header>

            <div className="admin-action-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <select className="filter-select" value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}>
                    <option value="">Toutes les catégories</option>
                    {categories.map((category) => (
                        <option value={category.id} key={category.id}>{category.name}</option>
                    ))}
                </select>
            </div>

            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            {isLoading ? (
                <div className="analytics-loader"><div className="loader-spinner" /><p>Chargement des produits...</p></div>
            ) : perfumes.length === 0 ? (
                <div className="glass-premium empty-state-panel">
                    <Box size={48} />
                    <h3>Aucun produit trouvé</h3>
                    <p>Créez un produit en utilisant le bouton ci-dessus.</p>
                </div>
            ) : (
                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '24px' }}>
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
                                {perfumes.map((product) => (
                                    <tr key={product.id}>
                                        <td><strong>{product.name}</strong></td>
                                        <td>{product.brand}</td>
                                        <td>{product.category?.name || 'Général'}</td>
                                        <td>{parseFloat(product.price).toFixed(2)} €</td>
                                        <td>
                                            <span style={{ color: product.stock_quantity === 0 ? '#ef4444' : product.stock_quantity < 5 ? '#f59e0b' : '#10b981' }}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-action" onClick={() => openEditModal(product)} title="Modifier">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-action btn-delete" onClick={() => handleDelete(product.id)} title="Supprimer">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div className="pagination-controls">
                            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button>
                            {[...Array(pagination.last_page).keys()].map((index) => (
                                <button
                                    key={index}
                                    className={`btn btn-sm ${page === index + 1 ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button className="btn btn-secondary btn-sm" disabled={page === pagination.last_page} onClick={() => setPage(page + 1)}>Suivant</button>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-premium modal-card">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Ajouter un produit' : 'Modifier le produit'}</h3>
                            <button type="button" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSave} className="admin-product-form">
                            <div className="grid-two-columns">
                                <div className="form-group">
                                    <label>Nom du produit</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Maison / Marque</label>
                                    <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid-two-columns">
                                <div className="form-group">
                                    <label>Prix (€)</label>
                                    <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Catégorie</label>
                                <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required>
                                    <option value="">Sélectionnez une catégorie</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Photo principale</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <button type="button" className={imageType === 'file' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} onClick={() => setImageType('file')}>
                                        Fichier
                                    </button>
                                    <button type="button" className={imageType === 'url' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} onClick={() => setImageType('url')}>
                                        URL
                                    </button>
                                </div>
                                {imageType === 'file' ? (
                                    <input type="file" accept="image/*" onChange={handleImageFileChange} />
                                ) : (
                                    <input type="url" value={formData.image_url} onChange={handleImageUrlChange} placeholder="https://..." />
                                )}
                                {imagePreview && (
                                    <div style={{ marginTop: '1rem', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', maxWidth: '320px' }}>
                                        <img src={imagePreview} alt="Aperçu du produit" style={{ width: '100%', display: 'block', objectFit: 'contain' }} />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" required />
                            </div>
                            <div className="form-group">
                                <label>Notes olfactives</label>
                                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
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

export default AdminProducts;
