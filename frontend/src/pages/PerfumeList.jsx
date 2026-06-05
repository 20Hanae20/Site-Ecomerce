import { useState, useEffect, useCallback } from 'react';
import api, { API_HOST } from '../services/api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { Filter, Search, RotateCcw, ShoppingCart, Star, Box, Sparkles, SlidersHorizontal } from 'lucide-react';

const getPerfumeImage = (perfume) => {
    if (perfume.image_url) {
        if (perfume.image_url.startsWith('http://') || perfume.image_url.startsWith('https://')) {
            return perfume.image_url;
        }
        return `${API_HOST}${perfume.image_url}`;
    }
    return null;
};

const PerfumeList = () => {
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
            const data = response.data || [];
            setCategories(Array.isArray(data) ? data : []);
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
            const data = response.data?.data || response.data || [];
            setPerfumes(Array.isArray(data) ? data : []);
            setPagination({
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                total: response.data.total || (Array.isArray(data) ? data.length : 0)
            });
        } catch (err) {
            console.error("Fetch perfumes error:", err);
            setError("Impossible de charger le catalogue de parfums.");
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCategories();
        fetchPerfumes();
    }, [fetchCategories, fetchPerfumes]);

    // Autocomplete Search Logic
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (filters.q.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const response = await api.get(`/perfumes?q=${filters.q}&per_page=5`);
                const data = response.data?.data || response.data || [];
                setSuggestions(Array.isArray(data) ? data : []);
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

    const renderMainContent = () => {
        if (isLoading) return (
            <div className="premium-catalog-loader">
                <div className="catalog-spinner">
                    <div className="spinner-ring"></div>
                    <Sparkles size={20} className="spinner-icon" />
                </div>
                <p>Création de la collection en cours...</p>
            </div>
        );

        if (error) return (
            <div className="premium-alert alert-danger saas-card">
                <div className="alert-badge">!</div>
                <div>
                    <h4>Une erreur est survenue</h4>
                    <p>{error}</p>
                </div>
            </div>
        );

        if (perfumes.length === 0) return (
            <div className="saas-card empty-catalog text-center py-5">
                <div className="empty-icon-container">
                    <Box size={32} />
                </div>
                <h3>Aucun parfum trouvé</h3>
                <p>Essayez de réinitialiser vos filtres ou de modifier votre recherche.</p>
                <button className="btn btn-secondary mt-3" onClick={resetFilters}>Réinitialiser les filtres</button>
            </div>
        );

        return (
            <>
                <div className="catalog-grid">
                    {perfumes.map(perfume => (
                        <div key={perfume.id} className="saas-card product-card">
                            <Link to={`/perfumes/${perfume.id}`} className="product-media">
                                {getPerfumeImage(perfume) ? (
                                    <img src={getPerfumeImage(perfume)} alt={perfume.name} />
                                ) : (
                                    <div className="placeholder-image">
                                        <Box size={32} />
                                    </div>
                                )}
                                {new Date(perfume.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                                    <span className="badge badge-luxury absolute top-3 left-3">Nouvel Arrivage</span>
                                )}
                            </Link>
                            
                            <div className="product-info">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="category-tag">{perfume.category?.name || 'Exceptionnel'}</span>
                                    {perfume.rating_avg > 0 && (
                                        <span className="flex items-center gap-1 text-xs font-semibold rating-badge">
                                            <Star size={12} fill="currentColor" /> {parseFloat(perfume.rating_avg).toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                
                                <Link to={`/perfumes/${perfume.id}`} className="text-decoration-none">
                                    <h3 className="product-title mb-1 text-main">{perfume.name}</h3>
                                </Link>
                                
                                <p className="notes-desc text-muted mb-4 line-clamp-2">
                                    {perfume.notes ? `Notes olfactives : ${perfume.notes}` : 'Un sillage élégant et harmonieux.'}
                                </p>
                                
                                <div className="flex justify-between items-center mt-auto border-t pt-3 border-light">
                                    <span className="product-price">{parseFloat(perfume.price || 0).toFixed(2)} €</span>
                                    <button
                                        className="btn btn-primary btn-sm add-cart-btn flex items-center gap-2"
                                        onClick={(e) => handleQuickAdd(e, perfume.id)}
                                        disabled={addingIds.has(perfume.id) || perfume.stock_quantity === 0}
                                    >
                                        <ShoppingCart size={14} /> 
                                        {addingIds.has(perfume.id) ? '...' : (perfume.stock_quantity === 0 ? 'Rupture' : 'Ajouter')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {pagination.last_page > 1 && (
                    <div className="pagination">
                        <button
                            disabled={filters.page === 1}
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                            className="btn btn-secondary"
                        >
                            Précédent
                        </button>

                        <div className="pagination-numbers">
                            {(() => {
                                const pages = [];
                                const current = filters.page;
                                const total = pagination.last_page;

                                if (total <= 7) {
                                    for (let i = 1; i <= total; i++) pages.push(i);
                                } else {
                                    if (current <= 4) {
                                        pages.push(1, 2, 3, 4, 5, '...', total);
                                    } else if (current >= total - 3) {
                                        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
                                    } else {
                                        pages.push(1, '...', current - 1, current, current + 1, '...', total);
                                    }
                                }

                                return pages.map((p, index) => (
                                    <button
                                        key={index}
                                        className={`page-item ${p === current ? 'active' : ''} ${p === '...' ? 'disabled' : ''}`}
                                        onClick={() => typeof p === 'number' && setFilters({ ...filters, page: p })}
                                        disabled={p === '...'}
                                    >
                                        {p}
                                    </button>
                                ));
                            })()}
                        </div>

                        <button
                            disabled={filters.page === pagination.last_page}
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            className="btn btn-secondary"
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="container saas-catalog-page py-5">
            <header className="page-header mb-5">
                <div className="flex justify-between items-end border-b border-light pb-4">
                    <div>
                        <h1>Collection de Parfums</h1>
                        <p className="subtitle">Explorez notre univers de créations olfactives haut de gamme et d'exception.</p>
                    </div>
                    <div className="text-right">
                        <span className="badge-luxury-pill">{pagination.total || 0} créations en ligne</span>
                    </div>
                </div>
            </header>

            <div className="catalog-layout">
                {/* Sidebar Filters */}
                <aside className="catalog-sidebar">
                    <div className="saas-card filter-sidebar-card sticky top-4">
                        <div className="sidebar-header flex items-center justify-between mb-4 border-b border-light pb-3">
                            <span className="sidebar-title flex items-center gap-2"><SlidersHorizontal size={14} /> Filtres</span>
                            {(filters.q || filters.category_id || filters.min_price || filters.max_price) && (
                                <button className="clear-filters-link" onClick={resetFilters}>Effacer tout</button>
                            )}
                        </div>
                        
                        <div className="filter-group mb-4">
                            <form onSubmit={handleSearch} className="search-form relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 search-input-icon" />
                                <input
                                    type="text"
                                    className="form-input pl-9"
                                    placeholder="Rechercher une fragrance..."
                                    value={filters.q}
                                    onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="suggestions-dropdown saas-card absolute w-full mt-1 z-10 p-0 overflow-hidden">
                                        {suggestions.map(s => (
                                            <div key={s.id} className="p-2 hover:bg-light cursor-pointer text-sm" onClick={() => selectSuggestion(s.name)}>
                                                {s.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="filter-group mb-4">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                                <Filter size={14} /> Catégories
                            </label>
                            <div className="flex flex-col gap-1">
                                <button 
                                    className={`category-filter-btn ${filters.category_id === '' ? 'active' : ''}`}
                                    onClick={() => setFilters({ ...filters, category_id: '', page: 1 })}
                                >
                                    Toutes les fragrances
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        className={`category-filter-btn ${filters.category_id == cat.id ? 'active' : ''}`}
                                        onClick={() => setFilters({ ...filters, category_id: cat.id, page: 1 })}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group mb-4">
                            <label className="text-sm font-semibold mb-3 block">Budget (€)</label>
                            <div className="flex gap-2 mb-3">
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
                            <button className="btn btn-primary w-full btn-sm apply-btn" onClick={() => { setFilters({ ...filters, page: 1 }); fetchPerfumes(); }}>
                                Filtrer
                            </button>
                        </div>

                        <div className="border-t border-light pt-4">
                            <button className="btn btn-secondary w-full btn-sm flex items-center justify-center gap-2" onClick={resetFilters}>
                                <RotateCcw size={14} /> Réinitialiser
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="catalog-main">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-muted">Page {pagination.current_page || 1} sur {pagination.last_page || 1}</div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted whitespace-nowrap">Trier par:</label>
                            <select className="form-input py-1 text-sm sort-select" value={filters.sort_by} onChange={(e) => setFilters({ ...filters, sort_by: e.target.value, page: 1 })}>
                                <option value="created_at">Nouveautés d'abord</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                                <option value="popularity">Populaire</option>
                            </select>
                        </div>
                    </div>

                    {renderMainContent()}
                </main>
            </div>

            <style>{`
                .saas-catalog-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-bottom: 6rem;
                }

                .page-header h1 {
                    font-size: 2.25rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    color: var(--text-main, #111);
                    margin-bottom: 0.5rem;
                }
                .page-header .subtitle {
                    color: var(--text-muted, #666);
                    font-size: 1.05rem;
                }

                .badge-luxury-pill {
                    display: inline-block;
                    padding: 0.35rem 1rem;
                    background: #f7f7f7;
                    border: 1px solid #eaeaea;
                    border-radius: 30px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted, #555);
                    letter-spacing: 0.02em;
                }

                .catalog-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 2.5rem;
                    align-items: start;
                }

                .sticky { position: sticky; }
                .top-4 { top: 1.5rem; }

                .filter-sidebar-card {
                    padding: 1.5rem;
                    border-radius: 16px;
                    background: var(--bg-surface, #fff);
                    border: 1px solid var(--border-light, #eaeaea);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
                }
                .sidebar-title {
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-main, #111);
                }
                .clear-filters-link {
                    background: none;
                    border: none;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--primary, #000);
                    cursor: pointer;
                    text-decoration: underline;
                    padding: 0;
                }

                .category-filter-btn {
                    width: 100%;
                    text-align: left;
                    font-size: 0.875rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: var(--text-muted, #666);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                .category-filter-btn:hover {
                    background: var(--bg-surface-alt, #f7f7f7);
                    color: var(--text-main, #111);
                }
                .category-filter-btn.active {
                    background: var(--primary, #000);
                    color: #fff;
                    font-weight: 600;
                }

                .search-input-icon {
                    color: var(--text-muted, #999);
                }
                .sort-select {
                    width: auto !important;
                    font-weight: 600;
                    border-radius: 8px;
                    background: var(--bg-surface, #fff);
                    border: 1px solid var(--border-light, #eaeaea);
                    padding: 0.25rem 2rem 0.25rem 0.75rem;
                }

                .catalog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 1.5rem;
                }

                /* Product Card Styling */
                .product-card {
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    overflow: hidden;
                    height: 100%;
                    border-radius: 16px;
                    background: var(--bg-surface, #fff);
                    border: 1px solid var(--border-light, #eaeaea);
                    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease;
                }
                .product-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
                }

                .product-media {
                    position: relative;
                    height: 240px;
                    background: #fafafa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border-bottom: 1px solid var(--border-light, #eaeaea);
                }
                .product-media img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .product-card:hover .product-media img {
                    transform: scale(1.04);
                }

                .badge-luxury {
                    background: #111;
                    color: #fff;
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    padding: 0.3rem 0.6rem;
                    border-radius: 4px;
                }

                .placeholder-image {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f7f7f7;
                    color: var(--text-muted, #bbb);
                }

                .product-info {
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }
                .category-tag {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-muted, #777);
                }
                .rating-badge {
                    color: #d97706;
                    background: #fef3c7;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                }

                .product-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    line-height: 1.3;
                    color: var(--text-main, #111);
                    margin-bottom: 0.5rem;
                }
                .notes-desc {
                    font-size: 0.85rem;
                    color: var(--text-muted, #666);
                    line-height: 1.5;
                    margin-bottom: 1.5rem;
                    min-height: 40px;
                }

                .product-price {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-main, #111);
                }
                .add-cart-btn {
                    border-radius: 8px;
                    padding: 0.45rem 1rem;
                    font-weight: 600;
                    transition: transform 0.1s ease;
                }
                .add-cart-btn:active {
                    transform: scale(0.96);
                }

                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 3.5rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border-light, #eaeaea);
                }
                .pagination-numbers {
                    display: flex;
                    gap: 0.35rem;
                }
                .page-item {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    border: 1px solid var(--border-light, #eaeaea);
                    background: var(--bg-surface, #fff);
                    color: var(--text-main, #111);
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .page-item:hover:not(.disabled) {
                    background: var(--bg-surface-alt, #fafafa);
                    border-color: #bbb;
                }
                .page-item.active {
                    background: var(--primary, #000);
                    color: #fff;
                    border-color: var(--primary, #000);
                }
                .page-item.disabled {
                    border: none;
                    background: none;
                    cursor: default;
                }

                /* Premium Loader Styles */
                .premium-catalog-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 6rem 2rem;
                    text-align: center;
                }
                .catalog-spinner {
                    position: relative;
                    width: 56px;
                    height: 56px;
                    margin-bottom: 1.5rem;
                }
                .spinner-ring {
                    width: 100%;
                    height: 100%;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid var(--primary, #000);
                    border-radius: 50%;
                    animation: spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
                }
                .spinner-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: var(--primary, #000);
                }
                .premium-catalog-loader p {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--text-muted, #777);
                    letter-spacing: 0.02em;
                }

                /* Empty catalog styles */
                .empty-catalog {
                    padding: 5rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .empty-icon-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 64px;
                    height: 64px;
                    background: #f7f7f7;
                    border-radius: 50%;
                    color: #999;
                    margin-bottom: 1.25rem;
                }
                .empty-catalog h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
                .empty-catalog p { color: var(--text-muted, #666); font-size: 0.9rem; }

                /* Error Alert design */
                .premium-alert {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.5rem;
                    border-left: 4px solid var(--danger, #dc2626);
                }
                .alert-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #fee2e2;
                    color: #dc2626;
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                @media (max-width: 992px) {
                    .catalog-layout {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    .sticky { position: static; }
                }

                @media (max-width: 576px) {
                    .catalog-grid {
                        grid-template-columns: 1fr;
                    }
                    .page-header h1 { font-size: 1.85rem; }
                    .sort-select { font-size: 0.8rem; }
                }
            `}</style>
        </div>
    );
};

export default PerfumeList;
