import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Mail, Phone, Clock, Send, Sparkles, MessageSquare } from 'lucide-react';

const Contact = () => {
    const [settings, setSettings] = useState({
        contact_email: 'contact@siteparfum.fr',
        site_name: 'Site Parfum'
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await api.get('/settings/public');
                const publicSettings = response.data;
                setSettings(prev => ({
                    ...prev,
                    ...publicSettings
                }));
            } catch (err) {
                console.error("Failed to fetch contact settings", err);
            }
        };

        loadSettings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setStatus({ type: 'success', message: 'Votre message a été envoyé avec succès. Nous vous recontacterons sous peu.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
            setTimeout(() => setStatus({ type: '', message: '' }), 5000);
        }, 1500);
    };

    const contactInfoItems = [
        { icon: <MapPin size={20} />, title: 'Adresse', text: '123 Avenue AbouBaker AL SIDIK\n75001 Casablanca, Maroc' },
        { icon: <Mail size={20} />, title: 'Email', text: settings.contact_email },
        { icon: <Phone size={20} />, title: 'Téléphone', text: '+212 6 23 45 67 89' },
        { icon: <Clock size={20} />, title: 'Horaires', text: 'Lundi - Samedi : 10h00 - 19h00' },
    ];

    return (
        <div className="container contact-page py-5">
            <header className="contact-header">
                <span className="badge badge-primary">Contact</span>
                <h1>Nous sommes à votre écoute</h1>
                <p className="contact-subtitle">
                    Une question sur un produit ? Besoin de conseil ? Notre équipe est disponible pour vous répondre.
                </p>
            </header>

            <div className="contact-layout">
                {/* Info Column */}
                <aside className="contact-info-col">
                    <div className="info-cards">
                        {contactInfoItems.map((item, i) => (
                            <div key={i} className="saas-card info-card">
                                <div className="info-icon">{item.icon}</div>
                                <div>
                                    <h4>{item.title}</h4>
                                    <p style={{ whiteSpace: 'pre-line' }}>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="saas-card quote-card">
                        <blockquote>
                            "Le parfum est la forme la plus intense du souvenir."
                        </blockquote>
                    </div>
                </aside>

                {/* Form Column */}
                <main className="contact-form-col">
                    <div className="saas-card form-card">
                        <div className="form-card-header">
                            <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
                            <h3>Envoyez-nous un message</h3>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {status.message && (
                                <div className={`form-alert ${status.type}`}>
                                    {status.message}
                                </div>
                            )}

                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label className="form-label">Nom complet</label>
                                    <input className="form-input" name="name" value={formData.name} onChange={handleChange} required placeholder="Jean Dupont" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jean@email.com" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sujet</label>
                                <input className="form-input" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Demande d'information" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea className="form-input" name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Comment pouvons-nous vous aider ?" />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={isSubmitting}>
                                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </main>
            </div>

            <style>{`
                .contact-page { padding-bottom: 6rem; }

                .contact-header {
                    text-align: center;
                    max-width: 600px;
                    margin: 0 auto 4rem;
                }
                .contact-header h1 {
                    font-size: 2.25rem;
                    margin-top: 1rem;
                    margin-bottom: 0.75rem;
                }
                .contact-subtitle {
                    color: var(--text-muted);
                    font-size: 1rem;
                    line-height: 1.6;
                }

                .contact-layout {
                    display: grid;
                    grid-template-columns: 360px 1fr;
                    gap: 2.5rem;
                    align-items: start;
                }

                .info-cards {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .info-card {
                    display: flex;
                    gap: 1rem;
                    padding: 1.25rem;
                    align-items: flex-start;
                }
                .info-icon {
                    color: var(--primary);
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .info-card h4 {
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    color: var(--text-main);
                    margin-bottom: 0.25rem;
                }
                .info-card p {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                }

                .quote-card {
                    padding: 1.5rem;
                    text-align: center;
                    background: var(--primary-light);
                    border-color: transparent;
                }
                .quote-card blockquote {
                    font-style: italic;
                    color: var(--primary);
                    font-size: 0.95rem;
                    line-height: 1.6;
                }

                .form-card {
                    padding: 2rem;
                }
                .form-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                    padding-bottom: 1.25rem;
                    border-bottom: 1px solid var(--border-light);
                }
                .form-card-header h3 {
                    font-size: 1.25rem;
                }

                .form-row-2col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .form-alert {
                    padding: 0.875rem 1rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                .form-alert.success {
                    background: var(--success-bg);
                    color: var(--success);
                }
                .form-alert.error {
                    background: var(--danger-bg);
                    color: var(--danger);
                }

                textarea.form-input {
                    resize: vertical;
                    min-height: 120px;
                    font-family: inherit;
                }

                @media (max-width: 1024px) {
                    .contact-layout { grid-template-columns: 1fr; }
                    .contact-info-col { order: 2; }
                    .form-row-2col { grid-template-columns: 1fr; gap: 0; }
                }
            `}</style>
        </div>
    );
};

export default Contact;