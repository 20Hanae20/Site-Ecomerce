import React, { useState, useEffect } from 'react';
import api from '../services/api';

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
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulation d'envoi
        setTimeout(() => {
            setStatus({ type: 'success', message: 'Merci pour votre message. Notre équipe vous recontactera sous peu.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="page-container contact-page">
            <header className="contact-header">
                <h1>Contactez-Nous</h1>
                <div className="luxury-divider"></div>
                <p>Une question ? Un sillage particulier à rechercher ? Notre Maison est à votre écoute.</p>
            </header>

            <div className="contact-layout">
                <div className="contact-info glass">
                    <div className="info-item">
                        <span className="icon">📍</span>
                        <div className="details">
                            <h3>Adresse</h3>
                            <p>123 Avenue des Fragrances<br />75001 Paris, France</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="icon">✉️</span>
                        <div className="details">
                            <h3>Email</h3>
                            <p>{settings.contact_email}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="icon">📞</span>
                        <div className="details">
                            <h3>Téléphone</h3>
                            <p>+33 1 23 45 67 89</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="icon">🕙</span>
                        <div className="details">
                            <h3>Horaires</h3>
                            <p>Lundi - Samedi : 10h00 - 19h00</p>
                        </div>
                    </div>
                </div>

                <div className="contact-form-wrapper glass">
                    <form onSubmit={handleSubmit} className="luxury-form">
                        {status.message && (
                            <div className={`alert alert-${status.type}`}>
                                {status.message}
                            </div>
                        )}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nom Complet</label>
                                <input name="name" value={formData.name} onChange={handleChange} required placeholder="Jean Dupont" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jean@email.com" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Sujet</label>
                            <input name="subject" value={formData.subject} onChange={handleChange} required placeholder="Demande d'information" />
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} required rows="6" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                        </div>
                        <button type="submit" className="luxury-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Envoi...' : 'Envoyer le message'}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                .contact-page { max-width: 1200px; margin: 0 auto; padding-top: 6rem; padding-bottom: 8rem; }
                .contact-header { text-align: center; margin-bottom: 6rem; }
                .contact-header h1 { font-size: 4rem; margin-bottom: 1.5rem; font-weight: 500; }
                .contact-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 4rem; }
                .contact-info { padding: 4rem; display: flex; flex-direction: column; gap: 3rem; border-radius: 2rem; }
                .info-item { display: flex; gap: 2rem; align-items: flex-start; }
                .info-item .icon { font-size: 2rem; opacity: 0.8; }
                .info-item h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; }
                .info-item p { color: var(--text-muted); line-height: 1.6; }
                .contact-form-wrapper { padding: 4rem; border-radius: 2rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .luxury-form { display: flex; flex-direction: column; gap: 2rem; }
                .luxury-form label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary); margin-bottom: 0.8rem; display: block; }
                .luxury-form input, .luxury-form textarea {
                    background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
                    border-radius: 0.5rem; padding: 1rem; color: white; width: 100%; transition: all 0.3s;
                }
                .luxury-form input:focus, .luxury-form textarea:focus { border-color: var(--primary); background: rgba(255,255,255,0.08); outline: none; }
                .luxury-btn {
                    padding: 1.2rem; background: var(--primary); color: black; border: none; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.2em; cursor: pointer; border-radius: 0.5rem; transition: all 0.4s; margin-top: 1rem;
                }
                .luxury-btn:hover { background: white; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
                @media (max-width: 900px) {
                    .contact-layout { grid-template-columns: 1fr; }
                    .form-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Contact;
