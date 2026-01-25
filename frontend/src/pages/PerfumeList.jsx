import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const getPerfumeImage = (perfume) => {
    if (perfume.image_url) {
        if (perfume.image_url.startsWith('http://') || perfume.image_url.startsWith('https://')) {
            return perfume.image_url;
        }
        return `http://localhost:8000${perfume.image_url}`;
    }
    return 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=800';
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
            const response = await api.get('/categories');
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

            const response = await api.get(`/perfumes?${params.toString()}`);
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
        if (isLoading) return <div className="loader">Chargement de la collection...</div>;
        if (error) return <div className="error-message">{error}</div>;
        if (perfumes.length === 0) return <div className="no-results">Aucun parfum trouvé pour ces critères.</div>;

        return (
            <>
                <div className="perfume-grid">
                    {perfumes.map(perfume => (
                        <Link key={perfume.id} to={`/perfume/${perfume.id}`} className="perfume-card-link">
                            <div className="perfume-card">
                                <div className="perfume-image-wrapper">
                                    <img src={getPerfumeImage(perfume)} alt={perfume.name} />
                                    {perfume.rating > 0 && <span className="card-rating">⭐ {perfume.rating}</span>}
                                    {new Date(perfume.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                                        <span className="badge-new">NOUVEAU</span>
                                    )}
                                </div>
                                <div className="perfume-details">
                                    <span className="card-category">{perfume.category?.name || 'Parfum'}</span>
                                    <h3>{perfume.name}</h3>
                                    <p className="card-notes">{perfume.notes}</p>
                                    <div className="card-footer">
                                        <span className="card-price">{perfume.price} €</span>
                                        <button
                                            className="quick-add-btn"
                                            onClick={(e) => handleQuickAdd(e, perfume.id)}
                                            disabled={addingIds.has(perfume.id) || perfume.stock === 0}
                                        >
                                            {addingIds.has(perfume.id) ? '...' : '🛒'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {pagination.last_page > 1 && (
                    <div className="pagination">
                        <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Précédent</button>
                        <span>{filters.page} / {pagination.last_page}</span>
                        <button disabled={filters.page === pagination.last_page} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Suivant</button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="page-container catalog-page">
            <div className="catalog-header">
                <h1>L'Art de la Fragrance</h1>
                <div className="hero-divider"></div>
                <p>Une sélection minutieuse pour magnifier votre sillage.</p>
            </div>

            <div className="catalog-layout">
                <aside className="filters-sidebar">
                    <form onSubmit={handleSearch} className="minimal-search relative-search">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filters.q}
                            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                        <button type="submit">🔍</button>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-suggestions">
                                {suggestions.map(s => (
                                    <div
                                        key={s.id}
                                        className="suggestion-item"
                                        onClick={() => selectSuggestion(s.name)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                selectSuggestion(s.name);
                                            }
                                        }}
                                    >
                                        {s.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>

                    <div className="sidebar-group">
                        <span className="group-label">Univers</span>
                        <div className="category-pills">
                            <button className={filters.category_id === '' ? 'active' : ''} onClick={() => setFilters({ ...filters, category_id: '', page: 1 })}>Tous</button>
                            {categories.map(cat => (
                                <button key={cat.id} className={filters.category_id == cat.id ? 'active' : ''} onClick={() => setFilters({ ...filters, category_id: cat.id, page: 1 })}>{cat.name}</button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-group">
                        <span className="group-label">Budget</span>
                        <div className="budget-range">
                            <input type="number" placeholder="Min" value={filters.min_price} onChange={(e) => setFilters({ ...filters, min_price: e.target.value })} />
                            <input type="number" placeholder="Max" value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} />
                            <button className="gold-btn-outline" onClick={() => { setFilters({ ...filters, page: 1 }); fetchPerfumes(); }}>Appliquer</button>
                        </div>
                    </div>

                    <button className="reset-link" onClick={resetFilters}>Réinitialiser les filtres</button>
                </aside>

                <main className="catalog-main">
                    <div className="main-toolbar">
                        <span className="results-info">{pagination.total || 0} essences trouvées</span>
                        <select value={filters.sort_by} onChange={(e) => setFilters({ ...filters, sort_by: e.target.value, page: 1 })}>
                            <option value="created_at">Nouveautés</option>
                            <option value="price_asc">Prix croissant</option>
                            <option value="price_desc">Prix décroissant</option>
                            <option value="popularity">Le plus populaire</option>
                        </select>
                    </div>

                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
};

export default PerfumeList;
