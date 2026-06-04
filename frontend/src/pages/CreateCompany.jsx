import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, User, Mail, Phone, Globe } from 'lucide-react';
import api from '../services/api';

const CreateCompany = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        domain: '',
        logo_url: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await api.post('/tenant/create', formData);
            
            // Store tenant info for next step
            localStorage.setItem('onboarding_tenant', JSON.stringify(response.data.tenant));
            
            navigate('/onboarding/plan');
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: err.response?.data?.message || 'Erreur lors de la création' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <div className="onboarding-header">
                    <div className="step-indicator">
                        <div className="step-badge active">1</div>
                        <span>Créer votre entreprise</span>
                    </div>
                    <h1>Bienvenue chez AURA</h1>
                    <p className="onboarding-subtitle">
                        Créez votre espace SaaS en quelques étapes simples
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="onboarding-form">
                    {errors.general && (
                        <div className="alert alert-danger">{errors.general}</div>
                    )}

                    <div className="form-group">
                        <label htmlFor="company_name" className="form-label">
                            <Building2 size={16} /> Nom de l'entreprise
                        </label>
                        <input
                            id="company_name"
                            type="text"
                            name="company_name"
                            className="form-input"
                            value={formData.company_name}
                            onChange={handleChange}
                            placeholder="ex: Parfums Luxe SARL"
                            required
                        />
                        {errors.company_name && (
                            <span className="error-text">{errors.company_name[0]}</span>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="contact_name" className="form-label">
                                <User size={16} /> Responsable
                            </label>
                            <input
                                id="contact_name"
                                type="text"
                                name="contact_name"
                                className="form-input"
                                value={formData.contact_name}
                                onChange={handleChange}
                                placeholder="Jean Dupont"
                                required
                            />
                            {errors.contact_name && (
                                <span className="error-text">{errors.contact_name[0]}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact_phone" className="form-label">
                                <Phone size={16} /> Téléphone
                            </label>
                            <input
                                id="contact_phone"
                                type="tel"
                                name="contact_phone"
                                className="form-input"
                                value={formData.contact_phone}
                                onChange={handleChange}
                                placeholder="+33 6 12 34 56 78"
                                required
                            />
                            {errors.contact_phone && (
                                <span className="error-text">{errors.contact_phone[0]}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_email" className="form-label">
                            <Mail size={16} /> Email professionnel
                        </label>
                        <input
                            id="contact_email"
                            type="email"
                            name="contact_email"
                            className="form-input"
                            value={formData.contact_email}
                            onChange={handleChange}
                            placeholder="contact@parfums.fr"
                            required
                        />
                        {errors.contact_email && (
                            <span className="error-text">{errors.contact_email[0]}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="domain" className="form-label">
                            <Globe size={16} /> Domaine de votre espace
                        </label>
                        <div className="domain-input-wrapper">
                            <input
                                id="domain"
                                type="text"
                                name="domain"
                                className="form-input"
                                value={formData.domain}
                                onChange={handleChange}
                                placeholder="monentreprise"
                                required
                            />
                            <span className="domain-suffix">.aura-saas.com</span>
                        </div>
                        {errors.domain && (
                            <span className="error-text">{errors.domain[0]}</span>
                        )}
                        <p className="form-hint">
                            Cet identifiant sera l'adresse de votre tableau de bord
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="logo_url" className="form-label">
                            Logo (URL)
                        </label>
                        <input
                            id="logo_url"
                            type="url"
                            name="logo_url"
                            className="form-input"
                            value={formData.logo_url}
                            onChange={handleChange}
                            placeholder="https://votre-logo.png"
                        />
                        <p className="form-hint">Optionnel pour le moment, vous pourrez l'ajouter plus tard</p>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '2rem' }}
                    >
                        {loading ? 'Création en cours...' : (
                            <>
                                Continuer <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="onboarding-note">
                    <p>✓ Vos données sont sécurisées et isolées (Multi-Tenancy)</p>
                    <p>✓ Accès administrateur immédiat au tableau de bord</p>
                </div>
            </div>

            <style>{`
                .onboarding-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-body) 100%);
                }

                .onboarding-card {
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    width: 100%;
                    max-width: 500px;
                    padding: 2.5rem;
                }

                .onboarding-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .step-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .step-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--bg-alt);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .step-badge.active {
                    background: var(--primary);
                    color: white;
                }

                .onboarding-header h1 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .onboarding-subtitle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }

                .onboarding-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                    color: var(--text-main);
                    font-size: 0.875rem;
                }

                .form-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-light);
                }

                .domain-input-wrapper {
                    position: relative;
                    display: flex;
                }

                .domain-input-wrapper .form-input {
                    flex: 1;
                    border-right: none;
                    border-radius: var(--radius-md) 0 0 var(--radius-md);
                }

                .domain-suffix {
                    padding: 0.75rem 1rem;
                    background: var(--bg-alt);
                    border: 1px solid var(--border-light);
                    border-left: none;
                    border-radius: 0 var(--radius-md) var(--radius-md) 0;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                }

                .form-hint {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin: 0;
                }

                .error-text {
                    font-size: 0.8rem;
                    color: var(--danger);
                }

                .alert {
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }

                .alert-danger {
                    background: var(--danger-bg);
                    color: var(--danger);
                    border: 1px solid #fecaca;
                }

                .btn-lg {
                    padding: 1rem 1.5rem;
                    font-size: 1rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                }

                .onboarding-note {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background: var(--bg-alt);
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .onboarding-note p {
                    margin: 0;
                }

                @media (max-width: 600px) {
                    .onboarding-card {
                        padding: 1.5rem;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default CreateCompany;
