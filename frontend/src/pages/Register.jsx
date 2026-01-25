import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
            const response = await api.post('/register', formData);
            setMessage(response.data.message);
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
        <div className="page-container auth-page">
            <div className="auth-card register-card">
                <header className="auth-header">
                    <h1>Inscription</h1>
                    <div className="luxury-divider"></div>
                    <p>Rejoignez notre cercle d'exception.</p>
                </header>

                <form onSubmit={handleSubmit} className="minimal-form">
                    {message && (
                        <div className={`alert ${message.includes('succès') ? 'alert-success' : 'alert-error'}`}>
                            {message}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="first_name">Prénom</label>
                            <input id="first_name" type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Jean" required />
                            {errors.first_name && <span className="error-text">{errors.first_name[0]}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="last_name">Nom</label>
                            <input id="last_name" type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Dupont" required />
                            {errors.last_name && <span className="error-text">{errors.last_name[0]}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required />
                        {errors.email && <span className="error-text">{errors.email[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Votre secret" required />
                        {errors.password && <span className="error-text">{errors.password[0]}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation">Confirmation</label>
                        <input id="password_confirmation" type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} placeholder="Confirmez votre secret" required />
                    </div>

                    <button type="submit" className="luxury-btn-auth" disabled={isLoading}>
                        {isLoading ? 'Création...' : "Devenir membre"}
                    </button>

                    <div className="auth-footer">
                        <span>Déjà membre ?</span>
                        <Link to="/login">Se connecter</Link>
                    </div>
                </form>
            </div>

            <style>{`
                .auth-page {
                    padding: 5rem 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .register-card {
                    max-width: 600px !important;
                }
                .auth-card {
                    width: 100%;
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
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
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
                @media (max-width: 600px) {
                    .form-row { grid-template-columns: 1fr; }
                    .auth-card { padding: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default Register;
