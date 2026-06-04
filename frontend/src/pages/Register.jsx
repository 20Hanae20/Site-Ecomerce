import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setMessage('');

        try {
            await api.post('/register', formData);
            setMessage("Compte créé avec succès");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setMessage("Une erreur est survenue lors de l'inscription.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            <div className="auth-form-side">
                <div className="auth-form-container" style={{ maxWidth: '450px' }}>
                    <Link to="/" className="back-link">
                        <ArrowLeft size={16} /> Retour au site
                    </Link>

                    <div className="auth-header">
                        <div className="brand-logo mb-4">
                            <span className="brand-icon">❖</span>
                            <span className="brand-text">AURA SaaS</span>
                        </div>
                        <h1>Créer un compte</h1>
                        <p className="text-muted">Commencez votre essai gratuit de 14 jours. Aucune carte de crédit requise.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="saas-form">
                        {message && (
                            <div className={`alert ${message.includes('succès') ? 'alert-success' : 'alert-danger'}`}>
                                {message}
                            </div>
                        )}

                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="first_name">Prénom</label>
                                <input id="first_name" type="text" name="first_name" className="form-input" value={formData.first_name} onChange={handleChange} placeholder="Jean" required />
                                {errors.first_name && <span className="error-text">{errors.first_name[0]}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="last_name">Nom</label>
                                <input id="last_name" type="text" name="last_name" className="form-input" value={formData.last_name} onChange={handleChange} placeholder="Dupont" required />
                                {errors.last_name && <span className="error-text">{errors.last_name[0]}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Adresse Email Pro</label>
                            <input id="email" type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="jean.dupont@entreprise.com" required />
                            {errors.email && <span className="error-text">{errors.email[0]}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Mot de passe</label>
                            <input id="password" type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                            {errors.password && <span className="error-text">{errors.password[0]}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password_confirmation">Confirmer le mot de passe</label>
                            <input id="password_confirmation" type="password" name="password_confirmation" className="form-input" value={formData.password_confirmation} onChange={handleChange} placeholder="••••••••" required />
                        </div>

                        <button type="submit" className="btn btn-primary w-100 mt-2" disabled={isLoading}>
                            {isLoading ? 'Création en cours...' : 'Démarrer gratuitement'}
                        </button>

                        <div className="auth-footer text-center mt-5">
                            <p className="text-muted">
                                Vous avez déjà un compte ? <Link to="/login" className="text-primary font-medium">Se connecter</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            <div className="auth-illustration-side">
                <div className="illustration-content animate-fade-up">
                    <h2>Boostez la gestion de votre parfumerie</h2>
                    <p>Rejoignez des centaines de distributeurs qui optimisent leurs opérations avec AURA SaaS.</p>
                    
                    <ul className="benefit-list">
                        <li><CheckCircle size={20} /> Catalogue centralisé (PIM)</li>
                        <li><CheckCircle size={20} /> Gestion des stocks multi-boutiques</li>
                        <li><CheckCircle size={20} /> API et intégrations (ERP, CRM)</li>
                        <li><CheckCircle size={20} /> Support client dédié 24/7</li>
                    </ul>

                    <div className="saas-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                                MS
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Marie Simon</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Fondatrice, Parfums Rares</div>
                            </div>
                        </div>
                        <p style={{ fontStyle: 'italic', fontSize: '0.95rem', margin: 0, opacity: 0.9 }}>
                            "L'implémentation de cet outil a divisé par deux notre temps de gestion d'inventaire. Le ROI a été immédiat."
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .auth-split-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--bg-surface);
                }

                .auth-form-side {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 2rem;
                }

                .auth-form-container {
                    width: 100%;
                    margin: 0 auto;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: 2rem;
                    transition: color var(--transition-fast);
                }

                .back-link:hover {
                    color: var(--text-main);
                }

                .auth-header {
                    margin-bottom: 2rem;
                }

                .auth-header h1 {
                    font-size: 1.875rem;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.5px;
                }

                .brand-logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .brand-icon {
                    color: var(--primary);
                    font-size: 1.5rem;
                }
                .brand-text {
                    font-weight: 700;
                    font-size: 1.25rem;
                    color: var(--text-main);
                }

                .alert {
                    padding: 0.875rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                }
                .alert-success {
                    background: var(--success-bg);
                    color: var(--success);
                    border: 1px solid #a7f3d0;
                }
                .alert-danger {
                    background: var(--danger-bg);
                    color: var(--danger);
                    border: 1px solid #fecaca;
                }

                .w-100 { width: 100%; }
                .font-medium { font-weight: 500; }
                .text-primary { color: var(--primary); text-decoration: none; }
                .text-primary:hover { text-decoration: underline; }

                .error-text {
                    color: var(--danger);
                    font-size: 0.75rem;
                    margin-top: 0.25rem;
                    display: block;
                }

                /* Illustration Side */
                .auth-illustration-side {
                    flex: 1.2;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    position: relative;
                    overflow: hidden;
                }

                .auth-illustration-side::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
                }

                .illustration-content {
                    position: relative;
                    z-index: 10;
                    max-width: 480px;
                }

                .illustration-content h2 {
                    color: white;
                    font-size: 2.5rem;
                    line-height: 1.2;
                    margin-bottom: 1rem;
                }

                .illustration-content p {
                    color: rgba(255,255,255,0.8);
                    font-size: 1.125rem;
                    margin-bottom: 2.5rem;
                    line-height: 1.6;
                }

                .benefit-list {
                    list-style: none;
                    margin-bottom: 3rem;
                }

                .benefit-list li {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    font-size: 1rem;
                    font-weight: 500;
                }

                .benefit-list svg {
                    color: #a7f3d0;
                }

                @media (max-width: 992px) {
                    .auth-illustration-side {
                        display: none;
                    }
                    .form-row { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default Register;
