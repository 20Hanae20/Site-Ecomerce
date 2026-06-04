import { useState, useEffect, useCallback } from 'react';
import api, { API_HOST } from '../services/api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { Filter, Search, RotateCcw, ShoppingCart, Star, Box } from 'lucide-react';

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
            setError("Impossible de charger l'inventaire.");
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCategories();
        fetchPerfumes();
    }, [fetchCategories, fetchPerfumes]);

    // Autocomplete Logic
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

    const renderMainContent = () => {
        if (isLoading) return (
            <div className="text-center py-5">
                <div className="spinner"></div>
                <p className="text-muted mt-3">Chargement du catalogue...</p>
            </div>
        );
        if (error) return <div className="alert alert-danger">{error}</div>;
        if (perfumes.length === 0) return (
            <div className="saas-card text-center py-5">
                <Box size={48} className="text-muted mx-auto mb-3" />
                <h3>Aucun produit trouvé</h3>
                <p className="text-muted">Modifiez vos filtres de recherche.</p>
                <button className="btn btn-secondary mt-3" onClick={resetFilters}>Réinitialiser</button>
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
                                        <Box size={32} className="text-muted" />
                                    </div>
                                )}
                                {new Date(perfume.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                                    <span className="badge badge-primary absolute top-2 left-2">Nouveau</span>
                                )}
                            </Link>
                            
                            <div className="product-info">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">{perfume.category?.name || 'Général'}</span>
                                    {perfume.rating > 0 && (
                                        <span className="flex items-center gap-1 text-sm font-medium text-warning">
                                            <Star size={14} fill="currentColor" /> {perfume.rating}
                                        </span>
                                    )}
                                </div>
                                
                                <Link to={`/perfumes/${perfume.id}`} className="text-decoration-none">
                                    <h3 className="product-title mb-1 text-main">{perfume.name}</h3>
                                </Link>
                                
                                <p className="text-sm text-muted mb-4 line-clamp-2" style={{ minHeight: '40px' }}>
                                    {perfume.notes || 'Aucune description disponible.'}
                                </p>
                                
                                <div className="flex justify-between items-center mt-auto border-t pt-3 border-light">
                                    <span className="font-bold text-lg">{perfume.price} €</span>
                                    <button
                                        className="btn btn-primary btn-sm flex items-center gap-2"
                                        onClick={(e) => handleQuickAdd(e, perfume.id)}
                                        disabled={addingIds.has(perfume.id) || perfume.stock === 0}
                                    >
                                        <ShoppingCart size={14} /> 
                                        {addingIds.has(perfume.id) ? '...' : (perfume.stock === 0 ? 'Rupture' : 'Ajouter')}
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
                        <h1 className="text-3xl font-bold mb-2">Catalogue d'Inventaire</h1>
                        <p className="text-muted">Gérez et explorez la base de données centralisée de parfums.</p>
                    </div>
                    <div className="text-right">
                        <span className="badge badge-secondary">{pagination.total || 0} références actives</span>
                    </div>
                </div>
            </header>

            <div className="catalog-layout">
                {/* Sidebar Filters */}
                <aside className="catalog-sidebar">
                    <div className="saas-card p-4 sticky top-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4 border-b border-light pb-2">Filtres</h3>
                        
                        <div className="filter-group mb-4">
                            <form onSubmit={handleSearch} className="search-form relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                                <input
                                    type="text"
                                    className="form-input pl-9"
                                    placeholder="Rechercher par nom, marque..."
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
                            <label className="flex items-center gap-2 text-sm font-semibold mb-3"><Filter size={14} /> Catégories</label>
                            <div className="flex flex-col gap-2">
                                <button 
                                    className={`text-left text-sm py-1 px-2 rounded transition-colors ${filters.category_id === '' ? 'bg-primary text-white font-medium' : 'text-muted hover:bg-light'}`}
                                    onClick={() => setFilters({ ...filters, category_id: '', page: 1 })}
                                >
                                    Toutes les catégories
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        className={`text-left text-sm py-1 px-2 rounded transition-colors ${filters.category_id == cat.id ? 'bg-primary text-white font-medium' : 'text-muted hover:bg-light'}`}
                                        onClick={() => setFilters({ ...filters, category_id: cat.id, page: 1 })}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group mb-4">
                            <label className="text-sm font-semibold mb-3 block">Prix (€)</label>
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
                            <button className="btn btn-secondary w-full btn-sm" onClick={() => { setFilters({ ...filters, page: 1 }); fetchPerfumes(); }}>Appliquer</button>
                        </div>

                        <div className="border-t border-light pt-4">
                            <button className="btn w-full btn-sm text-muted hover:bg-light flex items-center justify-center gap-2" onClick={resetFilters}>
                                <RotateCcw size={14} /> Réinitialiser
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="catalog-main">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-muted">Affichage de la page {pagination.current_page || 1} sur {pagination.last_page || 1}</div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted whitespace-nowrap">Trier par:</label>
                            <select className="form-input py-1 text-sm w-auto" value={filters.sort_by} onChange={(e) => setFilters({ ...filters, sort_by: e.target.value, page: 1 })}>
                                <option value="created_at">Plus récents</option>
                                <option value="price_asc">Prix: croissant</option>
                                <option value="price_desc">Prix: décroissant</option>
                                <option value="popularity">Popularité</option>
                            </select>
                        </div>
                    </div>

                    {renderMainContent()}
                </main>
            </div>

            <style>{`
                .catalog-layout {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                .sticky { position: sticky; }
                .top-4 { top: 1rem; }

                .catalog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .product-card {
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    overflow: hidden;
                    height: 100%;
                }

                .product-media {
                    position: relative;
                    height: 200px;
                    background: var(--bg-body);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-bottom: 1px solid var(--border-light);
                }

                .product-media img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .product-card:hover .product-media img {
                    transform: scale(1.05);
                }

                .placeholder-image {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-alt);
                }

                .product-info {
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }

                .product-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    line-height: 1.3;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border-light);
                }

                .pagination-numbers {
                    display: flex;
                    gap: 0.25rem;
                }

                .page-item {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-light);
                    background: var(--bg-surface);
                    color: var(--text-main);
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .page-item:hover:not(.disabled) {
                    background: var(--bg-alt);
                }

                .page-item.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                    font-weight: 600;
                }

                .page-item.disabled {
                    border: none;
                    background: none;
                    cursor: default;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--border-light);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Utilities used in JSX */
                .uppercase { text-transform: uppercase; }
                .tracking-wider { letter-spacing: 0.05em; }
                .text-xs { font-size: 0.75rem; }
                .text-sm { font-size: 0.875rem; }
                .text-lg { font-size: 1.125rem; }
                .text-3xl { font-size: 1.875rem; }
                .font-semibold { font-weight: 600; }
                .font-bold { font-weight: 700; }
                .border-b { border-bottom-width: 1px; }
                .border-t { border-top-width: 1px; }
                .pb-4 { padding-bottom: 1rem; }
                .pb-2 { padding-bottom: 0.5rem; }
                .pt-3 { padding-top: 0.75rem; }
                .pt-4 { padding-top: 1rem; }
                .pl-9 { padding-left: 2.25rem; }
                .whitespace-nowrap { white-space: nowrap; }
                .text-main { color: var(--text-main); }
                .text-decoration-none { text-decoration: none; }
                .hover\\:bg-light:hover { background-color: var(--bg-alt); }
                .cursor-pointer { cursor: pointer; }

                @media (max-width: 992px) {
                    .catalog-layout {
                        grid-template-columns: 1fr;
                    }
                    .catalog-sidebar {
                        margin-bottom: 2rem;
                    }
                    .sticky { position: static; }
                }
            `}</style>
        </div>
    );
};

export default PerfumeList;
