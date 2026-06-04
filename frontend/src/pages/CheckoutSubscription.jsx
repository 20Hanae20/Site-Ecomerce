import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowRight } from 'lucide-react';
import api from '../services/api';

const CheckoutSubscription = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [plan, setPlan] = useState(null);

    useEffect(() => {
        const storedTenant = localStorage.getItem('onboarding_tenant');
        const storedPlan = localStorage.getItem('onboarding_plan');

        if (storedTenant) setTenant(JSON.parse(storedTenant));
        if (storedPlan) setPlan(storedPlan);

        if (!storedTenant || !storedPlan) {
            navigate('/onboarding/company');
        }
    }, [navigate]);

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            // Initialize tenant context temporarily for checkout
            const response = await api.post('/billing/checkout', {
                plan: plan,
                tenant_id: tenant.id,
            });

            // Redirect to Stripe checkout
            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else if (response.data.session_id) {
                // Fallback for stripe.js redirect
                const stripe = window.Stripe(process.env.REACT_APP_STRIPE_KEY);
                stripe.redirectToCheckout({ sessionId: response.data.session_id });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du paiement');
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <div className="onboarding-header">
                    <div className="step-indicator">
                        <div className="step-badge">1</div>
                        <div className="step-badge">2</div>
                        <div className="step-badge active">3</div>
                        <span>Paiement</span>
                    </div>
                    <h1>Finaliser votre abonnement</h1>
                    <p className="onboarding-subtitle">
                        Sécurisé par Stripe. Paiement immédiat.
                    </p>
                </div>

                <div className="checkout-summary">
                    <div className="summary-section">
                        <h3>Votre commande</h3>
                        <div className="summary-item">
                            <span>Entreprise</span>
                            <span className="summary-value">{tenant?.name}</span>
                        </div>
                        <div className="summary-item">
                            <span>Plan</span>
                            <span className="summary-value">{plan}</span>
                        </div>
                        <div className="summary-divider"></div>
                    </div>

                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                            {error}
                        </div>
                    )}

                    <div className="payment-method">
                        <div className="payment-icon">
                            <CreditCard size={32} />
                        </div>
                        <div className="payment-info">
                            <div className="payment-title">Paiement par Stripe</div>
                            <div className="payment-description">
                                Vous serez redirigé vers Stripe pour compléter votre paiement de manière sécurisée.
                            </div>
                        </div>
                    </div>

                    <div className="security-badge">
                        <span>🔒</span> Paiement 100% sécurisé par SSL
                    </div>
                </div>

                <div className="onboarding-actions">
                    <button
                        onClick={() => navigate('/onboarding/plan')}
                        className="btn btn-secondary"
                    >
                        Retour
                    </button>
                    <button
                        onClick={handleCheckout}
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Redirection...' : (
                            <>
                                Passer au paiement <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>

                <div className="onboarding-note">
                    <p>✓ Vous pouvez annuler à tout moment</p>
                    <p>✓ Pas d'engagement long terme</p>
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
                    max-width: 500px;
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

                .checkout-summary {
                    padding: 1.5rem;
                    background: var(--bg-alt);
                    border-radius: var(--radius-lg);
                    margin: 2rem 0;
                }

                .summary-section h3 {
                    font-size: 0.95rem;
                    margin-bottom: 1rem;
                    color: var(--text-main);
                }

                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .summary-value {
                    font-weight: 600;
                    color: var(--text-main);
                }

                .summary-divider {
                    height: 1px;
                    background: var(--border-light);
                    margin: 1rem 0;
                }

                .alert {
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                }

                .alert-danger {
                    background: var(--danger-bg);
                    color: var(--danger);
                    border: 1px solid #fecaca;
                }

                .payment-method {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    padding: 1.5rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                    margin: 1.5rem 0;
                }

                .payment-icon {
                    color: var(--primary);
                    flex-shrink: 0;
                }

                .payment-info {
                    flex: 1;
                }

                .payment-title {
                    font-weight: 600;
                    color: var(--text-main);
                    margin-bottom: 0.25rem;
                }

                .payment-description {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .security-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: #d1fae5;
                    color: #059669;
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                    justify-content: center;
                }

                .onboarding-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .onboarding-actions .btn {
                    flex: 1;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .onboarding-note {
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: var(--bg-alt);
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .onboarding-note p {
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default CheckoutSubscription;
