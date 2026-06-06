import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getImageUrl } from '../utils/getImageUrl';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { Filter, Search, RotateCcw, ShoppingCart, Star, Box, Sparkles, SlidersHorizontal } from 'lucide-react';
import { exportPerfumesPDF } from '../utils/pdfExport';

const getPerfumeImage = (perfume) => {
    return getImageUrl(perfume.image_url);
};

const handleImageError = (e, perfume) => {
    const fallbackImages = [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800',
    ];
    const index = (perfume.id || 0) % fallbackImages.length;
    e.target.src = fallbackImages[index];
};

const PerfumeList = () => {
    const [perfumes, setPerfumes] = useState([]);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportCatalog = async () => {
        setIsExporting(true);
        try {
            const response = await api.get('/perfumes?per_page=100');
            const allPerfumes = response.data?.data || response.data || [];
            await exportPerfumesPDF(allPerfumes);
        } catch (err) {
            console.error("Failed to export catalog", err);
            alert("Erreur lors de l'exportation du catalogue.");
        } finally {
            setIsExporting(false);
        }
    };
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
                                    <img 
                                        src={getPerfumeImage(perfume)} 
                                        alt={perfume.name} 
                                        onError={(e) => handleImageError(e, perfume)}
                                    />
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
                    <div className="text-right flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={handleExportCatalog}
                            disabled={isExporting}
                            className="btn btn-secondary flex items-center gap-2"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', borderRadius: '12px' }}
                        >
                            <Sparkles size={14} /> {isExporting ? 'Exportation...' : 'Exporter Catalogue PDF'}
                        </button>
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
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

                .saas-catalog-page {
                    max-width: 1240px;
                    margin: 0 auto;
                    padding-bottom: 6rem;
                    font-family: 'Montserrat', sans-serif;
                }

                /* Header redesign */
                .page-header {
                    margin-bottom: 4rem;
                }
                .page-header .flex {
                    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
                    padding-bottom: 2rem;
                }
                .page-header h1 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 3rem;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                    color: var(--text-main, #0f172a);
                    margin-bottom: 0.75rem;
                    line-height: 1.1;
                }
                .page-header .subtitle {
                    color: var(--text-muted, #64748b);
                    font-size: 1.1rem;
                    font-weight: 400;
                    font-family: 'Cormorant Garamond', serif;
                    font-style: italic;
                    letter-spacing: 0.02em;
                }

                .badge-luxury-pill {
                    display: inline-block;
                    padding: 0.5rem 1.25rem;
                    background: rgba(37, 99, 235, 0.03);
                    border: 1px solid rgba(37, 99, 235, 0.15);
                    border-radius: 40px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--primary, #2563eb);
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    box-shadow: 0 2px 10px rgba(37, 99, 235, 0.02);
                }

                /* Layout structure */
                .catalog-layout {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 3rem;
                    align-items: start;
                }

                .sticky { position: sticky; }
                .top-4 { top: 2rem; }

                /* Sidebar Redesign */
                .filter-sidebar-card {
                    padding: 2rem;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }
                .filter-sidebar-card:hover {
                    border-color: rgba(37, 99, 235, 0.2);
                    box-shadow: 0 15px 40px rgba(37, 99, 235, 0.04);
                }
                .sidebar-header {
                    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
                    padding-bottom: 1rem;
                }
                .sidebar-title {
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: var(--text-main, #0f172a);
                }
                .clear-filters-link {
                    background: none;
                    border: none;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--primary, #2563eb);
                    cursor: pointer;
                    text-decoration: none;
                    padding: 0;
                    transition: opacity 0.2s;
                }
                .clear-filters-link:hover {
                    opacity: 0.8;
                    text-decoration: underline;
                }

                /* Forms & Inputs */
                .form-input {
                    font-family: 'Montserrat', sans-serif;
                    border-radius: 12px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    background: rgba(255, 255, 255, 0.5);
                    padding: 0.75rem 1rem;
                    font-size: 0.85rem;
                    transition: all 0.25s ease;
                }
                .form-input:focus {
                    background: #fff;
                    border-color: var(--primary, #2563eb);
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
                }
                .search-form input {
                    padding-left: 2.75rem !important;
                }

                /* Categories tag style */
                .category-filter-btn {
                    width: 100%;
                    text-align: left;
                    font-size: 0.8rem;
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                    border: 1px solid transparent;
                    background: transparent;
                    color: var(--text-muted, #64748b);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.25s ease;
                    margin-bottom: 0.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .category-filter-btn:hover {
                    background: rgba(37, 99, 235, 0.04);
                    color: var(--primary, #2563eb);
                    transform: translateX(4px);
                }
                .category-filter-btn.active {
                    background: var(--primary, #2563eb);
                    color: #fff;
                    font-weight: 600;
                    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.15);
                }

                /* Apply & Reset Buttons */
                .apply-btn {
                    border-radius: 12px;
                    background: linear-gradient(135deg, var(--primary, #2563eb), var(--primary-hover, #1d4ed8));
                    border: none;
                    color: #fff;
                    font-weight: 600;
                    padding: 0.75rem 1.25rem;
                    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.15);
                    transition: all 0.25s ease;
                }
                .apply-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25);
                }

                /* Sort select wrapper */
                .sort-select {
                    width: auto !important;
                    font-weight: 600;
                    font-size: 0.8rem !important;
                    border-radius: 10px;
                    background: #fff;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    padding: 0.4rem 2rem 0.4rem 1rem;
                    cursor: pointer;
                }

                /* Grid items */
                .catalog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                }

                /* Luxury Product Card styling */
                .product-card {
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    overflow: hidden;
                    height: 100%;
                    border-radius: 20px;
                    background: #fff;
                    border: 1px solid rgba(226, 232, 240, 0.7);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.015);
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    position: relative;
                }
                .product-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.2), transparent);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 10;
                }
                .product-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.06);
                    border-color: rgba(37, 99, 235, 0.2);
                }
                .product-card:hover::before {
                    opacity: 1;
                }

                .product-media {
                    position: relative;
                    height: 270px;
                    background: linear-gradient(180deg, #fbfbfd 0%, #f4f4f7 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border-bottom: 1px solid rgba(226, 232, 240, 0.5);
                }
                .product-media img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .product-card:hover .product-media img {
                    transform: scale(1.06);
                }

                /* Luxury badge */
                .badge-luxury {
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(4px);
                    color: #fff;
                    font-size: 0.65rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    padding: 0.4rem 0.8rem;
                    border-radius: 30px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .placeholder-image {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    color: #cbd5e1;
                }

                /* Product Info */
                .product-info {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }
                
                .category-tag {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: var(--text-muted, #64748b);
                }
                
                .rating-badge {
                    color: #b45309;
                    background: #fef3c7;
                    padding: 0.2rem 0.5rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .product-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.35rem;
                    font-weight: 600;
                    line-height: 1.2;
                    color: var(--text-main, #0f172a);
                    margin-top: 0.25rem;
                    margin-bottom: 0.75rem;
                    transition: color 0.2s ease;
                }
                .product-card:hover .product-title {
                    color: var(--primary, #2563eb);
                }

                .notes-desc {
                    font-size: 0.8rem;
                    color: var(--text-muted, #64748b);
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                    min-height: 48px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Price and Add button border */
                .product-info .border-t {
                    border-color: rgba(226, 232, 240, 0.6) !important;
                    margin-top: auto;
                }

                .product-price {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-main, #0f172a);
                    letter-spacing: -0.02em;
                }

                .add-cart-btn {
                    border-radius: 10px;
                    padding: 0.5rem 1rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    background: var(--primary, #2563eb);
                    color: #fff;
                    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.1);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                }
                .add-cart-btn:hover:not(:disabled) {
                    background: var(--primary-hover, #1d4ed8);
                    box-shadow: 0 6px 15px rgba(37, 99, 235, 0.2);
                    transform: translateY(-1px);
                }
                .add-cart-btn:active {
                    transform: translateY(0);
                }
                .add-cart-btn:disabled {
                    background: #e2e8f0;
                    color: #94a3b8;
                    box-shadow: none;
                    cursor: not-allowed;
                }

                /* Pagination redesign */
                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 4rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(226, 232, 240, 0.6);
                }
                .pagination-numbers {
                    display: flex;
                    gap: 0.5rem;
                }
                .page-item {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    background: #fff;
                    color: var(--text-main, #0f172a);
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s;
                }
                .page-item:hover:not(.disabled) {
                    background: rgba(37, 99, 235, 0.04);
                    border-color: var(--primary, #2563eb);
                    color: var(--primary, #2563eb);
                }
                .page-item.active {
                    background: var(--primary, #2563eb);
                    color: #fff;
                    border-color: var(--primary, #2563eb);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
                }
                .page-item.disabled {
                    border: none;
                    background: none;
                    color: #cbd5e1;
                    cursor: default;
                }

                /* Loader and empty states */
                .premium-catalog-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 8rem 2rem;
                    text-align: center;
                }
                .catalog-spinner {
                    position: relative;
                    width: 60px;
                    height: 60px;
                    margin-bottom: 1.5rem;
                }
                .spinner-ring {
                    width: 100%;
                    height: 100%;
                    border: 3px solid rgba(226, 232, 240, 0.6);
                    border-top: 3px solid var(--primary, #2563eb);
                    border-radius: 50%;
                    animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                .spinner-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: var(--primary, #2563eb);
                }
                .premium-catalog-loader p {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.2rem;
                    font-style: italic;
                    color: var(--text-muted, #64748b);
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .empty-catalog {
                    padding: 6rem 2rem;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 20px;
                    border: 1px solid rgba(226, 232, 240, 0.6);
                }
                .empty-icon-container {
                    background: rgba(226, 232, 240, 0.5);
                    color: #94a3b8;
                    margin-bottom: 1.5rem;
                }

                @media (max-width: 992px) {
                    .catalog-layout {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }
                    .sticky { position: static; }
                }

                @media (max-width: 576px) {
                    .catalog-grid {
                        grid-template-columns: 1fr;
                    }
                    .page-header h1 { font-size: 2.25rem; }
                }
            `}</style>
        </div>
    );
};

export default PerfumeList;
