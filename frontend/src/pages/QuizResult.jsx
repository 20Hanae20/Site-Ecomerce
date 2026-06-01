import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';

const QuizResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { result } = location.state || {};

    if (!result) {
        return <div className="loader">Aucun résultat. Veuillez refaire le quiz.</div>;
    }

    const { profile, recommendations } = result;

    // Find dominant family
    const dominantFamily = Object.keys(profile).reduce((a, b) => profile[a] > profile[b] ? a : b);

    return (
        <div className="page-container result-page">
            <header className="result-header">
                <h1>Votre Signature Olfactive</h1>
                <p className="dominant-text">
                    Votre profil révèle une affinité pour les notes <span className="highlight">{dominantFamily}es</span>.
                </p>
                <button onClick={() => navigate('/quiz')} className="restart-btn">
                    <RefreshCw size={16} /> Recommencer le test
                </button>
            </header>

            <div className="recommendations-grid">
                {recommendations.length > 0 ? recommendations.map(({ perfume, match_percentage }, index) => (
                    <div key={perfume.id} className="perfume-card premium-card" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="match-badge">
                            {match_percentage}% Compatible
                        </div>
                        <div className="card-image">
                            <img src={perfume.image_url} alt={perfume.name} />
                        </div>
                        <div className="card-info">
                            <h3>{perfume.name}</h3>
                            <p className="notes">{perfume.notes}</p>
                            <div className="price">{perfume.price} €</div>
                            <div className="actions">
                                <Link to={`/perfume/${perfume.id}`} className="details-btn">Découvrir</Link>
                                <button className="add-cart-btn" onClick={() => addToCart(perfume)}>
                                    <ShoppingBag size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <p>Nos alchimistes n'ont pas trouvé de correspondance exacte, mais nous vous invitons à explorer notre catalogue complet.</p>
                        <Link to="/catalogue" className="gold-button">Voir le catalogue</Link>
                    </div>
                )}
            </div>

            <style>{`
                .result-page {
                    padding: 4rem 2rem;
                    text-align: center;
                }
                .result-header {
                    margin-bottom: 4rem;
                }
                .dominant-text {
                    font-size: 1.5rem;
                    color: rgba(255,255,255,0.8);
                }
                .highlight {
                    color: var(--primary);
                    font-weight: bold;
                    text-transform: capitalize;
                }
                .restart-btn {
                    margin-top: 1rem;
                    background: transparent;
                    border: 1px solid var(--primary);
                    color: var(--primary);
                    padding: 0.5rem 1rem;
                    border-radius: 2rem;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s;
                }
                .restart-btn:hover {
                    background: var(--primary);
                    color: black;
                }
                .recommendations-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .premium-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 1rem;
                    overflow: hidden;
                    position: relative;
                    transition: transform 0.3s;
                    animation: fadeInUp 0.6s ease-out forwards;
                    opacity: 0;
                }
                .premium-card:hover {
                    transform: translateY(-10px);
                    border-color: var(--primary);
                }
                .match-badge {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: var(--primary);
                    color: black;
                    padding: 0.3rem 0.8rem;
                    border-radius: 2rem;
                    font-weight: bold;
                    font-size: 0.8rem;
                    z-index: 2;
                }
                .card-image {
                    height: 300px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .card-image img {
                    max-height: 80%;
                    max-width: 80%;
                    object-fit: contain;
                }
                .card-info {
                    padding: 1.5rem;
                    text-align: left;
                }
                .card-info h3 {
                    font-size: 1.2rem;
                    margin-bottom: 0.5rem;
                    color: white;
                }
                .notes {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.6);
                    margin-bottom: 1rem;
                    height: 2.5em;
                    overflow: hidden;
                }
                .price {
                    font-size: 1.2rem;
                    color: var(--primary);
                    margin-bottom: 1rem;
                    font-weight: 600;
                }
                .actions {
                    display: flex;
                    gap: 1rem;
                }
                .details-btn {
                    flex: 1;
                    text-align: center;
                    padding: 0.8rem;
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 0.5rem;
                    color: white;
                    text-decoration: none;
                    transition: all 0.3s;
                }
                .details-btn:hover {
                    background: white;
                    color: black;
                }
                .add-cart-btn {
                    background: var(--primary);
                    border: none;
                    width: 45px;
                    border-radius: 0.5rem;
                    color: black;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                .add-cart-btn:hover {
                    background: #fff;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default QuizResult;
