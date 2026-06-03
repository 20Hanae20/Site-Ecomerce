import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
            const response = await axios.post(`http://${window.location.hostname}:8000/api/login`, formData);
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
        <div className="container-premium auth-section-luxury">
            <div className="auth-card-premium glass-premium animate-fade-in">
                <div className="auth-header-luxury">
                    <h1 className="font-serif gradient-text-gold">CONNEXION</h1>
                    <p className="auth-subtitle">Retrouvez votre sillage personnel.</p>
                </div>

                <form onSubmit={handleSubmit} className="premium-form">
                    {message && (
                        <div className={`premium-alert ${message.includes('réussie') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <div className="premium-input-group">
                        <label>VOTRE EMAIL</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="votre@email.com"
                            required
                        />
                        {errors.email && <span className="error-hint">{errors.email[0]}</span>}
                    </div>

                    <div className="premium-input-group">
                        <label>MOT DE PASSE</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password && <span className="error-hint">{errors.password[0]}</span>}
                    </div>

                    <button type="submit" className="btn-premium btn-auth-luxury" disabled={isLoading}>
                        {isLoading ? 'TRAITEMENT...' : 'S\'IDENTIFIER'}
                    </button>

                    <div className="auth-links-luxury">
                        <Link to="/forgot-password">Mot de passe oublié ?</Link>
                        <p>Pas encore membre ? <Link to="/register" className="gold-link">Créer un compte</Link></p>
                    </div>
                </form>
            </div>

            <style>{`
                .auth-section-luxury {
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 1rem;
                }

                .auth-card-premium {
                    width: 100%;
                    max-width: 500px;
                    padding: 4rem;
                    border-radius: 12px;
                    text-align: center;
                    background: var(--bg-card);
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--glass-border);
                }

                .auth-header-luxury h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    letter-spacing: 2px;
                    color: var(--text-primary);
                }

                .auth-subtitle {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    margin-bottom: 3rem;
                }

                .premium-form {
                    text-align: left;
                }

                .premium-input-group {
                    margin-bottom: 2rem;
                }

                .premium-input-group label {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .premium-input-group input {
                    width: 100%;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    padding: 1rem;
                    color: var(--text-primary);
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .premium-input-group input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .btn-auth-luxury {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1rem;
                    margin-bottom: 2rem;
                }

                .auth-links-luxury {
                    text-align: center;
                    font-size: 0.9rem;
                }

                .auth-links-luxury a {
                    color: var(--text-secondary);
                    text-decoration: none;
                    display: block;
                    margin-bottom: 1rem;
                }

                .auth-links-luxury a:hover {
                    color: var(--primary);
                }

                .gold-link {
                    color: var(--primary) !important;
                    font-weight: 600;
                }

                .premium-alert {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                    font-size: 0.9rem;
                    background: #f8fafc;
                }

                .premium-alert.success { border: 1px solid #22c55e; color: #16a34a; background: #f0fdf4; }
                .premium-alert.error { border: 1px solid #ef4444; color: #dc2626; background: #fef2f2; }

                .error-hint {
                    font-size: 0.8rem;
                    color: #dc2626;
                    margin-top: 0.5rem;
                    display: block;
                }

                @media (max-width: 480px) {
                    .auth-card-premium { padding: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default Login;
