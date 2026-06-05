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
        </div>
    );
};

export default AdminLogin;
