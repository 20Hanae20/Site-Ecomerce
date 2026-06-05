import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/admin/login', { email, password });
            localStorage.setItem('admin_token', response.data.access_token);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('admin_user', JSON.stringify(response.data.user));
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <header>
                    <h1>Back-Office</h1>
                    <p>Accès réservé aux administrateurs</p>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Professionnel</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@siteparfum.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="luxury-btn" disabled={isLoading}>
                        {isLoading ? 'Authentification...' : 'Se connecter'}
                    </button>
                </form>
            </div>

            <style>{`
                .admin-login-page {
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at center, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
                }
                .admin-login-card {
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    padding: 3rem;
                    border-radius: 1.5rem;
                    width: 100%;
                    max-width: 450px;
                    backdrop-filter: blur(20px);
                }
                .admin-login-card header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                .admin-login-card h1 {
                    font-size: 2.5rem;
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }
                .admin-login-card p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
