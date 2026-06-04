import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api';

const OnboardingSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const [tenant, setTenant] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const sessionId = searchParams.get('session_id');
                
                // Get tenant from localStorage
                const storedTenant = localStorage.getItem('onboarding_tenant');
                if (storedTenant) {
                    setTenant(JSON.parse(storedTenant));
                }

                // In real scenario, verify payment with backend
                // For now, assume success
                setStatus('success');

                // Cleanup onboarding data
                setTimeout(() => {
                    localStorage.removeItem('onboarding_tenant');
                    localStorage.removeItem('onboarding_plan');
                }, 3000);
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [searchParams]);

    const handleAccessDashboard = () => {
        if (tenant) {
            // Redirect to tenant domain
            window.location.href = `https://${tenant.domain}.aura-saas.com/tenant/dashboard`;
        }
    };

    if (status === 'loading') {
        return (
            <div className="success-container">
                <div className="success-card">
                    <div className="loader"></div>
                    <p>Vérification de votre paiement...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="success-container">
                <div className="success-card error">
                    <AlertCircle size={64} />
                    <h1>Erreur lors de la vérification</h1>
                    <p>Nous avons rencontré un problème. Veuillez contacter le support.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="success-container">
            <div className="success-card success">
                <div className="success-icon">
                    <CheckCircle size={80} />
                </div>

                <h1>Bienvenue dans AURA! 🎉</h1>
                <p className="success-subtitle">
                    Votre entreprise et votre abonnement sont maintenant actifs.
                </p>

                <div className="success-info">
                    <div className="info-item">
                        <span className="info-label">Entreprise</span>
                        <span className="info-value">{tenant?.name}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Domaine</span>
                        <span className="info-value">{tenant?.domain}.aura-saas.com</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Plan</span>
                        <span className="info-value capitalize">{tenant?.subscription?.plan || 'Starter'}</span>
                    </div>
                </div>

                <div className="next-steps">
                    <h3>Prochaines étapes</h3>
                    <ol>
                        <li>Accédez à votre tableau de bord</li>
                        <li>Invitez vos collaborateurs</li>
                        <li>Importez votre catalogue produit</li>
                        <li>Configurez vos paramètres</li>
                    </ol>
                </div>

                <button
                    onClick={handleAccessDashboard}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: '2rem' }}
                >
                    Accéder au tableau de bord <ArrowRight size={18} />
                </button>

                <div className="success-note">
                    <p>✓ Vos données sont sécurisées et isolées</p>
                    <p>✓ Support disponible 24/7</p>
                    <p>✓ Mise à jour automatique incluse</p>
                </div>
            </div>

            <style>{`
                .success-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, #d1fae5 0%, var(--bg-body) 100%);
                }

                .success-card {
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    width: 100%;
                    max-width: 550px;
                    padding: 2.5rem;
                    text-align: center;
                }

                .success-card.error {
                    background: linear-gradient(135deg, #fee2e2 0%, var(--bg-surface) 100%);
                }

                .loader {
                    width: 50px;
                    height: 50px;
                    border: 4px solid var(--border-light);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1.5rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .success-icon {
                    color: var(--success);
                    margin-bottom: 1.5rem;
                    animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .success-card h1 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: var(--text-main);
                }

                .success-subtitle {
                    color: var(--text-muted);
                    font-size: 1rem;
                    margin-bottom: 2rem;
                }

                .success-info {
                    background: var(--bg-alt);
                    border-radius: var(--radius-md);
                    padding: 1.5rem;
                    margin: 2rem 0;
                    text-align: left;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .info-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text-main);
                }

                .capitalize {
                    text-transform: capitalize;
                }

                .next-steps {
                    text-align: left;
                    background: var(--bg-alt);
                    border-left: 4px solid var(--primary);
                    padding: 1.5rem;
                    border-radius: var(--radius-md);
                    margin: 1.5rem 0;
                }

                .next-steps h3 {
                    margin: 0 0 1rem 0;
                    color: var(--text-main);
                    font-size: 0.95rem;
                }

                .next-steps ol {
                    margin: 0;
                    padding-left: 1.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    line-height: 1.8;
                }

                .next-steps li {
                    margin-bottom: 0.5rem;
                }

                .btn-lg {
                    padding: 1rem 1.5rem;
                    font-size: 1rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                }

                .success-note {
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

                .success-note p {
                    margin: 0;
                }

                @media (max-width: 600px) {
                    .success-card {
                        padding: 1.5rem;
                    }

                    .success-card h1 {
                        font-size: 1.5rem;
                    }

                    .success-info {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default OnboardingSuccess;
