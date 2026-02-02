import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Package, ArrowRight, ShoppingBag, Clock, Truck } from 'lucide-react';

const PaymentConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { success, orderId, transactionId, failureReason } = location.state || {};

    useEffect(() => {
        if (!orderId) {
            navigate('/');
        }
    }, [orderId, navigate]);

    if (success) {
        return (
            <div className="container-premium confirmation-page-luxury animate-fade-in">
                <div className="confirmation-hero-luxury">
                    <div className="success-lume-luxury">
                        <CheckCircle2 size={80} className="gold-rose" strokeWidth={1} />
                    </div>
                    <h5 className="gradient-text-gold font-serif">EXPÉRIENCE RÉUSSIE</h5>
                    <h1 className="font-serif">Votre Sillage est <span className="gradient-text-gold">Confirmé</span></h1>
                </div>

                <div className="confirmation-grid-luxury">
                    <div className="confirmation-card-column">
                        <div className="premium-card detail-card-luxury">
                            <h3 className="font-serif">RÉCÉPISSÉ DE TRANSACTION</h3>
                            <div className="summary-divider-luxury"></div>

                            <div className="confirmation-detail-row">
                                <label>RÉFÉRENCE</label>
                                <span>{transactionId || `ORD-${orderId}`}</span>
                            </div>
                            <div className="confirmation-detail-row">
                                <label>COMMANDE</label>
                                <span>#{orderId}</span>
                            </div>
                            <div className="confirmation-detail-row">
                                <label>STATUT</label>
                                <span className="status-badge success">PAYÉ ACCEPTE</span>
                            </div>
                        </div>

                        <div className="next-steps-luxury glass-premium">
                            <h4 className="font-serif">PROCHAINES ÉTAPES</h4>
                            <div className="step-item-luxury">
                                <div className="step-icon-luxury"><Clock size={16} /></div>
                                <p>Confirmation envoyée par courrier électronique immédiat.</p>
                            </div>
                            <div className="step-item-luxury">
                                <div className="step-icon-luxury"><Package size={16} /></div>
                                <p>Préparation artisanale de votre coffret sous 24h.</p>
                            </div>
                            <div className="step-item-luxury">
                                <div className="step-icon-luxury"><Truck size={16} /></div>
                                <p>Notification d'expédition avec suivi en temps réel.</p>
                            </div>
                        </div>
                    </div>

                    <aside className="confirmation-actions-column">
                        <div className="actions-glass-luxury glass-premium">
                            <p className="aesthetic-quote font-serif">"Le parfum est le frère de la respiration."</p>
                            <Link to={`/orders/${orderId}`} className="btn-premium w-full text-center">
                                SUIVRE MA COMMANDE <ArrowRight size={18} />
                            </Link>
                            <Link to="/perfumes" className="btn-outline-luxury">
                                <ShoppingBag size={18} /> CONTINUER L'EXPLORATION
                            </Link>
                        </div>
                    </aside>
                </div>

                <style>{`
                    .confirmation-page-luxury { padding-top: 6rem; padding-bottom: 8rem; }
                    .confirmation-hero-luxury { text-align: center; margin-bottom: 6rem; }
                    .success-lume-luxury { width: 120px; height: 120px; margin: 0 auto 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
                    .success-lume-luxury::after { content: ''; position: absolute; inset: -10px; border: 1px solid var(--primary); border-radius: 50%; opacity: 0.3; animation: pulse-gold 2s infinite; }
                    
                    @keyframes pulse-gold { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.3); opacity: 0; } }

                    .confirmation-hero-luxury h1 { font-size: 4rem; margin-top: 1rem; }
                    
                    .confirmation-grid-luxury { display: grid; grid-template-columns: 1fr 400px; gap: 4rem; max-width: 1000px; margin: 0 auto; }
                    
                    .detail-card-luxury { padding: 3rem; border-radius: 24px; }
                    .detail-card-luxury h3 { font-size: 1.2rem; letter-spacing: 3px; margin-bottom: 2rem; }
                    
                    .confirmation-detail-row { display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.85rem; }
                    .confirmation-detail-row label { opacity: 0.5; letter-spacing: 2px; font-weight: 700; }
                    .confirmation-detail-row span { font-weight: 700; color: var(--text-primary); }
                    
                    .status-badge.success { color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); background: rgba(34, 197, 94, 0.05); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; }

                    .next-steps-luxury { margin-top: 2rem; padding: 2.5rem; border-radius: 20px; }
                    .next-steps-luxury h4 { font-size: 1rem; letter-spacing: 2px; margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; }
                    .step-item-luxury { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; align-items: flex-start; }
                    .step-icon-luxury { color: var(--primary); margin-top: 0.2rem; }
                    .step-item-luxury p { font-size: 0.85rem; opacity: 0.7; line-height: 1.5; }

                    .actions-glass-luxury { padding: 3rem; border-radius: 24px; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 2rem; text-align: center; }
                    .aesthetic-quote { font-style: italic; opacity: 0.5; font-size: 1.1rem; line-height: 1.6; margin-bottom: 1rem; }
                    
                    .btn-outline-luxury { border: 1px solid var(--glass-border); color: #fff; text-decoration: none; padding: 1.25rem; border-radius: 12px; font-size: 0.8rem; letter-spacing: 2px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 1rem; transition: 0.3s; }
                    .btn-outline-luxury:hover { background: var(--glass-hover); border-color: var(--primary); }

                    @media (max-width: 900px) {
                        .confirmation-grid-luxury { grid-template-columns: 1fr; }
                        .confirmation-actions-column { order: -1; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="container-premium confirmation-page-luxury animate-fade-in failure">
            <div className="confirmation-hero-luxury">
                <div className="failure-lume-luxury">
                    <XCircle size={80} className="error-red" strokeWidth={1} />
                </div>
                <h5 className="font-serif" style={{ color: '#ef4444' }}>INCIDENT DE PARCOURS</h5>
                <h1 className="font-serif">Le Paiement a été <span style={{ color: '#ef4444' }}>Interrompu</span></h1>
            </div>

            <div className="confirmation-grid-luxury" style={{ maxWidth: '600px' }}>
                <div className="premium-card error-card-luxury" style={{ padding: '3rem', width: '100%' }}>
                    <p className="confirmation-message" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        Votre transaction n'a pas pu être finalisée pour la raison suivante :
                    </p>
                    <div className="error-box-luxury glass-premium" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '3rem' }}>
                        <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: '700' }}>{failureReason || 'Une exception technique est survenue.'}</p>
                    </div>

                    <div className="action-buttons-luxury" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to={`/checkout`} state={{ orderId }} className="btn-premium text-center">
                            RÉESSAYER LE RÈGLEMENT
                        </Link>
                        <Link to="/cart" className="btn-outline-luxury">
                            RETOUR AU PANIER
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmation;
