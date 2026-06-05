import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getImageUrl } from '../../utils/getImageUrl';
import { useCart } from '../../context/useCart';
import { Filter, Search, RotateCcw, ShoppingCart, Star, Box, Compass } from 'lucide-react';

const getPerfumeImage = (perfume) => {
    return getImageUrl(perfume.image_url);
};

const ClientCatalog = () => {
    const [perfumes, setPerfumes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({});
    const { addToCart } = useCart();
    const [addingIds, setAddingIds] = useState(new Set());
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [filters, setFilters] = useState({
        q: '',
        category_id: '',
        min_price: '',
        max_price: '',
        sort_by: 'created_at',
        page: 1
    });

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error("Fetch categories error:", err);
        }
    }, []);

    const fetchPerfumes = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.q) params.append('q', filters.q);
            if (filters.category_id) params.append('category_id', filters.category_id);
            if (filters.min_price) params.append('min_price', filters.min_price);
            if (filters.max_price) params.append('max_price', filters.max_price);
            if (filters.sort_by) params.append('sort_by', filters.sort_by);
            params.append('page', filters.page);

            const response = await api.get(`/perfumes?${params.toString()}`);
            setPerfumes(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (err) {
            console.error("Fetch perfumes error:", err);
            setError("Impossible de charger le catalogue.");
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCategories();
        fetchPerfumes();
    }, [fetchCategories, fetchPerfumes]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (filters.q.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const response = await api.get(`/perfumes?q=${filters.q}&per_page=5`);
                setSuggestions(response.data.data);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Autocomplete error", error);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [filters.q]);

    const selectSuggestion = (name) => {
        setFilters({ ...filters, q: name, page: 1 });
        setShowSuggestions(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchPerfumes();
    };

    const resetFilters = () => {
        setFilters({
            q: '',
            category_id: '',
            min_price: '',
            max_price: '',
            sort_by: 'created_at',
            page: 1
        });
    };

    const handleQuickAdd = async (e, perfumeId) => {
        e.preventDefault();
        e.stopPropagation();

        setAddingIds(prev => new Set(prev).add(perfumeId));
        await addToCart(perfumeId, 1);
        setAddingIds(prev => {
            const next = new Set(prev);
            next.delete(perfumeId);
            return next;
        });
    };

    return (
        <div className="client-catalog-wrapper" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
            {/* Filters Sidebar */}
            <aside className="catalog-sidebar">
                <div className="glass-premium" style={{ padding: '1.5rem', borderRadius: '20px', position: 'sticky', top: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>Filtres</h3>
                    
                    <div style={{ marginBottom: '1.25rem' }}>
                        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: '2.25rem' }}
                                placeholder="Rechercher..."
                                value={filters.q}
                                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div style={{ position: 'absolute', width: '100%', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '12px', zIndex: 10, marginTop: '4px', boxShadow: 'var(--shadow-md)' }}>
                                    {suggestions.map(s => (
                                        <div key={s.id} style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }} onMouseDown={() => selectSuggestion(s.name)}>
                                            {s.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </form>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Filter size={14} /> Catégories
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button 
                                className={`btn btn-sm ${filters.category_id === '' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilters({ ...filters, category_id: '', page: 1 })}
                                style={{ textAlign: 'left', width: '100%' }}
                            >
                                Toutes les catégories
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat.id} 
                                    className={`btn btn-sm ${filters.category_id == cat.id ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFilters({ ...filters, category_id: cat.id, page: 1 })}
                                    style={{ textAlign: 'left', width: '100%' }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>Prix (€)</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <input 
                                type="number" 
                                className="form-input text-sm" 
                                placeholder="Min" 
                                value={filters.min_price} 
                                onChange={(e) => setFilters({ ...filters, min_price: e.target.value })} 
                            />
                            <input 
                                type="number" 
                                className="form-input text-sm" 
                                placeholder="Max" 
                                value={filters.max_price} 
                                onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} 
                            />
                        </div>
                        <button className="btn btn-secondary w-full btn-sm" onClick={() => { setFilters({ ...filters, page: 1 }); fetchPerfumes(); }}>Appliquer</button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                        <button className="btn w-full btn-sm text-muted" onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <RotateCcw size={14} /> Réinitialiser
                        </button>
                    </div>
                </div>
            </aside>

            {/* Products Main View */}
            <main className="catalog-main" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {pagination.total || 0} essences d'exception trouvées
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Trier par:</label>
                        <select className="form-input" style={{ width: 'auto', padding: '0.25rem 0.5rem' }} value={filters.sort_by} onChange={(e) => setFilters({ ...filters, sort_by: e.target.value, page: 1 })}>
                            <option value="created_at">Plus récents</option>
                            <option value="price_asc">Prix croissant</option>
                            <option value="price_desc">Prix décroissant</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="analytics-loader"><div className="loader-spinner" /><p>Chargement des parfums...</p></div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : perfumes.length === 0 ? (
                    <div className="glass-premium" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <Box size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1.5rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aucune essence ne correspond</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Essayez d'ajuster vos critères de recherche ou vos filtres.</p>
                        <button className="btn btn-primary btn-sm" style={{ marginTop: '1.5rem' }} onClick={resetFilters}>Réinitialiser les filtres</button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            {perfumes.map(perfume => (
                                <div key={perfume.id} className="glass-premium" style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', padding: '1rem', background: '#fff', border: '1px solid var(--border-light)' }}>
                                    <div style={{ height: '200px', background: 'var(--bg-alt)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                        {getPerfumeImage(perfume) ? (
                                            <img src={getPerfumeImage(perfume)} alt={perfume.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Compass size={40} style={{ color: 'var(--primary)', opacity: 0.2 }} />
                                        )}
                                        {new Date(perfume.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                                            <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: '20px' }}>Nouveau</span>
                                        )}
                                    </div>
                                    <div style={{ padding: '0.75rem 0 0', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                            <span>{perfume.brand}</span>
                                            {perfume.rating_avg > 0 && (
                                                <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    <Star size={12} fill="currentColor" /> {perfume.rating_avg}
                                                </span>
                                            )}
                                        </div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-main)' }}>{perfume.name}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '38px' }}>
                                            {perfume.notes || 'Notes olfactives non renseignées.'}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{parseFloat(perfume.price).toFixed(2)} €</span>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={(e) => handleQuickAdd(e, perfume.id)}
                                                disabled={addingIds.has(perfume.id) || perfume.stock_quantity === 0}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <ShoppingCart size={14} />
                                                {addingIds.has(perfume.id) ? '...' : (perfume.stock_quantity === 0 ? 'Rupture' : 'Prendre')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={filters.page === 1}
                                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                >
                                    Précédent
                                </button>
                                {[...Array(pagination.last_page).keys()].map(p => (
                                    <button
                                        key={p + 1}
                                        className={`btn btn-sm ${filters.page === p + 1 ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setFilters({ ...filters, page: p + 1 })}
                                    >
                                        {p + 1}
                                    </button>
                                ))}
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={filters.page === pagination.last_page}
                                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default ClientCatalog;
