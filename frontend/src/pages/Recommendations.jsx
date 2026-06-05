import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Sparkles,
    Eye,
    ShoppingBag,
    ChevronRight,
    Info,
    Search,
    Compass,
    Star,
    History
} from 'lucide-react';

const Recommendations = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('recommendations');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recommendations/dashboard');
            setData(response.data.data);
            setError(null);
        } catch (err) {
            if (err.response?.status === 403) {
                setData({ viewed_perfumes: [], recommendations: [] });
                setError('Les recommandations ne sont pas disponibles pour votre abonnement actuel.');
            } else {
                console.error('Error fetching recommendations:', err);
                setError('Une erreur est survenue lors du chargement des recommandations.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="loader-container-premium">
            <div className="premium-loader"></div>
            <p className="loader-text-luxury">CONGÉNÉRATION DE VOTRE PORTRAIT OLFACTIF...</p>
        </div>
    );

    if (error) return (
        <div className="container-premium error-state-luxury animate-fade-in">
            <h1 className="font-serif">{error}</h1>
            <div className="flex gap-2 m-t-2">
                <button onClick={fetchDashboard} className="btn-premium">RÉESSAYER</button>
                <button onClick={() => navigate('/perfumes')} className="btn-premium btn-secondary-luxury">EXPLORER L'ARTISANAT</button>
            </div>
        </div>
    );

    const { viewed_perfumes = [], recommendations = [] } = data || {};

    return (
        <div className="container-premium recommendations-page-luxury animate-fade-in">
            <header className="page-header-luxury">
                <h5 className="gradient-text-gold font-serif">SUR MESURE</h5>
                <h1 className="font-serif">Votre Sillage <span className="gradient-text-gold">Personnel</span></h1>
                <p className="aesthetic-hint">Une sélection guidée par vos aspirations et votre histoire avec nous.</p>
            </header>

            <div className="recommendations-tabs-luxury glass-premium">
                {[
                    { id: 'recommendations', label: 'RÉVÉLATIONS', icon: <Sparkles size={16} />, count: recommendations.length },
                    { id: 'viewed', label: 'EXPLORATIONS', icon: <History size={16} />, count: viewed_perfumes.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn-luxury ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        <span className="tab-count">{tab.count}</span>
                    </button>
                ))}
            </div>

            <div className="recommendations-content-luxury">
                {activeTab === 'recommendations' && (
                    <section className="tab-panel-luxury animate-fade-in-up">
                        {recommendations.length > 0 ? (
                            <div className="perfumes-grid-luxury">
                                {recommendations.map((rec, idx) => (
                                    <div key={idx} className="perfume-card-luxury glass-premium" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        <div className="card-media-luxury">
                                            {rec.perfume.image_url ? (
                                                <img src={rec.perfume.image_url} alt={rec.perfume.name} />
                                            ) : (
                                                <div className="img-placeholder"><Compass size={32} strokeWidth={1} /></div>
                                            )}
                                            <div className="match-tag-luxury">
                                                <Star size={12} fill="currentColor" />
                                                <span>{rec.match_percentage}% AFFINITÉ</span>
                                            </div>
                                        </div>
                                        <div className="card-body-luxury">
                                            <h3 className="font-serif">{rec.perfume.name}</h3>
                                            <p className="perfume-category-luxury">{rec.perfume.category?.name || 'Fragrance d\'Exception'}</p>
                                            <p className="perfume-notes-luxury">{rec.perfume.notes?.substring(0, 80)}...</p>
                                            <div className="card-footer-luxury">
                                                <span className="perfume-price-luxury">{rec.perfume.price} €</span>
                                                <button onClick={() => navigate(`/perfumes/${rec.perfume.id}`)} className="btn-view-luxury">
                                                    EXPLORER <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-luxury glass-premium">
                                <Compass size={48} className="gold-icon op-2" />
                                <h3 className="font-serif">VOTRE PORTRAIT EST ENCORE VOILÉ</h3>
                                <p>Découvrez nos créations pour que nous puissions identifier vos affinités.</p>
                                <button onClick={() => navigate('/perfumes')} className="btn-premium">DÉBUTER LE VOYAGE</button>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'viewed' && (
                    <section className="tab-panel-luxury animate-fade-in-up">
                        {viewed_perfumes.length > 0 ? (
                            <div className="perfumes-grid-luxury">
                                {viewed_perfumes.map((item, idx) => (
                                    <div key={idx} className="perfume-card-luxury glass-premium" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        <div className="card-media-luxury">
                                            <img src={item.perfume.image_url} alt={item.perfume.name} />
                                            <div className="view-tag-luxury">
                                                <Eye size={12} />
                                                <span>{item.view_count} PASSAGES</span>
                                            </div>
                                        </div>
                                        <div className="card-body-luxury">
                                            <h3 className="font-serif">{item.perfume.name}</h3>
                                            <p className="last-seen-luxury">Dernière visite: {new Date(item.last_viewed_at).toLocaleDateString()}</p>
                                            <div className="card-footer-luxury">
                                                <span className="perfume-price-luxury">{item.perfume.price} €</span>
                                                <button onClick={() => navigate(`/perfumes/${item.perfume.id}`)} className="btn-view-luxury">
                                                    REVOIR <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-luxury glass-premium">
                                <Eye size={48} className="gold-icon op-2" />
                                <h3 className="font-serif">AUCUNE EXPLORATION RÉCENTE</h3>
                                <p>Le sillage de vos recherches passées s'est dissipé.</p>
                                <button onClick={() => navigate('/perfumes')} className="btn-premium">FLÂNER DANS LA BOUTIQUE</button>
                            </div>
                        )}
                    </section>
                )}

            </div>

            <style>{`
                .recommendations-page-luxury { padding-top: 4rem; padding-bottom: 8rem; }
                .page-header-luxury { text-align: center; margin-bottom: 5rem; }
                .page-header-luxury h5 { letter-spacing: 5px; margin-bottom: 1rem; }
                .page-header-luxury h1 { font-size: 3.5rem; }

                .recommendations-tabs-luxury {
                    display: flex;
                    justify-content: center;
                    gap: 1.5rem;
                    padding: 0.5rem;
                    border-radius: 50px;
                    max-width: fit-content;
                    margin: 0 auto 5rem auto;
                }

                .tab-btn-luxury {
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.4);
                    padding: 1rem 2.5rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .tab-btn-luxury:hover { color: #fff; }
                .tab-btn-luxury.active {
                    background: var(--grad-gold);
                    color: #000;
                    box-shadow: 0 5px 15px var(--primary-glow);
                }

                .tab-count {
                    background: rgba(255,255,255,0.1);
                    color: inherit;
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.65rem;
                }
                .tab-btn-luxury.active .tab-count { background: rgba(0,0,0,0.1); }

                .perfumes-grid-luxury {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 2.5rem;
                }

                .perfume-card-luxury {
                    border-radius: 20px;
                    overflow: hidden;
                    transition: 0.4s;
                }
                .perfume-card-luxury:hover { transform: translateY(-10px); border-color: var(--primary); }

                .card-media-luxury {
                    height: 300px;
                    position: relative;
                    overflow: hidden;
                    background: var(--glass-hover);
                }
                .card-media-luxury img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s; }
                .perfume-card-luxury:hover .card-media-luxury img { transform: scale(1.1); }

                .match-tag-luxury, .view-tag-luxury, .qty-tag-luxury {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    padding: 0.5rem 1.25rem;
                    border-radius: 50px;
                    font-size: 0.65rem;
                    font-weight: 900;
                    letter-spacing: 1px;
                    background: var(--grad-gold);
                    color: #000;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                }
                .view-tag-luxury { background: #000; color: var(--primary); border: 1px solid var(--primary); }
                .qty-tag-luxury { background: rgba(255,255,255,0.9); color: #000; }

                .card-body-luxury { padding: 2rem; }
                .card-body-luxury h3 { font-size: 1.4rem; margin-bottom: 0.5rem; letter-spacing: 1px; }
                
                .perfume-category-luxury, .last-seen-luxury, .order-ref-luxury { 
                    font-size: 0.7rem; 
                    font-weight: 800; 
                    letter-spacing: 1px; 
                    color: var(--primary); 
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                }
                .perfume-notes-luxury { font-size: 0.85rem; opacity: 0.5; line-height: 1.6; margin-bottom: 2rem; }

                .card-footer-luxury {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--glass-border);
                }
                .perfume-price-luxury { font-size: 1.5rem; font-weight: 900; color: #fff; }
                
                .btn-view-luxury {
                    background: none; border: none; color: var(--primary);
                    font-size: 0.7rem; font-weight: 800; letter-spacing: 2px;
                    cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
                    transition: 0.3s;
                }
                .btn-view-luxury:hover { transform: translateX(5px); opacity: 0.8; }

                .empty-state-luxury {
                    padding: 6rem 2rem;
                    text-align: center;
                    border-radius: 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }
                .empty-state-luxury h3 { font-size: 1.8rem; letter-spacing: 2px; }
                .empty-state-luxury p { opacity: 0.5; max-width: 400px; margin-bottom: 1.5rem; }

                .img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--primary); }
                .op-2 { opacity: 0.2; }

                @media (max-width: 768px) {
                    .recommendations-tabs-luxury { flex-direction: column; width: 100%; border-radius: 20px; }
                    .tab-btn-luxury { width: 100%; justify-content: space-between; }
                }

                .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Recommendations;
