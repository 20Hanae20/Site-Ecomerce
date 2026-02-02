import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [debugCode, setDebugCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await api.post('/forgot-password', { email });
            setMessage(response.data.message);
            if (response.data.debug_code) {
                setDebugCode(response.data.debug_code);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <h1>Mot de passe oublié</h1>
                <p>Entrez votre email pour recevoir un code de réinitialisation.</p>

                {message && (
                    <div className="alert alert-success">
                        {message}
                        {debugCode && <p className="debug-info">Code de test : <strong>{debugCode}</strong></p>}
                        <div style={{ marginTop: '1rem' }}>
                            <Link to="/reset-password" state={{ email }} className="primary-btn">
                                Continuer vers la réinitialisation
                            </Link>
                        </div>
                    </div>
                )}

                {error && <div className="alert alert-error">{error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="votre@email.com"
                            />
                        </div>
                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? 'Envoi...' : 'Envoyer le code'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <Link to="/login">Retour à la connexion</Link>
                </div>
            </div>

            <style>{`
                .debug-info { margin-top: 1rem; padding: 0.5rem; background: rgba(0,0,0,0.2); border-left: 3px solid var(--primary); font-size: 0.9rem; }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
