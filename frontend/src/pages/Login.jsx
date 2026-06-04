import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
            const response = await api.post('/login', formData);
            localStorage.setItem('token', response.data.access_token);
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));

            setMessage("Connexion réussie");

            const isStaff = ['admin', 'super_admin', 'moderateur', 'gestionnaire'].includes(user.role);

            setTimeout(() => {
                if (isStaff) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }, 1000);
        } catch (err) {
            if (err.response?.status === 401) {
                setMessage("Identifiants invalides.");
            } else if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setMessage("Une erreur est survenue.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            <div className="auth-form-side">
                <div className="auth-form-container">
                    <Link to="/" className="back-link">
                        <ArrowLeft size={16} /> Retour au site
                    </Link>

                    <div className="auth-header">
                        <div className="brand-logo mb-4">
                            <span className="brand-icon">❖</span>
                            <span className="brand-text">AURA SaaS</span>
                        </div>
                        <h1>Bon retour !</h1>
                        <p className="text-muted">Connectez-vous pour accéder à votre tableau de bord.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="saas-form">
                        {message && (
                            <div className={`alert ${message.includes('réussie') ? 'alert-success' : 'alert-danger'}`}>
                                {message}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Adresse Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="nom@entreprise.com"
                                required
                            />
                            {errors.email && <span className="error-text">{errors.email[0]}</span>}
                        </div>

                        <div className="form-group">
                            <div className="flex justify-between items-center mb-1">
                                <label className="form-label mb-0" htmlFor="password">Mot de passe</label>
                                <Link to="/forgot-password" className="forgot-link">Oublié ?</Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && <span className="error-text">{errors.password[0]}</span>}
                        </div>

                        <button type="submit" className="btn btn-primary w-100 mt-4" disabled={isLoading}>
                            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>

                        <div className="auth-footer text-center mt-5">
                            <p className="text-muted">
                                Vous n'avez pas de compte ? <Link to="/register" className="text-primary font-medium">Créer un compte</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            <div className="auth-illustration-side">
                <div className="illustration-content animate-fade-up">
                    <h2>La plateforme de référence pour les distributeurs.</h2>
                    <p>Découvrez comment nos outils d'IA et de gestion simplifient votre activité commerciale au quotidien.</p>
                    
                    <ul className="benefit-list">
                        <li><CheckCircle size={20} /> Synchronisation des stocks en temps réel</li>
                        <li><CheckCircle size={20} /> Suggestions de parfums basées sur l'IA</li>
                        <li><CheckCircle size={20} /> Sécurité et Multi-Tenancy natifs</li>
                    </ul>

                    <div className="testimonial-card">
                        <p className="quote">"Depuis que nous utilisons AURA SaaS, notre gestion d'inventaire multi-sites est devenue un jeu d'enfant."</p>
                        <div className="author">- Jean Dupont, Directeur Retail</div>
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
                    max-width: 400px;
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
                    margin-bottom: 3rem;
                    transition: color var(--transition-fast);
                }

                .back-link:hover {
                    color: var(--text-main);
                }

                .auth-header {
                    margin-bottom: 2.5rem;
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

                .forgot-link {
                    font-size: 0.875rem;
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 500;
                }

                .w-100 { width: 100%; }
                .mb-0 { margin-bottom: 0 !important; }
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

                .testimonial-card {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .quote {
                    font-style: italic;
                    margin-bottom: 1rem !important;
                    font-size: 1rem !important;
                    color: white !important;
                }

                .author {
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                @media (max-width: 992px) {
                    .auth-illustration-side {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
