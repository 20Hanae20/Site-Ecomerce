import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        code: '',
        password: '',
        password_confirmation: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/reset-password', formData);
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-premium auth-section-luxury">
            <div className="auth-card-premium glass-premium animate-fade-in">
                <div className="auth-header-luxury">
                    <h1 className="font-serif gradient-text-gold">RÉINITIALISATION</h1>
                    <p className="auth-subtitle">Entrez le code reçu et votre nouveau mot de passe.</p>
                </div>

                {message && <div className="premium-alert success">{message}</div>}
                {error && <div className="premium-alert error">{error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit} className="premium-form">
                        <div className="premium-input-group">
                            <label>EMAIL</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="premium-input-group">
                            <label>CODE DE VÉRIFICATION (6 CHIFFRES)</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                                maxLength="6"
                                placeholder="123456"
                            />
                        </div>
                        <div className="premium-input-group">
                            <label>NOUVEAU MOT DE PASSE</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="premium-input-group">
                            <label>CONFIRMER LE MOT DE PASSE</label>
                            <input
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="btn-premium btn-auth-luxury" disabled={isLoading}>
                            {isLoading ? 'TRAITEMENT...' : 'CHANGER LE MOT DE PASSE'}
                        </button>
                    </form>
                )}

                <div className="auth-links-luxury">
                    <Link to="/login" className="gold-link">Retour à la connexion</Link>
                </div>
            </div>

            <style>{`
                .auth-section-luxury {
                    min-height: 85vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 1rem;
                }

                .auth-card-premium {
                    width: 100%;
                    max-width: 500px;
                    padding: 4rem;
                    border-radius: 20px;
                    text-align: center;
                }

                .auth-header-luxury h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    letter-spacing: 4px;
                }

                .auth-subtitle {
                    font-size: 0.9rem;
                    opacity: 0.6;
                    margin-bottom: 3rem;
                    letter-spacing: 1px;
                }

                .premium-form {
                    text-align: left;
                }

                .premium-input-group {
                    margin-bottom: 1.5rem;
                }

                .premium-input-group label {
                    display: block;
                    font-size: 0.7rem;
                    letter-spacing: 2px;
                    color: var(--primary);
                    margin-bottom: 0.8rem;
                    font-weight: 600;
                }

                .premium-input-group input {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--glass-border);
                    padding: 1rem;
                    color: #fff;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .premium-input-group input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(255,255,255,0.05);
                    box-shadow: 0 0 15px var(--glass-glow);
                }

                .btn-auth-luxury {
                    width: 100%;
                    padding: 1.2rem;
                    font-size: 1rem;
                    margin-top: 1rem;
                    margin-bottom: 2.5rem;
                }

                .auth-links-luxury {
                    text-align: center;
                    font-size: 0.85rem;
                }

                .auth-links-luxury a {
                    color: var(--text-secondary);
                    text-decoration: none;
                    display: block;
                    transition: color 0.3s ease;
                }

                .auth-links-luxury a:hover {
                    color: var(--primary);
                }

                .gold-link {
                    color: var(--primary) !important;
                    display: inline !important;
                    font-weight: 600;
                }

                .premium-alert {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                    font-size: 0.85rem;
                    border-left: 4px solid;
                    background: rgba(255,255,255,0.05);
                    text-align: left;
                }

                .premium-alert.success { border-color: #22c55e; color: #22c55e; }
                .premium-alert.error { border-color: #ef4444; color: #ef4444; }

                @media (max-width: 480px) {
                    .auth-card-premium { padding: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;
