import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
            localStorage.setItem('auth_token', response.data.access_token);
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            setMessage(response.data.message);

            const isStaff = ['admin', 'super_admin', 'moderateur', 'gestionnaire'].includes(user.role);

            setTimeout(() => {
                if (isStaff) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
                globalThis.location.reload();
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
        <div className="page-container auth-page">
            <div className="auth-card">
                <header className="auth-header">
                    <h1>Connexion</h1>
                    <div className="luxury-divider"></div>
                    <p>Retrouvez votre sillage personnel.</p>
                </header>

                <form onSubmit={handleSubmit} className="minimal-form">
                    {message && (
                        <div className={`alert ${message.includes('succès') ? 'alert-success' : 'alert-error'}`}>
                            {message}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="votre@email.com"
                            required
                        />
                        {errors.email && <span className="error-text">{errors.email[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Votre secret"
                            required
                        />
                        {errors.password && <span className="error-text">{errors.password[0]}</span>}
                    </div>

                    <button type="submit" className="luxury-btn-auth" disabled={isLoading}>
                        {isLoading ? 'Identification...' : "S'identifier"}
                    </button>

                    <div className="auth-footer">
                        <Link to="/forgot-password" style={{ display: 'block', marginBottom: '1rem' }}>
                            Mot de passe oublié ?
                        </Link>
                        <span>Pas encore membre ?</span>
                        <Link to="/register">Créer un compte</Link>
                    </div>
                </form>
            </div>

            <style>{`
                .auth-page {
                    height: 80vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .auth-card {
                    width: 100%;
                    max-width: 480px;
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    padding: 4rem;
                    border-radius: 2rem;
                    backdrop-filter: blur(20px);
                }
                .auth-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                .auth-header h1 {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .luxury-divider {
                    width: 50px;
                    height: 1px;
                    background: var(--primary);
                    margin: 1rem auto;
                }
                .minimal-form .form-group {
                    margin-bottom: 2rem;
                }
                .minimal-form label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--primary);
                    margin-bottom: 0.8rem;
                }
                .minimal-form input {
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid var(--glass-border);
                    border-radius: 0;
                    padding: 0.8rem 0;
                    font-size: 1rem;
                }
                .minimal-form input:focus {
                    border-bottom-color: var(--primary);
                    background: transparent;
                    box-shadow: none;
                }
                .luxury-btn-auth {
                    width: 100%;
                    margin-top: 2rem;
                    padding: 1.2rem;
                    background: var(--primary);
                    color: black;
                    border: none;
                    border-radius: 0.5rem;
                    font-family: 'Bodoni Moda', serif;
                    font-size: 1.2rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.4s;
                }
                .luxury-btn-auth:hover {
                    background: white;
                    transform: translateY(-3px);
                }
                .auth-footer {
                    margin-top: 2rem;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .auth-footer a {
                    color: var(--primary);
                    text-decoration: none;
                    margin-left: 0.5rem;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default Login;
