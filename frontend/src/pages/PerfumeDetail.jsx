import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import ReviewList from '../components/Reviews/ReviewList';
import ReviewForm from '../components/Reviews/ReviewForm';

const PerfumeDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [activeImage, setActiveImage] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchPerfume();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchPerfume = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/perfumes/${id}`);
            setData(response.data);
            setActiveImage(response.data.perfume.image_url);
        } catch (err) {
            console.error("Fetch perfume detail error:", err);
            setError("Produit introuvable.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        const result = await addToCart(perfume.id, 1);
        if (result.success) {
            setCartMessage({ text: 'Ajouté au panier !', type: 'success' });
            setTimeout(() => setCartMessage({ text: '', type: '' }), 3000);
        } else {
            setCartMessage({ text: result.message, type: 'error' });
        }
        setIsAdding(false);
    };

    if (isLoading) return <div className="loader">Découverte de l'essence...</div>;
    if (error) return (
        <div className="page-container error-state">
            <h1>{error}</h1>
            <Link to="/catalogue" className="gold-link">Retour au catalogue</Link>
        </div>
    );

    const { perfume, similar } = data;

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/600x800?text=Fragrance';
        if (url.startsWith('http')) return url;
        // Ensure no double slashes if url already has/
        const path = url.startsWith('/') ? url : `/${url}`;
        return `http://localhost:8000${path}`;
    };

    const getButtonText = () => {
        if (isAdding) return 'Ajout en cours...';
        return perfume.stock > 0 ? 'Ajouter à mon sillage' : 'Bientôt de retour';
    };

    // Combine main image and gallery for the viewer
    const allImages = [perfume.image_url, ...(perfume.gallery || [])].filter(Boolean);

    return (
        <div className="page-container perfume-detail-page">
            <div className="detail-layout">
                {/* Visual Section */}
                <div className="detail-visual">
                    <div className="image-frame">
                        {new Date(perfume.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                            <span className="badge-new" style={{ top: '1.5rem', right: '1.5rem', fontSize: '0.9rem' }}>NOUVEAU</span>
                        )}
                        <img src={getImageUrl(activeImage || perfume.image_url)} alt={perfume.name} />
                    </div>

                    {allImages.length > 1 && (
                        <div className="gallery-thumbnails">
                            {allImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`thumb-item ${activeImage === img ? 'active' : ''}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="detail-content">
                    <nav className="detail-nav">
                        <Link to="/catalogue">Collection</Link> / <span>{perfume.category?.name || 'Parfumerie'}</span>
                    </nav>

                    <header className="detail-header">
                        <div className="title-row">
                            <h1>{perfume.name}</h1>
                            {perfume.rating > 0 && (
                                <span className="detail-rating">
                                    ★ {perfume.rating} ({perfume.reviews_count} avis)
                                </span>
                            )}
                        </div>
                        <div className="luxury-divider"></div>
                    </header>

                    <div className="info-block">
                        <p className="main-description">{perfume.description}</p>
                    </div>

                    <div className="olfactory-pyramid">
                        <span className="block-label">Notes Olfactives</span>
                        <p className="palette-notes">{perfume.notes}</p>
                    </div>

                    <div className="checkout-card">
                        <div className="price-display">
                            <span className="amount">{perfume.price}</span>
                            <span className="currency">€</span>
                        </div>

                        <div className="stock-indicator">
                            <span className={`dot ${perfume.stock > 0 ? 'online' : 'offline'}`}></span>
                            {perfume.stock > 0 ? `${perfume.stock} pièces disponibles` : 'Épuisé'}
                        </div>

                        <button
                            className="luxury-btn"
                            disabled={perfume.stock === 0 || isAdding}
                            onClick={handleAddToCart}
                        >
                            {getButtonText()}
                        </button>

                        {cartMessage.text && (
                            <div className={`cart-status-message ${cartMessage.type}`}>
                                {cartMessage.text}
                            </div>
                        )}
                    </div>

                    <div className="service-grid">
                        <div className="service-item">
                            <span className="icon">🚚</span>
                            <div className="text">
                                <strong>Livraison Signature</strong>
                                <span>Expédition sous 48h</span>
                            </div>
                        </div>
                        <div className="service-item">
                            <span className="icon">🛡️</span>
                            <div className="text">
                                <strong>Paiement Sécurisé</strong>
                                <span>Transaction cryptée</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <section className="product-reviews-container">
                <div className="reviews-layout">
                    <div className="reviews-left">
                        <ReviewList
                            perfumeId={id}
                            key={`list-${id}`}
                        />
                    </div>
                    {localStorage.getItem('auth_token') && (
                        <div className="reviews-right">
                            <ReviewForm
                                perfumeId={id}
                                onReviewAdded={() => fetchPerfume()}
                            />
                        </div>
                    )}
                </div>
            </section>

            {similar && similar.length > 0 && (
                <section className="similar-collection">
                    <div className="section-header">
                        <h2>Explorations Similaires</h2>
                        <Link to="/catalogue" className="see-all">Voir toute la collection →</Link>
                    </div>
                    <div className="similar-grid">
                        {similar.map(item => (
                            <Link key={item.id} to={`/perfume/${item.id}`} className="mini-card-link">
                                <div className="mini-card">
                                    <div className="mini-image">
                                        <img src={getImageUrl(item.image_url)} alt={item.name} />
                                    </div>
                                    <div className="mini-meta">
                                        <h3>{item.name}</h3>
                                        <span className="mini-price">{item.price} €</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
export default PerfumeDetail;
