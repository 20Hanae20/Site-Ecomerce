import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/useCart';
import { Star, ShoppingBag, Truck, ShieldCheck, ChevronRight, Package, Check } from 'lucide-react';
import ReviewList from '../components/Reviews/ReviewList';
import ReviewForm from '../components/Reviews/ReviewForm';

const PerfumeDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [activeImage, setActiveImage] = useState(null);
    const [cartMessage, setCartMessage] = useState({ text: '', type: '' });
    const { addToCart } = useCart();

    useEffect(() => {
        fetchPerfume();
        globalThis.scrollTo(0, 0);
    }, [fetchPerfume]);

    const fetchPerfume = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://${globalThis.location.hostname}:8000/api/perfumes/${id}`);
            setData(response.data);
            setActiveImage(response.data.perfume.image_url);
        } catch (err) {
            console.error("Fetch perfume detail error:", err);
            setError("Le produit demandé est introuvable.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const handleAddToCart = async () => {
        setIsAdding(true);
        const result = await addToCart(data.perfume.id, 1);
        if (result.success) {
            setCartMessage({ text: 'Produit ajouté au panier avec succès', type: 'success' });
            setTimeout(() => setCartMessage({ text: '', type: '' }), 5000);
        } else {
            setCartMessage({ text: result.message, type: 'error' });
        }
        setIsAdding(false);
    };

    if (isLoading) return (
        <div className="container py-5 text-center">
            <div className="detail-spinner"></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Chargement du produit...</p>
        </div>
    );

    if (error) return (
        <div className="container py-5 text-center">
            <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h2>{error}</h2>
            <Link to="/perfumes" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Retour au catalogue</Link>
        </div>
    );

    const { perfume, similar } = data;

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const apiHost = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : `http://${globalThis.location.hostname}:8000`;
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${apiHost}${path}`;
    };

    const allImages = [perfume.image_url, ...(perfume.gallery || [])].filter(Boolean);

    return (
        <div className="container detail-page py-5">
            {/* Breadcrumb */}
            <nav className="detail-breadcrumb">
                <Link to="/perfumes">Catalogue</Link>
                <ChevronRight size={14} />
                <span>{perfume.name}</span>
            </nav>

            {/* Main Product Layout */}
            <div className="detail-grid">
                {/* Image Section */}
                <div className="detail-images">
                    <div className="saas-card main-image-frame">
                        {activeImage ? (
                            <img src={getImageUrl(activeImage)} alt={perfume.name} />
                        ) : (
                            <div className="image-placeholder">
                                <Package size={48} style={{ color: 'var(--text-muted)' }} />
                            </div>
                        )}
                        {new Date(perfume.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                            <span className="badge badge-primary" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>Nouveau</span>
                        )}
                    </div>

                    {allImages.length > 1 && (
                        <div className="thumb-row">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`thumb-btn ${activeImage === img ? 'active' : ''}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={getImageUrl(img)} alt={`Vue ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="detail-info">
                    <div className="detail-meta-row">
                        <span className="badge badge-primary">{perfume.category?.name || 'Parfum'}</span>
                        <span className={`stock-indicator ${perfume.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                            <span className="stock-dot"></span>
                            {perfume.stock > 0 ? 'En stock' : 'Rupture de stock'}
                        </span>
                    </div>

                    <h1 className="detail-title">{perfume.name}</h1>

                    {perfume.rating > 0 && (
                        <div className="detail-rating">
                            <Star size={16} fill="var(--warning)" stroke="var(--warning)" />
                            <span className="rating-value">{perfume.rating}</span>
                            <span className="rating-count">({perfume.reviews_count} avis)</span>
                        </div>
                    )}

                    <p className="detail-description">{perfume.description}</p>

                    {perfume.notes && (
                        <div className="notes-block">
                            <h4>Notes olfactives</h4>
                            <p>{perfume.notes}</p>
                        </div>
                    )}

                    {/* Price & Action */}
                    <div className="purchase-section">
                        <div className="price-display">
                            <span className="price-value">{perfume.price}</span>
                            <span className="price-currency">€</span>
                        </div>

                        <button
                            className="btn btn-primary btn-purchase"
                            disabled={perfume.stock === 0 || isAdding}
                            onClick={handleAddToCart}
                        >
                            {isAdding ? (
                                <>Ajout en cours...</>
                            ) : perfume.stock > 0 ? (
                                <><ShoppingBag size={18} /> Ajouter au panier</>
                            ) : (
                                'Rupture de stock'
                            )}
                        </button>

                        {cartMessage.text && (
                            <div className={`alert-inline ${cartMessage.type}`}>
                                {cartMessage.type === 'success' && <Check size={16} />}
                                {cartMessage.text}
                            </div>
                        )}
                    </div>

                    {/* Trust Signals */}
                    <div className="trust-row">
                        <div className="trust-item">
                            <Truck size={18} style={{ color: 'var(--primary)' }} />
                            <div>
                                <strong>Livraison rapide</strong>
                                <span>Sous 48h ouvrées</span>
                            </div>
                        </div>
                        <div className="trust-item">
                            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                            <div>
                                <strong>Authenticité garantie</strong>
                                <span>Produits certifiés</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <section className="reviews-section">
                <div className="section-header">
                    <h2>Avis clients</h2>
                    {perfume.reviews_count > 0 && (
                        <span className="badge badge-primary">{perfume.reviews_count} avis</span>
                    )}
                </div>

                <div className="reviews-layout">
                    <div className="reviews-list-col">
                        <ReviewList perfumeId={id} key={`list-${id}`} />
                    </div>
                    {localStorage.getItem('token') && (
                        <div className="review-form-col saas-card" style={{ padding: '1.5rem' }}>
                            <ReviewForm perfumeId={id} onReviewAdded={fetchPerfume} />
                        </div>
                    )}
                </div>
            </section>

            {/* Similar Products */}
            {similar && similar.length > 0 && (
                <section className="similar-section">
                    <h2 className="section-header">Produits similaires</h2>
                    <div className="similar-grid">
                        {similar.map(item => (
                            <Link key={item.id} to={`/perfumes/${item.id}`} className="saas-card similar-card">
                                <div className="similar-img">
                                    <img src={getImageUrl(item.image_url)} alt={item.name} />
                                </div>
                                <div className="similar-info">
                                    <h4>{item.name}</h4>
                                    <span className="similar-price">{item.price} €</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <style>{`
                .detail-page { padding-bottom: 6rem; }

                .detail-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin-bottom: 2rem;
                }
                .detail-breadcrumb a {
                    color: var(--primary);
                    text-decoration: none;
                }
                .detail-breadcrumb a:hover { text-decoration: underline; }

                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    align-items: start;
                    margin-bottom: 4rem;
                }

                .main-image-frame {
                    position: relative;
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    overflow: hidden;
                }
                .main-image-frame img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-placeholder {
                    width: 100%;
                    height: 100%;
                    min-height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-alt);
                }

                .thumb-row {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 1rem;
                    overflow-x: auto;
                }
                .thumb-btn {
                    width: 72px;
                    height: 72px;
                    border-radius: var(--radius-md);
                    border: 2px solid var(--border-light);
                    padding: 4px;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    background: var(--bg-surface);
                    flex-shrink: 0;
                }
                .thumb-btn.active {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-light);
                }
                .thumb-btn img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 4px;
                }

                .detail-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .stock-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                .stock-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .in-stock { color: var(--success); }
                .in-stock .stock-dot { background: var(--success); }
                .out-stock { color: var(--danger); }
                .out-stock .stock-dot { background: var(--danger); }

                .detail-title {
                    font-size: 2rem;
                    font-weight: 700;
                    line-height: 1.2;
                    margin-bottom: 0.75rem;
                }

                .detail-rating {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    margin-bottom: 1.5rem;
                }
                .rating-value { font-weight: 700; font-size: 1rem; }
                .rating-count { color: var(--text-muted); font-size: 0.875rem; }

                .detail-description {
                    color: var(--text-muted);
                    line-height: 1.7;
                    margin-bottom: 1.5rem;
                    font-size: 0.95rem;
                }

                .notes-block {
                    background: var(--bg-alt);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                    padding: 1.25rem;
                    margin-bottom: 2rem;
                }
                .notes-block h4 {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }
                .notes-block p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    line-height: 1.6;
                }

                .purchase-section {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .price-display {
                    display: flex;
                    align-items: baseline;
                    gap: 0.25rem;
                    margin-bottom: 1rem;
                }
                .price-value { font-size: 2.25rem; font-weight: 800; }
                .price-currency { font-size: 1.25rem; color: var(--text-muted); }

                .btn-purchase {
                    width: 100%;
                    padding: 0.875rem;
                    font-size: 1rem;
                }

                .alert-inline {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                    padding: 0.625rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                .alert-inline.success {
                    background: var(--success-bg);
                    color: var(--success);
                }
                .alert-inline.error {
                    background: var(--danger-bg);
                    color: var(--danger);
                }

                .trust-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .trust-item {
                    display: flex;
                    gap: 0.75rem;
                    align-items: flex-start;
                    padding: 1rem;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                    background: var(--bg-surface);
                }
                .trust-item strong {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 0.125rem;
                }
                .trust-item span {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .reviews-section {
                    margin-top: 4rem;
                    padding-top: 3rem;
                    border-top: 1px solid var(--border-light);
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .section-header h2 {
                    font-size: 1.5rem;
                }

                .reviews-layout {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 2rem;
                    align-items: start;
                }

                .similar-section {
                    margin-top: 4rem;
                    padding-top: 3rem;
                    border-top: 1px solid var(--border-light);
                }

                .similar-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                }

                .similar-card {
                    text-decoration: none;
                    color: var(--text-main);
                    padding: 0;
                }
                .similar-img {
                    height: 200px;
                    overflow: hidden;
                }
                .similar-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }
                .similar-card:hover .similar-img img {
                    transform: scale(1.05);
                }
                .similar-info {
                    padding: 1rem;
                }
                .similar-info h4 {
                    font-size: 0.95rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .similar-price {
                    color: var(--primary);
                    font-weight: 700;
                    font-size: 0.9rem;
                }

                .detail-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--border-light);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: detailSpin 1s linear infinite;
                    margin: 3rem auto;
                }
                @keyframes detailSpin { to { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .detail-grid { grid-template-columns: 1fr; gap: 2rem; }
                    .reviews-layout { grid-template-columns: 1fr; }
                    .similar-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    .similar-grid { grid-template-columns: 1fr; }
                    .trust-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default PerfumeDetail;
