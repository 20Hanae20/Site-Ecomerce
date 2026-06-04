import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/useCart';
import { Star, ShoppingBag, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
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

    const fetchPerfume = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/perfumes/${id}`);
            setData(response.data);
            setActiveImage(response.data.perfume.image_url);
        } catch (err) {
            console.error("Fetch perfume detail error:", err);
            setError("L'essence que vous recherchez semble s'être évanouie.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPerfume();
        window.scrollTo(0, 0);
    }, [fetchPerfume]);

    const handleAddToCart = async () => {
        setIsAdding(true);
        const result = await addToCart(data.perfume.id, 1);
        if (result.success) {
            setCartMessage({ text: 'PRÉCIEUX AJOUTÉ AU PANIER', type: 'success' });
            setTimeout(() => setCartMessage({ text: '', type: '' }), 5000);
        } else {
            setCartMessage({ text: result.message, type: 'error' });
        }
        setIsAdding(false);
    };

    if (isLoading) return (
        <div className="loader-container-premium">
            <div className="premium-loader"></div>
            <p className="loader-text-luxury">RÉVÉLATION DE L'ESSENCE...</p>
        </div>
    );

    if (error) return (
        <div className="container-premium error-state-luxury animate-fade-in">
            <h1 className="font-serif">{error}</h1>
            <Link to="/perfumes" className="btn-premium">RETOUR AU CATALOGUE</Link>
        </div>
    );

    const { perfume, similar } = data;

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const apiHost = API_HOST.replace(/\/api\/?$/, '');
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${apiHost}${path}`;
    };

    const allImages = [perfume.image_url, ...(perfume.gallery || [])].filter(Boolean);

    return (
        <div className="container-premium detail-page-luxury animate-fade-in">
            <div className="detail-layout-luxury">
                {/* Visual Section */}
                <div className="detail-visual-luxury">
                    <div className="main-frame-luxury glass-premium">
                        {new Date(perfume.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                            <span className="luxury-badge top-right">NOUVEAU</span>
                        )}
                        {activeImage ? (
                            <img src={getImageUrl(activeImage)} alt={perfume.name} />
                        ) : (
                            <div className="placeholder-luxury large">🌹</div>
                        )}
                    </div>

                    {allImages.length > 1 && (
                        <div className="gallery-track-luxury">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`thumb-btn-luxury glass-premium ${activeImage === img ? 'active' : ''}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={getImageUrl(img)} alt={`Illustration ${idx}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="detail-content-luxury">
                    <nav className="breadcrumb-luxury">
                        <Link to="/perfumes">CATALOGUE</Link>
                        <ChevronRight size={14} />
                        <span className="gradient-text-gold">{perfume.name.toUpperCase()}</span>
                    </nav>

                    <header className="detail-header-luxury">
                        <span className="category-reveal-luxury">{perfume.category?.name || 'Fragrance d\'Exception'}</span>
                        <h1 className="font-serif">{perfume.name}</h1>
                        <div className="metrics-row-luxury">
                            {perfume.rating > 0 && (
                                <div className="rating-pill-luxury glass-premium">
                                    <Star size={14} fill="var(--primary)" />
                                    <span>{perfume.rating}</span>
                                    <span className="count">({perfume.reviews_count} avis)</span>
                                </div>
                            )}
                            <div className="stock-pill-luxury glass-premium">
                                <span className={`status-dot ${perfume.stock > 0 ? 'instock' : 'outstock'}`}></span>
                                {perfume.stock > 0 ? 'EN STOCK' : 'ÉPUISÉ'}
                            </div>
                        </div>
                    </header>

                    <div className="description-box-luxury">
                        <p className="description-text">{perfume.description}</p>
                        <div className="notes-card-luxury glass-premium">
                            <label className="gold-label">ARCHITECTURE OLFACTIVE</label>
                            <p className="notes-text">{perfume.notes || 'Une symphonie de notes rares et précieuses.'}</p>
                        </div>
                    </div>

                    <div className="action-card-luxury glass-premium">
                        <div className="price-tag-luxury">
                            <span className="price-amount">{perfume.price}</span>
                            <span className="price-currency">€</span>
                        </div>

                        <button
                            className="btn-premium btn-purchase-luxury"
                            disabled={perfume.stock === 0 || isAdding}
                            onClick={handleAddToCart}
                        >
                            <ShoppingBag size={20} />
                            {isAdding ? 'AJOUT...' : perfume.stock > 0 ? 'AJOUTER AU PANIER' : 'RUPTURE DE STOCK'}
                        </button>

                        {cartMessage.text && (
                            <div className={`status-alert-luxury ${cartMessage.type}`}>
                                {cartMessage.text}
                            </div>
                        )}
                    </div>

                    <div className="trust-badges-luxury">
                        <div className="trust-item">
                            <Truck size={20} className="gold-icon" />
                            <div>
                                <h6>Expédition Royale</h6>
                                <p>Sous 48 heures</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <ShieldCheck size={20} className="gold-icon" />
                            <div>
                                <h6>Sillage Garanti</h6>
                                <p>Authenticité certifiée</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <section className="reviews-section-luxury">
                <div className="section-title-luxury">
                    <h5 className="gradient-text-gold font-serif">TÉMOIGNAGES</h5>
                    <h2 className="font-serif">Leurs Impressions</h2>
                </div>

                <div className="reviews-grid-luxury">
                    <div className="reviews-list-luxury">
                        <ReviewList perfumeId={id} key={`list-${id}`} />
                    </div>
                    {localStorage.getItem('token') && (
                        <div className="review-form-luxury glass-premium">
                            <ReviewForm perfumeId={id} onReviewAdded={fetchPerfume} />
                        </div>
                    )}
                </div>
            </section>

            {similar && similar.length > 0 && (
                <section className="related-section-luxury">
                    <div className="section-title-luxury">
                        <h2 className="font-serif">Explorations Complémentaires</h2>
                    </div>
                    <div className="similar-grid-luxury">
                        {similar.map(item => (
                            <Link key={item.id} to={`/perfumes/${item.id}`} className="premium-card similar-card-luxury">
                                <div className="similar-media">
                                    <img src={getImageUrl(item.image_url)} alt={item.name} />
                                </div>
                                <div className="similar-info">
                                    <h3>{item.name}</h3>
                                    <span className="price">{item.price} €</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <style>{`
                .detail-page-luxury { padding-top: 4rem; padding-bottom: 8rem; }
                
                .detail-layout-luxury {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 6rem;
                    align-items: start;
                }

                .main-frame-luxury {
                    position: relative;
                    height: 700px;
                    border-radius: 30px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2rem;
                }

                .main-frame-luxury img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .gallery-track-luxury {
                    display: flex;
                    gap: 1rem;
                    overflow-x: auto;
                    padding-bottom: 1rem;
                }

                .thumb-btn-luxury {
                    width: 100px;
                    height: 100px;
                    border-radius: 12px;
                    padding: 0.5rem;
                    transition: all 0.3s;
                    border: 1px solid transparent;
                }

                .thumb-btn-luxury.active { border-color: var(--primary); transform: translateY(-5px); }
                .thumb-btn-luxury img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }

                .breadcrumb-luxury {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.75rem;
                    letter-spacing: 2px;
                    margin-bottom: 3rem;
                    opacity: 0.6;
                }

                .category-reveal-luxury {
                    font-size: 0.8rem;
                    letter-spacing: 4px;
                    color: var(--primary);
                    margin-bottom: 1rem;
                    display: block;
                    font-weight: 700;
                }

                .detail-header-luxury h1 { font-size: 4.5rem; line-height: 1; margin-bottom: 2rem; }

                .metrics-row-luxury { display: flex; gap: 1.5rem; margin-bottom: 3rem; }
                .rating-pill-luxury, .stock-pill-luxury {
                    padding: 0.6rem 1.2rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.8rem;
                }

                .status-dot { width: 8px; height: 8px; border-radius: 50%; }
                .status-dot.instock { background: #22c55e; box-shadow: 0 0 10px #22c55e; }
                .status-dot.outstock { background: #ef4444; }

                .description-text { font-size: 1.1rem; line-height: 1.8; opacity: 0.7; margin-bottom: 3rem; }

                .notes-card-luxury { padding: 2rem; border-radius: 20px; }
                .gold-label { font-size: 0.7rem; color: var(--primary); letter-spacing: 3px; font-weight: 800; margin-bottom: 1rem; display: block; }
                .notes-text { font-size: 1rem; letter-spacing: 1px; }

                .action-card-luxury {
                    margin-top: 4rem;
                    padding: 3rem;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                }

                .price-tag-luxury { display: flex; align-items: baseline; }
                .price-amount { font-size: 3rem; font-weight: 800; }
                .price-currency { font-size: 1.5rem; margin-left: 0.5rem; opacity: 0.5; }

                .btn-purchase-luxury {
                    flex: 1;
                    padding: 1.25rem;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                }

                .trust-badges-luxury { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 4rem; }
                .trust-item { display: flex; gap: 1.5rem; align-items: start; }
                .trust-item h6 { font-size: 0.9rem; margin-bottom: 0.25rem; }
                .trust-item p { font-size: 0.75rem; opacity: 0.5; }
                .gold-icon { color: var(--primary); }

                .reviews-section-luxury { margin-top: 10rem; }
                .section-title-luxury { text-align: center; margin-bottom: 5rem; }
                .section-title-luxury h5 { letter-spacing: 4px; margin-bottom: 1rem; }
                .section-title-luxury h2 { font-size: 3rem; }

                .reviews-grid-luxury { display: grid; grid-template-columns: 1fr 400px; gap: 4rem; }
                .review-form-luxury { padding: 3rem; border-radius: 24px; height: fit-content; }

                .related-section-luxury { margin-top: 10rem; }
                .similar-grid-luxury {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 2rem;
                    margin-top: 3rem;
                }

                .similar-card-luxury { border-radius: 20px; overflow: hidden; text-decoration: none; color: #fff; }
                .similar-media { height: 300px; overflow: hidden; }
                .similar-media img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s; }
                .similar-card-luxury:hover img { transform: scale(1.1); }
                .similar-info { padding: 1.5rem; text-align: center; }
                .similar-info h3 { font-size: 1rem; margin-bottom: 0.5rem; }
                .similar-info .price { color: var(--primary); font-weight: 700; }

                @media (max-width: 1024px) {
                    .detail-layout-luxury { grid-template-columns: 1fr; gap: 4rem; }
                    .reviews-grid-luxury { grid-template-columns: 1fr; }
                    .similar-grid-luxury { grid-template-columns: repeat(2, 1fr); }
                }

                .status-alert-luxury {
                    position: absolute;
                    bottom: -3rem;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-size: 0.75rem;
                    letter-spacing: 2px;
                    padding: 0.5rem;
                    border-radius: 5px;
                }
                .status-alert-luxury.success { color: #22c55e; }
                .status-alert-luxury.error { color: #ef4444; }
            `}</style>
        </div>
    );
};

export default PerfumeDetail;
