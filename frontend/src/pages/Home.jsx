import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
    const [perfumes, setPerfumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerfumes = async () => {
            try {
                const response = await api.get(`/perfumes?per_page=4`);
                setPerfumes(response.data.data || []);
            } catch (err) {
                console.error('Erreur:', err);
                setError('Impossible de charger le catalogue');
                // Fallback mock data
                setPerfumes([
                    { id: 1, name: 'Santal Royal', brand: 'Guerlain', price: 185.00, stock_status: 'En stock' },
                    { id: 2, name: 'Oud Wood', brand: 'Tom Ford', price: 240.00, stock_status: 'Faible' },
                    { id: 3, name: 'Baccarat Rouge', brand: 'MFK', price: 310.00, stock_status: 'En stock' },
                    { id: 4, name: 'Aventus', brand: 'Creed', price: 295.00, stock_status: 'Rupture' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfumes();
    }, [apiBase]);

    return (
        <div className="home-saas">
            {/* SaaS Hero Section */}
            <section className="saas-hero">
                <div className="container hero-grid">
                    <div className="hero-content animate-fade-up">
                        <div className="badge badge-primary mb-4">Nouveau : Version 2.0 🚀</div>
                        <h1 className="hero-title">
                            Gérez votre inventaire avec <span className="text-gradient">précision</span>
                        </h1>
                        <p className="hero-subtitle">
                            La plateforme B2B unifiée pour les professionnels de la parfumerie. 
                            Synchronisez vos stocks, analysez vos ventes et optimisez vos recommandations IA en temps réel.
                        </p>
                        <div className="hero-cta">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Démarrer l'essai gratuit <ArrowRight size={18} />
                            </Link>
                            <Link to="/contact" className="btn btn-secondary btn-lg">
                                Contacter les ventes
                            </Link>
                        </div>
                    </div>
                    <div className="hero-visual animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        <div className="mockup-window">
                            <div className="mockup-header">
                                <span className="dot bg-danger"></span>
                                <span className="dot bg-warning"></span>
                                <span className="dot bg-success"></span>
                            </div>
                            <div className="mockup-body">
                                <div className="skeleton-line" style={{ width: '40%' }}></div>
                                <div className="skeleton-block"></div>
                                <div className="skeleton-grid">
                                    <div className="skeleton-card"></div>
                                    <div className="skeleton-card"></div>
                                    <div className="skeleton-card"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="saas-features bg-alt">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2>L'infrastructure idéale pour votre croissance</h2>
                        <p className="text-muted mt-2">Des outils conçus spécifiquement pour les exigences du B2B.</p>
                    </div>
                    
                    <div className="features-grid">
                        <div className="saas-card feature-card">
                            <div className="feature-icon"><Database size={24} /></div>
                            <h3>Gestion Centralisée</h3>
                            <p className="text-muted">Suivez vos stocks en temps réel sur tous vos points de vente depuis une interface unique.</p>
                        </div>
                        <div className="saas-card feature-card">
                            <div className="feature-icon"><Zap size={24} /></div>
                            <h3>Moteur IA Ultra-Rapide</h3>
                            <p className="text-muted">Générez des recommandations de parfums hyper-personnalisées pour vos clients instantanément.</p>
                        </div>
                        <div className="saas-card feature-card">
                            <div className="feature-icon"><ShieldCheck size={24} /></div>
                            <h3>Sécurité Entreprise</h3>
                            <p className="text-muted">Vos données sont isolées (Multi-Tenancy) et protégées par des standards de sécurité élevés.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Preview Catalog Section */}
            <section className="saas-catalog">
                <div className="container">
                    <div className="flex items-center justify-between mb-4">
                        <h2>Aperçu du Catalogue</h2>
                        <Link to="/perfumes" className="btn btn-secondary">Voir tout l'inventaire</Link>
                    </div>

                    {loading ? (
                        <div className="text-center mt-5"><p>Chargement des données...</p></div>
                    ) : error ? (
                        <div className="saas-card text-center p-4"><p className="text-danger">{error}</p></div>
                    ) : (
                        <div className="catalog-grid">
                            {perfumes.map(perfume => (
                                <div key={perfume.id} className="saas-card product-card">
                                    <div className="product-header">
                                        <span className="text-muted text-sm font-semibold">{perfume.brand}</span>
                                        {perfume.stock_status === 'Rupture' ? (
                                            <span className="badge badge-danger">Rupture</span>
                                        ) : perfume.stock_status === 'Faible' ? (
                                            <span className="badge badge-warning">Stock Faible</span>
                                        ) : (
                                            <span className="badge badge-success">En Stock</span>
                                        )}
                                    </div>
                                    <h3 className="product-title">{perfume.name}</h3>
                                    <div className="product-footer flex justify-between items-center mt-4">
                                        <div className="product-price">{perfume.price} €</div>
                                        <Link to={`/perfumes/${perfume.id}`} className="btn btn-secondary btn-sm">Détails</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                .saas-hero {
                    padding: 5rem 0 6rem;
                    background: var(--bg-surface);
                    overflow: hidden;
                    position: relative;
                }

                .hero-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: center;
                }

                .hero-title {
                    font-size: 3.5rem;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                }

                .hero-subtitle {
                    font-size: 1.125rem;
                    color: var(--text-muted);
                    margin-bottom: 2.5rem;
                    max-width: 500px;
                    line-height: 1.6;
                }

                .hero-cta {
                    display: flex;
                    gap: 1rem;
                }

                .btn-lg {
                    padding: 0.875rem 1.5rem;
                    font-size: 1rem;
                }

                /* Mockup Window Styling */
                .mockup-window {
                    background: var(--bg-body);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    overflow: hidden;
                }

                .mockup-header {
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-light);
                    padding: 0.75rem 1rem;
                    display: flex;
                    gap: 0.5rem;
                }

                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .bg-danger { background: #ef4444; }
                .bg-warning { background: #f59e0b; }
                .bg-success { background: #10b981; }

                .mockup-body {
                    padding: 2rem;
                }

                .skeleton-line {
                    height: 20px;
                    background: var(--border-light);
                    border-radius: 4px;
                    margin-bottom: 1.5rem;
                }

                .skeleton-block {
                    height: 150px;
                    background: var(--bg-surface);
                    border-radius: var(--radius-md);
                    border: 1px dashed var(--border-light);
                    margin-bottom: 1.5rem;
                }

                .skeleton-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 1rem;
                }

                .skeleton-card {
                    height: 100px;
                    background: var(--bg-surface);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-light);
                }

                /* Features Section */
                .saas-features {
                    padding: 5rem 0;
                    background: var(--bg-alt);
                    border-top: 1px solid var(--border-light);
                    border-bottom: 1px solid var(--border-light);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .feature-card {
                    padding: 2rem;
                }

                .feature-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--primary-light);
                    color: var(--primary);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }

                .feature-card h3 {
                    margin-bottom: 0.75rem;
                    font-size: 1.125rem;
                }

                /* Catalog Section */
                .saas-catalog {
                    padding: 5rem 0;
                    background: var(--bg-body);
                }

                .catalog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .product-card {
                    padding: 1.5rem;
                }

                .product-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .product-title {
                    font-size: 1.125rem;
                    margin-bottom: 0.5rem;
                    color: var(--text-main);
                }

                .product-price {
                    font-weight: 700;
                    font-size: 1.25rem;
                    color: var(--text-main);
                }

                .btn-sm {
                    padding: 0.4rem 0.8rem;
                    font-size: 0.8rem;
                }

                .text-sm { font-size: 0.875rem; }
                .font-semibold { font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

                @media (max-width: 992px) {
                    .hero-grid { grid-template-columns: 1fr; gap: 3rem; }
                    .hero-title { font-size: 2.5rem; }
                    .features-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Home;
