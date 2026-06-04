import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import api from '../services/api';

const ChoosePlan = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/subscription/plans');
                setPlans(response.data.plans || []);
                setSelectedPlan(response.data.plans[0]?.id);
            } catch (err) {
                console.error('Error fetching plans:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleContinue = () => {
        const tenant = JSON.parse(localStorage.getItem('onboarding_tenant'));
        localStorage.setItem('onboarding_plan', selectedPlan);
        navigate('/onboarding/checkout');
    };

    if (loading) {
        return (
            <div className="onboarding-container">
                <div className="onboarding-card">
                    <p style={{ textAlign: 'center' }}>Chargement des plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <div className="onboarding-header">
                    <div className="step-indicator">
                        <div className="step-badge">1</div>
                        <div className="step-badge active">2</div>
                        <div className="step-badge">3</div>
                        <span>Choisir un plan</span>
                    </div>
                    <h1>Sélectionnez votre formule</h1>
                    <p className="onboarding-subtitle">
                        Choisissez le plan adapté à vos besoins. Vous pourrez changer à tout moment.
                    </p>
                </div>

                <div className="plans-grid">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.recommended ? 'recommended' : ''}`}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {plan.recommended && (
                                <div className="plan-badge">Recommandé</div>
                            )}

                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price">
                                {plan.price === 0 ? (
                                    <span className="price-free">Gratuit</span>
                                ) : (
                                    <>
                                        <span className="price-amount">{plan.price}€</span>
                                        <span className="price-period">/mois</span>
                                    </>
                                )}
                            </div>

                            <ul className="plan-features">
                                {plan.features?.map((feature, idx) => (
                                    <li key={idx}>
                                        <Check size={16} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {plan.limitations && (
                                <div className="plan-limitations">
                                    <p className="limitation-label">Limitations:</p>
                                    <ul>
                                        {Object.entries(plan.limitations).map(([key, value]) => (
                                            <li key={key}>
                                                {key}: {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                type="button"
                                className={`btn ${selectedPlan === plan.id ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ width: '100%', marginTop: '1.5rem' }}
                            >
                                {selectedPlan === plan.id ? '✓ Sélectionné' : 'Choisir'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="onboarding-actions">
                    <button
                        onClick={() => navigate('/onboarding/company')}
                        className="btn btn-secondary"
                    >
                        Retour
                    </button>
                    <button
                        onClick={handleContinue}
                        className="btn btn-primary"
                    >
                        Continuer <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <style>{`
                .onboarding-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-body) 100%);
                }

                .onboarding-card {
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    width: 100%;
                    max-width: 1000px;
                    padding: 2.5rem;
                }

                .onboarding-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .step-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .step-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--bg-alt);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: var(--text-main);
                    font-size: 0.85rem;
                }

                .step-badge.active {
                    background: var(--primary);
                    color: white;
                }

                .onboarding-header h1 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .onboarding-subtitle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }

                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin: 2rem 0;
                }

                .plan-card {
                    position: relative;
                    padding: 2rem;
                    border: 2px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .plan-card:hover {
                    box-shadow: var(--shadow-md);
                }

                .plan-card.selected {
                    border-color: var(--primary);
                    background: var(--primary-light);
                }

                .plan-card.recommended {
                    transform: scale(1.05);
                    box-shadow: var(--shadow-lg);
                }

                .plan-badge {
                    position: absolute;
                    top: -12px;
                    right: 1.5rem;
                    padding: 0.4rem 1rem;
                    background: var(--primary);
                    color: white;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .plan-name {
                    font-size: 1.4rem;
                    margin-bottom: 0.75rem;
                    color: var(--text-main);
                }

                .plan-price {
                    margin-bottom: 1.5rem;
                }

                .price-free {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--primary);
                }

                .price-amount {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--primary);
                }

                .price-period {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    margin-left: 0.5rem;
                }

                .plan-features {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 1.5rem 0;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .plan-features li {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--text-main);
                    font-size: 0.9rem;
                }

                .plan-features svg {
                    color: var(--success);
                    flex-shrink: 0;
                }

                .plan-limitations {
                    padding: 1rem;
                    background: var(--bg-alt);
                    border-radius: var(--radius-md);
                    margin-bottom: 1rem;
                }

                .limitation-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin: 0 0 0.5rem 0;
                }

                .plan-limitations ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .plan-limitations li {
                    margin: 0.25rem 0;
                }

                .onboarding-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: space-between;
                    margin-top: 2rem;
                }

                .onboarding-actions .btn {
                    flex: 1;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                @media (max-width: 600px) {
                    .onboarding-card {
                        padding: 1.5rem;
                    }

                    .plans-grid {
                        grid-template-columns: 1fr;
                    }

                    .plan-card.recommended {
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default ChoosePlan;
