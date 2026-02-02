import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
            const response = await axios.post('http://127.0.0.1:8000/api/register', formData);
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
        <div className="container-premium auth-section-luxury">
            <div className="auth-card-premium glass-premium animate-fade-in register-card-luxury">
                <div className="auth-header-luxury">
                    <h1 className="font-serif gradient-text-gold">INSCRIPTION</h1>
                    <p className="auth-subtitle">Rejoignez notre cercle d'exception.</p>
                </div>

                <form onSubmit={handleSubmit} className="premium-form">
                    {message && (
                        <div className={`premium-alert ${message.includes('succès') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <div className="form-row-premium">
                        <div className="premium-input-group">
                            <label>PRÉNOM</label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Jean" required />
                            {errors.first_name && <span className="error-hint">{errors.first_name[0]}</span>}
                        </div>
                        <div className="premium-input-group">
                            <label>NOM</label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Dupont" required />
                            {errors.last_name && <span className="error-hint">{errors.last_name[0]}</span>}
                        </div>
                    </div>

                    <div className="premium-input-group">
                        <label>VOTRE EMAIL</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required />
                        {errors.email && <span className="error-hint">{errors.email[0]}</span>}
                    </div>

                    <div className="form-row-premium">
                        <div className="premium-input-group">
                            <label>MOT DE PASSE</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                            {errors.password && <span className="error-hint">{errors.password[0]}</span>}
                        </div>
                        <div className="premium-input-group">
                            <label>CONFIRMATION</label>
                            <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} placeholder="••••••••" required />
                        </div>
                    </div>

                    <button type="submit" className="btn-premium btn-auth-luxury" disabled={isLoading}>
                        {isLoading ? 'CRÉATION...' : 'DEVENIR MEMBRE'}
                    </button>

                    <div className="auth-links-luxury">
                        <p>Déjà membre ? <Link to="/login" className="gold-link">Se connecter</Link></p>
                    </div>
                </form>
            </div>

            <style>{`
                .auth-section-luxury {
                    min-height: 90vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 1rem;
                }

                .register-card-luxury {
                    max-width: 650px;
                }

                .form-row-premium {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .auth-card-premium {
                    width: 100%;
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
                    font-size: 0.65rem;
                    letter-spacing: 2px;
                    color: var(--primary);
                    margin-bottom: 0.6rem;
                    font-weight: 600;
                }

                .premium-input-group input {
                    width: 100%;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--glass-border);
                    padding: 0.85rem;
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
                    padding: 1.1rem;
                    font-size: 0.9rem;
                    margin-top: 1rem;
                    margin-bottom: 2rem;
                }

                .auth-links-luxury {
                    text-align: center;
                    font-size: 0.85rem;
                }

                .gold-link {
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 600;
                    margin-left: 0.5rem;
                }

                .premium-alert {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                    font-size: 0.85rem;
                    border-left: 4px solid;
                    background: rgba(255,255,255,0.05);
                }

                .premium-alert.success { border-color: #22c55e; color: #22c55e; }
                .premium-alert.error { border-color: #ef4444; color: #ef4444; }

                .error-hint {
                    font-size: 0.7rem;
                    color: #ef4444;
                    margin-top: 0.3rem;
                    display: block;
                }

                @media (max-width: 600px) {
                    .form-row-premium { grid-template-columns: 1fr; }
                    .auth-card-premium { padding: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default Register;
