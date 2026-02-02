import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Filter, Search, RotateCcw, ShoppingCart, Star } from 'lucide-react';

const getPerfumeImage = (perfume) => {
    if (perfume.image_url) {
        if (perfume.image_url.startsWith('http://') || perfume.image_url.startsWith('https://')) {
            return perfume.image_url;
        }
        return `http://localhost:8000${perfume.image_url}`;
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

    useEffect(() => {
        fetchCategories();
        fetchPerfumes();
    }, [filters.category_id, filters.sort_by, filters.page]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/categories');
            setCategories(response.data);
        } catch (err) {
            console.error("Fetch categories error:", err);
        }
    };

    const fetchPerfumes = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.q) params.append('q', filters.q);
            if (filters.category_id) params.append('category_id', filters.category_id);
            if (filters.min_price) params.append('min_price', filters.min_price);
            if (filters.max_price) params.append('max_price', filters.max_price);
            if (filters.sort_by) params.append('sort_by', filters.sort_by);
            params.append('page', filters.page);

            const response = await axios.get(`http://127.0.0.1:8000/api/perfumes?${params.toString()}`);
            setPerfumes(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (err) {
            console.error("Fetch perfumes error:", err);
            setError("Impossible de charger les parfums.");
        } finally {
            setIsLoading(false);
        }
    };

    // Autocomplete Logic
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (filters.q.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/perfumes?q=${filters.q}&per_page=5`);
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
            <div className="loader-container-premium">
                <div className="premium-loader"></div>
            </div>
        );
        if (error) return <div className="premium-alert error">{error}</div>;
        if (perfumes.length === 0) return <div className="no-results-premium">Aucune fragrance ne correspond à votre recherche.</div>;

        return (
            <>
                <div className="catalog-grid-premium">
                    {perfumes.map(perfume => (
                        <div key={perfume.id} className="premium-card catalog-card-luxury">
                            <Link to={`/perfumes/${perfume.id}`} className="card-media-wrapper">
                                {getPerfumeImage(perfume) ? (
                                    <img src={getPerfumeImage(perfume)} alt={perfume.name} />
                                ) : (
                                    <div className="placeholder-luxury">
                                        <span className="gold-rose">🌹</span>
                                    </div>
                                )}
                                {new Date(perfume.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                                    <span className="luxury-badge">NOUVEAU</span>
                                )}
                            </Link>
                            <div className="card-body-luxury">
                                <div className="card-head-row">
                                    <span className="category-tag-luxury">{perfume.category?.name || 'Parfum'}</span>
                                    {perfume.rating > 0 && <span className="rating-tag-luxury"><Star size={12} fill="var(--primary)" /> {perfume.rating}</span>}
                                </div>
                                <Link to={`/perfumes/${perfume.id}`} className="title-link-luxury">
                                    <h3>{perfume.name}</h3>
                                </Link>
                                <p className="notes-luxury">{perfume.notes || 'Notes de tête raffinées et fond boisé.'}</p>
                                <div className="card-foot-row">
                                    <span className="price-luxury">{perfume.price} €</span>
                                    <button
                                        className="btn-add-luxury"
                                        onClick={(e) => handleQuickAdd(e, perfume.id)}
                                        disabled={addingIds.has(perfume.id) || perfume.stock === 0}
                                    >
                                        <ShoppingCart size={16} /> {addingIds.has(perfume.id) ? '...' : ''}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {pagination.last_page > 1 && (
                    <div className="pagination-premium">
                        <button
                            disabled={filters.page === 1}
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                            className="btn-nav"
                        >
                            &lt;
                        </button>

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
                                    className={p === current ? 'active' : p === '...' ? 'dots' : ''}
                                    onClick={() => typeof p === 'number' && setFilters({ ...filters, page: p })}
                                    disabled={p === '...'}
                                >
                                    {p}
                                </button>
                            ));
                        })()}

                        <button
                            disabled={filters.page === pagination.last_page}
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            className="btn-nav"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="container-premium catalog-page-luxury animate-fade-in">
            <header className="catalog-header-luxury">
                <h5 className="gradient-text-gold font-serif">COLLECTIONS EXCLUSIVES</h5>
                <h1 className="font-serif">L'Ouvrage du <span className="gradient-text-gold">Parfumeur</span></h1>
                <p>Découvrez notre sélection de fragrances d'exception, conçues pour l'âme.</p>
            </header>

            <div className="catalog-layout-luxury">
                <aside className="catalog-sidebar-luxury glass-premium">
                    <div className="sidebar-search-luxury">
                        <form onSubmit={handleSearch} className="search-form-luxury">
                            <Search size={18} className="search-icon-luxury" />
                            <input
                                type="text"
                                placeholder="RECHERCHER..."
                                value={filters.q}
                                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                        </form>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="suggestions-box-luxury glass-premium">
                                {suggestions.map(s => (
                                    <div key={s.id} className="suggestion-item-luxury" onClick={() => selectSuggestion(s.name)}>
                                        {s.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="sidebar-group-luxury">
                        <label><Filter size={14} /> UNIVERS</label>
                        <div className="category-scroll-luxury">
                            <button className={filters.category_id === '' ? 'active' : ''} onClick={() => setFilters({ ...filters, category_id: '', page: 1 })}>TOUS</button>
                            {categories.map(cat => (
                                <button key={cat.id} className={filters.category_id == cat.id ? 'active' : ''} onClick={() => setFilters({ ...filters, category_id: cat.id, page: 1 })}>{cat.name.toUpperCase()}</button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-group-luxury">
                        <label>PLAGE DE PRIX</label>
                        <div className="price-inputs-luxury">
                            <input type="number" placeholder="MIN" value={filters.min_price} onChange={(e) => setFilters({ ...filters, min_price: e.target.value })} />
                            <input type="number" placeholder="MAX" value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} />
                        </div>
                        <button className="btn-premium btn-apply-luxury" onClick={() => { setFilters({ ...filters, page: 1 }); fetchPerfumes(); }}>APPLIQUER</button>
                    </div>

                    <button className="btn-reset-luxury" onClick={resetFilters}>
                        <RotateCcw size={14} /> RÉINITIALISER
                    </button>
                </aside>

                <main className="catalog-content-luxury">
                    <div className="catalog-toolbar-luxury">
                        <span className="catalog-count">{pagination.total || 0} FRAGRANCES</span>
                        <select className="catalog-sort-luxury" value={filters.sort_by} onChange={(e) => setFilters({ ...filters, sort_by: e.target.value, page: 1 })}>
                            <option value="created_at">NOUVEAUTÉS</option>
                            <option value="price_asc">PRIX CROISSANT</option>
                            <option value="price_desc">PRIX DÉCROISSANT</option>
                            <option value="popularity">POPULARITÉ</option>
                        </select>
                    </div>

                    {renderMainContent()}
                </main>
            </div>

            <style>{`
                .catalog-page-luxury { padding-bottom: 8rem; }

                .catalog-header-luxury {
                    text-align: center;
                    padding: 6rem 0;
                }

                .catalog-header-luxury h5 { letter-spacing: 5px; margin-bottom: 1.5rem; }
                .catalog-header-luxury h1 { font-size: 4rem; margin-bottom: 1.5rem; line-height: 1; }
                .catalog-header-luxury p { font-size: 1.1rem; opacity: 0.6; max-width: 600px; margin: 0 auto; }

                .catalog-layout-luxury {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 3rem;
                }

                .catalog-sidebar-luxury {
                    padding: 2.5rem;
                    border-radius: 20px;
                    height: fit-content;
                    position: sticky;
                    top: 100px;
                }

                .sidebar-search-luxury { position: relative; margin-bottom: 3rem; }
                .search-form-luxury {
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid var(--glass-border);
                    padding-bottom: 0.5rem;
                }

                .search-icon-luxury { opacity: 0.5; margin-right: 0.75rem; }

                .search-form-luxury input {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 0.8rem;
                    letter-spacing: 2px;
                    width: 100%;
                }

                .search-form-luxury input:focus { outline: none; }

                .suggestions-box-luxury {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 10;
                    margin-top: 0.5rem;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .suggestion-item-luxury {
                    padding: 0.8rem 1.25rem;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .suggestion-item-luxury:hover { background: var(--glass-hover); color: var(--primary); }

                .sidebar-group-luxury { margin-bottom: 3rem; }
                .sidebar-group-luxury label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.7rem;
                    letter-spacing: 2px;
                    color: var(--primary);
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }

                .category-scroll-luxury { display: flex; flex-direction: column; gap: 0.75rem; }
                .category-scroll-luxury button {
                    background: none;
                    border: none;
                    text-align: left;
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .category-scroll-luxury button:hover, .category-scroll-luxury button.active {
                    color: #fff;
                    transform: translateX(5px);
                }

                .category-scroll-luxury button.active { color: var(--primary); font-weight: 700; }

                .price-inputs-luxury { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
                .price-inputs-luxury input {
                    width: 50%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--glass-border);
                    padding: 0.6rem;
                    color: #fff;
                    font-size: 0.7rem;
                    border-radius: 4px;
                }

                .btn-apply-luxury { width: 100%; padding: 0.7rem; font-size: 0.7rem; }

                .btn-reset-luxury {
                    width: 100%;
                    background: none;
                    border: 1px solid var(--glass-border);
                    color: var(--text-secondary);
                    padding: 0.8rem;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    letter-spacing: 1px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-reset-luxury:hover { border-color: #fff; color: #fff; }

                .catalog-toolbar-luxury {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                }

                .catalog-count { font-size: 0.75rem; letter-spacing: 2px; opacity: 0.5; }
                .catalog-sort-luxury {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                    cursor: pointer;
                }

                .catalog-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                }

                .card-media-wrapper {
                    height: 320px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    position: relative;
                    overflow: hidden;
                    text-decoration: none;
                }

                .card-media-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.8;
                    transition: all 0.6s ease;
                }

                .catalog-card-luxury:hover .card-media-wrapper img {
                    opacity: 1;
                    transform: scale(1.1);
                }

                .placeholder-luxury { font-size: 4rem; }

                .luxury-badge {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    background: var(--primary);
                    color: #000;
                    font-size: 0.6rem;
                    font-weight: 800;
                    padding: 0.3rem 0.8rem;
                    border-radius: 4px;
                    letter-spacing: 1px;
                }

                .card-body-luxury { padding: 1.5rem; }
                .card-head-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }

                .category-tag-luxury { font-size: 0.6rem; letter-spacing: 2px; opacity: 0.5; text-transform: uppercase; }
                .rating-tag-luxury { font-size: 0.7rem; color: var(--primary); display: flex; align-items: center; gap: 0.3rem; }

                .title-link-luxury { text-decoration: none; color: #fff; }
                .card-body-luxury h3 { font-size: 1.2rem; margin-bottom: 1rem; font-weight: 500; }

                .notes-luxury { font-size: 0.8rem; opacity: 0.5; margin-bottom: 1.5rem; line-height: 1.6; }

                .card-foot-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .price-luxury { font-size: 1.2rem; font-weight: 700; color: #fff; }

                .btn-add-luxury {
                    background: none;
                    border: 1px solid var(--glass-border);
                    color: var(--primary);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-add-luxury:hover:not(:disabled) {
                    background: var(--primary);
                    color: #000;
                }

                .pagination-premium {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 6rem;
                }

                .pagination-premium button {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--glass-border);
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                    font-family: 'Inter', sans-serif;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .pagination-premium button:hover:not(:disabled):not(.dots) {
                    border-color: var(--primary);
                    color: var(--primary);
                    transform: translateY(-2px);
                }

                .pagination-premium button.active {
                    background: var(--primary);
                    color: #000;
                    border-color: var(--primary);
                    font-weight: 700;
                    box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
                }

                .pagination-premium button.btn-nav {
                    font-size: 1.2rem;
                    border-radius: 8px;
                    width: auto;
                    padding: 0 1rem;
                }

                .pagination-premium button:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                    transform: none !important;
                    border-color: transparent;
                }

                .pagination-premium button.dots {
                    border: none;
                    background: none;
                    cursor: default;
                }

                @media (max-width: 968px) {
                    .catalog-layout-luxury { grid-template-columns: 1fr; }
                    .catalog-sidebar-luxury { position: static; }
                }
            `}</style>
        </div>
    );
};

export default PerfumeList;
