import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const [perfumes, setPerfumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : `http://${window.location.hostname}:8000`;

    useEffect(() => {
        const fetchPerfumes = async () => {
            try {
                const response = await axios.get(`${apiBase}/api/perfumes?per_page=4`);
                setPerfumes(response.data.data || []);
            } catch (err) {
                console.error('Erreur:', err);
                setError('Impossible de charger les parfums');
                // Données fictives si l'API n'est pas disponible
                setPerfumes([
                    { id: 1, name: 'Santal Royal', brand: 'Guerlain', price: 185.00, image: null },
                    { id: 2, name: 'Oud Wood', brand: 'Tom Ford', price: 240.00, image: null },
                    { id: 3, name: 'Baccarat Rouge', brand: 'MFK', price: 310.00, image: null },
                    { id: 4, name: 'Aventus', brand: 'Creed', price: 295.00, image: null },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfumes();
    }, [apiBase]);

    return (
        <div className="home-premium">
            {/* Hero Section */}
            <section className="hero-premium">
                <div className="container-premium hero-content animate-fade-in">
                    <h5 className="hero-subtitle font-serif gradient-text-gold">BIENVENUE DANS L'UNIVERS DU LUXE</h5>
                    <h1 className="hero-title font-serif">L'Art de la <br /><span className="gradient-text-gold">Parfumerie Fine</span></h1>
                    <p className="hero-description">
                        Découvrez une collection exclusive de fragrances rares, sélectionnées parmi les plus grandes maisons du monde. Trouvez votre signature olfactive.
                    </p>
                    <div className="hero-actions">
                        <Link to="/perfumes" className="btn-premium">DÉCOUVRIR LA COLLECTION</Link>
                        <Link to="/recommendations" className="btn-minimal">EXPÉRIENCE SUR MESURE</Link>
                    </div>
                </div>
            </section>

            {/* Featured Experience */}
            <section className="experience-section">
                <div className="container-premium">
                    <div className="experience-grid">
                        <div className="experience-card glass-premium">
                            <span className="exp-icon">🧪</span>
                            <h3>Quiz Olfactif IA</h3>
                            <p>Laissez notre algorithme analyser vos préférences pour vous proposer le parfum idéal.</p>
                        </div>
                        <div className="experience-card glass-premium">
                            <span className="exp-icon">✨</span>
                            <h3>Matières Rares</h3>
                            <p>Nous ne sélectionnons que des fragrances élaborées avec les ingrédients les plus nobles.</p>
                        </div>
                        <div className="experience-card glass-premium">
                            <span className="exp-icon">🌍</span>
                            <h3>Maison de Luxe</h3>
                            <p>Une passerelle directe vers les créateurs les plus prestigieux au monde.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Perfumes */}
            <section className="featured-section">
                <div className="container-premium">
                    <div className="section-header">
                        <h2 className="font-serif">Nos <span className="gradient-text-gold">Incontournables</span></h2>
                        <Link to="/perfumes" className="view-all">TOUT VOIR →</Link>
                    </div>

                    {loading ? (
                        <div className="loader-container">
                            <div className="premium-loader"></div>
                        </div>
                    ) : error ? (
                        <p style={{ textAlign: 'center', color: '#ff4b4b' }}>{error}</p>
                    ) : (
                        <div className="perfume-grid-premium">
                            {perfumes.map(perfume => (
                                <div key={perfume.id} className="premium-card perfume-card-luxury">
                                    <div className="card-image-wrapper">
                                        {perfume.image ? (
                                            <img src={perfume.image} alt={perfume.name} />
                                        ) : (
                                            <div className="placeholder-image">
                                                <span className="font-serif gold-rose">🌹</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-info">
                                        <span className="brand-label">{perfume.brand}</span>
                                        <h3>{perfume.name}</h3>
                                        <p className="price-label">{perfume.price} €</p>
                                        <Link to={`/perfumes/${perfume.id}`} className="card-link">VOIR LE PRODUIT</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                .hero-premium {
                    padding: 8rem 0;
                    text-align: center;
                    position: relative;
                    background: var(--bg-deep);
                }

                .hero-subtitle {
                    font-size: 0.9rem;
                    letter-spacing: 2px;
                    margin-bottom: 2rem;
                    color: var(--primary);
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .hero-title {
                    font-size: 5rem;
                    line-height: 1.1;
                    margin-bottom: 2rem;
                    color: var(--text-primary);
                }

                .hero-description {
                    max-width: 600px;
                    margin: 0 auto 3rem;
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                    font-weight: 400;
                }

                .hero-actions {
                    display: flex;
                    gap: 2rem;
                    justify-content: center;
                }

                .btn-minimal {
                    color: var(--text-primary);
                    text-decoration: none;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    border-bottom: 2px solid var(--primary);
                    padding-bottom: 5px;
                    transition: all 0.2s ease;
                }

                .btn-minimal:hover {
                    color: var(--primary);
                    letter-spacing: 2px;
                }

                .experience-section {
                    padding: 5rem 0;
                    background: var(--bg-card);
                }

                .experience-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .experience-card {
                    padding: 3rem;
                    text-align: center;
                    transition: all 0.2s ease;
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                }

                .experience-card:hover { 
                    border-color: #cbd5e1;
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-3px);
                }

                .exp-icon { font-size: 2.5rem; display: block; margin-bottom: 1.5rem; }

                .experience-card h3 {
                    margin-bottom: 1rem;
                    font-size: 1.2rem;
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .experience-card p {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 4rem;
                }

                .section-header h2 { font-size: 3rem; color: var(--text-primary); }

                .view-all {
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 600;
                    letter-spacing: 1px;
                }

                .perfume-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .perfume-card-luxury {
                    padding: 0;
                }

                .card-image-wrapper {
                    height: 350px;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-bottom: 1px solid var(--glass-border);
                }

                .card-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: all 0.4s ease;
                }

                .perfume-card-luxury:hover img {
                    transform: scale(1.03);
                }

                .placeholder-image {
                    font-size: 5rem;
                }

                .card-info {
                    padding: 2rem;
                    text-align: center;
                }

                .brand-label {
                    font-size: 0.8rem;
                    letter-spacing: 2px;
                    color: var(--primary);
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }

                .card-info h3 {
                    font-size: 1.4rem;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .price-label {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    color: var(--text-primary);
                }

                .card-link {
                    display: block;
                    padding: 1rem;
                    border: 1px solid #cbd5e1;
                    color: var(--text-primary);
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    border-radius: 6px;
                }

                .card-link:hover {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: #fff;
                }

                @media (max-width: 768px) {
                    .hero-title { font-size: 3rem; }
                    .experience-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Home;
